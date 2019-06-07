import { Parse } from "./Parse"
import { ActiveEffect, ActiveEffectConfig, Effect } from "./Effect"
import { EffectTarget } from "./Effect";
import { Configurable } from "./Configurable";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";

export interface ReadonlyActiveEffects
	extends ReadonlyArray<ActiveEffect>
{
	readonly target: EffectTarget;
	readonly config: ReadonlyArray<ActiveEffectConfig>;
	configure(config?: ReadonlyArray<ActiveEffectConfig>|ActiveEffects): void;
	removeByType(type: Effect.Type): void;
	remove(effect: ActiveEffect, invokeCancel: boolean): boolean;
}

/**
 * Collection of active effects for an EffectTarget.
 */
export class ActiveEffects
	extends Array<ActiveEffect>
	implements ReadonlyActiveEffects, Configurable<ReadonlyArray<ActiveEffectConfig>>
{

	private _target: EffectTarget;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_ActiveEffects: void = (() => {
		ClassRegistry.registerClass(
			"ActiveEffects", ActiveEffects,
			(obj: ActiveEffects, serializer: Serializer): void => {
				serializer.writeProp("effects", obj.config);
			},
			(obj: ActiveEffects, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data, "effects") as ReadonlyArray<ActiveEffectConfig>);
			}
		);
	})();


	// TODO: Inheriting from Array may be problematic here...  The array methods that construct new arrays
	//   will try to call this constructor, leaving the target unassigned in the new instance.
	//   The first parameter passed in from those methods may also be the array length,
	//   which would have adverse consequences here.
	//   See the LatentEffects collection for ideas on how to address the problem (though that
	//   doesn't have the target property that requires initialization).
	constructor(
		target: EffectTarget,
		config?: ReadonlyArray<ActiveEffectConfig>|ActiveEffects
	) {
		super();
		this._target = target;
		this.configure(config);
	}

	configure(config?: ReadonlyArray<ActiveEffectConfig>|ActiveEffects): void {
		if (config instanceof ActiveEffects)
			config = config.config;

		this.length = 0;
		if (config == null) {
			this.push(...Parse.array(
				config, [],
				(effect:ActiveEffectConfig) => new ActiveEffect(effect, this.target)
			));
		}
	}

	get config(): ReadonlyArray<ActiveEffectConfig> {
		return this.map((item) => item.config);
	}

	get target(): EffectTarget {
		return this._target;
	}

	trigger(triggerType: string): void {
		for (let effect of this) {
			effect.trigger(triggerType, this.target);
		}
	}

	/**
	 * Removes all entries with the specified type value.
	 * @param type the type of the items to remove.
	 */
	removeByType(type: Effect.Type): void {
		let vals = this.filter(item => item.type != type);
		this.length = 0;
		this.push(...vals);
	}

	/**
	 * Removes the specified effect from the collection, if it's found.
	 * @param effect the effect to remove.
	 * @param invokeCancel whether to invoke the effect's cancel method after removing it.
	 *      Use caution when setting this to false! The effect will still be active until
	 *      its cancel method is called or it expires, but it will not appear in the
	 *      target's list of effects anymore.
	 * @return `true` if the effect was found and removed, `false` if not found.
	 */
	remove(effect: ActiveEffect, invokeCancel: boolean = true): boolean {
		let index: number = this.indexOf(effect);
		if (index != -1) {
			this.splice(index, 1);
			effect.cancel();
			return true;
		}
		return false;
	}
}
