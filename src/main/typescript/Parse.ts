
export class Parse {

	static readonly MINUTES_IN_HOUR: number = 60;
	static readonly MINUTES_IN_DAY: number = Parse.MINUTES_IN_HOUR * 24;
	static readonly MINUTES_IN_WEEK: number = Parse.MINUTES_IN_DAY * 7;

	private static readonly durationUnitMap: {[p:string]:number} = {
		"m": 1,
		"h": Parse.MINUTES_IN_HOUR,
		"d": Parse.MINUTES_IN_DAY,
		"w": Parse.MINUTES_IN_WEEK
	};

	static getProp(obj: Object, ...props: string[]): any {
		let l: number = props.length - 1;
		let v: any = obj;

		for (let i = 0; i <= l; ++i) {
			if (v == null)
				break;

			// Throw error if the result is not an object and we're not at the last item
			v = v[props[i]];

			if ((i < l) && (v != null) && !(v instanceof Object))
				throw new Error("Object expected");
		}

		return v;
	} // getProp

	static str(val? : any, defaultVal?: string): string {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Expected string value');

			return defaultVal;
		}

		return String(val);
	} // _parseString

	// What about NaN?
	static num(val?: any, defaultVal?: number): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Expected number value');

			return defaultVal;
		}

		return Number(val);
	} // num

	// What about NaN?
	static int(val?: any, defaultVal?: number, radix: number = 10): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Expected int value');

			return defaultVal - defaultVal % 1;	// % will truncate to int & support larger than 32-bit
		}

		return parseInt(val, radix);
	} // int

	/**
	 * Parses a temperature value.
	 * Example temperature values: `12F`, `-2.5C`
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The value to return if `val` is null/undefined.  If undefined, and `val`
	 *						is null/undefined, then an error will be thrown.
	 */
	static temperature(val?: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Expected temperature value');

			return Parse.temperature(defaultVal);
		}

		let m = /^\s*(\s+)\s*([fc])\s*$/i.exec(val);
		if (m == null)
			throw new Error('Invalid temperature value');

		let v: number = Number(m[1]);
		if (Number.isNaN(v))
			throw new Error('Invalid temperature value');

		if (m[2].toLowerCase() == 'c')
			v = 32 + v * 5 / 9;

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
	static duration(val?: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Expected duration value');

			return Parse.duration(defaultVal);
		}

		val = String(val);

		let rv: number = 0;
		let lastPos: number = 0;
		let m;

		while ((m = /\s*([^\s]+)\s*([mhdw]?)\s*/ig.exec(val)) != null) {
			lastPos = m.index + m[0].length;

			let v: number = Number(m[1]);
			if (Number.isNaN(v))
				throw new Error('Invalid duration value');

			if (m[2] != null) {
				let units: number = Parse.durationUnitMap[m[2].toLowerCase()];
				if (units == null)
					throw new Error('Invalid duration units');

				v *= units;
			}

			rv += v;
		}

		if ((lastPos < val.length) || (val.length == 0))
			throw new Error('Invalid duration value');

		return rv;
	} // duration

} // Parse
