import { Parse } from "./Parse.js"
import { ActiveEffect, ActiveEffectConfig, EffectType } from "./Effect.js"
import { EffectTarget } from "./Effect.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";

/**
 * @interface
 * @extends ReadonlyArray<ActiveEffect>
 */
export class ReadonlyActiveEffects {
	/**
	 * @readonly
	 * @type {EffectTarget}
	 */
	target;

	/**
	 * @readonly
	 * @type {ReadonlyArray<ActiveEffectConfig>}
	 */
	config;

	/**
	 *
	 * @param {(ReadonlyArray<ActiveEffectConfig>|ActiveEffects)?} config
	 */
 	configure(config) {};

	/**
	 *
	 * @param {EffectType} type
	 */
	removeByType(type) {}

	/**
	 *
	 * @param {ActiveEffect} effect
	 * @param {boolean} invokeCancel
	 *
	 * @return {boolean}
	 */
 	remove(effect, invokeCancel) {}
 }


/**
 * Collection of active effects for an EffectTarget.
 *
 * @extends Array<ActiveEffect>
 * @implements {ReadonlyActiveEffects}
 * @implements {Configurable<ReadonlyArray<ActiveEffectConfig>>}
 */
export class ActiveEffects extends Array {

	/**
	 * @type EffectTarget
	 */
	#target;

	// TODO: Inheriting from Array may be problematic here...  The array methods that construct new arrays
	//   will try to call this constructor, leaving the target unassigned in the new instance.
	//   The first parameter passed in from those methods may also be the array length,
	//   which would have adverse consequences here.
	//   See the LatentEffects collection for ideas on how to address the problem (though that
	//   doesn't have the target property that requires initialization).
	/**
	 *
	 * @param {EffectTarget} target
	 * @param {(ReadonlyArray<ActiveEffectConfig>|ActiveEffects)?} config
	 */
	constructor(target, config) {
		super();
		this._target = target;
		this.configure(config);
	}

	/**
	 *
	 * @param {(ReadonlyArray<ActiveEffectConfig>|ActiveEffects)?} config
	 */
	configure(config) {
		if (config instanceof ActiveEffects)
			config = config.config;

		this.length = 0;
		if (config == null) {
			this.push(...Parse.array(
				config, [],
				(effect) => new ActiveEffect(effect, this.target)
			));
		}
	}

	/**
	 * @type {ReadonlyArray<ActiveEffectConfig>}
	 */
	get config() {
		return this.map((item) => item.config);
	}

	/**
	 * @type {EffectTarget}
	 */
	get target() {
		return this.#target;
	}

	/**
	 *
	 * @param {string} triggerType
	 */
	trigger(triggerType) {
		for (let effect of this) {
			effect.trigger(triggerType, this.target);
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
	 * @param {ActiveEffect} effect the effect to remove.
	 * @param {boolean} invokeCancel whether to invoke the effect's cancel method after removing it.
	 *      Use caution when setting this to false! The effect will still be active until
	 *      its cancel method is called or it expires, but it will not appear in the
	 *      target's list of effects anymore.
	 * @return {boolean} `true` if the effect was found and removed, `false` if not found.
	 */
	remove(effect, invokeCancel = true) {
		const index = this.indexOf(effect);
		if (index != -1) {
			this.splice(index, 1);
			effect.cancel();
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
		"ActiveEffects", ActiveEffects,
		(obj, serializer) => {
			serializer.writeProp("effects", obj.config);
		},
		(obj, data, deserializer) => {
			obj.configure(deserializer.readProp(data, "effects"));
		}
	);
})();