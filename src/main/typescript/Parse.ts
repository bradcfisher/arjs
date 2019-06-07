import { ClassRegistry, Deserializer, Serializer, ClassEntry } from "./Serializer";
import { EventListener } from "./EventDispatcher";

/**
 * Utility class providing methods for parsing object structures (usually JSON, but not always).
 */
export class Parse {

	/**
	 * Mapping used for converting duration unit strings to the appropriate multiplier in minutes.
	 */
	private static readonly durationUnitMap: {[p:string]:number} = {
		"ms": 1/60000,		// Milliseconds in a minute
		"s": 1/60,			// Minutes in a second
		"m": 1,
		"h": 60,			// Minutes in an hour
		"d": 60 * 24,		// Minutes in a day
		"w": 60 * 24 * 7	// Minutes in a week
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
	 * @throws	Error if a non-null primitive value is encountered at a non-terminal node in
	 *			the path (non-terminals should either be null or an object).
	 */
	static getProp(obj: Object|undefined|null, defaultVal: any, ...props: string[]): any {
		if (obj == null)
			return defaultVal;

		let propsLength: number = props.length - 1;
		let val: any = obj;
		let index = 0;
		for (; (val != null) && (index <= propsLength); ++index) {
			// Throw error if the result is not an object and we're not at the last item
			val = val[props[index]];

			if ((index < propsLength) && (val != null) && !(val instanceof Object))
				throw new Error('Object value required for "'+ props[index] +'"');
		}

		return (index < propsLength ? defaultVal : (val === undefined ? defaultVal : val));
	} // getProp

	/**
	 * Asserts that the specified value is not null or undefined.
	 *
	 * @param value The value to check.
	 * @param name Name to use in error messages to describe the value.
	 *
	 * @throws Error if `value` is null or undefined.
	 */
	static required<T>(value: T, name: string = 'value'): NonNullable<T> {
		if (value == null)
			throw new Error(name + " required");
		return <any>value;
	}

	/**
	 * Converts a value to "proper case" by converting the first character to uppercase
	 * and the remaining characters to lowercase.
	 *
	 * @param val The value to convert (will be cast to a string if it's not already)
	 *
	 * @return The proper cased version of the provided value.
	 */
	static toProperCase(val: any): string {
		let s: string = String(val);
		if (s.length == 0)
			return "";

		return s[0].toUpperCase() + s.substr(1).toLowerCase();
	}

	/**
	 * Parses a value as a string.
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The default value to return if `val` is null/undefined.  Will throw an
	 *						error if null/undefined and val is also null/undefined.
	 *
	 * @return The parsed value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined.
	 */
	static str(val: any, defaultVal?: string): string {
		if (val == null) {
			return Parse.required(defaultVal, 'String value');
		}

		return String(val);
	} // str

	/**
	 * Parses a value as a number.
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and `val` is also null/undefined.
	 *
	 * @return The parsed number value.  This value will not be `NaN`, unless `defaultVal` is
	 * 			`Number.NaN` or `allowNaN` is true.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static num(val: any, defaultVal?: any, allowNaN: boolean = false): number {
		if (val == null) {
			val = Parse.required(defaultVal, "Number value");
		}

		let rv: number = Number(val);
		if (Number.isNaN(rv) && !allowNaN && (typeof defaultVal !== "number"))
			throw new Error('Unable to parse value "'+ val +'" as number');

		return rv;
	} // num

	/**
	 * Parses a value as a percentage.
	 *
	 * Examples:
	 *   Val   | Range | Result | Calc
	 *   ------|-------|--------|------
	 *   "12%" | 1     | 0.12   | 12 / 100 * 1
	 *   "12%" | 100   | 12     | 12 / 100 * 100
	 *   12    | 1     | 12     | 12
	 *   12    | 100   | 12     | 12
	 *
	 * @param val 			The value to parse.
	 * @param defaultVal 	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and `val` is also null/undefined.
	 * @param range			If a value is parsed with a trailing % symbol ("12%"), this
	 * 						value will be multiplied with the percentage before being returned.
	 *
	 * @return The parsed value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static percent(val: any, defaultVal?: any, range: number = 1): number {
		if (val == null) {
			val = Parse.required(defaultVal, 'Percent value');
		}

		let m = /^\s*([-+.e0-9]+)\s*(%)?\s*$/i.exec(val);
		if (m == null)
			throw new Error('Unable to parse value "'+ val +'" as percentage');

		let v: number = Number(m[1]);
		if (Number.isNaN(v))
			throw new Error('Unable to parse value "'+ val +'" as percentage');

		if (m[2] == "%")
			v = (v / 100) * range;

		return v;
	}

	/**
	 * Parses a value as an integer.
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and `val` is also null/undefined.
	 *
	 * @return The parsed integer value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static int(val: any, defaultVal?: any, radix: number = 10): number {
		if (val == null) {
			val = Parse.required(defaultVal, 'Int value');
		}

		let rv: number = parseInt(val, radix);
		if (Number.isNaN(rv))
			throw new Error('Unable to parse value "'+ val +'" as int');

		return rv;
	} // int

	/**
	 * Parses a value as a boolean.
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The default value to return if `val` is null/undefined.  Will throw
	 *						an error if null/undefined and `val` is also null/undefined.
	 *
	 * @return The parsed boolean value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined.
	 */
	static bool(val: any, defaultVal?: any): boolean {
		if (val == null) {
			val = Parse.required(defaultVal, 'Bool value');
		}

		if (val instanceof String) {
			return ("true" == val.toLowerCase());
		}

		return !!val;
	} // bool

	/**
	 * Parses an enumeration value name into a enumeration value.
	 *
	 * The value to parse will be identified within the specified enumeration or
	 * object, by examining the property keys.  Comparisons are made in a case-insensitive
	 * manner.
	 *
	 * The enumeration object passed in must be structured in the same manner
	 * as a TypeScript enumeration.
	 *
	 * For a string enumeration, both the keys and values must be strings.
	 *
	 * For a numeric enumeration, string keys must be assigned a numeric value, and string
	 * values must be associated with a numeric key.  Additionally, a key matching the value
	 * associated to the key being retrieved must exist, and that key's value must match the
	 * original key.
	 *
	 * @param val	The value to parse.
	 * @param defaultVal The default value to use, if val is null or undefined.
	 *
	 * @return The parsed enumeration value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the name cannot be resolved as a valid enumeration value.
	 */
   static enum<T>(enumType: T, val: any, defaultVal?: any): T[keyof T] {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('enum value required');

			val = defaultVal;
		}

		let mapping: any = getEnumMapping(enumType);

		let name: string = String(val).toLowerCase();
		let rv: any = mapping[name];
		if (rv == null)
			throw new Error('No such enum value: '+ val);

		return rv;
	}

	static array<T>(val: any, defaultVal?: any, parseCallback: (val: any) => T = Parse.any): T[] {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('array value required');

			val = defaultVal;
		}

		if (
			(typeof val === 'string') ||
			(typeof val[Symbol.iterator] !== 'function')
		) {
			return [parseCallback(val)];
		}

		// Object is iterable and not a string
		let result: T[] = [];
		for (let item of val) {
			result.push(parseCallback(item));
		}
		return result;
	}

	static set<T>(val: any, defaultVal?: any, parseCallback: (val: any) => T = Parse.any): Set<T> {
		let list: T[] = Parse.array(val, defaultVal, parseCallback);
		let rv: Set<T> = new Set();
		for (let item of list) {
			rv.add(item);
		}
		return rv;
	}

	static any(val: any, defaultVal?: any): any {
		if (val == null) {
			val = defaultVal;
		}
		return val;
	}

	/**
	 * Parses a temperature value.
	 * Example temperature values: `12F`, `-2.5C`
	 *
	 * @param	val			The value to parse.  Recognized units are: `F` (or none) = Fahrenheit,
	 *						`C` = Celsius
	 * @param	defaultVal	The value to return if `val` is null/undefined.  If undefined, and `val`
	 *						is null/undefined, then an error will be thrown.
	 *
	 * @return The parsed temperature value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static temperature(val: any, defaultVal?: any): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Temperature value required');

			val = defaultVal;
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
	 * Units are case-insensitive.  Recognized units are:
	 *  - `ms` = milliseconds
	 *  - `s` = seconds
	 *  - `m` = minutes
	 *  - `h` = hours
	 *  - `d` = days
	 *  - `w` = weeks
	 *
	 * @param	val			The value to parse.
	 * @param	defaultVal	The value to return if `val` is null/undefined.  If undefined, and `val`
	 *						is null/undefined, then an error will be thrown.
	 * @param	defaultUnits The units to apply to unitless values and the return value.
	 *
	 * @return The parsed duration value, in the units specified for `defaultUnits`.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static duration(val: any, defaultVal?: any, defaultUnits: string = "m"): number {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Duration value required');

			val = defaultVal;
		}

		val = String(val);
		defaultUnits = defaultUnits.toLowerCase();

		let rv: number = 0;
		let re: RegExp = /\s*([-+.e0-9]+)\s*(ms|[smhdw])?\s*/ig;
		let lastPos: number = 0;
		let m;

		while ((m = re.exec(val)) != null) {
			let v: number = Number(m[1]);
			if (Number.isNaN(v))
				throw new Error('Unable to parse value "'+ val +'" as duration (invalid numeric portion)');

			let unitType = (m[2] == null ? defaultUnits : m[2].toLowerCase());
			let unitMultiplier: number = Parse.durationUnitMap[unitType];
			if (unitMultiplier == null)
				throw new Error('Unable to parse value "'+ val +'" as duration (invalid units: '+ unitType +')');

			v *= unitMultiplier;

			lastPos = m.index + m[0].length;
			rv += v;
		}

		if ((lastPos < val.length) || (val.length == 0))
			throw new Error('Unparseable value "'+ val.substr(lastPos) +'" when parsing duration: '+ lastPos +" "+ re.lastIndex +" "+ val.length);

		return rv / Parse.durationUnitMap[defaultUnits];
	} // duration

	static action(val: any, defaultVal?: any, parameters?: string[]): Parse.ActionCallback {
		if (val == null) {
			if (defaultVal == null)
				throw new Error('Action value required');

			val = defaultVal;
		}
		val = Parse.str(val);

		if (parameters == null)
			parameters = [];

		let actionCallback: Parse.ActionCallback = <any> new Function(...parameters, '"use strict";' + val);
		actionCallback.sourceCode = val;
		actionCallback.parameterNames = parameters.slice();
		actionCallback.constructor = Parse.action;
		return actionCallback;
	}

	static listener(val: any, defaultVal?: any): Parse.EventListenerCallback {
		let callback: Parse.EventListenerCallback = <any> Parse.action(val, defaultVal, ['context', 'event', 'data']);
		callback.constructor = Parse.listener;
		callback.processEvent = function(...args): void { (<any>callback).apply(this, args); };
		return callback;
	}

} // Parse


function serializeCallback(obj: Parse.ActionCallback, serializer: Serializer): void {
	serializer.writeProp("parameters", obj.parameterNames);
	serializer.writeProp("source", obj.sourceCode);
}

function deserializeCallback(obj: Parse.ActionCallback, data: any, deserializer: Deserializer): void {
	// Do nothing
}

ClassRegistry.registerClass(
	'Parse.ActionCallback', Parse.action, serializeCallback, deserializeCallback,
	(entry: ClassEntry, data: any, deserializer: Deserializer): Parse.ActionCallback => {
		return Parse.action(
			deserializer.readProp(data, "source"),
			null,
			deserializer.readProp(data, "parameters")
		);
	}
);

ClassRegistry.registerClass(
	'Parse.EventListenerCallback', Parse.listener, serializeCallback, deserializeCallback,
	(entry: ClassEntry, data: any, deserializer: Deserializer): Parse.ActionCallback => {
		return Parse.listener(deserializer.readProp(data, "source"));
	}
);


/**
 * Constructs a lookup map for the specified enumeration object.
 *
 * The enumeration object passed in must be structured in the same manner
 * as a TypeScript enumeration.
 *
 * For a string enumeration, both the keys and values must be strings.
 *
 * For a numeric enumeration, string keys must be assigned a numeric value, and string
 * values must be associated with a numeric key.  Additionally, a key matching the value
 * associated to the key being retrieved must exist, and that key's value must match the
 * original key.
 *
 * @param enumType the enumeration object to retrieve the mapping for.
 *
 * @return The mapping.
 * @throws Error if the structure of `enumType` is not valid.
 */
function getEnumMapping(enumType: any): any {
	// Retrieve or populate a lower-cased, value-normalized version of the enumeration mapping
	let rv: any = _enumMapping.get(enumType);
	if (rv == null) {
		rv = {};
		for (let key in enumType) if (enumType.hasOwnProperty(key)) {
			let val = enumType[key];

			// Proper enum type should either be string->string or string->number/number->string
			let keyIsNumeric = !Number.isNaN(Number(key));
			let valIsString = (typeof val === "string");
			let valIsNumeric = (typeof val === "number");

			if (!valIsString && !valIsNumeric) {
				throw new Error("Invalid enum: Values must be a string or number, found "+ typeof val +" for key '"+ key +"'");
			}

			if (keyIsNumeric || valIsNumeric) {
				// Appears to be a numeric entry
				// Reverse mapping must exist enumType[val] = key
				if (enumType[val] != key) {
					throw new Error("Invalid numeric enum: Reverse mapping for value '"+ val +"' ("+ enumType[val] +") does not match key '"+ key +"'");
				}

				// Ensure the numeric value is the one returned by this mapping
				if (keyIsNumeric) {
					if (!valIsString) {
						throw new Error("Invalid numeric enum: one of key or value must be a string");
					}
					val = Number(key);
				}
			}

			key = key.toLowerCase();
			if (rv[key] != null)
				throw new Error("Found duplicate enum key '"+ key +"'. (this method ignores case differences for enum keys)");

			rv[key] = val;
		}
		_enumMapping.set(enumType, rv);
	}

	return rv;
}
let _enumMapping: Map<any, any> = new Map();


export module Parse {

	export interface ActionCallback {
		sourceCode: string;
		parameterNames: string[];
	};

	export interface EventListenerCallback extends ActionCallback, EventListener { };

}
