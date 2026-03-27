
import { MapReader } from "./MapReader.js";
import { Parse } from "./Parse.js";
import { CityMapOptionsConfig } from "./Scenario.js";
import { ScenarioMap } from "./ScenarioMap.js";


export class CityMapReader extends MapReader {

    /**
     *
     * @param {number} width the width of the map in cells. Only provide for non-standard map sizes.
     * @param {number} height the height of the map in cells. Only provide for non-standard map sizes.
     */
    constructor(width = 64, height = 64) {
        super(width, height);
        this.map.metadata.description = "Map for Alternate Reality: The City";
    }

    /**
     * Reads the specified wall JSON definitions into the map using the global ResourceManager.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the
     * method returns. In addition to the promise returned, a 'complete' listener may also be used
     * to detect when all pending load operations have completed.
     *
     * @param {string|string[]} source the location(s) of the description JSON to load. If a
     *        relative reference is provided, it will be resolved using {@link Parse.url}.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     */
    async readJsonDescriptions(source) {
        for (let url of Parse.array(source, [], Parse.url)) {
            const loaded = await this.resourceManager.load(url);
            const descriptions = loaded[url].data;
            const map = this.map;
            map.descriptions = [];
            descriptions.forEach((entry) => {
                let index = entry.startIndex;
                entry.descriptions.forEach((description) => {
                    map.descriptions[index++] = description;
                });
            });
        }
    }

    /**
     * Maps a 'City' wall type to a 'Dungeon' wall type.
     * @param {number} wallType The wall type to map.
     * @return the mapped WallType value.
     * @throws Error if the type value could not be mapped.
     */
    #mapWallType(wallType) {
        switch (wallType) {
            case 0: return 0;   // None
            case 1: return 13;  // Wall
            case 2: return 5;   // SecretDoor
            case 3: return 3;   // Door
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
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the location of the JSON wall definitions to load.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     * @throws Error if an invalid buffer is provided.
     */
    async readCellWalls(url) {
        url = Parse.url(url);

        const loaded = await this.resourceManager.load(url);
        const buffer = loaded[url].data;
        if (buffer == null) {
            throw new Error("You must provide a buffer");
        }
        const map = this.map;
        const width = map.width;
        const height = map.height;
        const expectedSize = width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length " + buffer.byteLength + " != " + expectedSize + ")");
        }
        const buf = new Uint8Array(buffer);
        let pos = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                let walls = buf[pos++];
                let cell = map.getCell(x, y);

                cell.westWall = this.#mapWallType((walls >>> 6) & 3);
                cell.southWall = this.#mapWallType((walls >>> 4) & 3);
                cell.eastWall = this.#mapWallType((walls >>> 2) & 3);
                cell.northWall = this.#mapWallType(walls & 3);
            }
        }
    }

    /**
     * Reads the location codes file and updates the specified map.
     *
     * The file is arranged in 64 rows of 64 bytes each. Each byte represents a location
     * in the map and is split into multiple bit fields:
     *
     * AAABCCCC
     *   - When B is 1, it indicates a special location, bits 5 to 7 (AAA) specify an
     *     establishment or scenario type, such as guild, bank, etc. and bits 0 to 3 (CCCC)
     *     contain the scenario index (e.g. the specific inn, shop, etc). The scenario index
     *     is also a description index into a table of descriptions specific to the scenario
     *     type. (Codes below for the original game)
     *     - (AAA = 000) 0x10 Inns
     *       - 0x10 / 0 "You are at the Green Boar Inn"
     *       - 0x11 / 1 "You are at the Lazy Griffin Inn"
     *       - 0x12 / 2 "You are at the Sleeping Dragon Inn"
     *       - 0x13 / 3 "You are at the Travellers Inn"
     *       - 0x14 / 4 "You are at the Midnight Inn"
     *       - 0x15 / 5 "You are at the Warriors Retreat Inn"
     *       - 0x16 / 6 "You are at the Royal Resort"
     *     - (AAA = 001) 0x30 Taverns
     *       - 0x30 / 0 "You are at the Flaming Dragon Tavern"
     *       - 0x31 / 1 "You are at the Misty Mountain Tavern"
     *       - 0x32 / 2 "You are at the Screaming Siren Bar"
     *       - 0x33 / 3 "You are at the Happy Hunter Rest Stop"
     *       - 0x34 / 4 "You are at the Dancing Nymph Tavern"
     *       - 0x35 / 5 "You are at the Club"
     *       - 0x36 / 6 "You are at the Black Devil Tavern"
     *       - 0x37 / 7 "You are at the Lost Oasis Tavern"
     *       - 0x38 / 8 "You are at the Last Stop"
     *       - 0x39 / 9 "You are at the Tail of the Dog"
     *       - 0x3a / 10 "You are at Club Babalyon"
     *       - 0x3b / 11 "You are at the Lost Tears Tavern"
     *       - 0x3c / 12 "You are at Mom's Bar"
     *       - 0x3d / 13 "You are at Lusty Lloyds"
     *     - (AAA = 010) 0x50 Banks
     *       - 0x50 / 0 "You are at the First City Bank"
     *       - 0x51 / 1 "You are at the Granite Bank"
     *       - 0x52 / 2 "You are at the Grams Gold Exchange"
     *     - (AAA = 011) 0x70 Shops
     *       - 0x70 / 0 "You are at Smiley's Shop"
     *       - 0x71 / 1 "You are at the Honest Trader"
     *       - 0x72 / 2 "You are at the Adventurers Outfitters"
     *       - 0x73 / 3 "You are at the Warrior's Supplies"
     *       - 0x74 / 4 "You are at the General Store"
     *       - 0x75 / 5 "You are at the Exclusive Outfitters"
     *       - 0x76 / 6 "You are at the Ono Goods"
     *       - 0x77 / 7 "You are at the Best Bargain Store"
     *       - 0x78 / 8 "You are at the Grubron Imports"
     *       - 0x79 / 9 "You are at the Betelguese Sales"
     *       - 0x7a / 10 "You are at the Merchants Grotto"
     *       - 0x7b / 11 "You are at the Sunset Market"
     *       - 0x7c / 12 "You are at Pauline's Emporium"
     *       - 0x7d / 13 "You are at Da Place"
     *       - 0x7e / 14 "You are at the Trade Winds"
     *     - (AAA = 100) 0x90 Smiths
     *       - 0x90 / 0 "You are at the Sharp Weaponsmiths"
     *       - 0x91 / 1 "You are at Occum's Weaponsmiths"
     *       - 0x92 / 2 "You are at the Best Armorers"
     *       - 0x93 / 3 "You are at the Knights Armorers"
     *     - (AAA = 101) 0xb0 Scenarios (trainers, palace, etc. These should load the
     *       appropriate game scenario (e.g. Dungeon, etc)
     *       - 0xb0 / 0 "You are at the House of Ill-Repute"
     *       - 0xb1 / 1 "You are at Acrinimiril's Gate"
     *       - 0xb2 / 2 "You are at the Floating Gate"
     *       - 0xb3 / 3 "You are at the Arena"
     *       - 0xb4 / 4 "You are at the Palace"
     *       - 0xb5 / 5 "You are at the Palace Gate"
     *       - 0xb6 / 6 "You are at an entrance to The Dungeon"
     *       - 0xb7 / 7 "You are at the Maximum Casino"
     *       - 0xb8 / 8 "You are at the Arena Entrance"
     *       - 0xb9 / 9 "You are at Jack's Fitness Academy"
     *       - 0xba / 10 "You are at the Armstrong Builders"
     *       - 0xbb / 11 "You are at the Apollo Trainers"
     *       - 0xbc / 12 "You are at Grog's Weapons Trainers"
     *       - 0xbd / 13 "You are at the Flash Weapons Trainers"
     *       - 0xbe / 14 "You are at David's Weapons Trainers"
     *     - (AAA = 110) 0xd0 Healers
     *       - 0xd0 / 0 "You are at the One Way Soothers"
     *       - 0xd1 / 1 "You are at the Alpha Omega Healers"
     *     - (AAA = 111) 0xf0 Guilds
     *       - 0xf0 / 0 "You are at the Thieves Guild",
     *       - 0xf1 / 1 "You are at the Blue Wizards Guild",
     *       - 0xf2 / 2 "You are at the Light Wizards Guild",
     *       - 0xf3 / 3 "You are at the Paladins Guild",
     *       - 0xf4 / 4 "You are at the Green Wizards Academy",
     *       - 0xf5 / 5 "You are at the Red Wizards University",
     *       - 0xf6 / 6 "You are at the Dark Wizards Guild",
     *       - 0xf7 / 7 "You are at the Star Wizards Guild",
     *       - 0xf8 / 8 "You are at the Wizards of Chaos Guild",
     *       - 0xf9 / 9 "You are at the Wizards of Law Guild",
     *       - 0xfa / 10 "You are at the Mercenary Guild",
     *       - 0xfb / 11 "You are at the Guild of Order",
     *       - 0xfc / 12 "You are at the Physicians Guild",
     *       - 0xfd / 13 "You are at the Assassins Guild"
     *   - When B is 0, it indicates a normal map location. In this case, CCCC contains the
     *     description index and AAA is further broken down into EED
     *     - The description index is used to lookup a text description for the cell from
     *       the following:
     *       - 0 "You are on a Street"
     *       - 1 "You are on a Side Street"
     *       - 2 "You are on a Back Alley"
     *       - 3 "You are on a Main Street"
     *       - 4 "You are in a Street"
     *       - 5 "You are at the City Square"
     *       - 6 "You are at the City Wall"
     *       - 7 "You are in a Secret passage"
     *       - 8 "You are in a Secret alley"
     *       - 9 "You are at the Northern Gate"
     *       - 10 "You are at the Southern Gate"
     *       - 11 "You are at the Western Gate"
     *       - 12 "You are at the Royale Walkway"
     *       - 13 "You are in an Alley"
     *       - 14 "You are in an Enclosed Area"
     *       - 15 "You are in an Alcove"
     *     - When D = 0 the space is outside and does not have a ceiling / roof.
     *       - The bits in EE are not fully identified for this case. Speculation below:
     *         - Bit 7 may indicate a location where you are more likely to be surprised
     *           (this bit is often set next to a secret passage)
     *         - Bit 6 may increase danger level
     *     - When D = 1 the space is enclosed and has a ceiling / roof and is protected
     *       from weather effects. In this case, EE specifies the type (color / texture)
     *       of ceiling and floor for the cell (0-3).
     *       - (EE = 00) - Yellow ceiling / Dark green floor
     *       - (EE = 01) - Pink ceiling / Dark blue floor
     *       - (EE = 10) - Cyan ceiling / Dark magenta floor
     *       - (EE = 11) - Yellow ceiling / Black floor
     *       - It may be possible that EE is also interpreted for other purposes as well,
     *         such as likelihood to be surprised, or danger level.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the url of the binary map location code data.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     */
    async readCellLocationCodes(url) {
        url = Parse.url(url);

        const loaded = await this.resourceManager.load(url);
        const buffer = loaded[url].data;
        if (buffer == null) {
            throw new Error("You must provide a buffer");
        }
        const map = this.map;
        const width = map.width;
        const height = map.height;
        const expectedSize = width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length " + buffer.byteLength + " != " + expectedSize + ")");
        }
        const buf = new Uint8Array(buffer);
        let pos = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const data = buf[pos++];
                const cell = map.getCell(x, y);

                let type = (data >>> 4) & 0xF;
                if (type & 1) {
                    // Establishment or scenario
                    cell.descriptionIndex = data;

                    cell.special = type;
                    cell.specialDescription = "Scenario " + type.toString(16);
                } else if ((type & 3) == 2) {
                    // Enclosed area / ceiling
                    cell.ceiling = (type >>> 2) + 1;
                    cell.floor = (type >>> 2) + 1;
                    cell.descriptionIndex = data & 0xf;
                    cell.special = type;
                    cell.specialDescription = "Enclosed " + type.toString(2)
                } else if ((type & 3) == 0) {
                    cell.descriptionIndex = data & 0xf;
                    cell.special = type;
                    cell.specialDescription = "Sky " + type.toString(2)
                }

                cell.description = map.descriptions[cell.descriptionIndex];

                // TODO: Map the scenario value to a common format merged with the dungeon values.
                //cell.special = data;
            }
        }
    }

    /**
     * Reads a City format map described by the provided configuration.
     * @param {CityMapOptionsConfig} config the map configuration to load.
     * @param {string} baseUrl the base URL to use for relative paths.
     * @returns {PromiseLike<ScenarioMap>} a promise that will complete when the load completes
     */
    async readMap(config, baseUrl) {
        if (baseUrl != null) {
            baseUrl = new URL(baseUrl, window.location);
        } else {
            baseUrl = window.location;
        }

        const width = config.width || this.map.width;
        const height = config.height || this.map.height;
        this.resize(width, height);

        return Parse.withBaseUrl(baseUrl, () => {
            const promises = [
                this.readCellWalls(config.wallBinaryUrl),
                this.readJsonDescriptions(config.descriptionJsonUrl)
                    .then(() => Parse.withBaseUrl(baseUrl, () => {
                        return this.readCellLocationCodes(config.locationBinaryUrl);
                    }))
            ];

            if (config.soundJsonUrl) {
                promises.push(this.readJsonSounds(config.soundJsonUrl));
            }

            if (config.wallTextureJsonUrl) {
                promises.push(this.readJsonWalls(config.wallTextureJsonUrl));
            }

            if (config.floorAndCeilingTextureJsonUrl) {
                promises.push(this.readJsonFloorAndCeiling(config.floorAndCeilingTextureJsonUrl));
            }

            if (config.patchJsonUrl) {
                promises.push(this.readJsonPatches(config.patchJsonUrl));
            }

            if (config.zoneJsonUrl) {
                promises.push(this.readJsonZones(config.zoneJsonUrl));
            }

            //messageJsonUrl;
            //encounterJsonUrl;

            return Promise.all(promises).then(() => this.map);
        });
    }

}