import { Parse } from "./Parse"
import { LatentEffect, LatentEffectConfig, EffectTarget, Effect } from "./Effect"
import { Configurable } from "./Configurable";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { createSecurePair } from "tls";

export interface ReadonlyLatentEffects
	extends ReadonlyArray<LatentEffect>
{
	readonly config: ReadonlyArray<LatentEffectConfig>;
	configure(config?: ReadonlyArray<LatentEffectConfig>|ReadonlyLatentEffects): void;
	removeByType(type: Effect.Type): void;
	remove(effect: LatentEffect): boolean;
}

/**
 * Collection of effects associated with an Item.
 */
export class LatentEffects
	extends Array<LatentEffect>
	implements ReadonlyLatentEffects, Configurable<ReadonlyArray<LatentEffectConfig>>
{

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_LatentEffects: void = (() => {
		ClassRegistry.registerClass(
			"LatentEffects", LatentEffects,
			(obj: LatentEffects, serializer: Serializer): void => {
				serializer.writeProp("effects", obj.config);
			},
			(obj: LatentEffects, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data, "effects") as ReadonlyArray<LatentEffectConfig>);
			}
		);
	})();

	constructor();
	constructor(size: number);	// Map be called from inherited array methods (e.g. Map)
	constructor(config: ReadonlyArray<LatentEffect>);
	constructor(config: ReadonlyArray<LatentEffectConfig>);
	constructor(...args: any) {
		// If we were passed a single number, pass it onto the super constructor
		// Otherwise, don't pass anything
		super(...((args.length == 1 && typeof args[0] === "number") ? args : []));

		// Received something other than a single number, assume it's a
		if ((args.length > 0) && (typeof args[0] !== "number")) {
			this.configure(args);
		}
	}

	configure(config?: ReadonlyArray<LatentEffectConfig>|ReadonlyLatentEffects): void {
		if (config instanceof LatentEffects)
			config = config.config;

		this.length = 0;
		if (config != null) {
			this.push(...Parse.array(
				config, [],
				(effect:LatentEffectConfig) => new LatentEffect(effect)
			));
		}
	}

	get config(): ReadonlyArray<LatentEffectConfig> {
		return this.map((item) => item.config);
	}

	trigger(triggerType: string, target: EffectTarget): void {
		for (let effect of this) {
			effect.trigger(triggerType, target);
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
	 * @return `true` if the effect was found and removed, `false` if not found.
	 */
	remove(effect: LatentEffect): boolean {
		let index: number = this.indexOf(effect);
		if (index != -1) {
			this.splice(index, 1);
			return true;
		}
		return false;
	}
}
