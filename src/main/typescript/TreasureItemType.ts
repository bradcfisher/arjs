import { ItemType, ItemTypeConfig } from "./ItemType";
import { Parse } from "./Parse";

// Typescript doesn't let you equate an enum and a string union type
// However, this approach produces a similar effect (just no true enum type)
// See https://stackoverflow.com/questions/52393730/typescript-string-literal-union-type-from-enum
const lit = <V extends keyof any>(v: V) => v;
export const TreasureType = {
    gold: lit("gold"),
    silver: lit("silver"),
    copper: lit("copper"),
    foodPacket: lit("foodPacket"),
    waterFlask: lit("waterFlask"),
    torch: lit("torch"),
    gem: lit("gem"),
    jewel: lit("jewel"),
    crystal: lit("crystal"),
    key: lit("key"),
    compass: lit("compass"),
    timepiece: lit("timepiece")
}

export type TreasureType = (typeof TreasureType)[keyof typeof TreasureType];

export interface TreasureItemTypeConfig extends ItemTypeConfig {
    readonly type?: TreasureType;
}

export class TreasureItemType
    extends ItemType
{

    private _type: TreasureType = TreasureType.copper;

    constructor(config?: TreasureItemTypeConfig|TreasureItemType) {
        super(config);

        if (config instanceof TreasureItemType)
            config = config.config;

        if (config != null)
            this.configureTreasure(config);
    }

    configureTreasure(config: TreasureItemTypeConfig): void {
        this._type = Parse.enum(TreasureType, config.type);
    }

    configure(config: TreasureItemTypeConfig): void {
        super.configure(config);
        this.configureTreasure(config)
    }

    get config(): TreasureItemTypeConfig {
        return Object.assign(
            super.config,
            {
                type: this.type
            }
        );
    }

    get type(): TreasureType {
        return this._type;
    }

}

