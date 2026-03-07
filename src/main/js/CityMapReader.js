
import { MapReader } from "./MapReader.js";

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
     * Reads the specified wall JSON definitions into the map using the internal ResourceManager.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the location of the JSON wall definitions to load.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     */
    async readJsonDescriptions(url) {
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
     * Each code is a single byte split into multiple bit fields
     * - 11110000 = type (high nibble - bits 4 through 7)
     *   - If bits 4 and 5 are 00, then
     *     - Bit 7 probably set to true where you are more likely to be surprised (e.g. next to secret passage)
     *     - Bit 6 probably increases danger level
     *     - The description used is from the generic (0) table (0-31)
     *   - If bits 4 and 5 are 10 it indicates an area with a ceiling where the leftmost two bits 6 and 7 indicate
     *     the type (color) of ceiling for the cell (0-3).
     *     - Do they also have the same meaning as when bit 5 is 0? (e.g. surprise/danger?)
     *     - Type 00 - Yellow ceiling / Dark green floor
     *     - Type 01 - Pink ceiling / Dark blue floor
     *     - Type 10 - Cyan ceiling / Dark magenta floor
     *     - Type 11 - Yellow ceiling / Black floor
     *   - If bit 4 is 1, then bits 5 to 7 specify an establishment or scenario type, such as guild, bank, etc.
     *     - 0x10 Inns
     *     - 0x30 Taverns
     *     - 0x50 Banks
     *     - 0x70 Shops
     *     - 0x90 Smiths
     *     - 0xb0 Scenarios (trainers, palace, etc. These should load the appropriate game scenario (e.g. Dungeon, etc)
     *     - 0xd0 Healers
     *     - 0xf0 Guilds
     * - 00001111 = bits 0 through 3: description/scenario index (0-31)
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {ArrayBuffer} buffer the buffer containing the map location to read.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     * @throws Error if an invalid buffer is provided.
     */
    async readCellLocationCodes(url) {
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

    async readMap(
        wallBinaryUrl,
        locationBinaryUrl,
        descriptionJsonUrl,
        wallJsonUrl,
        floorAndCeilingJsonUrl,
        patchJsonUrl
    ) {
        return Promise.all([
            this.readCellWalls(wallBinaryUrl),
            this.readJsonDescriptions(descriptionJsonUrl)
                .then(() => this.readCellLocationCodes(locationBinaryUrl)),
            this.readJsonWalls(wallJsonUrl),
            this.readJsonFloorAndCeiling(floorAndCeilingJsonUrl),
            this.readJsonPatches(patchJsonUrl)
        ]);

        // TODO: city MapZoneRefs for the various environmental effects (smithy hammer, palace fanfare, etc?)
    }

}