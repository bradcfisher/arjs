
import { ScenarioMap, MapCell, WallType, MapZone } from "./ScenarioMap";
const sprintf = require('sprintf-js').sprintf;

export class DungeonMapReader {

    private _map: ScenarioMap;

    constructor(width: number = 32, height: number = 32) {
        this._map = new ScenarioMap(width, height);
        this._map.description = "Map for Alternate Reality: The Dungeon";
    }

    /**
     * Reads the first three bytes of the buffer as level data.
     *
     * 3 bytes:
     *   00 - level number
     *   01 - ?
     *   02 - ?
     *
     * @param buf the buffer to read the data from
     */
    private readLevelData(buffer: Uint8Array): void {
        (<any>(this._map)).levelNumber = buffer[0];
        (<any>(this._map)).unknown1 = buffer[1];
        (<any>(this._map)).unknown2 = buffer[2];
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
     * @param buf the buffer to read the data from
     */
    private readDescriptions(buffer: Uint8Array): void {
        // Read text fragments table.
        let pos: number = 3;
        let fragment: string = "";
        let byte: number;
        let fragments: string[] = [];

        while ((pos < buffer.length) && ((byte = buffer[pos]) != 0)) {
            fragment += String.fromCharCode(byte & 0x7f);
            if (byte & 0x80) {
                console.log(sprintf("%1$02X [%1$2d]: fragment='%2$s'", fragments.length, fragment));
                fragments.push(fragment);
                fragment = "";
            }
            ++pos;
        }

        console.log(sprintf("Exited fragments at offset %1$02x [%1$4d]", pos));

        // Read descriptions table
        ++pos;
        let descriptions: string[] = [];

        // There's no need to perform fragment expansion for this entry
        // The first entry in the description table CANNOT have any fragment
        // references, since the same flag is used to delineate fragment
        // boundaries in the previous table.
        console.log(sprintf("%1$02X [%1$2d]: description='%2$s'", descriptions.length, fragment));
        descriptions.push(fragment);
        fragment = "";

        while ((pos < buffer.length) && ((byte = buffer[pos]) != 0xff)) {
            if (byte == 0) {
                console.log(sprintf("%1$02X [%1$2d]: description='%2$s'", descriptions.length, fragment));
                descriptions.push(fragment);
                fragment = "";
            } else if (byte & 0x80) {
                fragment += fragments[byte & 0x7f];
            } else {
                fragment += String.fromCharCode(byte);
            }
            ++pos;
        }

        console.log(sprintf("Exited descriptions at offset %1$02x [%1$4d]", pos));

        // TODO: Should a final, empty description be added to the table?  Level 1.2 seems to use a description past the end of the table (40 of 39) (<--- verify this)
        if (fragment != "") {
            console.log(sprintf("%1$02X [%1$2d]: LAST description='%2$s'", descriptions.length, fragment));
            descriptions.push(fragment);
        }

        this._map.descriptions.push(...descriptions);
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
     * @param buf the buffer to read the data from
     */
    private readZones(buffer: Uint8Array): void {
        // Read zones (0x300, 125 bytes, 5 byte records, 25 records)
        // 4 bytes: y,x - y,x
        // 1 byte: ref - what is this value?

        let pos: number = 0x300;

        let numZones: number = buffer[pos++] + 1;
        console.log(sprintf("numZones=%2d", numZones));

        for (let i = 0; i < numZones; ++i) {
            let y1: number = buffer[pos++];
            let x1: number = buffer[pos++];
            let y2: number = buffer[pos++];
            let x2: number = buffer[pos++];

            let z = new MapZone(
                x1, y1, x2, y2,
                buffer[pos++]
            );

            console.log(sprintf("%1$02X [%1$2d]: %2$s", this._map.zones.length, z));
            this._map.zones.push(z);
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
     * @param buffer the buffer to read the data from
     */
    private readWalls(buffer: Uint8Array): void {
        let pos: number = 0x400;

        for (let y = 0; y < this._map.height; ++y) {
            for (let x = 0; x < this._map.width; ++x) {
                let a: number = buffer[pos++];
                let b: number = buffer[pos++];

                let cell: MapCell = this._map.getCell(x, y);

                cell.north = a & 0xf;
                cell.east = (a >> 4) & 0xf;
                cell.south = b & 0xf;
                cell.west = (b >> 4) & 0xf;
                cell.descriptionIndex = buffer[pos++];
                cell.special = buffer[pos++];

                console.log(sprintf("(%1$02X, %2$02X) [%1$2d, %2$2d]: cell=%3$s", x, y, cell));
            }
        }
    }

    /**
     * Reads a dungeon map file.
     * The map for the dungeon is always a 32x32 grid.
     *
     * It consists of a header defining descriptions and zones, followed by
     * 4 bytes of data for each cell.  Cell data includes the walls to display
     * (2 bytes), a description index (1 byte) and an additional byte of
     * "special" flag data.
     *
     * @param buffer the buffer containing the map data to read.
     * @throws Error if an invalid buffer is provided.
     */
    readMap(buffer: ArrayBuffer): void {
        if (buffer == null) {
            throw new Error("You must provide a buffer");
        }

        let width = this._map.width;
        let height = this._map.height;

        let expectedSize: number = 0x400 + 4 * width * height;
        if (buffer.byteLength != expectedSize) {
            throw new Error("The provided buffer is not the correct length (buffer length "+ buffer.byteLength +" != "+ expectedSize +")");
        }

        let buf: Uint8Array = new Uint8Array(buffer);

        this.readLevelData(buf);
        this.readDescriptions(buf);
        this.readZones(buf);

        // TODO: Read the unknown table between zones and walls.  Does that table contain the zone data?  If so, what is the format?

        this.readWalls(buf);
        this._map.assignDescriptionsAndZones();
    }

    get map(): ScenarioMap {
        return this._map;
    }
}