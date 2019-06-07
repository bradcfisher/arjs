import { ItemTypeConfig, ItemType, ItemTypeCategory } from "./ItemType";
import { Parse } from "./Parse";
import { ClassRegistry, Serializer, Deserializer, SerializedData } from "./Serializer";
import { Configurable } from "./Configurable";

/**
 * Collection of ItemTypes.
 */
export class ItemTypes
	extends Map<string, ItemType>	// item id => ItemType
	implements Configurable<ReadonlyArray<ItemTypeConfig>>
{
	// category => map{ itemid => ItemType }
	private readonly _categories: Map<string, Map<string, ItemType>> = new Map();

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_ItemTypes: void = (() => {
		ClassRegistry.registerClass(
			"ItemTypes", ItemTypes,
			(obj: ItemTypes, serializer: Serializer): void => {
				serializer.writeProp("types", obj.config);
			},
			(obj: ItemTypes, data: SerializedData, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data, "types") as ItemTypeConfig[]);
			}
		);
	})();

	constructor(config?: ReadonlyArray<ItemTypeConfig>|ItemTypes|Iterable<ItemType>) {
		super();

		if (config != null)
			this.configure(config);
	}

	configure(config?: ReadonlyArray<ItemTypeConfig>|ItemTypes|Iterable<ItemType>): void {
		if (config instanceof ItemTypes)
			config = config.values();

		let items: ItemType[] = Parse.array(config, [], (c: ItemTypeConfig) => ItemType.create(c));

		this.clear();
		this._categories.clear();

		for (let item of items) {
			if (this.has(item.id))
				throw new Error("Duplicate item id: "+ item.id);

			let category: Map<string, ItemType>|undefined = this._categories.get(item.category);
			if (category == null) {
				category = new Map();
				this._categories.set(item.category, category);
			}

			category.set(item.id, item);
			this.set(item.id, item);
		}
	}

	get config(): ReadonlyArray<ItemTypeConfig> {
		let rv: ItemTypeConfig[] = [];

		for (let type of this.values())
			rv.push(type.config);

		return rv;
	}

	categories(): string[] {
		return Array.from(this._categories.keys());
	}

	category(type: ItemTypeCategory): ItemTypes|undefined {
		let rv: ItemTypes = new ItemTypes();

		let cat: Map<string, ItemType>|undefined = this._categories.get(type);
		if (cat != null) {
			for (let [id,type] of cat.entries())
				cat.set(id, type);
		}

		return rv;
	}

	filter(predicate: (type: ItemType) => boolean): ItemTypes {
		let rv: ItemTypes = new ItemTypes();

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