const sprintf = require('sprintf-js').sprintf;

//import { LatentEffects } from "./LatentEffects";

/**
 * Enumeration of supported wall types.
 */
export enum WallType {
	/**
	 * No wall.
	 */
	None = 0,
	/**
	 * An archway that you can pass through, primary texture.
	 */
	Archway = 1,
	/**
	 * An archway that you can pass through, alternate texture.
	 */
	Archway2 = 1 + 16,
	/**
	 * A door you can pass through.
	 */
	Door = 3,
	/**
	 * A door you can pass through, alternate texture.
	 */
	Door2 = 3 + 16,
	/**
	 * A secret door.
	 * Looks like a regular wall to normal vision, but works like a door.
	 */
	SecretDoor = 5,
	/**
	 * A secret door, alternate texture.
	 */
	SecretDoor2 = 5 + 16,
	/**
	 * A locked door that requires a key to unlock it.
	 * TODO: When a locked door is unlocked, that status should be saved with the character.
	 */
	LockedDoor = 8,
	/**
	 * A locked door that requires a key to unlock it, alternate texture
	 */
	LockedDoor2 = 8 + 16,
	/**
	 * A door that is secured with a deadbolt or bar.
	 * TODO: When a bolted door is forced open, that status should be saved with the character.
	 */
	BoltedDoor = 9,
	/**
	 * A door that is secured with a deadbolt or bar, alternate texture.
	 */
	BoltedDoor2 = 9 + 16,
	/**
	 * A door that is secured with magic.
	 * TODO: When an enchantment on a door is broken, that status should be saved with the character.
	 */
	EnchantedDoor = 10,
	/**
	 * A door that is secured with magic, alternate texture.
	 */
	EnchantedDoor2 = 10 + 16,
	/**
	 * A typical solid wall.
	 */
	Wall = 13,
	/**
	 * A typical solid wall, alternate texture
	 */
	Wall2 = 13 + 16

	// TODO: Invisible wall? (or just use transparency?)  More than one alternate texture?
}


/**
 * Represents a Zone within a map file.
 */
export class MapZone {
	/**
	 * x coordinate of the left edge of the zone.
	 */
	x1: number;

	/**
	 * y coordinate of the top edge of the zone.
	 */
	y1: number;

	/**
	 * x coordinate of the right edge of the zone (non-inclusive).
	 */
    x2: number;

	/**
	 * y coordinate of the bottom edge of the zone (non-inclusive).
	 */
	y2: number;

	/**
	 * TODO: Determine what this 'ref' value is used for.
	 * It appears to be a rather low number, so may be a reference to
	 * a lookup table somewhere.
	 */
	ref: number;

	/**
	 * Constructs a new instance.
	 *
	 * @param x1 x coordinate of one of the zone edges.
	 * @param y1 y coordinate of one of the zone edges.
	 * @param x2 x coordinate of one of the zone edges.
	 * @param y2 y coordinate of one of the zone edges.
	 * @param ref
	 */
    constructor(x1: number, y1: number, x2: number, y2: number, ref: number) {
		if (x1 <= x2) {
			this.x1 = x1;
			this.x2 = x2;
		} else {
			this.x1 = x2;
			this.x2 = x1;
		}

		if (y1 <= y2) {
			this.y1 = y1;
			this.y2 = y2;
		} else {
			this.y1 = y2;
			this.y2 = y1;
		}

        this.ref = ref;
	}

	/**
	 * Tests whether this zone contains the specified coordinates.
	 *
	 * @param x the x coordinate value to test.
	 * @param y the y coordinate value to test.
	 *
	 * @return `true` if the zone contains the coordinates, `false` otherwise.
	 */
	contains(x: number, y: number): boolean {
		return (this.x1 <= x) && (x < this.x2) && (this.y1 <= y) && (y < this.y2);
	}

    toString(): string {
        return sprintf(
			"MapZone<(%1$02X,%2$02X)-(%3$02X,%4$02X) [(%1$s,%2$s)-(%3$s,%4$s)], ref=%5$02X [%5$d]>",
			this.x1, this.y1, this.x2, this.y2, this.ref
		);
    }
}

export class MapTeleportAttributes {
/*
 int ref; - location special code for the teleport
 int new_x;
 int new_y;
 int new_map; - map level
 int new_facing; - compass direction
*/
}

export class MapZoneAttributes {
	// Textures?
	/*
	wall
	door
	archway
	floor
	ceiling
	skybox
	*/

	// Other attributes?
	/*
	lighting
	permits magic
	*/
}

/**
 * Object representing a cell in a level map.
 */
export class MapCell {
	// TODO: wall heights?

	/**
	 * The type of floor to use for the cell.
	 * Value is index into registered floor textures.
	 */
	floor: number = 0;

	/**
	 * The type of ceiling to use for the cell.
	 *   0 = none (sky and weather effects)
	 *  Other values index into registered floor textures.
	 */
	ceiling: number = 0;

	/**
	 * The wall type for the North wall.
	 * Specific texture sets mapped to these values are defined
	 * by the assigned zone.
	 */
	north: WallType;

	/**
	 * The wall type for the East wall.
	 * Specific texture sets mapped to these values are defined
	 * by the assigned zone.
	 */
	east: WallType;

	/**
	 * The wall type for the South wall.
	 * Specific texture sets mapped to these values are defined
	 * by the assigned zone.
	 */
	south: WallType;

	/**
	 * The wall type for the West wall.
	 * Specific texture sets mapped to these values are defined
	 * by the assigned zone.
	 */
	west: WallType;

	/**
	 * Index of the description to use for this cell.
	 */
	descriptionIndex: number;

	/**
	 * Special attribute to apply or action to perform when character enters this square.
	 * May refer to an effect (lighting, heat, cold, increased encounter frequency,
	 * stronger encounters), a message to display, an item, an encounter
	 * (doppleganger, etc), or a scenario.
	 * TODO: Define this better...  What do the values mean, how to interpret them.
	 */
	special: number;

	/**
	 * Populated by ScenarioMap.assignDescriptionsAndZones
	 */
	description?: string;

	/**
	 * Populated by ScenarioMap.assignDescriptionsAndZones
	 */
	zone?: MapZone;

//	private _message: string = "";

//	private _items / _data;

	// Perhaps these should just be on the zone instead?
//	private readonly _effects: LatentEffects = new LatentEffects();		// enter (first? every?), leave

	constructor(
		north: WallType = WallType.None,
		east: WallType = WallType.None,
		south: WallType = WallType.None,
		west: WallType = WallType.None,
		descriptionIndex: number = 0,
		special: number = 0
	) {
		this.north = north;
		this.east  = east;
		this.south = south;
		this.west  = west;
		this.descriptionIndex = descriptionIndex;
		this.special = special;
	}

	toString(): string {
		return sprintf(
			"MapCell<N=%1$02X [%1$2d], E=%2$02X [%2$2d], S=%3$02X [%3$2d], W=%4$02X [%4$2d], special=%5$02X [%5$3d], description=%6$02X [%6$2d] \"%7$s\">",
			this.north, this.east, this.south, this.west,
			this.special,
			this.descriptionIndex,
			this.description
		);
	}
}


// TODO: Textures
//   - Skybox?
//   - Wall types
//   - Ceiling types
//   - Floor types

export class ScenarioMap {

	private _description: string = "<unnamed map>";

	private _width: number;
	private _height: number;
	private _cells: MapCell[];
	private _descriptions: string[] = [];
	private _zones: MapZone[] = [];


	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;

		this._cells = new Array<MapCell>(width * height);
		for (let i = 0; i < width * height; ++i)
			this._cells[i] = new MapCell();
	}

	get description(): string {
		return this._description;
	}

	set description(value: string) {
		this._description = value;
	}

	get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}

	get descriptions(): string[] {
		return this._descriptions;
	}

	get zones(): MapZone[] {
		return this._zones;
	}

	private assertValidCoord(x: number, y: number): void {
		if ((x < 0) || (x >= this._width))
			throw new Error("x out of range ("+ x +" not in [0;"+ this._width +"[");

		if ((y < 0) || (y >= this._height))
			throw new Error("y out of range ("+ y +" not in [0;"+ this._height +"[");
	}

	getZone(x: number, y: number): MapZone|undefined {
		this.assertValidCoord(x, y);
		for (let z of this._zones) {
			if (z.contains(x, y)) {
				return z;
			}
		}

		return undefined;
	}

	getCell(x: number, y: number): MapCell {
		this.assertValidCoord(x, y);
		return this._cells[x + y * this._width];
	}

	assignDescriptionsAndZones(): void {
		for (let x = 0; x < this._width; ++x) {
			for (let y = 0; y < this._height; ++y) {
				let cell: MapCell = this._cells[x + y * this._width];

				cell.zone = this.getZone(x, y);
				cell.description = this.descriptions[cell.descriptionIndex];
			}
		}
	}

}
