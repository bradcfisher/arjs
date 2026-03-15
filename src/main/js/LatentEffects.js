import { Parse } from "./Parse.js"
import { LatentEffect, LatentEffectConfig, EffectTarget, EffectType } from "./Effect.js"
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";

/**
 * @interface
 * @extends {ReadonlyArray<LatentEffect>}
 */
export class ReadonlyLatentEffects {
	/**
	 * @readonly
	 * @type {ReadonlyArray<LatentEffectConfig>}
	 */
	config;

	/**
	 *
	 * @param {(ReadonlyArray<LatentEffectConfig>|ReadonlyLatentEffects)=} config
	 */
	configure(config) {}

	/**
	 *
	 * @param {EffectType} type
	 */
	removeByType(type) {}

	/**
	 *
	 * @param {LatentEffect} effect
	 * @return {boolean}
	 */
	remove(effect) {}
}

/**
 * Collection of effects associated with an Item.
 *
 * @extends {Array<LatentEffect>}
 * @implements {ReadonlyLatentEffects}
 * @implements {Configurable<ReadonlyArray<LatentEffectConfig>>}
 */
export class LatentEffects extends Array {

	/**
	 * Constructs a new instance.
	 */
	/**
	 * May be called from inherited array methods (e.g. Map)
	 * @overload
	 * @param {number} size
	 */
	/**
	 * @overload
	 * @param {ReadonlyArray<LatentEffect|LatentEffectConfig>} config
	 */
	/**
	 * @overload
	 * @param {any[]} args
	 */
	constructor(...args) {
		// If we were passed a single number, pass it onto the super constructor
		// Otherwise, don't pass anything
		super(...((args.length == 1 && typeof args[0] === "number") ? args : []));

		// Received something other than a single number, pass whatever we got to configure
		if ((args.length > 0) && (typeof args[0] !== "number")) {
			this.configure(args);
		}
	}

	/**
	 *
	 * @param {ReadonlyArray<LatentEffect|LatentEffectConfig>?} config
	 */
	configure(config) {
		if (config instanceof LatentEffects)
			config = config.config;

		this.length = 0;
		if (config != null) {
			this.push(...Parse.array(
				config, [],
				(effect) => new LatentEffect(effect)
			));
		}
	}

	/**
	 * @type {ReadonlyArray<LatentEffectConfig>}
	 */
	get config() {
		return this.map((item) => item.config);
	}

	/**
	 *
	 * @param {string} triggerType
	 * @param {EffectTarget} target
	 */
	trigger(triggerType, target) {
		for (let effect of this) {
			effect.trigger(triggerType, target);
		}
	}

	/**
	 * Removes all entries with the specified type value.
	 * @param {EffectType} type the type of the items to remove.
	 */
	removeByType(type) {
		let vals = this.filter(item => item.type != type);
		this.length = 0;
		this.push(...vals);
	}

	/**
	 * Removes the specified effect from the collection, if it's found.
	 * @param {LatentEffect} effect the effect to remove.
	 * @return {boolean} `true` if the effect was found and removed, `false` if not found.
	 */
	remove(effect) {
		const index = this.indexOf(effect);
		if (index != -1) {
			this.splice(index, 1);
			return true;
		}
		return false;
	}
}


/**
 * Static initializer for registering deserializer with private member access.
 */
(() => {
	ClassRegistry.registerClass(
		"LatentEffects", LatentEffects,
		(obj, serializer) => {
			serializer.writeProp("effects", obj.config);
		},
		(obj, data, deserializer) => {
			obj.configure(deserializer.readProp(data, "effects"));
		}
	);
})();