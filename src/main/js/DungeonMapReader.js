import { MapReader } from "./MapReader.js";
import { Parse } from "./Parse.js";
import { DungeonMapOptionsConfig } from "./Scenario.js";
import { MapZone, MapZoneRef, ScenarioMap } from "./ScenarioMap.js";

export class DungeonMapReader extends MapReader {

    /**
     *
     * @param {number} width
     * @param {number} height
     */
    constructor(width = 32, height = 32) {
        super(width, height);
        this.map.metadata.description = "Map for Alternate Reality: The Dungeon";
    }

    /**
     * Reads the first three bytes of the buffer as level data.
     *
     * 3 bytes:
     *   00 - level number
     *   01 - ?
     *   02 - ?
     *
     * @param {Uint8Array} buf the buffer to read the data from
     */
    #readLevelData(buffer) {
        const metadata = this.map.metadata;
        metadata.levelNumber = buffer[0];
        metadata.unknown1 = buffer[1];
        metadata.unknown2 = buffer[2];
    }

    /**
     * Reads the descriptions from the specified buffer.
     *
     * The descriptions are encoded in two variable length tables stored between
     * 0x003 and 0x2FF.  The reason for using two tables is presumably as a basic
     * form of data compression to conserve the limited space.
     *
     * The first table is a dictionary of text fragments.  Each
     * fragment is variable length and terminated by a character with the high bit
     * set.  The end of the fragment table is signalled by an entry terminated with
     * a NUL byte.  That last entry is actually the first entry of the descriptions
     * table.
     *
     * The second table contains the the entries to decode into the actual
     * descriptions.  The first description read signals the end of the fragments
     * table and is simply added as the first entry when it's encountered.  For
     * the remaining entries, if a character is encountered with the high bit set,
     * that character is replaced with the corresponding fragment parsed earlier.
     * Each description entry is terminated with a NUL byte.  The end of the table
     * has been reached when a 0xff byte is read.
     *
     * @param {Uint8Array} buf the buffer to read the data from
     * @param {string} idPrefix prefix to assign to description and zone IDs loaded from this
     *        map.
     */
    #readDescriptions(buffer, idPrefix) {
        // Read text fragments table.
        let pos = 3;
        let fragment = "";
        let byte;
        /** @type string[] */
        const fragments = [];

        while ((pos < buffer.length) && ((byte = buffer[pos]) != 0)) {
            fragment += String.fromCharCode(byte & 0x7f);
            if (byte & 0x80) {
                console.log(`0x${fragments.length.toString(16)} [${fragments.length}]: fragment='${fragment}'`);
                fragments.push(fragment);
                fragment = "";
            }
            ++pos;
        }

        console.log(`Exited fragments at offset 0x${pos.toString(16)} [${pos}]`);

        // Read descriptions table
        ++pos;

        let count = 0;

        // There's no need to perform fragment expansion for this entry
        // The first entry in the description table CANNOT have any fragment
        // references, since the same flag is used to delineate fragment
        // boundaries in the previous table.
        console.log(`[${idPrefix + String(count)}]: description='${fragment}'`);
        this.map.descriptions.set(idPrefix + String(count), fragment);
        count++;
        fragment = "";

        while ((pos < buffer.length) && ((byte = buffer[pos]) != 0xff)) {
            if (byte == 0) {
                console.log(`[${idPrefix + String(count)}]: description='${fragment}'`);
                this.map.descriptions.set(idPrefix + String(count), fragment);
                count++;
                fragment = "";
            } else if (byte & 0x80) {
                fragment += fragments[byte & 0x7f];
            } else {
                fragment += String.fromCharCode(byte);
            }
            ++pos;
        }

        console.log(`Exited descriptions at offset 0x${pos.toString(16)} [${pos}]`);

        // TODO: Should a final, empty description be added to the table?  Level 1.2 seems to use a description past the end of the table (40 of 39) (<--- verify this)
        if (fragment != "") {
            console.log(`[${idPrefix + String(count)}]: LAST description='${fragment}'`);
            this.map.descriptions.set(idPrefix + String(count), fragment);
        }
    }

    /**
     * Read the Zone region definitions.
     *
     * Starting at 0x300 and extending to 0x37D is the zone region table.
     *
     * The first byte indicates the number of zone entries in the table.
     *
     * Each entry in the table is 5 bytes long and consists of a rectangle of
     * map coordinates [y1 x1 y2 x2] and a reference ID.
     *
     * @param {Uint8Array} buf the buffer to read the data from
     * @param {string} idPrefix prefix to assign to description and zone IDs loaded from this
     *        map.
     * @param {number} xOfs the starting horizontal position in the underlying map to load the data to
     * @param {number} yOfs the starting vertical position in the underlying map to load the data to
     */
    #readZones(buffer, idPrefix, xOfs, yOfs) {
        // Read zone refs table (0x300, 125 bytes: 1 byte num records, 5 byte records, 25 records max)
        // 5 byte records: y1, x2, y2, x1, zoneRefId

        let pos = 0x300;
        const map = this.map;
        const numZones = buffer[pos++] + 1;
        console.log("numZones=", numZones);

        for (let i = 0; i < numZones; ++i) {
            let y1 = buffer[pos++] + yOfs;
            let x2 = buffer[pos++] + xOfs;
            let y2 = buffer[pos++] + yOfs;
            let x1 = buffer[pos++] + xOfs;
            const zone = idPrefix + String(buffer[pos++]);

            if (x2 < x1) {
                console.log(`Swapping x1=${x1}, x2=${x2}`);
                [x1, x2] = [x2, x1];
            }

            if (y2 < y1) {
                console.log(`Swapping y1=${y1}, y2=${y2}`);
                [y1, y2] = [y2, y1];
            }

            this.map.applyZoneRef({
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
                "zone": zone
            });
        }

        // Read zone definition table (0x37e, 130 bytes: 8 byte records (max 16 records, plus extra 2 bytes))
        pos = 0x37e;
        const zoneDefs = new Map();
        for (let i = 0; i < 16; ++i) {
            const zone = new MapZone();
            zone.zoneId = idPrefix + String(i);
            zone.data = [];
            for (let d = 0; d < 8; ++d) {
                zone.data.push(buffer[pos++]);
            }
            this.map.zones.set(zone.zoneId, zone);

            console.log("MapZone: " + zone);
        }
    }

    /**
     * Read the map cell data.
     *
     * Cell data starts at 0x400
     * Origin is (0, 0) from top left
     * Always 80 bytes per row
     * Always 32 rows
     *
     * Each square is encoded as 4 bytes (ABCD):
     *     A + B - Walls encoded in first 2 bytes (4 bits per wall)
     *     C - Location description index
     *     D - Special
     *         00-1F=Module (shoppe etc.)  20-7F=Effect/Dangerous
     *         80-9F=Encounter 0-31        A0-BF=Treasure 0-31
     *         C0-DF=Message 0-31          E0-FF=Teleport 0-31
     *
     * @param {Uint8Array} buffer the buffer to read the data from
     * @param {string} idPrefix prefix to assign to description and zone IDs loaded from this
     *        map.
     * @param {number} xOfs the starting horizontal position in the underlying map to load the data to
     * @param {number} yOfs the starting vertical position in the underlying map to load the data to
     * @param {number=} width the width of the binary map data.
     * @param {number=} height the height of the binary map data.
     */
    #readWalls(buffer, idPrefix, xOfs, yOfs, width, height) {
        let pos = 0x400;
        const map = this.map;

        xOfs = xOfs || 0;
        yOfs = yOfs || 0;

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const a = buffer[pos++];
                const b = buffer[pos++];

                const cell = map.getCell(x + xOfs, y + yOfs);

                cell.northWall = a & 0xf;
                cell.eastWall = (a >> 4) & 0xf;
                cell.southWall = b & 0xf;
                cell.westWall = (b >> 4) & 0xf;
                cell.descriptionIndex = idPrefix + String(buffer[pos++]);
                cell.description = map.descriptions.get(cell.descriptionIndex);
                cell.special = buffer[pos++];

                // TODO: floor and ceiling textures?

                // console.log(`(0x${x.toString(16)}, 0x${y.toString(16)}) [${x}, ${y}]: cell=${cell}`);
            }
        }
    }

    /**
     * Reads a dungeon map file from a url using the global ResourceManager.
     * The map for the dungeon is always a 32x32 grid.
     *
     * It consists of a header defining descriptions and zones, followed by
     * 4 bytes of data for each cell.  Cell data includes the walls to display
     * (2 bytes), a description index (1 byte) and an additional byte of
     * "special" flag data.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * Use a 'complete' listener to detect when all pending load operations have completed.
     *
     * @param {string} url the location to read the binary map data from. If a relative reference, it
     *        will be resolved using {@link Parse.url}.
     * @param {string=} idPrefix prefix to assign to description and zone IDs loaded from this
     *        map. When loading multiple binaries into a single logical map, each map must be assigned
     *        a unique prefix to avoid ID collisions.
     * @param {number=} xOfs the starting horizontal position in the underlying map to load the data to.
     * @param {number=} yOfs the starting vertical position in the underlying map to load the data to.
     * @param {number=} width the width of the binary map data. If not provided, defaults to 32.
     * @param {number=} height the height of the binary map data. If not provided, defaults to 32.
     *
     * @return {PromiseLike<void>} a promise that will complete when the load completes
     */
    async readBinaryMapData(url, idPrefix = "", xOfs = 0, yOfs = 0, width = 32, height = 32) {
        url = Parse.url(url);
		const loaded = await this.resourceManager.load(url);

        const buffer = loaded[url].data;

        const map = this.map;

        const expectedSize = 0x400 + 4 * width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length "+ buffer.byteLength +" != "+ expectedSize +")");
        }

        const buf = new Uint8Array(buffer);

        this.#readLevelData(buf);
        this.#readDescriptions(buf, idPrefix);
        this.#readZones(buf, idPrefix, xOfs, yOfs);

        // TODO: Read the unknown table between zones and walls.  Does that table contain the zone data?  If so, what is the format?
        // Perhaps alternate textures to apply, sound to play, etc?

        this.#readWalls(buf, idPrefix, xOfs, yOfs, width, height);
	}

    /**
     * Reads a Dungeon format map described by the provided configuration.
     * @param {DungeonMapOptionsConfig} config the map configuration to load.
     * @param {string=} baseUrl the base URL to use for relative paths. If not given,
     *        the value of {@link Parse.baseUrl} will be used.
     * @returns {PromiseLike<ScenarioMap>} a promise that will complete when the load completes
     */
    async readMap(config, baseUrl) {
        return Parse.withBaseUrl(baseUrl, () => {
            const width = config.width || this.map.width;
            const height = config.height || this.map.height;
            this.resize(width, height);

            const promises = Parse.array(config.mapBinaryUrl, null, (val) => { return (typeof val === 'string' || val instanceof URL) ? {"x":0,"y":0,"url":val} : val })
                    .map((/** @type {DungeonMapBinaryConfiguration} */ config) => {
                        return this.readBinaryMapData(
                            config.url, config.idPrefix,
                            config.x, config.y, config.width, config.height);
                    });

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