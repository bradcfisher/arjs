
/**
 * Utility class providing methods for parsing object structures (usually JSON, but not always).
 */
export class Parse {

	/**
	 * The number of minutes in an hour.
	 */
	static readonly MINUTES_IN_HOUR: number = 60;

	/**
	 * The number of minutes in a day.
	 */
	static readonly MINUTES_IN_DAY: number = Parse.MINUTES_IN_HOUR * 24;

	/**
	 * The number of minutes in a week.
	 */
	static readonly MINUTES_IN_WEEK: number = Parse.MINUTES_IN_DAY * 7;

	/**
	 * Mapping used for converting duration unit strings to the appropriate multiplier in minutes.
	 */
	private static readonly durationUnitMap: {[p:string]:number} = {
		"m": 1,
		"h": Parse.MINUTES_IN_HOUR,
		"d": Parse.MINUTES_IN_DAY,
		"w": Parse.MINUTES_IN_WEEK
	};

	/**
	 * Extracts a value from the specified property of an object.
	 *
	 * @param	obj			The object to retrieve the value from.
	 * @param	defaultVal	The default value to return if not found (`obj` == null or a property
	 *						doesn't exist).  If the requested property _does_ exist, it's value
	 *						will always be returned, even if it is null.
	 * @param	props		The property names, in the order they should be resolved.  For example,
	 *						if "protection" and "magic" are given, will attempt to retrieve the
	 *						value of `obj.protection.magic`.
	 *
	 * @return	The value retrieved from the `obj`, or the `defaultVal` if `obj` is null or a
	 *			specified property could not be found.
	 */
	static getProp(obj: Object, defaultVal?: any, ...props: string[]): any {
		let l: number = props.length - 1;
		let v: any;
		if (obj != null)
			v = obj;

		let i = 0;
		for (; i <= l; ++i) {
			if (v == null)
				break;

			// Throw error if the result is not an object and we're not at the last item
			v = v[props[i]];

			if ((i < l) && (v != null) && !(v instanceof Object))
				throw new Error('Object value required for "'+ props[i] +'"');
		}

		return (i < l ? defaultVal : v);
	} // getProp

	/**
	 * Parses a value as a string.
	 * @param	val			The value to parse.
	 * @return	defaultVal	The default value to return if `val` is null/undefined.  Will throw an
	 *						error if null/undefined and val is also null/undefined.
	 */
	static str(val: any, defaultVal?: string): string {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('String value required');

			return defaultVal;
		}

		return String(val);
	} // _parseString

	/**
	 * Parses a value as a number.
	 * @param	val			The value to parse.
	 * @return	defaultVal	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and val is also null/undefined.
	 */
	static num(val: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Number value required');

			return Parse.num(defaultVal);
		}

		let rv: number = Number(val);
		if (Number.isNaN(rv))
			throw new Error('Unable to parse value "'+ val +'" as number');

		return rv;
	} // num

	/**
	 * Parses a value as an integer.
	 * @param	val			The value to parse.
	 * @return	defaultVal	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and val is also null/undefined.
	 */
	static int(val: any, defaultVal?: any, radix: number = 10): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Int value required');

			return Parse.int(defaultVal, undefined, radix);
		}

		let rv: number = parseInt(val, radix);
		if (Number.isNaN(rv))
			throw new Error('Unable to parse value "'+ val +'" as int');

		return rv;
	} // int

	/**
	 * Parses a temperature value.
	 * Example temperature values: `12F`, `-2.5C`
	 *
	 * @param	val			The value to parse.  Recognized units are: `F` (or none) = Fahrenheit,
	 *						`C` = Celsius
	 * @param	defaultVal	The value to return if `val` is null/undefined.  If undefined, and `val`
	 *						is null/undefined, then an error will be thrown.
	 */
	static temperature(val: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Temperature value required');

			return Parse.temperature(defaultVal);
		}

		let m = /^\s*([-+.e0-9]+)\s*([fc]?)\s*$/i.exec(val);
		if (m == null)
			throw new Error('Unable to parse value "'+ val +'" as temperature');
		let v: number = Number(m[1]);
		if (Number.isNaN(v))
			throw new Error('Unable to parse value "'+ val +'" as temperature');

		if (m[2].toLowerCase() == 'c')
			v = 32 + v * 1.8;

		return v;
	} // temperature

	/**
	 * Parses a duration value.
	 *
	 * Example duration values: `6H 5M`, `-3.8D`
	 *
	 * Be careful with values like `1H -10M` and `-1H 10M`.  The former is effectively `50M` (60
	 * minutes - 10 minutes), while the latter is equivalent to `-50M` (10 minutes - 60 minutes).
	 *
	 * @param	val			The value to parse.  Recognized units are: `M` (or none) = minutes,
	 *						`H` = hours, `D` = days, `W` = weeks
	 * @param	defaultVal	The value to return if `val` is null/undefined.  If undefined, and `val`
	 *						is null/undefined, then an error will be thrown.
	 */
	static duration(val: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Duration value required');

			return Parse.duration(defaultVal);
		}

		val = String(val);

		let rv: number = 0;
		let re: RegExp = /\s*([-+.e0-9]+)\s*([mhdw])?\s*/ig;
		let lastPos: number = 0;
		let m;

		while ((m = re.exec(val)) != null) {
			let v: number = Number(m[1]);
			if (Number.isNaN(v))
				throw new Error('Unable to parse value "'+ val +'" as duration (invalid numeric portion)');

			if (m[2] != null) {
				let units: number = Parse.durationUnitMap[m[2].toLowerCase()];
				if (units == null)
					throw new Error('Unable to parse value "'+ val +'" as duration (invalid units)');

				v *= units;
			}

			lastPos = m.index + m[0].length;
			rv += v;
		}

		if ((lastPos < val.length) || (val.length == 0))
			throw new Error('Unparseable value "'+ val.substr(lastPos) +'" found parsing duration: '+ lastPos +" "+ re.lastIndex +" "+ val.length);

		return rv;
	} // duration

} // Parse
