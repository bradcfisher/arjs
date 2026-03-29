
/**
 * Multi-map proxy wrapper.
 * @template K the key type
 * @template V the value type
 * @extends {Map<K,V>}
 */
export class ProxyMap extends Map {
	#maps;

    /**
     * @param  {...Map<K, V>} maps the list of maps to proxy.
     */
	constructor(...maps) {
		super();
		this.#maps = maps;
        this[Symbol.iterator] = this.entries;
	}

    /**
     * Unsupported operation.
     * @throws {Error} when called.
     */
	clear() {
		throw new Error("clear is unsupported");
	}

    /**
     * Unsupported operation.
     * @throws {Error} when called.
     */
    delete(key) {
        throw new Error("delete is unsupported");
	}

    /**
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     * @param {(value: V, key: K, map: Map<K, V>) => void} callbackFn A function to execute for
     *        each entry in the map.
     * @param {any?} thisArg A value to use as this when executing callbackFn.
     */
    forEach(callbackFn, thisArg) {
        this.#maps.forEach((val) => val.forEach(callbackFn, thisArg));
    }

    /**
     * Returns the first value corresponding to the key in this Map, or undefined if there is none.
     *
     * @param {K} key The key of the value to return from the Map object. Object keys are
     *        compared by reference, not by value.
     *
     * @returns {V} The value associated with the specified key in the Map object. If the key can't
     *          be found, undefined is returned.
     */
    get(key) {
        for (let map of this.#maps) {
            if (map.has(key)) {
                return map.get(key);
            }
        }
        return undefined;
    }

    /**
     * Returns a boolean indicating whether an entry with the specified key exists in this Map
     * or not.
     *
     * @param {K} key The key of the entry to test for presence in the Map object. Object keys
     *        are compared by reference, not by value.
     *
     * @returns {boolean} Returns true if an entry with the specified key exists in the Map
     *          object; otherwise false.
     */
    has(key) {
        for (let map of this.#maps) {
            if (map.has(key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Unsupported operation.
     * @throws {Error} when called.
     */
    set(key, value) {
        throw new Error("set is unsupported");
    }

    get size() {
        let s = 0;
        this.#maps.forEach((map) => s += map.size);
        return s;
    }

    /**
     * Unsupported operation.
     * @throws {Error} when called.
     */
    getOrInsert(key, defautlValue) {
        throw new Error("getOrInsert is unsupported");
    }

    /**
     * Unsupported operation.
     * @throws {Error} when called.
     */
    getOrInsertComputed(key, callback) {
        throw new Error("getOrInsertComputed is unsupported");
    }

    *entries() {
        for (let map of this.#maps) {
            yield* map.entries;
        }
    }

    *keys() {
        for (let map of this.#maps) {
            yield* map.keys;
        }
    }

    *values() {
        for (let map of this.#maps) {
            yield* map.values;
        }
    }
}