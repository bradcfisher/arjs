
/**
 * @interface
 * @template T the type of confguration supported by this object.
 */
export class Configurable {
    /**
     * Applies the specified configuration to this object.
     * @param {T} config the configuration to apply.
     */
    configure(config) {};

    /**
     * Retrieves a configuration describing this object.
     * @readonly
     * @type T
     */
    config;
}
