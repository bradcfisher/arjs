
import { ScenarioMap, MapCell, WallType } from "./ScenarioMap";

export class CityMapReader {

    private _map: ScenarioMap;

    // Array of indexes to assist in mapping to the descriptions below.
    // Index to this array is the top-nibble of the location data.
    // Value is starting index in descriptions for that location type.
    private _descIndexes: number[] = [ ];

    constructor(width: number = 64, height: number = 64) {
        this._map = new ScenarioMap(width, height);
        this._map.description = "Map for Alternate Reality: The City";

        // Basic descriptions
        this._map.descriptions.push(...[
            "on a Street",
            "on a Side Street",
            "on a Back Alley",
            "on a Main Street",
            "in a Street",
            "at the City Square",
            "at the City Wall",
            "in a Secret passage",
            "in a Secret alley",
            "at the Northern Gate",
            "at the Southern Gate",
            "at the Western Gate",
            "at the Royale Walkway",
            "in an Alley",
            "in an Enclosed Area",
            "in an Alcove"
        ]);

        // Inns (0x10)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the Green Boar Inn",
            "at the Lazy Griffin Inn",
            "at the Sleeping Dragon Inn",
            "at the Travellers Inn",
            "at the Midnight Inn",
            "at the Warriors Retreat Inn",
            "at the Royal Resort"
        ]);

        // Taverns (0x30)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the Flaming Dragon Tavern",
            "at the Misty Mountain Tavern",
            "at the Screaming Siren Bar",
            "at the Happy Hunter Rest Stop",
            "at the Dancing Nymph Tavern",
            "at the Club",
            "at the Black Devil Tavern",
            "at the Lost Oasis Tavern",
            "at the Last Stop",
            "at the Tail of the Dog",
            "at Club Babalyon",
            "at the Lost Tears Tavern",
            "at Mom's Bar",
            "at Lusty Lloyds"
        ]);

        // Banks (0x50)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the First City Bank",
            "at the Granite Bank",
            "at the Grams Gold Exchange"
        ]);

        // Shops (0x70)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at Smiley's Shop",
            "at the Honest Trader",
            "at the Adventurers Outfitters",
            "at the Warrior's Supplies",
            "at the General Store",
            "at the Exclusive Outfitters",
            "at the Ono Goods",
            "at the Best Bargain Store",
            "at the Grubron Imports",
            "at the Betelguese Sales",
            "at the Merchants Grotto",
            "at the Sunset Market",
            "at Pauline's Emporium",
            "at Da Place",
            "at the Trade Winds"
        ]);

        // Smiths (0x90)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the Sharp Weaponsmiths",
            "at Occum's Weaponsmiths",
            "at the Best Armorers",
            "at the Knights Armorers"
        ]);

        // Scenarios (0xB0)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the House of Ill-Repute",
            "at Acrinimiril's Gate",
            "at the Floating Gate",
            "at the Arena",
            "at the Palace",
            "at the Palace Gate",
            "at an entrance to The Dungeon",
            "at the Maximum Casino",
            "at the Arena Entrance",
            "at Jack's Fitness Academy",
            "at the Armstrong Builders",
            "at the Apollo Trainers",
            "at Grog's Weapons Trainers",
            "at the Flash Weapons Trainers",
            "at David's Weapons Trainers"
        ]);

        // Healers (0xD0)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the One Way Soothers",
            "at the Alpha Omega Healers"
        ]);

        // Guilds (0xF0)
        this._descIndexes.push(0, this._map.descriptions.length);
        this._map.descriptions.push(...[
            "at the Thieves Guild",
            "at the Blue Wizards Guild",
            "at the Light Wizards Guild",
            "at the Paladins Guild",
            "at the Green Wizards Academy",
            "at the Red Wizards University",
            "at the Dark Wizards Guild",
            "at the Star Wizards Guild",
            "at the Wizards of Chaos Guild",
            "at the Wizards of Law Guild",
            "at the Mercenary Guild",
            "at the Guild of Order",
            "at the Physicians Guild",
            "at the Assassins Guild"
        ]);

        // TODO: Define city MapZoneRefs for the various environmental effects (smithy hammer, palace fanfare, enclosed areas, etc?)
    }

    /**
     * Maps a 'City' wall type to a 'Dungeon' wall type.
     * @param wallType The wall type to map.
     * @return the mapped WallType value.
     * @throws Error if the type value could not be mapped.
     */
    mapWallType(wallType: number): WallType {
        switch (wallType) {
            case 0: return WallType.None;
            case 1: return WallType.Wall;
            case 2: return WallType.SecretDoor;
            case 3: return WallType.Door;
            default:
                throw new Error("Unknown wall type value: "+ wallType);
        }
    }

    /**
     * Reads a city map walls file.
     * The map for the city is always a 64x64 grid.
     * Walls for each cell are encoded in a single byte per cell.
     *
     *  L| D| R| U
     * --+--+--+--
     * 76|54|32|10
     *
     *   L = The type of wall to apply to the left edge of the cell
     *   D = The type of wall to apply to the bottom edge of the cell
     *   R = The type of wall to apply to the right edge of the cell
     *   U = The type of wall to apply to the top edge of the cell
     *
     * Wall types are:
     *
     *   00 (0) - No wall / open
     *   01 (1) - Wall
     *   10 (2) - Secret door
     *   11 (3) - Door
     *
     * @param buffer the buffer containing the map data to read.
     * @throws Error if an invalid buffer is provided.
     */
    readWalls(buffer: ArrayBuffer): void {
        if (buffer == null) {
            throw new Error("You must provide a buffer");
        }

        let width = this._map.width;
        let height = this._map.height;

        let expectedSize: number = width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length "+ buffer.byteLength +" != "+ expectedSize +")");
        }

        let buf: Uint8Array = new Uint8Array(buffer);

        let pos: number = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                let walls: number = buf[pos++];
                let cell: MapCell = this._map.getCell(x, y);

                cell.west = this.mapWallType((walls >> 6) & 3);
                cell.south = this.mapWallType((walls >> 4) & 3);
                cell.east = this.mapWallType((walls >> 2) & 3);
                cell.north = this.mapWallType(walls & 3);
            }
        }

        // TODO: Define zones? (e.g. around Palace, Smithys)

    }

    /**
     * Reads the location codes file an updates the specified map.
     *
     * @param buffer the buffer containing the map location to read.
     * @throws Error if an invalid buffer is provided.
     */
    readLocationCodes(buffer: ArrayBuffer): void {
        if (buffer == null) {
            throw new Error("You must provide a buffer");
        }

        let width = this._map.width;
        let height = this._map.height;

        let expectedSize: number = width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length "+ buffer.byteLength +" != "+ expectedSize +")");
        }

        let buf: Uint8Array = new Uint8Array(buffer);

        let pos: number = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                let data: number = buf[pos++];
                let cell: MapCell = this._map.getCell(x, y);

                let type: number = (data >> 4) & 0xF;
                cell.descriptionIndex = this._descIndexes[type] + (data & 0xF);

                if ((type & 3) == 2) {
                    // Enclosed area
                    cell.ceiling = (type >> 2) + 1;
                    cell.floor = (type >> 2) + 1;
                }

                // TODO: Map the scenario value to a common format merged with the dungeon values.
                cell.special = data;

                // TODO: Update special?
                // Do bits 6 & 7 have any special meaning for enclosed other than the colors?
                // What do bits 6 & 7 mean for regular (non-scenario, non-enclosed squares)?

            }
        }
    }

    get map(): ScenarioMap {
        return this._map;
    }
}