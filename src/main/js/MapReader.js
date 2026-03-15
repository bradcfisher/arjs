
import { EventDispatcher } from "./EventDispatcher.js";
import { Parse } from "./Parse.js";
import { GameState } from "./GameState.js";
import { ScenarioMap, WallStyle } from "./ScenarioMap.js";
import { Texture, TextureFrame, AnimatedTextureProvider, SolidColorTexture } from "./Texture.js";

/**
 * Provides a resource manager and uninitialized map as well as utility functions to read map definitions from JSON files.
 */
export class MapReader extends EventDispatcher {

    #resourceManager;
    #map;

    constructor(width, height) {
        super();

        this.#resourceManager = GameState.getResourceManager();
        this.#map = new ScenarioMap(width, height);

        this.#resourceManager.on("complete", (event) => this.triggerEvent("complete", event.data));
    }

    /**
     * Resizes the underlying map.
     *
     * WARNING: This is a destructive operation and resets all previously loaded map data.
     *
     * @param {number} width the new map width.
     * @param {number} height  the new map height.
     */
    resize(width, height) {
        this.#map = new ScenarioMap(width, height);
    }

    get map() {
        return this.#map;
    }

    get resourceManager() {
        return this.#resourceManager;
    }

    #applyMetadata(obj, metadata) {
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                obj[key] = value;
            });
        }
        return obj;
    }

    #loadTexture(value, context, callback, metadata) {
        if (value.texture) {
            const source = Parse.url(value.texture.source ? value.texture.source : value.texture);
            this.#resourceManager.load(source)
                .then((result) => {
                    /** @type ImageData */
                    const imageData = result[source].data;

                    let textureProvider;
                    if (value.texture.frames) {
                        textureProvider = new AnimatedTextureProvider(
                            value.texture.frames.map(
                                (f) => this.#applyMetadata(
                                    new TextureFrame(f.duration, imageData, f.x, f.y, f.width, f.height), metadata)));
                    } else {
                        textureProvider = this.#applyMetadata(new Texture(imageData), metadata);
                    }

                    textureProvider.color = value.color;

                    callback(textureProvider);
                });
        } else if (value.color) {
            callback(this.#applyMetadata(new SolidColorTexture(value.color), metadata));
        } else {
            console.error("Missing both 'texture' and 'color' for " + context);
        }
    }

    /**
     * Reads wall definitions from a JSON File.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the URL of the JSON to load.  If a relative reference, it
     *        will be resolved using {@link Parse.url}.
     *
     * @return {Promise} a promise that will complete when the load completes
     */
    async readJsonWalls(url) {
        url = Parse.url(url);

        const loaded = await this.#resourceManager.load(url);
        const walls = loaded[url].data;

        Parse.withBaseUrl(url, () => {
            console.log("Loading walls JSON: " + url);
            Object.entries(walls).forEach(([key, value]) => {
                this.#loadTexture(value, "wall style '" + key + "'", (textureProvider) => {
                    value.textureProvider = textureProvider;
                    Parse.withBaseUrl(url, () => {
                        this.#map.wallStyles[key] = new WallStyle(value);
                    });
                    console.log("Registered wall style: ", key, " = ", this.#map.wallStyles[key]);
                });
            });
            console.log("DONE loading walls JSON: " + url);
        });
    }

    /**
     * Reads JSON floor and ceiling definitions into the map.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the location of the floor and ceiling JSON to load. If a relative reference, it
     *        will be resolved using {@link Parse.url}.
     *
     * @return {Promise} a promise that will complete when the load completes
     */
    async readJsonFloorAndCeiling(url) {
        url = Parse.url(url);

        const loaded = await this.#resourceManager.load(url);
        const floorAndCeiling = loaded[url].data;

        Parse.withBaseUrl(url, () => {
            // Load the sky texture
            if (floorAndCeiling.sky) {
                this.#loadTexture(floorAndCeiling.sky, "sky texture", (textureProvider) => {
                    this.#map.skyTexture = textureProvider;
                    console.log("Registered sky texture: ", this.#map.skyTexture);
                }, { "isSky": true });
            }
            // Load floor styles
            if (floorAndCeiling.floor) {
                Object.entries(floorAndCeiling.floor).forEach(([key, floorStyle]) => {
                    this.#loadTexture(floorStyle, "floor texture '" + key + "'", (textureProvider_1) => {
                        this.#map.floorTextures[key] = textureProvider_1;
                        console.log("Registered floor texture: ", key, " = ", this.#map.floorTextures[key]);
                    });
                });
            }
            if (floorAndCeiling.ceiling) {
                Object.entries(floorAndCeiling.ceiling).forEach(([key_1, ceilingStyle]) => {
                    this.#loadTexture(ceilingStyle, "ceiling texture '" + key_1 + "'", (textureProvider_2) => {
                        this.#map.ceilingTextures[key_1] = textureProvider_2;
                        console.log("Registered ceiling texture: ", key_1, " = ", this.#map.ceilingTextures[key_1]);
                    });
                });
            }
        });
    }

    /**
     * Reads JSON map cell patches into the map.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the location of the patches JSON to load. If a relative reference, it
     *        will be resolved using {@link Parse.url}.
     *
     * @return {Promise} a promise that will complete when the load completes
     */
    async readJsonPatches(url) {
        url = Parse.url(url);

        const loaded = await this.#resourceManager.load(url);

        loaded[url].data.forEach((patch) => {
            const cell = this.map.getCell(patch.x, patch.y);
            if (!cell) {
                console.warn("Unable to apply patch to cell at [", patch.x, ", ", patch.y,
                    "]. No such cell in map for patch ", patch);
                return;
            }

            console.log("Applying patch to cell at [", patch.x, ", ", patch.y, "] with ", patch);

            Object.entries(patch).forEach(([key, value]) => {
                if (key.charAt(0) != '_') {
                    cell[key] = value;
                }
            });
        });
    }

    /**
     * Reads JSON zone definitions into the map.
     *
     * This operation may execute asynchronously and is not guaranteed to be complete when the method returns.
     * In addition to the promose returned, a 'complete' listener may also be used to detect when all pending
     * load operations have completed.
     *
     * @param {string} url the location of the zone JSON to load. If a relative reference, it
     *        will be resolved using {@link Parse.url}.
     *
     * @return {Promise} a promise that will complete when the load completes
     */
    async readJsonZones(url) {
        url = Parse.url(url);
        const loaded = await this.#resourceManager.load(url);

        console.warn("TODO: Parse and apply zone data: ", loaded[url].data);
    }

}
