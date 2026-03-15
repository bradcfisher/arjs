import { Parse } from "./Parse.js"
import { Player } from "./Player.js"
import { GameClock, GameClockConfig } from "./GameClock.js"
import { OptionsConfig, RecurringOptionsConfig, Options, RecurringOptions, TemperatureOptionsConfig, TemperatureOptions } from "./ConfigOptions.js"
import { ItemTypeConfig } from "./ItemType.js";
import { ItemTypes } from "./ItemTypes.js";
import { ResourceManager } from "./ResourceManager.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";
import { AudioManager } from "./AudioManager.js";
import { ActionManager } from "./ActionManager.js";

/**
 * @interface
 */
export class GameStateConfig {
	/**
	 * @readonly
	 * @type {string}
	 */
	title;

	//readonly weather?: WeatherConfig;

	/**
	 * @readonly
	 * @type {GameClockConfig}
	 */
	clock;

	/**
	 * @readonly
	 * @type {RecurringOptionsConfig?}
	 */
	hunger;

	/**
	 * @readonly
	 * @type {RecurringOptionsConfig?}
	 */
	thirst;

	/**
	 * @readonly
	 * @type {RecurringOptionsConfig?}
	 */
	fatigue;

	/**
	 * @readonly
	 * @type {RecurringOptionsConfig?}
	 */
	digestion;

	/**
	 * @readonly
	 * @type {TemperatureOptionsConfig?}
	 */
	warmth;

	/**
	 * @readonly
	 * @type {OptionsConfig?}
	 */
	encumbrance;

	//readonly inebriation?: InebriationConfig;

	/**
	 * @readonly
	 * @type {ReadonlyArray<ItemTypeConfig>?}
	 */
	 itemTypes;

	//readonly scenarios: ScenarioConfig[];
	//readonly defaultScenario: string;
}


/**
 * The singleton GameState instance.
 * @type {GameState}
 */
let instance;

/**
 * @type {boolean}
 */
let loading = false;

/**
 * @type {string|GameStateConfig|undefined}
 */
let loadingConfig;

/**
 * @type {Promise<GameState>|undefined}
 */
let loadingPromise;

const audioManager = new AudioManager();

const resourceManager = new ResourceManager();
resourceManager.registerResourceDecoder(
	"audio/*", (request, meta, accept, reject) => {
		const url = String(meta.url);
		const clip = audioManager.getClip(url);
		if (clip) {
			accept(clip);
			return;
		}

		audioManager.clipFromArrayBuffer(url, request.response).then(accept, reject);
	}
);

const actionManager = new ActionManager();

/**
 * @implements {Configurable<GameStateConfig>}
 */
export class GameState {

	/**
	 * @type {string}
	 */
	#title = "<Untitled>";

	//private _weather: Weather;

	/**
	 * @type {GameClock}
	 */
	#clock = new GameClock();

	/**
	 * @readonly
	 * @type {RecurringOptions}
	 */
	#hunger = new RecurringOptions();

	/**
	 * @readonly
	 * @type {RecurringOptions}
	 */
	#thirst = new RecurringOptions();

	/**
	 * @readonly
	 * @type {RecurringOptions}
	 */
	#fatigue = new RecurringOptions();

	/**
	 * @readonly
	 * @type {RecurringOptions}
	 */
	#digestion = new RecurringOptions();

	/**
	 * @readonly
	 * @type {TemperatureOptions}
	 */
	#warmth = new TemperatureOptions();

	/**
	 * @readonly
	 * @type {Options}
	 */
	#encumbrance = new Options();

	/**
	 * @readonly
	 * @type {ItemTypes}
	 */
	#itemTypes = new ItemTypes();

	/**
	 * @readonly
	 * @type {Player?}
	 */
	#player;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_GameState = (() => {
		ClassRegistry.registerClass(
			"GameState", GameState,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			},
			(classEntry, data, deserializer) => {
				return GameState.getInstance();
			}
		);
	})();

	/**
	 * Loads a configuration into the GameState singleton, intializing the instance.
	 *
	 * @param {GameStateConfig|string} config the configuration to apply to the GameState.
	 * @return {PromiseLike<GameState>} a Promise that resolves to the GameState singleton populated with
	 * 		the specified configuration on success.
	 */
	static load(config) {
		/** @type {Promise<GameState>} */
		let rv;

		if (loading) {
			if (config != loadingConfig) {
				throw new Error("Already loading a different config");
			}

			if (loadingPromise == null) {
				throw new Error("loading set, but no promise? shouldn't happen");
			}

			rv = loadingPromise;
		} else {
			loading = true;
			loadingConfig = config;

			if (typeof config === "string") {
				loadingPromise = rv = resourceManager.load(config).then((entry) => {
					let confJson = entry[config].data;
					if (instance == null) {
						instance = new GameState(confJson);
					} else {
						instance.configure(confJson);
					}
					loading = false;
					return instance;
				})
			} else {
				loadingPromise = rv = new Promise<GameState>((resolve, reject) => {
					let inst = this.getInstance();
					inst.configure(config);
					loading = false;
					resolve(inst);
				});
			}
		}

		return rv;
	}

	/**
	 * Retrieves the GameState singleton object.
	 * @return the GameState singleton.
	 * @throws Error if the load() method has not yet been called to initialize the GameState.
	 */
	static getInstance() {
		if (instance == null) {
			throw new Error("GameState not loaded");
		}
		return instance;
	}

	/**
	 * Retrieves the global ResourceManager used by the GameState for loading assets.
	 */
	static getResourceManager() {
		return resourceManager;
	}

	/**
	 * Retrieves the global AudioManager.
	 */
	static getAudioManager() {
		return audioManager;
	}

	/**
	 * Retrieves the global ActionManager.
	 */
	static getActionManager() {
		return actionManager;
	}

	/**
	 * Constructs a new GameState instance.
	 *
	 * @parame {GameStateConfig} config
	 */
	constructor(config) {
		this.configure(config);
	}

	/**
	 *
	 * @param {GameStateConfig} config
	 */
	configure(config) {
		this.title = Parse.str(config.title, "<Untitled>");
		//this._weather = new Weather(config.weather);
		this.#clock.configure(Parse.required(config.clock, "clock"));

		// TODO: Validate the weather types against the calendar month weather refs

		this.#hunger.configure(Parse.required(config.hunger, "hunger"));
		this.#thirst.configure(Parse.required(config.thirst, "thirst"));
		this.#fatigue.configure(Parse.required(config.fatigue, "fatigue"));
		this.#digestion.configure(Parse.required(config.digestion, "digestion"));
		this.#warmth.configure(Parse.required(config.warmth, "warmth"));
		this.#encumbrance.configure(Parse.required(config.encumbrance, "encumbrance"));
		//this._inebriation.configure(Parse.required(config.inebriation, "inebriation"));

		this.#itemTypes.configure(Parse.required(config.itemTypes, "itemTypes"));

		/*
		"scenarios"
		*/
	}

	/**
	 * @type {GameStateConfig}
	 */
	get config() {
		return {
			title: this.title,
			//weather: this.weather.config,
			clock: this.clock.config,

			hunger: this.hunger.config,
			thirst: this.thirst.config,
			fatigue: this.fatigue.config,
			digestion: this.digestion.config,
			warmth: this.warmth.config,
			encumbrance: this.encumbrance.config,
			//inebriation: this.inebriation.config,

			itemTypes: this.itemTypes.config,
			//scenarios: this.scenarios.config,
			//defaultScenario: this.defaultScenario
		};
	}

	/**
	 * The game title.
	 * Defaults to '<Untitled>' if not configured.
	 */
	get title() {
		return this.#title;
	}

	set title(value) {
		this._title = value;
	}

	/**
	 * The current in-game clock.
	 */
	get clock() {
		return this.#clock;
	}

	get hunger() {
		return this.#hunger;
	}

	get thirst() {
		return this.#thirst;
	}

	get fatigue() {
		return this.#fatigue;
	}

	get digestion() {
		return this.#digestion;
	}

	get warmth() {
		return this.#warmth;
	}

	get encumbrance() {
		return this.#encumbrance;
	}

	get itemTypes() {
		return this.#itemTypes;
	}

	get player() {
		if (this.#player == null) {
			throw new Error("No player");
		}

		return this.#player;
	}

	// weather type definitions (no save)
	// monsters (no save)
	// scenarios
	//  - maps
	//	- monsters (no save)
	//	- shops
	//	- smithies
	//	- banks
	//	- healers
	//	- inns (sleep)
	//	- taverns (drink/eat)
	//	- guilds
	//	- quests
	//	- items

}