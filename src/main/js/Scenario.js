
import { Configurable } from "./Configurable.js";
import { Parse } from "./Parse.js";

/**
 * @interface
 */
export class ScenarioLocationConfig {
    /**
     * The name of the map containing the location.
     * @readonly
     * @type {string}
     */
    map;

    /**
     * The x coordinate within the map.
     * @readonly
     * @type {number}
     */
    x;

    /**
     * The y coordinate within the map.
     * @readonly
     * @type {number}
     */
    y;

    /**
     * The orientation of the character.
     * May be an angle in radians using a right-handed coordinate system
     * (0 = east, Pi/2 = north, etc) or one of the following cardinal compass
     * directions:
     *
     * - `north` = Pi / 2 (approximately 1.57080)
     * - `northeast` = Pi / 4 (approximately 0.78540)
     * - `northwest`= Pi * 3 / 4 (approximately 2.35619)
     * - `east` = 0
     * - `west` = Pi (approximately 3.14159)
     * - `southeast` = -Pi / 4 (approximately -0.78540)
     * - `south` = -Pi / 2 (approximately -1.57080)
     * - `southwest` = -Pi * 3 / 4 (approximately -2.35619)
     *
     * @readonly
     * @type {number|"north"|"northeast"|"northwest"|"east"|"west"|"south"|"southeast"|"southwest"}
     */
    orientation;
}

/**
 * @interface
 */
export class RendererOptionsConfig {
    /**
     * The maximum rendering distance.
     * Defaults to 64 if not specified.
     * @readonly
     * @type {number?}
     */
    renderDistance;

    /**
     * The distance from the player's point of view to the camera plane.
     * Defaults to 1 if not specified.
     * @readonly
     * @type {number?}
     */
    cameraDistance;

    /**
     * The field of view to use for rendering.
     * Defaults to Pi/2 (90 degrees) if not specified.
     * @readonly
     * @type {number?}
     */
	fieldOfView;

    /**
     * The ratio of wall width to wall height. Values larger that 1 will result
     * in walls that are wider than they are tall and values less than 1 will
     * produce walls taller than they are wide. Must be greater than 0.
     * Defaults to 2 if not specified.
     * @readonly
     * @type {number?}
     */
    wallWidthToHeightRatio;

    /**
     * A vertical offset to apply to the projection plane. Values less than 0 will
     * render the scene from a perspective lower to the floor, while values greater
     * than 0 will raise the perspective toward the ceiling. Values should be between
     * -0.5 and 0.5.
     * Defaults to 0 if not specified.
     * @readonly
     * @type {number?}
     */
	projectionPlaneOffset;
}

/**
 * @interface
 */
export class ScenarioMapOptionsConfig {
    /**
     * The type of map definition this configuration describes.
     * @type {"city"|"dungeon"}
     */
    type;

    /**
     * Width of the map in cells.
     * If not provided, the map defaults to 64 cells wide if `type` = "city" and
     * 32 cells wide if `type` = "dungeon".
     * @type {number?}
     * @readonly
     */
    width;

    /**
     * Height of the map in cells.
     * If not provided, the map defaults to 64 cells tall if `type` = "city" and
     * 32 cells tall if `type` = "dungeon".
     * @type {number?}
     * @readonly
     */
    height;

    /**
     * URL of the JSON wall texture definitions to load.
     * @type {string|URL}
     * @readonly
     */
    wallTextureJsonUrl;

    /**
     * URL of the JSON floor and ceiling texture definitions to load.
     * @type {string|URL}
     * @readonly
     */
    floorAndCeilingTextureJsonUrl;

    /**
     * Optional URL of the JSON zone definitions to load.
     * @type {(string|URL)?}
     * @readonly
     */
    zoneJsonUrl;

    /**
     * Optional URL of the JSON message definitions to load.
     * @type {(string|URL)?}
     * @readonly
     */
    messageJsonUrl;

    /**
     * Optional URL of the encounter definitions to load.
     * @type {(string|URL)?}
     * @readonly
     */
    encounterJsonUrl;

    /**
     * Optional URL of the patch definitions to load.
     * @type {(string|URL)?}
     * @readonly
     */
    patchJsonUrl;

    /**
     * Optional URL of the JSON sound clip definitions to load.
     * @type {(string|URL)?}
     * @readonly
     */
    soundJsonUrl;
}

/**
 * @interface
 */
export class CityMapOptionsConfig extends ScenarioMapOptionsConfig {

    /**
     * @readonly
     * @type {"city"}
     */
    type;

    /**
     * URL of the binary map walls.
     * The dimensions of this map data must match the specified width and height.
     * @type {string}
     * @readonly
     */
    wallBinaryUrl;

    /**
     * URL of the binary map locations.
     * The dimensions of this map data must match the specified width and height.
     * @type {string}
     * @readonly
     */
    locationBinaryUrl;

    /**
     * URL of the JSON description definitions
     * @type {string}
     * @readonly
     */
    descriptionJsonUrl;
}

/**
 * @interface
 */
export class DungeonMapBinaryConfig {
    /**
     * Prefix to assign to description and zone IDs loaded from this map binary.
     *
     * When multiple binary maps are combined into a single logical map, each binary
     * must be assigned a unique ID prefix.
     *
     * @type {string}
     * @readonly
     */
    idPrefix;

    /**
     * The horizontal location within the underlying map to start writing the loaded map data.
     * @type {number}
     * @readonly
     */
    x;

    /**
     * The vertical locaton within the underlying map to start writing the loaded map data.
     * @type {number}
     * @readonly
     */
    y;

    /**
     * The width of the binary map data.
     * If omitted, defaults to 32.
     * @type {number?}
     * @readonly
     */
    width;

    /**
     * The height of the binary map data.
     * If omitted, defaults to 32.
     * @type {number?}
     * @readonly
     */
    height;

    /**
     * The URL of the map binary file to load.
     * @type {string|URL}
     * @readonly
     */
    url;
}


/**
 * @interface
 */
export class DungeonMapOptionsConfig extends ScenarioMapOptionsConfig {
    /**
     * @readonly
     * @type {"dungeon"}
     */
    type;

    /**
     * URL of the binary map file containing wall, location, description and zone data
     * OR an array of binary map file descriptions to load into a combined map.
     *
     * If a single URL is provided, the dimensions of this map data must match the specified
     * width and height.
     *
     * @readonly
     * @type {string|URL|DungeonMapBinaryConfig[]}
     */
    mapBinaryUrl;
}

/**
 * @interface
 */
export class ScenarioConfig {

    /**
     * The name of the scenario.
     * Defaults to '<Unnamed>' if not configured.
     * @readonly
     * @type {string?}
     */
    name;

    /**
     * The default location to place the player when first starting the scenario
     * without a specific location.
     *
     * @readonly
     * @type {ScenarioLocation}
     */
    defaultLocation;

    /**
     * The renderer options to apply for this scenario. If not provided, will
     * use the default renderer options. See {@link RendererOptions} for more
     * details.
     *
     * @type {RendererOptionsConfig?}
     */
    renderer;

    /**
     * The maps for this scenario.
     * @type {{[name: string]: CityMapOptionsConfig|DungeonMapOptionsConfig}}
     */
    maps;

}

/**
 * @implements {Configurable<RendererOptionsConfig>}
 * @implements {RendererOptionsConfig}
 */
export class RendererOptions {

    /**
     * @type {number}
     */
    #renderDistance;

    /**
     * @type {number}
     */
    #cameraDistance

    /**
     * @type {number}
     */
    #fieldOfView;

    /**
     * @type {number}
     */
    #wallWidthToHeightRatio;

    /**
     * @type {number}
     */
    #projectionPlaneOffset;

    /**
     * Constructs a new RendererOptions instance.
     * @param {RendererOptionsConfig?} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config || {});
    }

    /**
     * @param {RendererOptionsConfig} config the configuration to apply.
     */
    configure(config) {
        this.#renderDistance = Parse.prop(config, ["renderDistance"], 64, Parse.num);
        this.#cameraDistance = Parse.prop(config, ["cameraDistance"], 1, Parse.num);
        this.#fieldOfView = Parse.prop(config, ["fieldOfView"], Math.PI/2, Parse.num);
        this.#wallWidthToHeightRatio = Parse.prop(config, ["wallWidthToHeightRatio"], 2, Parse.num);
        this.#projectionPlaneOffset = Parse.prop(config, ["projectionPlaneOffset"], 0, Parse.num);
    }

    /**
     * @type {RendererOptionsConfig}
     */
    get config() {
        return this;
    }

    /**
     * The maximum rendering distance.
     */
    get renderDistance() {
        return this.#renderDistance;
    }

    /**
     * The distance from the player's point of view to the camera plane.
     */
    get cameraDistance() {
        return this.#cameraDistance;
    }

    /**
     * The field of view to use for rendering.
     */
	get fieldOfView() {
        return this.#fieldOfView;
    }

    /**
     * The ratio of wall width to wall height. Values larger that 1 will result
     * in walls that are wider than they are tall and values less than 1 will
     * produce walls taller than they are wide. Must be greater than 0.
     */
    get wallWidthToHeightRatio() {
        return this.#wallWidthToHeightRatio;
    }

    /**
     * A vertical offset to apply to the projection plane. Values less than 0 will
     * render the scene from a perspective lower to the floor, while values greater
     * than 0 will raise the perspective toward the ceiling.
     */
	get projectionPlaneOffset() {
        return this.#projectionPlaneOffset;
    }
}

/**
 *
 * @implements {Configurable<ScenarioLocationConfig>}
 * @implements {ScenarioLocationConfig}
 */
export class ScenarioLocation {

    /**
     * @type {string}
     */
    #map;

    /**
     * @type {number}
     */
    #x;

    /**
     * @type {number}
     */
    #y;

    /**
     * @type {number}
     */
    #orientation;

    /**
     *
     * @param {ScenarioLocationConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config || {});
    }

    configure(config) {
        this.#map = Parse.prop(config, ["map"], null, Parse.str);
        this.#x = Parse.prop(config, ["x"], null, Parse.num);
        this.#y = Parse.prop(config, ["y"], null, Parse.num);
        this.#orientation = Parse.prop(config, ["orientation"], "north",
            (val) => {
                switch (val) {
                    case "north": return Math.PI / 2;
                    case "northeast": return Math.PI / 4;
                    case "northwest": return Math.PI * 3 / 4;
                    case "east": return 0;
                    case "west": return Math.PI;
                    case "southeast": return -Math.PI / 4;
                    case "south": return -Math.PI / 2;
                    case "southwest": return -Math.PI * 3 / 4;
                    default: return Parse.num(val);
                }
            });
    }

    /**
     * @type {ScenarioLocationConfig}
     */
    get config() {
        return this;
    }

    /**
     * The name of the map containing the location.
     */
    get map() {
        return this.#map;
    }

    /**
     * The x coordinate within the map.
     */
    get x() {
        return this.#x;
    }

    /**
     * The y coordinate within the map.
     */
    get y() {
        return this.#y;
    }

    /**
     * The orientation of the character in radians using a right-handed coordinate
     * system (0 = east, Pi/2 = north, etc).
     */
    get orientation() {
        return this.#orientation;
    }
}

/**
 * @abstract
 * @implements {Configurable<ScenarioMapOptionsConfig>}
 * @implements {ScenarioMapOptionsConfig}
 */
export class ScenarioMapOptions {
    /**
     * @type {number}
     */
    #width;

    /**
     * @type {number}
     */
    #height;

    /**
     * @type {string}
     */
    #wallTextureJsonUrl;

    /**
     * @type {string}
     */
    #floorAndCeilingTextureJsonUrl;

    /**
     * @type {string?}
     */
    #zoneJsonUrl;

    /**
     * @type {string?}
     */
    #messageJsonUrl;

    /**
     * @type {string?}
     */
    #encounterJsonUrl;

    /**
     * @type {string?}
     */
    #patchJsonUrl;

    /**
     * @type {string?}
     */
    #soundJsonUrl;

    #parseUrl(config, property, required = false) {
        const val = config[property];

        if (!required && val == null) {
            return undefined;
        }

        return Parse.prop(config, [property], null,
            (val) => String(Parse.url(val)));
    }

    /**
     * @param {ScenarioMapOptionsConfig} config the configuration to apply.
     */
    configure(config) {
        let defaultSize;
        switch (config.type) {
            case "city":
                defaultSize = 64;
                break;
            case "dungeon":
                defaultSize = 32;
                break;
            default:
                throw new Error("Invalid 'type': " + config.type);
        }

        this.#width = Parse.prop(config, ["width"], defaultSize, Parse.num);
        this.#height = Parse.prop(config, ["height"], defaultSize, Parse.num);
        this.#wallTextureJsonUrl = this.#parseUrl(config, "wallTextureJsonUrl", true);
        this.#floorAndCeilingTextureJsonUrl =
            this.#parseUrl(config, "floorAndCeilingTextureJsonUrl", true);
        this.#zoneJsonUrl = this.#parseUrl(config, "zoneJsonUrl");
        this.#messageJsonUrl = this.#parseUrl(config, "messageJsonUrl");
        this.#encounterJsonUrl = this.#parseUrl(config, "encounterJsonUrl");
        this.#patchJsonUrl = this.#parseUrl(config, "patchJsonUrl");
        this.#soundJsonUrl = this.#parseUrl(config, "soundJsonUrl");
    }

    /**
     * @type {ScenarioMapOptionsConfig}
     */
    get config() {
        return this;
    }

    /**
     * The type of map definition this configuration describes.
     */
    get type() {
        throw new Error("This method must be overridden in a subclass");
    }

    /**
     * Width of the map in cells.
     */
    get width() {
        return this.#width;
    }

    /**
     * Height of the map in cells.
     */
    get height() {
        return this.#height;
    }

    /**
     * URL of the JSON wall texture definitions to load.
     * @type {string}
     */
    get wallTextureJsonUrl() {
        return this.#wallTextureJsonUrl;
    }

    /**
     * URL of the JSON floor and ceiling texture definitions to load.
     * @type {string}
     */
    get floorAndCeilingTextureJsonUrl() {
        return this.#floorAndCeilingTextureJsonUrl;
    }

    /**
     * Optional URL of the JSON zone definitions to load.
     * @type {string?}
     */
    get zoneJsonUrl() {
        return this.#zoneJsonUrl;
    }

    /**
     * Optional URL of the JSON message definitions to load.
     * @type {string?}
     */
    get messageJsonUrl() {
        return this.#messageJsonUrl;
    }

    /**
     * Optional URL of the encounter definitions to load.
     * @type {string?}
     */
    get encounterJsonUrl() {
        return this.#encounterJsonUrl;
    }

    /**
     * Optional URL of the patch definitions to load.
     * @type {string?}
     */
    get patchJsonUrl() {
        return this.#patchJsonUrl;
    }

    /**
     * Optional URL of the JSON sound clip definitions to load.
     * @type {string?}
     */
    get soundJsonUrl() {
        return this.#soundJsonUrl;
    }
}

/**
 * @implements {Configurable<CityMapOptionsConfig>}
 * @implements {CityMapOptionsConfig}
 */
export class CityMapOptions extends ScenarioMapOptions {

    /**
     * @type {string}
     */
    #wallBinaryUrl;

    /**
     * @type {string}
     */
    #locationBinaryUrl;

    /**
     * @type {string}
     */
    #descriptionJsonUrl;

    /**
     * Constructs a new CityMapOptions using the specified configuration.
     * @param {CityMapOptionsConfig} config the configuration to apply.
     */
    constructor(config) {
        super();
        this.configure(config);
    }

    /**
     * @param {CityMapOptionsConfig} config the configuration to apply.
     */
    configure(config) {
        super.configure(config);

        this.#wallBinaryUrl =
            Parse.prop(config, ["wallBinaryUrl"], null, (val) => String(Parse.url(val)));
        this.#locationBinaryUrl =
            Parse.prop(config, ["locationBinaryUrl"], null, (val) => String(Parse.url(val)));
        this.#descriptionJsonUrl =
            Parse.prop(config, ["descriptionJsonUrl"], null, (val) => String(Parse.url(val)));
    }

    /**
     * @type {CityMapOptionsConfig}
     */
    get config() {
        return this;
    }

    /**
     * @type {"city"}
     */
    get type() {
        return "city";
    }

    /**
     * URL of the binary map walls.
     * @type {string}
     */
    get wallBinaryUrl() {
        return this.#wallBinaryUrl;
    }

    /**
     * URL of the binary map locations.
     * @type {string}
     */
    get locationBinaryUrl() {
        return this.#locationBinaryUrl;
    }

    /**
     * URL of the JSON description definitions
     * @type {string}
     */
    get descriptionJsonUrl() {
        return this.#descriptionJsonUrl;
    }
}

/**
 * @implements {Configurable<DungeonMapBinaryConfig>}
 * @implements {DungeonMapBinaryConfig}
 */
export class DungeonMapBinary {

    /**
     * @type {string}
     */
    #idPrefix;

    /**
     * @type {number}
     */
    #x;

    /**
     * @type {number}
     */
    #y;

    /**
     * @type {number}
     */
    #width;

    /**
     * @type {number}
     */
    #height;

    /**
     * @type {string}
     */
    #url;

    /**
     * Creates a new DungeonMapBinary instance from the provided configuration.
     * @param {DungeonMapBinaryConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {DungeonMapBinaryConfig} config the configuration to apply.
     */
    configure(config) {
        this.#idPrefix = Parse.prop(config, ["idPrefix"], "", Parse.str);
        this.#width = Parse.prop(config, ["width"], 32, Parse.num);
        this.#height = Parse.prop(config, ["height"], 32, Parse.num);
        this.#x = Parse.prop(config, ["x"], 0, Parse.num);
        this.#y = Parse.prop(config, ["y"], 0, Parse.num);
        this.#url = Parse.prop(config, ["url"], null, (val) => String(Parse.url(val)));
    }

    get config() {
        return this;
    }

    /**
     * Prefix to assign to description and zone IDs loaded from this map binary.
     *
     * When multiple binary maps are combined into a single logical map, each binary
     * must be assigned a unique ID prefix.
     *
     * @type {string}
     */
    get idPrefix() {
        return this.#idPrefix;
    }

    /**
     * The horizontal location within the underlying map to start writing the loaded map data.
     * @type {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * The vertical locaton within the underlying map to start writing the loaded map data.
     * @type {number}
     */
    get y() {
        return this.#y;
    }

    /**
     * The width of the binary map data.
     * @type {number}
     */
    get width() {
        return this.#width;
    }

    /**
     * The height of the binary map data.
     * @type {number}
     */
    get height() {
        return this.#height;
    }

    /**
     * The URL of the map binary file to load.
     * @type {string}
     */
    get url() {
        return this.#url;
    }
}

/**
 * @implements {Configurable<DungeonMapOptionsConfig>}
 * @implements {DungeonMapOptionsConfig}
 */
export class DungeonMapOptions extends ScenarioMapOptions {

    /**
     * @type {DungeonMapBinary[]}
     */
    #mapBinaryUrl;

    /**
     * Creates a new DungeonMapOptions instance using the specified configuration.
     * @param {DungeonMapOptionsConfig} config the configuration to apply.
     */
    constructor(config) {
        super();
        this.configure(config);
    }

    /**
     * @param {DungeonMapOptionsConfig} config the configuration to apply.
     */
    configure(config) {
        super.configure(config);

        this.#mapBinaryUrl = Object.freeze(Parse.prop(config, ["mapBinaryUrl"], null,
            (val) => Parse.array(val, [], (val) => {
                if (typeof val === "string" || val instanceof URL) {
                    val = {url: val};
                }
                return new DungeonMapBinary(val);
            })));

        // Verify that each idPrefix is unique
        const s = new Set();
        this.#mapBinaryUrl.forEach((item, index) => {
            if (s.has(item.idPrefix)) {
                throw new Error("Duplicate 'idPrefix' for mapBinaryUrl[" + index + "]");
            }
            s.add(item.idPrefix);
        });
    }

    /**
     * @type {"dungeon"}
     */
    get type() {
        return "dungeon";
    }

    /**
     * Array of binary map file descriptions to load.
     * @type {readonly DungeonMapBinary[]}
     */
    get mapBinaryUrl() {
        return this.#mapBinaryUrl;
    }
}

/**
 * @implements {Configurable<ScenarioConfig>}
 * @implements {ScenarioConfig}
 */
export class Scenario {

    /**
     * @type {string}
     */
    #name;

    /**
     * @type {ScenarioLocation}
     */
    #defaultLocation;

    /**
     * @type {RendererOptions}
     */
    #renderer;

    /**
     * @type {{[name: string]: CityMapOptions|DungeonMapOptions}}
     */
    #maps;

    /**
     * Constructs a new Scenario instance.
     * @param {ScenarioConfig?} config
     */
    constructor(config) {
        this.configure(config || {});
    }

    configure(config) {
        this.#name = Parse.prop(config, ["name"], "<Unnamed>", Parse.str);
        this.#defaultLocation = Parse.prop(config, ["defaultLocation"], {},
            (config) => new ScenarioLocation(config));
        this.#renderer = Parse.prop(config, ["renderer"], {},
            (config) => new RendererOptions(config));

        this.#maps = Parse.prop(config, ["maps"], null, (maps) => {
            const result = {};
            Object.entries(maps).forEach(([name, config]) => {
                try {
                    if (config.type == "city") {
                        result[name] = new CityMapOptions(config);
                    } else if (config.type == "dungeon") {
                        result[name] = new DungeonMapOptions(config);
                    } else {
                        throw new Error("Invalid 'type': " + config.type);
                    }
                } catch (e) {
                    throw new Error("Unable to parse maps[" + name + "]: " + e);
                }
            });
            return Object.freeze(result);
        });
    }

    /**
     * @type {ScenarioConfig}
     */
    get config() {
        const maps = {};
        Object.entries(this.#maps).forEach(([key, val]) => {
            maps[key] = val.config;
        });

        return {
            name: this.#name,
            defaultLocation: this.#defaultLocation.config,
            renderer: this.#renderer.config,
            maps
        };
    }

    /**
     * The name of the scenario.
     */
    get name() {
        return this.#name;
    }

    /**
     * The default location to place the player when first starting the scenario
     * without a specific location.
     */
    get defaultLocation() {
        return this.#defaultLocation;
    }

    /**
     * The renderer options to apply for this scenario.
     */
    get renderer() {
        return this.#renderer;
    }

    /**
     * The maps for this scenario.
     */
    get maps() {
        return this.#maps;
    }
}
