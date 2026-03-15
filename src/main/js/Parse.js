import { ClassRegistry, Deserializer, Serializer } from "./Serializer.js";
import { EventListener } from "./EventDispatcher.js";
import { GameState } from "./GameState.js";
import { ActionCallbackConstructor } from "./ActionManager.js";

/**
 * @import { ActionCallback } from "./ActionManager.js"
 */

/**
 * @interface
 */
export class RegisteredAction {
    /**
     * The name of a previously registered action.
     * @type {string}
     */
    action;

    /**
     * Parameters to provide to the action function.
     * Any values provided will override any default parameters with the same key.
     *
     * @type {{[name:string]:any}?}
     */
    parameters;
}

/**
 * @interface
 */
export class ActionDefinition {
    /**
     * Name to register this action as.
     * If omitted, the action will not be registered for reuse.
     * When provided, the name must be unique or an error will be reported.
     *
     * @type {string?}
     */
    name;

	/**
	 * The code to execute for the action.
	 *
	 * A variable named `parameters` is available within the scope of this code
	 * to allow access to the action's parameter values.
	 */
	body;

    /**
     * Default parameters to provide to the action function.
     *
     * These properties will be provided by default, but may be overridden or augmented
     * by values provided based on the context in which the action is invoked.
     * @type {{[name:string]:any}?}
     */
    parameters;
}

/**
 * @callback EventListenerCallback
 * @param {{[name:string]: any}} parameters
 * @returns {any}
 * @extends ActionCallback
 * @implements {EventListener}
 */

/**
 * Utility class providing methods for parsing object structures (usually JSON, but not always).
 */
export class Parse {

	/**
	 * Mapping used for converting duration unit strings to the appropriate multiplier in minutes.
	 * @readonly
	 * @type {{[p:string]:number}}
	 */
	static #durationUnitMap = {
		"ms": 1/60000,		// Milliseconds in a minute
		"s": 1/60,			// Minutes in a second
		"m": 1,
		"h": 60,			// Minutes in an hour
		"d": 60 * 24,		// Minutes in a day
		"w": 60 * 24 * 7	// Minutes in a week
	};

	/**
	 * Stack containing base URL values used for resolving relative resource references.
	 * @type {URL[]}
	 */
	static #baseUrlStack = [];

	/**
	 * The currently effective base URL value.
	 *
	 * This is either the most recently added value in the base URL stack (added via `pushBaseUrl`)
	 * or the current document location if there are no entries in the base URL stack.
	 *
	 * This property is read-only. Use {@link pushBaseUrl} and {@link popBaseUrl} to update the
	 * effective value.
	 */
	static get baseUrl() {
		const len = Parse.#baseUrlStack.length;
		if (len) {
			return Parse.#baseUrlStack[len - 1];
		}

		return new URL(window.location.href);
	}

	/**
	 * Assigns a new base URL value to use for parsing relative references.
	 *
	 * This value is added to a stack of previously assigned values, with the most recently assigned
	 * value being used as the current {@link baseUrl} for resolving relative resource references.
	 *
	 * @param {string|URL} baseUrl the new base URL to use. This may be a relative path itself, in
	 *        which case it will be resolved to an absolute URL prior to assignment using the currently
	 *        effective base URL.
	 *
	 * @return {URL} the new base URL value.
	 */
	static pushBaseUrl(baseUrl) {
		baseUrl = Parse.url(baseUrl);
		Parse.#baseUrlStack.push(baseUrl);
		console.log("pushBaseUrl: " + baseUrl);
		return baseUrl;
	}

	/**
	 * Removes the most recently added base URL, reverting back to the previous base URL.
	 * @see {@link baseUrl}
	 * @returns the base URL value that was removed. May be undefined if there are no registered base URL values.
	 */
	static popBaseUrl() {
		if (!Parse.#baseUrlStack.length) {
			console.warn("popBaseUrl called with empty stack. Nothing to do.");
			return;
		}

		console.log("popBaseUrl");
		return Parse.#baseUrlStack.pop();
	}

	/**
	 * Executes a callback function in the context of a provided base URL.
	 *
	 * This function applies the specified base URL before calling the callback and restores
	 * it after the callback completes. Upon entry into the callback, {@link Parse.baseUrl} will
	 * return the value of the baseUrl parameter resolved to an absolute URL.
	 *
	 * After completion, the value of {@link Parse.baseUrl} will be the same as it was before
	 * `withBaseUrl` was invoked.
	 *
	 * If the callback throws an error, that error will be thrown by this method.
	 *
	 * @param {string|URL} baseUrl the base URL to apply while executing the callback.
	 * @param {() => any} callback the callback to execute in the context of the provided base URL.
	 * @returns {any} the value returned by the callback (if any)
	 * @throws any error thrown by the callback
	 */
	static withBaseUrl(baseUrl, callback) {
		if (baseUrl == null) {
            baseUrl = Parse.baseUrl;
        } else {
			baseUrl = Parse.url(baseUrl);
		}

		let didPush = false;
		if (baseUrl != Parse.baseUrl) {
	        Parse.pushBaseUrl(baseUrl);
			didPush = true;
		}

        try {
			console.log("withBaseURL: " + Parse.baseUrl);
			return callback();
		} finally {
			if (didPush) {
				Parse.popBaseUrl();
			}
		}
	}

	/**
	 * Extracts a value from the specified property of an object.
	 *
	 * @param {any=} obj The object to retrieve the value from.
	 * @param {any} defaultVal	The default value to return if not found (`obj` == null or a property
	 *        doesn't exist).  If the requested property _does_ exist, it's value
	 *        will always be returned, even if it is null.
	 * @param {string[]} props The property names, in the order they should be resolved.  For example,
	 *        if "protection" and "magic" are given, will attempt to retrieve the
	 *        value of `obj.protection.magic`.
	 *
	 * @return {any} The value retrieved from the `obj`, or the `defaultVal` if `obj` is null or a
	 *         specified property could not be found.
	 * @throws Error if a non-null primitive value is encountered at a non-terminal node in
	 *         the path (non-terminals should either be null or an object).
	 */
	static getProp(obj, defaultVal, ...props) {
		if (obj == null) {
			return defaultVal;
		}

		const propsLength = props.length - 1;
		let val = obj;
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
	 * @template T
	 * @param {T} value The value to check.
	 * @param {string} name Name to use in error messages to describe the value.
	 *
	 * @return {NonNullable<T>}
	 * @throws Error if `value` is null or undefined.
	 */
	static required(value, name = 'value') {
		if (value == null) {
			throw new Error(name + " required");
		}
		return value;
	}

	/**
	 * Converts a value to "Proper case" by converting the first character to uppercase
	 * and the remaining characters to lowercase.
	 *
	 * @param {any} val The value to convert (will be cast to a string if it's not already)
	 *
	 * @return {string} The proper cased version of the provided value.
	 */
	static toProperCase(val) {
		const s = String(val);
		if (s.length == 0) {
			return "";
		}

		return s[0].toUpperCase() + s.substring(1).toLowerCase();
	}

	/**
	 * Parses a value as a string.
	 *
	 * @param {any} val The value to parse.
	 * @param {string?} defaultVal The default value to return if `val` is null/undefined.  Will throw an
	 *        error if null/undefined and val is also null/undefined.
	 *
	 * @return {string} The parsed value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined.
	 */
	static str(val, defaultVal) {
		if (val == null) {
			return Parse.required(defaultVal, 'String value');
		}

		return String(val);
	} // str

	/**
	 * Parses a value as a number.
	 *
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to return if `val` is null/undefined.  Will throw
	 *        an error if null/undefined and `val` is also null/undefined.
	 * @param {boolean=} allowNaN whether to allow the parsed result to be NaN or fail if a number
	 *        cannot be parsed and the defaultVal is `Number.NaN`. (default = false)
	 *
	 * @return {number} The parsed number value.  This value will not be `NaN`, unless `defaultVal` is
	 * 			`Number.NaN` or `allowNaN` is true.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static num(val, defaultVal, allowNaN = false) {
		if (val == null) {
			val = Parse.required(defaultVal, "Number value");
		}

		const rv = Number(val);
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
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to return if `val` is null/undefined.  Will throw
	 *        an error if null/undefined and `val` is also null/undefined.
	 * @param {number} range If a value is parsed with a trailing % symbol ("12%"), this
	 *        value will be multiplied with the percentage before being returned.
	 *
	 * @return {number} The parsed value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static percent(val, defaultVal, range = 1) {
		if (val == null) {
			val = Parse.required(defaultVal, 'Percent value');
		}

		const m = /^\s*([-+.e0-9]+)\s*(%)?\s*$/i.exec(val);
		if (m == null) {
			throw new Error('Unable to parse value "'+ val +'" as percentage');
		}

		let v = Number(m[1]);
		if (Number.isNaN(v)) {
			throw new Error('Unable to parse value "'+ val +'" as percentage');
		}

		if (m[2] == "%") {
			v = (v / 100) * range;
		}

		return v;
	}

	/**
	 * Parses a value as an integer.
	 *
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to return if `val` is null/undefined.  Will throw
	 *        an error if null/undefined and `val` is also null/undefined.
	 * @param {number} radix The radix to use for parsing the value (default is 10).
	 *
	 * @return {number} The parsed integer value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static int(val, defaultVal, radix = 10) {
		if (val == null) {
			val = Parse.required(defaultVal, 'Int value');
		}

		const rv = parseInt(val, radix);
		if (Number.isNaN(rv)) {
			throw new Error('Unable to parse value "'+ val +'" as int');
		}

		return rv;
	} // int

	/**
	 * Parses a value as a boolean.
	 *
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to return if `val` is null/undefined.  Will throw
	 *        an error if null/undefined and `val` is also null/undefined.
	 *
	 * @return {boolean} The parsed boolean value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined.
	 */
	static bool(val, defaultVal) {
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
	 * @template T the enumeration type
	 * @param {T} enumType The type of enumeration to parse.
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to use, if val is null or undefined.
	 *
	 * @return {T[keyof T]} The parsed enumeration value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the name cannot be resolved as a valid enumeration value.
	 */
   static enum(enumType, val, defaultVal) {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('enum value required');
			}

			val = defaultVal;
		}

		const mapping = getEnumMapping(enumType);

		const name = String(val).toLowerCase();
		const rv = mapping[name];
		if (rv == null) {
			throw new Error('No such enum value: '+ val);
		}

		return rv;
	}

	/**
	 *
	 * @template T the element type of the array
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to use, if val is null or undefined.
	 * @param {((val: any) => T)=} parseCallback parsing function to apply to each element in the input.
	 *        If not specified, `Parse.any` will be used.
	 * @returns {T[]} the parsed array value.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the `parseCallback` throws an error while parsing a value.
	 */
	static array(val, defaultVal, parseCallback = Parse.any) {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('array value required');
			}

			val = defaultVal;
		}

		if (
			(typeof val === 'string') ||
			(typeof val[Symbol.iterator] !== 'function')
		) {
			return [parseCallback(val)];
		}

		// Object is iterable and not a string
		/** @type {T[]} */
		const result = [];
		for (let item of val) {
			result.push(parseCallback(item));
		}
		return result;
	}

	/**
	 * Parse a value as a Set<T>.
	 *
	 * The value is parsed as an array-like value as if by calling `Parse.array` and
	 * each item produced is added to the returned set.
	 *
	 * Since sets can only contain one instance of a given value, duplicate values are
	 * removed and the result may contain fewer entries than the input.
	 *
	 * @template T the element type of the set
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to use, if val is null or undefined.
	 * @param {(val: any) => T} parseCallback parsing function to apply to each element in
	 *        the input to produce items of the desired output element type.
	 * @returns {Set<T>} the parsed set of values.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the `parseCallback` throws an error while parsing a value.
	 */
	static set(val, defaultVal, parseCallback = Parse.any) {
		const list = Parse.array(val, defaultVal, parseCallback);
		/** @type {Set<T>} */
		const rv = new Set();
		for (let item of list) {
			rv.add(item);
		}
		return rv;
	}

	/**
	 * Returns `val` if not null or undefined, otherwise `defaultVal`
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The default value to use, if val is null or undefined.
	 * @returns {any} `val` if not null or undefined, otherwise `defaultVal`
	 */
	static any(val, defaultVal) {
		if (val == null) {
			val = defaultVal;
		}
		return val;
	}

	/**
	 * Parses a temperature value.
	 * Example temperature values: `12F`, `-2.5C`
	 *
	 * @param {any} val The value to parse.  Recognized units are: `F` (or none) = Fahrenheit,
	 *        `C` = Celsius
	 * @param {any} defaultVal The value to return if `val` is null/undefined.  If undefined, and `val`
	 *        is null/undefined, then an error will be thrown.
	 *
	 * @return {number} The parsed temperature value in degrees Fahrenheit.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static temperature(val, defaultVal) {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('Temperature value required');
			}

			val = defaultVal;
		}

		const m = /^\s*([-+.e0-9]+)\s*([fc]?)\s*$/i.exec(val);
		if (m == null) {
			throw new Error('Unable to parse value "'+ val +'" as temperature');
		}
		let v = Number(m[1]);
		if (Number.isNaN(v)) {
			throw new Error('Unable to parse value "'+ val +'" as temperature');
		}

		if (m[2].toLowerCase() == 'c') {
			v = 32 + v * 1.8;
		}

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
	 * @param {any} val The value to parse.
	 * @param {any} defaultVal The value to parse if `val` is null/undefined.  If undefined, and `val`
	 *        is null/undefined, then an error will be thrown.
	 * @param {string} defaultUnits The units to apply to unitless values and the return value.
	 *
	 * @return {number} The parsed duration value, in the units specified for `defaultUnits`.
	 * @throws Error if both `val` and `defaultVal` are null/undefined or
	 *         if the value cannot be parsed.
	 */
	static duration(val, defaultVal, defaultUnits = "m") {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('Duration value required');
			}

			val = defaultVal;
		}

		val = String(val);
		defaultUnits = defaultUnits.toLowerCase();

		let rv = 0;
		const re = /\s*([-+.e0-9]+)\s*(ms|[smhdw])?\s*/ig;
		let lastPos = 0;
		let m;

		while ((m = re.exec(val)) != null) {
			let v = Number(m[1]);
			if (Number.isNaN(v)) {
				throw new Error('Unable to parse value "'+ val +'" as duration (invalid numeric portion)');
			}

			const unitType = (m[2] == null ? defaultUnits : m[2].toLowerCase());
			const unitMultiplier = Parse.#durationUnitMap[unitType];
			if (unitMultiplier == null) {
				throw new Error('Unable to parse value "'+ val +'" as duration (invalid units: '+ unitType +')');
			}

			v *= unitMultiplier;

			lastPos = m.index + m[0].length;
			rv += v;
		}

		if ((lastPos < val.length) || (val.length == 0)) {
			throw new Error('Unparseable value "'+ val.substr(lastPos) +'" when parsing duration: '+ lastPos +" "+ re.lastIndex +" "+ val.length);
		}

		return rv / Parse.#durationUnitMap[defaultUnits];
	} // duration

	/**
	 * Parses a value as a URL, resolving relative URLs using the currently effective base URL.
	 *
	 * @param {string|URL|null} val the URL to resolve.
	 * @param {any} defaultVal the default Javascript code to use if val is undefined.
	 *
	 * @return {URL} a URL instance representing the resolved absolute URL.
	 * @see {@link baseUrl}
	 */
	static url(val, defaultVal) {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('URL value required');
			}

			val = defaultVal;
		}

		console.log("Parse.url: ref=" + val + " base=" + Parse.baseUrl + " result = " + new URL(val, Parse.baseUrl))
		return new URL(val, Parse.baseUrl);
	}

	/**
	 * Parses a string of Javascript into a Function object accepting the specified parameters.
	 *
	 * Example:
	 * ```
	 *     const sayHello = Parse.action("return 'Hello, ' + name + '!';", null, ["name"]);
	 *     console.log(sayHello("Bob"));  // Outputs "Hello, Bob!"
	 * ```
	 *
	 * @param {ActionDefinition|RegisteredAction|string|function|null} val the action
	 *        definition, a reference to a previously registered action, Javascript
	 *        code to use as the function body or a function. If code is provided, it
	 *        is evaluated in strict mode.
	 * @param {any} defaultVal the default action value to use if val is undefined.
     * @param {(({[name:string]: any}) => void)?} parameterResolver function invoked with the
	 *        parsed action parameters which can perform validation or augmentation, such as
	 *        resolving resources from URLs, etc.
	 *
	 * @return {ActionCallback} a Function instance
	 */
	static action(val, defaultVal, parameterResolver) {
		if (val == null) {
			if (defaultVal == null) {
				throw new Error('Action value required');
			}

			val = defaultVal;
		}

		if (typeof val == 'function') {
			return val;
		}

		/** @Type {ActionCallback} */
		let actionCallback;

		if (val.action != null) {
			if (parameterResolver && (val.parameters != null)) {
				resourceResolver(val.parameters);
			}

			actionCallback = GameState.getActionManager().get(val.action, val.parameters);
		} else if (val.body) {
			const parameters = val.parameters;
			const body = Parse.str(val.body);

			if (parameterResolver && (parameters != null)) {
				resourceResolver(parameters);
			}

			actionCallback = new Function(["parameters"], '"use strict";' + body);
			actionCallback.actionConfig = { body, parameters };
			actionCallback.constructor = ActionCallbackConstructor;

			if (val.name) {
				actionCallback.actionConfig.name = val.name;
				GameState.getActionManager().registerAction(val.name, actionCallback, parameters);
			}
		} else {
			const body = Parse.str(val);
			actionCallback = new Function(["parameters"], '"use strict";' + body);
			actionCallback.actionConfig = { body };
			actionCallback.constructor = ActionCallbackConstructor;
		}

		return actionCallback;
	}

	/**
	 * Parses the value as an event listener function taking a single Event parameter named "event".
	 *
	 * @param {any} val the Javascript code to use as the function body. This code is evaluated in strict mode.
	 * @param {any} defaultVal
	 *
	 * @return {EventListenerCallback}
	 */
	static listener(val, defaultVal) {
		/** @type {EventListenerCallback} */
		const callback = Parse.action(val, defaultVal);
		callback.constructor = Parse.listener;
		callback.processEvent = callback;
		return callback;
	}

} // Parse

/**
 *
 * @param {ActionCallback} obj
 * @param {Serializer} serializer
 */
function serializeCallback(obj, serializer) {
	serializer.writeProp(obj.actionConfig);
}

/**
 *
 * @param {ActionCallback} obj
 * @param {any} data
 * @param {Deserializer} deserializer
 */
function deserializeCallback(obj, data, deserializer) {
	// Do nothing
}

ClassRegistry.registerClass(
	'ActionCallback', ActionCallbackConstructor, serializeCallback, deserializeCallback,
	(entry, data, deserializer) => {
		return Parse.action(data);
	}
);

ClassRegistry.registerClass(
	'EventListenerCallback', Parse.listener, serializeCallback, deserializeCallback,
	(entry, data, deserializer) => {
		return Parse.listener(data);
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
 * @param {any} enumType the enumeration object to retrieve the mapping for.
 *
 * @return {any} The mapping.
 * @throws Error if the structure of `enumType` is not valid.
 */
function getEnumMapping(enumType) {
	// Retrieve or populate a lower-cased, value-normalized version of the enumeration mapping
	let rv = _enumMapping.get(enumType);
	if (rv == null) {
		rv = {};
		for (let key in enumType) if (enumType.hasOwnProperty(key)) {
			let val = enumType[key];

			// Proper enum type should either be string->string or string->number/number->string
			const keyIsNumeric = !Number.isNaN(Number(key));
			const valIsString = (typeof val === "string");
			const valIsNumeric = (typeof val === "number");

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
			if (rv[key] != null) {
				throw new Error("Found duplicate enum key '"+ key +"'. (this method ignores case differences for enum keys)");
			}

			rv[key] = val;
		}
		_enumMapping.set(enumType, rv);
	}

	return rv;
}

/**
 * @type {Map<any, any>}
 */
const _enumMapping = new Map();
