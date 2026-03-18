
import { ColorUtil } from "./ColorUtil.js";
import { Configurable } from "./Configurable.js";
import { EventDispatcher } from "./EventDispatcher.js";
import { Parse, ActionDefinition, RegisteredAction } from "./Parse.js";
import { TextureProvider, SolidColorTexture } from "./Texture.js";

/** @import {ActionCallback} from "./ActionManager.js" */


/**
 * @implements {Configurable<MapZoneRef>}
 */
export class MapZoneRef {
    /**
     * The x position of the starting corner of the zone area.
     * @type {number}
     * @readonly
     */
    x;

    /**
     * The y position of the starting corner of the zone area.
     * @type {number}
     * @readonly
     */
    y;

    /**
     * The width of the zone area.
     * @type {number}
     * @readonly
     */
    width;

    /**
     * The height of the zone area.
     * @type {number}
     * @readonly
     */
    height;

    /**
     * The ID of the zone (or list of zone IDs) to apply to the cells within the area.
     * @type {string|string[]}
     * @readonly
     */
    zone;

    /**
     * Constructs a new MapZoneRef
     * @param {MapZoneRef} config
     */
    constructor(config) {
        if (config) {
            this.configure(config);
        }
    }

    configure(config) {
        this.x = Parse.prop(config, ["x"], null, Parse.num);
        this.y = Parse.prop(config, ["y"], null, Parse.num);
        this.width = Parse.prop(config, ["width"], null, Parse.num);
        this.height = Parse.prop(config, ["height"], null, Parse.num)
        this.zone = Parse.prop(config, ["zone"], null, Parse.array)
    }

    get config() {
        return {
            "x": this.x,
            "y": this.y,
            "width": this.width,
            "height": this.height,
            "zone": this.zone
        };
    }

    toString() {
        return `MapZoneRef[x=${this.x}, y=${this.y}, w=${this.width}}, h=${this.height}, zone=${this.zone}]`;
    }
} // MapZoneRef

export class MapZone {
    /**
     * The zoneId.
     * @type {string}
     */
    zoneId;

    /**
     * The binary data describing the zone.
     * 9 bytes
     * @type {byte[]}
     */
    data = [];

    // TODO: Lots of stuff to make Zones cool
    //   texture set
    //   danger levels / encounters
    //   recurring events (ambient sounds, etc)
    //   light levels
    //   messages
    //

    toString() {
        const hex = "0123456789abcdef";
        let data = "";
        for (let i = 0; i < this.data.length; ++i) {
            let d = this.data[i];
            data += hex.charAt(d >>> 4) + hex.charAt(d & 0xf) + " ";
        }

        return `MapZone[id=${this.zoneId}, data=${data}]`;
    }
}

/**
 * @interface
 */
export class WallStyleConfig {
    /**
     * Optional name assigned to the wall style.
     * @type {string?}
     */
    name;

    /**
     * Optional description associated with the wall style.
     * @type {string?}
     */
    description;

    /**
     * Whether the wall is considered transparent for rendering purposes or not.
     * If true, the wall will be rendered to the screen on top of any walls detected further in the distance.
     * If false or unspecified, this type of wall will end the raycasting when rendering and will be the first
     * wall drawn to the screen for the ray.
     * @type {boolean?}
     * @readonly
     */
    transparent;

    /**
     * Whether this wall type is considered solid to the player or not.
     *
     * May be a boolean value to indicate the wall is either fully solid or fully intangible.
     *
     * If an array is provided, each entry in the list is an object specifying the start and end of
     * a region as a percentage of the wall's width where the wall is considered solid to the
     * player. A classifier value may also be provided for each region, in which case events
     * triggered for the region will include the classifier.
     *
     * `true` is equivalent to `[{'start': 0, 'end': 1}]` and `false` is equivalent to `[]`.
     *
     * @type {(boolean | {start:number, end:number, classifier:string?}[])?}
     * @readonly
     */
    collision;

    /**
     * Color assigned to the wall style.
     * May be used for rendering the style in a map as well as for rendering the wall if
     * no texture is defined.
     * @type {string?}
     * @readonly
     */
    color;

    /**
     * @type {TextureProvider?}
     * @readonly
     */
    textureProvider;

    /**
     * Actions to associate with events that occur with walls of this type.
     * Examples include playing sounds or triggering more complex checks such as locked doors or other actions/scenarios.
     * @type {({[type:string]: [ActionDefinition|RegisteredAction|ActionCallback|string]})?}
     * @readonly
     */
    on;
}

export class WallStyle extends EventDispatcher {
    /**
     * Optional name assigned to the wall style.
     * @type {string?}
     */
    name;

    /**
     * Optional description associated with the wall style.
     * @type {string?}
     */
    description;

    /**
     * Whether the wall is considered transparent for rendering purposes or not.
     * If true, the wall will be rendered to the screen on top of any walls detected further in the distance.
     * If false, this wall will end the raycasting when rendering and will be the first wall drawn to the screen
     * for the ray.
     * @type {boolean}
     */
    transparent = false;

    /**
     * List of regions indicating areas where this wall type is considered solid to the player.
     *
     * Each entry in the list is an object specifying the start and end of a region as a
     * percentage of the wall's width where the wall is considered solid to the player.
     * Entries may also have a classifier value which is assigned to any events triggered for
     * the region.
     *
     * `[{'start': 0, 'end': 1}]` would indicate a fully solid wall, while `[]` means the wall
     * is fully intangible.
     *
     * @type {{start:number, end:number, classifier:string?}[]}
     */
    collision = [];

    /**
     * @type {TextureProvider}
     */
    textureProvider = undefined;

    /**
     * Color assigned to the wall style.
     * May be used for rendering the style in a map as well as for rendering the wall if
     * no texture is defined.
     * @type {string}
     */
    color = 'rgb(255 0 0 / 50%)';

    /**
     * Constructs a new WallStyle.
     * @param {WallStyleConfig} config
     */
    constructor(config) {
        super();

        if (config) {
            if (config.name != null) {
                this.name = Parse.str(config.name);
            }

            if (config.description != null) {
                this.description = Parse.str(config.description);
            }

            this.transparent = Parse.bool(Parse.getProp(config, false, "transparent"));

            if (config.collision === true) {
                this.collision = [{start: 0, end: 1}];
            } else if (!config.collision) {
                this.collision = [];
            } else {
                // Validate and normalize the "collision" ranges
                const collision = [];
                for (let item of config.collision) {
                    const range = {
                        start: Parse.prop(item, ["start"], null, Parse.num),
                        end: Parse.prop(item, ["end"], null, Parse.num)
                    };
                    if (item.classifier != null) {
                        range.classifier = Parse.str(item.classifier);
                    }
                    if (range.end < range.start) {
                        let t = range.start;
                        range.start = range.end;
                        range.end = t;
                    }
                    collision.push(range);
                }
                this.collision = collision;
            }

            if (config.textureProvider != null) {
                if (config.textureProvider instanceof TextureProvider) {
                    this.textureProvider = config.textureProvider;
                } else {
                    throw new Error("textureProvider cannot be assigned to " + config.textureProvider);
                }
            }

            if (config.color != null) {
                this.color = config.color;
            }

            if (config.on) {
                Object.entries(config.on).forEach(([type, item]) => {
                    const actions = Parse.array(item, [], Parse.action);
                    this.on(type, (event) => {
                        for (let action of actions) {
                            try {
                                action({ event });
                            } catch (e) {
                                log.error(`Error in action for ${type}:`, event, error);
                            }
                        }
                    });
                });
            }
        }

        if (!this.textureProvider) {
            this.textureProvider =
                new SolidColorTexture(this.color, "white", config.name || config.description);
        }
    }

    /**
     * Whether the specified location lies in a collision region for this wall style.
     * @param {number} location position along the wall as a percentage of the wall's width.
     * @returns {{start: number, end: number, classifier: string?}|false} the collision region that
     *          was hit or false if no collision.
     */
    isCollision(location) {
        for (let region of this.collision) {
            if (region.start <= location && location <= region.end) {
                return region;
            }
        }
        return false;
    }
}

/**
 * @enum {string}
 */
export const WallSide = Object.freeze({
    /**
     * "N" - The wall on the North side of the cell
     * @readonly
     */
    NORTH: "N",

    /**
     * "S" - The wall on the South side of the cell
     * @readonly
     */
    SOUTH: "S",

    /**
     * "E" - The wall on the East side of the cell
     * @readonly
     */
    EAST: "E",

    /**
     * "W" - The wall on the West side of the cell
     * @readonly
     */
    WEST: "W"
});

/**
 * Object representing a cell in a level map.
 */
export class MapCell {
	// TODO: wall heights?

    /**
     * Constructs a new map cell.
     * @param {number} x The horizontal location of the cell within the map.
     * @param {number} y The vertical location of the cell within the map.
     * @param {string=} northWall The wall type for the North wall.
     * @param {string=} eastWall The wall type for the East wall.
     * @param {string=} southWall The wall type for the South wall.
     * @param {string=} westWall The wall type for the West wall.
     * @param {number=} descriptionIndex Index/key of the description for this cell withn the map's descriptions list.
     * @param {number=} special Special attribute to apply or action to perform when player enters this square.
     */
	constructor(
        x,
        y,
		northWall,
		eastWall,
		southWall,
		westWall,
		descriptionIndex = 0,
		special = 0
	) {
        /**
         * The horizontal location of the cell within the map.
         * @type {number}
         */
        this.x = x;

        /**
         * The vertical location of the cell within the map.
         * @type {number}
         */
        this.y = y;

        /**
         * The wall type for the North wall.
         * @type {string?}
         */
    	this.northWall = northWall;

        /**
         * The wall type for the East wall.
         * @type {string?}
         */
		this.eastWall  = eastWall;

        /**
         * The wall type for the South wall.
         * @type {string?}
         */
		this.southWall = southWall;

        /**
         * The wall type for the West wall.
         * @type {string?}
         */
		this.westWall  = westWall;

        /**
         * Index/key of the description for this cell withn the map's descriptions list.
         * @type {string?}
         */
        this.descriptionIndex = descriptionIndex;

        /**
         * Special attribute to apply or action to perform when player enters this square.
         * May refer to an effect (lighting, heat, cold, increased encounter frequency,
         * stronger encounters), a message to display, an item, an encounter
         * (doppleganger, etc), or a scenario.
         *
         * - 00-1F = Module (shoppe etc.)
         * - 20-7F = Effect/Dangerous
         * - 80-9F = Encounter 0-31
         * - A0-BF = Treasure 0-31
         * - C0-DF = Message 0-31
         * - E0-FF = Teleport 0-31
         *
         * @type {number}
         */
		this.special = special;

        /**
         * The set of zones assigned to this cell.
         * @type {Set<string>?}
         */
        this.zones = undefined;

        /**
         * The description to display for this cell.
         * @type {string?}
         */
        this.description = undefined;

        /**
         * The ceiling type to use for the cell.
         * Defaults to sky texture if not assigned.
         * @type {string?}
         */
        this.ceiling;

        /**
         * The floor type to use for the cell.
         * @type {string?}
         */
        this.floor;
    }

//	private _message: string = "";

//	private _items / _data;

// _entities (e.g. in-game sprites for items/decor/encounters/etc)

	// Perhaps these should just be on the zone instead?
//	private readonly _effects: LatentEffects = new LatentEffects();		// enter (first? every? count? random?), leave


	toString() {
		return `MapCell<N=${this.northWall}, ` +
            `E=${this.eastWall}, ` +
            `S=${this.southWall}, ` +
            `W=${this.westWall}, ` +
            `special=${this.special}, zones=${this.zones ? [...this.zones] : undefined}, ` +
            `description=${this.descriptionIndex} "${this.description}">`;
	}
}


/**
 * @interface
 */
export class HitData {
    /**
     * The map cell the hit occurred in.
     * @type {MapCell}
     */
    cell;

    /**
     * The integral horizontal map cell position of the end of the hit.
     * @type {number}
     */
    cellX;

    /**
     * The integral vertical map cell position of the end of the hit.
     * @type {number}
     */
    cellY;

    /**
     * The style for the intersected wall.
     * @type {WallStyle}
     */
    wallStyle;

    /**
     * The type of wall that was intersected.
     * @type {number}
     */
    wallType;

    /**
     * The position where the hit occurred on the wall, as a percentage of the cell's width.
     * @type {number}
     */
    wallPosition;

    /**
     * The side of the cell with the intersected wall ('N', 'S', 'E', 'W')
     * @type {WallSide}
     */
    side;

    /**
     * The classifier value assigned to the collision region that was intersected.
     * @type {string?}
     */
    classifier;
}


/**
 * @implements {HitData}
 */
export class Ray {
    /**
     * Constructs a new ray.
     * @overload
     * @param {number} startX the starting x position of the ray within the map.
     * @param {number} startY the starting y position of the ray within the map.
     * @param {number} rayDirX the x portion of the ray vector (aka the cosine of the ray angle)
     * @param {number} rayDirY the y portion of the ray vector (aka the sine of the ray angle)
     */
    /**
     * Constructs a new ray as a copy of an existing Ray.
     * @overload
     * @param {Ray} ray the ray to clone.
     */
    constructor(startX, startY, rayDirX, rayDirY) {
        if (startX instanceof Ray) {
            const ray = /*(Ray)*/ startX;

            /**
             * The starting x position of the ray within the map.
             * @type {number}
             */
            this.startX = ray.startX;

            /**
             * The starting y position of the ray within the map.
             * @type {number}
             */
            this.startY = ray.startY;

            /**
             * The integral horizontal map cell position of the end of the ray.
             * @type {number}
             */
            this.cellX = ray.cellX;

            /**
             * The integral horizontal map cell position of the end of the ray.
             * @type {number}
             */
            this.cellY = ray.cellY;

            /**
             * The x portion of the ray vector (aka the cosine of the ray angle)
             * @type {number}
             */
            this.rayDirX = ray.rayDirX;

            /**
             * The y portion of the ray vector (aka the sine of the ray angle)
             * @type {number}
             */
            this.rayDirY = ray.rayDirY;

            /**
             * The distance from the ray's starting point to the end point
             * @type {number}
             */
            this.distance = ray.distance;

            /**
             * The precise horizontal map position of the end of the ray.
             * @type {number}
             */
            this.endX = ray.endX;

            /**
             * The precise vertical map position of the end of the ray.
             * @type {number}
             */
            this.endY = ray.endY;

            /**
             * Distance the ray travels in the x direction for each cell moved in the y direction.
             * @type {number}
             */
            this.deltaDistX = ray.deltaDistX;

            /**
             * Distance the ray travels in the y direction for each cell moved in the x direction.
             * @type {number}
             */
            this.deltaDistY = ray.deltaDistY;

            /**
             * Direction to step in x direction (either +1 or -1)
             * @type {number}
             */
            this.stepX = ray.stepX;

            /**
             * Direction to step in y direction (either +1 or -1)
             * @type {number}
             */
            this.stepY = ray.stepY;

            /**
             * Length of ray from start position to the next x side
             * @type {number}
             */
            this.sideDistX = ray.sideDistX;

            /**
             * Length of ray from start position to the next y side
             * @type {number}
             */
            this.sideDistY = ray.sideDistY;

            /**
             * The cell data for the map cell the ray ends in.
             * @type {MapCell}
             */
            this.cell = ray.cell;

            /**
             * The side of the cell of the intersected wall ('N', 'S', 'E', 'W')
             * @type {WallSide}
             */
            this.side = ray.side;

            /**
             * The type of wall that was intersected or 0 if no intersection occurred.
             * @type {number}
             */
            this.wallType = ray.wallType;

            /**
             * The style for the intersected wall (or the 'missing' style if no intersection was detected)
             * @type {WallStyle}
             */
            this.wallStyle = ray.wallStyle;

            /**
             * The position where the ray intersected the edge of the cell, as a percentage of the cell's width.
             * @type {number}
             */
            this.wallPosition = ray.wallPosition;

            /**
             * The result of the isHit callback for the iteration.
             *
             * Will be strictly true if a wall was hit and the iteration completed, strictly false if no wall was hit,
             * or some other value (often null or undefined) if a non-terminal wall was hit.
             *
             * @type {boolean?}
             */
            this.isHit = ray.isHit;

            /**
             * The class assigned to the collision region that was intersected.
             * @type {string?}
             */
            this.classifier = ray.classifier;
        } else {
            this.startX = startX;
            this.startY = startY;
            this.cellX = Math.floor(startX);
            this.cellY = Math.floor(startY);
            this.rayDirX = rayDirX;
            this.rayDirY = rayDirY;
            this.distance = 0;
            this.endX = startX;
            this.endY = startY;
            this.deltaDistX = (rayDirX == 0) ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
            this.deltaDistY = (rayDirY == 0) ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);
            this.stepX = rayDirX < 0 ? -1 : 1;
            this.stepY = rayDirY < 0 ? -1 : 1;

            // Calculate distance ray travels before hitting the first cell edge
            if (rayDirX < 0) {
                this.sideDistX = (startX - this.cellX) * this.deltaDistX;
            } else if (rayDirX == 0) {
                this.sideDistX = Number.POSITIVE_INFINITY;
            } else {
                this.sideDistX = (this.cellX + 1.0 - startX) * this.deltaDistX;
            }

            if (rayDirY < 0) {
                this.sideDistY = (startY - this.cellY) * this.deltaDistY;
            } else if (rayDirY == 0) {
                this.sideDistY = Number.POSITIVE_INFINITY;
            } else {
                this.sideDistY = (this.cellY + 1.0 - startY) * this.deltaDistY;
            }

            // Values below are only assigned after iterate() is invoked

            this.cell = undefined;
            this.side = undefined;
            this.wallType = 0;
            this.wallStyle = undefined;
            this.wallPosition = 0;
            this.isHit = false;
        }
    }

    /**
     * Iterates this ray to the next cell intersection.
     * @param {ScenarioMap} map the map the ray is being cast on
     * @param {number} renderDistance the maximum distance to cast the ray
     * @return {boolean} true if the ray ended inside the map, false if outside (e.g. stop iterating, ray not updated)
     */
    iterate(map, renderDistance) {
        let sideDistX = this.sideDistX;
        let sideDistY = this.sideDistY;
        let cellX = this.cellX;
        let cellY = this.cellY;
        let cell = this.cell;

        if (!this.side) {
            // Side is only undefined for the first iteration
            cell = map.getCell(cellX, cellY);
            this.cell = cell; // Ensure cell is updated in this case, even if no iterations occur
        } else {
            // Jump to next map square
            if (sideDistX < sideDistY) {
                cellX += this.stepX;
                sideDistX += this.deltaDistX;
            } else {
                cellY += this.stepY;
                sideDistY += this.deltaDistY;
            }

            cell = map.getCell(cellX, cellY);
        }

        // Compute collision for the shorter of the two distances
        if (sideDistX < sideDistY) {
            if (sideDistX > renderDistance) {
                return false;
            }

            this.distance = sideDistX;
            this.cell = cell;

            if (this.stepX == -1) {
                // Moving into the cell from the E (through E side, facing W)
                this.side = WallSide.WEST;
                this.wallType = this.cell ? this.cell.westWall : 0;
            } else {
                // Moving into the cell from the W (through W side, facing E)
                this.side = WallSide.EAST;
                this.wallType = this.cell ? this.cell.eastWall : 0;
            }
        } else {
            if (sideDistY > renderDistance) {
                return false;
            }

            this.distance = sideDistY;
            this.cell = cell;

            if (this.stepY == -1) {
                // Moving into the cell from the S (through S side, facing N)
                this.side = WallSide.NORTH;
                this.wallType = this.cell ? this.cell.northWall : undefined;
            } else {
                // Moving into the cell from the N (through N side, facing S)
                this.side = WallSide.SOUTH;
                this.wallType = this.cell ? this.cell.southWall : undefined;
            }
        }

        this.sideDistX = sideDistX;
        this.sideDistY = sideDistY;
        this.cellX = cellX;
        this.cellY = cellY;

        this.endX = this.startX + this.distance * this.rayDirX;
        this.endY = this.startY + this.distance * this.rayDirY;

        // Compute position on the edge where the ray intersected
        if (this.side == WallSide.NORTH) {
            this.wallPosition = (this.endX - this.cellX);
        } else if (this.side == WallSide.SOUTH) {
            this.wallPosition = 1 - (this.endX - this.cellX);
        } else if (this.side == WallSide.EAST) {
            this.wallPosition = (this.endY - this.cellY);
        } else if (this.side == WallSide.WEST) {
            this.wallPosition = 1 - (this.endY - this.cellY);
        }

        // Retrieve wallStyle if the cell has a wall where the ray intersected the edge
        if (this.wallType) {
            this.wallStyle = map.getWallStyle(this.wallType);
        } else {
            this.wallStyle = null;
        }

        return true;
    }

    toString() {
        return "Ray{ " +
            Object.entries(this).map(([key, value]) => key + ": " + value).join(", ") +
            " }";
    }
}



export class ScenarioMap {

    /**
     * Creates a new map instance.
     * @param {number} width the width of the map in cells. The map will be uninitialized if this value
     *        is not positive.
     * @param {number} height the height of the map in cells. The map will be uninitialized if this value
     *        is not positive.
     */
    constructor(width = 0, height = 0) {
        /** @type {any} */
        this.metadata = {
            description: "Unnamed map"
        };

        /** @type {MapCell[][]} */
        this.cellData = [];

        /** @type {Map<string,string>} */
        this.descriptions = new Map();

        /** @type {Map<string,MapZone>} */
        this.zones = new Map();

        /**
         * @type {TextureProvider}
         */
        this.skyTexture = new SolidColorTexture("#00c0ff");

        /** @type {Map<string, TextureProvider>} */
        this.ceilingTextures = new Map();

        /** @type {Map<string, TextureProvider>} */
        this.floorTextures = new Map();

        /** @type {Map<string, WallStyle>} */
        this.wallStyles = new Map();

        /**
         * The width of the map in cells.
         * @type {number}
         */
        this.width = Math.max(0, width);

        /**
         * @type {number}
         */
        this.height = Math.max(0, height);

        this.initialize(width, height);
    }

    /**
     * Constructs the underlying cell storage with the specified width and height.
     *
     * This will replace any existing cell storage with default cell data.
     *
     * @param {number} width the width of the map in cells. The map will be unmodified if this value
     *        is not positive.
     * @param {number} height the height of the map in cells. The map will be unmodified if this value
     *        is not positive.
     */
    initialize(width, height) {
        this.cellData = [];

        if (width <= 0 || height <= 0) {
            return;
        }

        for (let y = 0; y < height; ++y) {
            let row = [];
            this.cellData[y] = row;

            for (let x = 0; x < width; ++x) {
                row[x] = new MapCell(x, y);
            }
        }
    }

    /**
     * Applies a zone reference to the cells within the referenced region.
     * @param {MapZoneRef} zoneRef the zone reference definition to apply.
     */
    applyZoneRef(zoneRef) {
        const zonesToAdd = Parse.prop(zoneRef, ["zone"], null, Parse.array);

		console.log(`Applying zone ref: (x=${zoneRef.x}, y=${zoneRef.y}) [w=${zoneRef.width} x h=${zoneRef.height}] ref=${zonesToAdd}`);

        if (zonesToAdd.length == 0) {
            return;
        }

        for (let y = 0; y < zoneRef.height; y++) {
            for (let x = 0; x < zoneRef.width; x++) {
                const cell = this.getCell(x + zoneRef.x, y + zoneRef.y);
                if (!cell.zones) {
                    cell.zones = new Set(zonesToAdd);
                } else {
                    for (let zone of zonesToAdd) {
                        cell.zones.add(zone);
                    }
                }
            }
        }
    }

    // TODO: This probably belongs somewhere else...
    useTarget(player) {
        // TODO: consider "interactible"/"useable" flag on wallStyle/cell?
        // TODO: apply isHit function to match "interesting" walls instead of just first found
        const hits = this.castRay(player.x, player.y, player.orientation, Number.POSITIVE_INFINITY);

        console.log("Use the target here: hits=", hits);

        let ray = hits[hits.length - 1];

        let fraction;
        if (ray.side == WallSide.NORTH) {
            fraction = (ray.endX - ray.cellX);
        } else if (ray.side == WallSide.SOUTH) {
            fraction = 1 - (ray.endX - ray.cellX);
        } else if (ray.side == WallSide.EAST) {
            fraction = (ray.endY - ray.cellY);
        } else if (ray.side == WallSide.WEST) {
            fraction = 1 - (ray.endY - ray.cellY);
        }

        console.log(" -> fraction=", fraction);
        console.log(" -> calcX=", player.x + Math.cos(player.orientation) * ray.distance,
            ", calcY=", player.y + Math.sin(player.orientation) * ray.distance);
    }

    /**
     * Retrieves the cell data for the specified map cell location.
     * @param {number} x the horizontal location of the cell to retrieve.
     * @param {number} y the vertical location of the cell to retrieve.
     * @returns {MapCell} the cell data for the requested location or undefined if the location
     *          is outside the bounds of the map.
     */
    getCell(x, y) {
        x = Math.floor(x);
        y = Math.floor(y)
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            return this.cellData[y][x];
        }
        return undefined;
    }

    /**
     * Retrieves the wall style for a wall type.
     * @param {number} wallType the wall type to retrieve the style for.
     * @returns {WallStyle} the wall style assigned to the wall type or the 'missing' wall style
     *         if no style is registered for the wall type.
     */
    getWallStyle(wallType) {
        let wallStyle = this.wallStyles[wallType];
        if (!wallStyle) {
            this.wallStyles[wallType] =
                new WallStyle({"textureProvider": new SolidColorTexture(ColorUtil.random(), "white", `Missing\nWall Style\n"${wallType}"`)});
            wallStyle = this.wallStyles[wallType];
        }
        return wallStyle;
    }

    /**
     * Retrieves the texture for a ceiling type.
     * @param {string} ceilingType the ceiling type to retrieve the texture for. If falsy, the skyTexture will be returned.
     * @return {TextureProvider} the texture assigned to the ceiling type. If no texture was registered for the ceiling
     *         type when the method was called, a nice, ugly texture is created for the type.
     */
    getCeilingStyle(ceilingType) {
        if (!ceilingType) {
            return this.skyTexture;
        }

        let ceilingTexture = this.ceilingTextures[ceilingType];
        if (!ceilingTexture) {
            this.ceilingTextures[ceilingType] =
                new SolidColorTexture(ColorUtil.random(), "white", `Missing\nCeiling\n"${ceilingType}"`);

            ceilingTexture = this.ceilingTextures[ceilingType];
        }
        return ceilingTexture;
    }

    /**
     * Retrieves the texture for a floor type.
     * @param {string} floorType the floor type to retrieve the texture for. If falsy, the "default" floor
     *        texture will be returned.
     * @return {TextureProvider} the texture assigned to the floor type. If no texture was registered for the floor
     *         type when the method was called, a nice, ugly texture is created for the type.
     */
    getFloorStyle(floorType) {
        if (!floorType) {
            floorType = "default";
        }

        let floorTexture = this.floorTextures[floorType];
        if (!floorTexture) {
            this.floorTextures[floorType] =
                new SolidColorTexture(ColorUtil.random(), "white", `Missing\nFloor\n"${floorType}"`);

            floorTexture = this.floorTextures[floorType];
        }
        return floorTexture;
    }

    /**
     * Casts a ray from the given position travelling at the provided angle.
     *
     * Distances returned by this algorithm will be equal to the Euclidean distance from the
     * starting point to the hit.
     *
     * @param {number} posX horizontal map position to cast from
     * @param {number} posY vertical map position to cast from
     * @param {number} rayAngle the angle at which to cast the ray
     * @param {number} renderDistance the maximum distance to cast without encountering a collision
     * @param {((hitData: HitData) => boolean)=} isHit the predicate to determine whether a
     *        wall with the given wall style and position should be included in the results and
     *        when to stop the search. The wall is not included if the predicate returns strictly
     *        false (not null), otherwise it will be included. When the return value is true, the
     *        search stops. The classifier of the hit data provided to this function will be
     *        unassigned. This function may assign a value to the classifier property when
     *        a collision is detected. This may be used to differentiate between different
     *        collision regions and can be used as an event selector.
     *
     * @returns {Ray[]} list of hits encountered. This list always contains at least one entry,
     *          even when the max cast distance is reached without any hits.
     */
    castRayAtAngle(posX, posY, rayAngle, renderDistance, isHit = () => true) {
        return this.castRay(posX, posY, Math.cos(rayAngle), Math.sin(rayAngle), renderDistance, isHit);
    }

    /**
     * Casts a ray from the given position travelling at the provided angle.
     *
     * Distances returned by this algorithm will be scaled based on the magnitude of the ray vector and will only
     * match the Euclidean distance when the vector length is exactly 1.
     *
     * @param {number} posX horizontal map position to cast from
     * @param {number} posY vertical map position to cast from
     * @param {number} rayDirX the horizontal component of the ray direction vector
     * @param {number} rayDirY the vertical component of the ray direction vector
     * @param {number} renderDistance the maximum distance to cast without encountering a hit
     * @param {((hitData: HitData) => boolean?)=} isHit the predicate to determine whether a
     *        wall with the given wall style and position should be included in the results and
     *        when to stop the search. The wall is not included if the predicate returns strictly
     *        false (not null), otherwise it will be included. When the return value is true, the
     *        search stops. The classifier of the hit data provided to this function will be
     *        unassigned. This function may assign a value to the classifier property when
     *        a collision is detected. This may be used to differentiate between different
     *        collision regions and can be used as an event selector.
     *
     * @returns {Ray[]} list of hits encountered. This list always contains at least one entry,
     *          even when the max cast distance is reached without any hits.
     */
    castRay(posX, posY, rayDirX, rayDirY, renderDistance, isHit = () => true) {
        let ray = new Ray(posX, posY, rayDirX, rayDirY);

        const result = [];
        while (ray.distance < renderDistance) {
            if (!ray.iterate(this, renderDistance)) {
                break;
            }

            ray.classifier = undefined;

            if (ray.wallStyle) {
                ray.isHit = isHit(ray);
                if (ray.isHit !== false) {
                    result.push(new Ray(ray));
                    if (ray.isHit === true) {
                        break;
                    }
                }
            } else {
                ray.isHit = false;
            }
        }
        if (!result.length) {
            // We didn't hit anything, so just return the final iteration
            result.push(ray);
        }
        return result;
    }

}