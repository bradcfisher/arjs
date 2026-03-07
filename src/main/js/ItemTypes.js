import { ItemTypeConfig, ItemType, ItemTypeCategory } from "./ItemType";
import { Parse } from "./Parse";
import { ClassRegistry } from "./Serializer";
import { Configurable } from "./Configurable";

/**
 * Collection of ItemTypes.
 *
 * @extends {Map<string, ItemType>}
 * @implements {Configurable<ReadonlyArray<ItemTypeConfig>>}
 */
export class ItemTypes
	extends Map	// item id => ItemType
{
	/**
	 * category => map{ itemid => ItemType }
	 *
	 * @readonly
	 * @type {Map<string, Map<string, ItemType>>}
	 */
	#categories = new Map();

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static _initializeClass_ItemTypes = (() => {
		ClassRegistry.registerClass(
			"ItemTypes", ItemTypes,
			(obj, serializer) => {
				serializer.writeProp("types", obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data, "types"));
			}
		);
	})();

	/**
	 *
	 * @param {(ReadonlyArray<ItemTypeConfig>|ItemTypes|Iterable<ItemType>)?} config
	 */
	constructor(config) {
		super();

		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 *
	 * @param {(ReadonlyArray<ItemTypeConfig>|ItemTypes|Iterable<ItemType>)?} config
	 */
	configure(config) {
		if (config instanceof ItemTypes) {
			config = config.values();
		}

		const items = Parse.array(config, [], (c) => ItemType.create(c));

		this.clear();
		this.#categories.clear();

		for (let item of items) {
			if (this.has(item.id)) {
				throw new Error("Duplicate item id: "+ item.id);
			}

			let category = this.#categories.get(item.category);
			if (category == null) {
				category = new Map();
				this.#categories.set(item.category, category);
			}

			category.set(item.id, item);
			this.set(item.id, item);
		}
	}

	/**
	 * @type {ReadonlyArray<ItemTypeConfig>}
	 */
	get config() {
		/** @type {ItemTypeConfig[]} */
		let rv = [];

		for (let type of this.values())
			rv.push(type.config);

		return rv;
	}

	categories() {
		return Array.from(this.#categories.keys());
	}

	/**
	 *
	 * @param {ItemTypeCategory} type
	 * @returns {ItemTypes|undefined}
	 */
	category(type) {
		const rv = new ItemTypes();

		const cat = this.#categories.get(type);
		if (cat != null) {
			for (let [id,type] of cat.entries()) {
				cat.set(id, type);
			}
		}

		return rv;
	}

	/**
	 *
	 * @param {(type: ItemType) => boolean} predicate
	 * @returns {ItemTypes}
	 */
	filter(predicate) {
		const rv = new ItemTypes();

		for (let type of this.values()) {
			if (predicate(type)) {
				rv.set(type.id, type);
			}
		}

		return rv;
	}

/*
	static create(id: string): Item {
		// TODO: Create a new Item of the specified type
	}
*/

}