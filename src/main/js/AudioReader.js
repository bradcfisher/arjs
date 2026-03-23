import { AudioClipOptions } from "./AudioClip.js";
import { GameState } from "./GameState.js";

/**
 * @interface
 */
export class AudioSourceOptions extends AudioClipOptions {
    /**
     * The source URL of the audio data to load. If a relative reference is
     * provided, it will be resolved using {@link Parse.url}.
     * @readonly
     * @type {string|URL}
     */
    source;
}

export class AudioReader {

    /**
     * Loads and registers an AudioClip.
     *
     * @param {string} clipName the clip name to use when registering with the
     *        AudioManager. If a clip with the given name is already registered,
     *        the existing clip will be returned instead of loading a new one.
     * @param {AudioSourceOptions} options the options specifying the source URL
     *        of the audio data to load as well as other options to apply to the
     *        clip.
     *
     * @return PromiseLike<AudioClip> a promise which resolves to the new
     *         AudioClip on success.
     */
    static async loadClip(clipName, options) {
        console.log("Registering sound clip: " + clipName, options);
        const source = Parse.prop(options, ["source"], null, Parse.url);

        const audioManager = GameState.getAudioManager();
        const existingClip = audioManager.getClip(clipName);
        if (existingClip) {
            return existingClip;
        }

        const loaded = await GameState.getResourceManager().load(source);
        const clip = new AudioClip(loaded[source].data, options);
        audioManager.registerClip(clipName, clip);
    }

    /**
     * Loads JSON file(s) containing sound clip definitions. The file should contain
     * a single JSON object whose keys are clip name fragments and whose values are
     * compatible with {@link AudioSourceOptions}.
     *
     * For example, given the following file "http://localhost/sounds.json":
     *
     * ```json
     * {
     *   "clip-name-1": {
     *     "source": "./some-audio.mp3",
     *     "loop": true
     *   },
     *   "clip-sprite-1": {
     *     "source": "./sprite-audio.mp3",
     *     "start": "10s",
     *     "length": "2s"
     *   },
     *   "clip-sprite-2": {
     *     "source": "./sprite-audio.mp3",
     *     "start": "12s",
     *     "length": "3s"
     *   }
     * }
     * ```
     *
     * The above will register the clips with the GameState's AudioManager under
     * the following names:
     *
     * - http://localhost/sounds.json#clip-name-1
     * - http://localhost/sounds.json#clip-sprite-1
     * - http://localhost/sounds.json#clip-sprite-2
     *
     * @param {string|URL|(string|URL)[]} source the location(s) of the sound JSON
     *        file(s) to load. If a relative reference is provided, it will be
     *        resolved using {@link Parse.url}.
     */
    static async loadSoundsJson(source) {
        const resourceManager = GameState.getResourceManager();
        const loadJsonPromises = [];
        for (let url of Parse.array(source, [], Parse.url)) {
            loadJsonPromises.push(resourceManager.load(url).then(
                (loaded) => {
                    const data = loaded[url].data;

                    return Parse.withBaseUrl(url, () => {
                        console.log("Loaded " + url + ": ", data);
                        const clipPromises = [];

                        Object.entries(data).forEach(([key, options]) => {
                            let clipName = new URL(String(url));
                            clipName.hash = "#" + key;

                            clipPromises.push(
                                AudioReader.loadClip(String(clipName), options));
                        });

                        return Promise.all(clipPromises);
                    });
                }));
        }
        await Promise.all(loadJsonPromises);
    }
}
