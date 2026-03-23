import { Parse } from "./Parse.js"
import { Player } from "./Player.js"
import { GameClock, GameClockConfig } from "./GameClock.js"
import { OptionsConfig, RecurringOptionsConfig, Options, RecurringOptions, TemperatureOptionsConfig, TemperatureOptions, InebriationOptions, InebriationOptionsConfig } from "./ConfigOptions.js"
import { ItemTypeConfig } from "./ItemType.js";
import { ItemTypes } from "./ItemTypes.js";
import { ResourceManager } from "./ResourceManager.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";
import { AudioManager } from "./AudioManager.js";
import { ActionManager } from "./ActionManager.js";
import { Scenario } from "./Scenario.js";
import { WeatherType, WeatherTypeConfig } from "./WeatherType.js";

/**
 * @interface
 */
export class GameStateConfig {
	/**
	 * @readonly
	 * @type {string}
	 */
	title;

	/**
	 * @readonly
	 * @type {{[name:string]: WeatherTypeConfig}}
	 */
	weather;

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

	/**
	 * @readonly
	 * @type {InebriationOptionsConfig?}
	 */
	inebriation;

	/**
	 * @readonly
	 * @type {ReadonlyArray<ItemTypeConfig>?}
	 */
	 itemTypes;

	 /**
	  * @readonly
	  * @type {{[name: string]: ScenarioConfig}}
	  */
	 scenarios;

	 /**
	  * @readonly
	  * @type {string}
	  */
	 defaultScenario;

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
	// Decode into an AudioBuffer
	"audio/*", (request, meta, accept, reject) => {
		audioManager.context.decodeAudioData(request.response).then(
						(buffer) => { accept(buffer); },
						(error) => { reject(error); }
					);
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

	/**
	 * @type {{[name: string]: WeatherType}}
	 */
	#weather;

	/**
	 * @readonly
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
	 * @type {InebriationOptions}
	 */
	#inebriation = new InebriationOptions();

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
	 * @type {{[name: string]: Scenario}}
	 */
	#scenarios;

	/**
	 * @type {string}
	 */
	#defaultScenario;

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
		if (config instanceof URL || typeof config == 'string') {
			config = String(Parse.url(config));
		}

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
					let configJson = entry[config].data;

					if (instance == null) {
						instance = new GameState(configJson);
					} else {
						instance.configure(configJson);
					}

					loading = false;
					return instance;
				})
			} else {
				loadingPromise = rv = new Promise<GameState>((resolve, reject) => {
					if (instance == null) {
						instance = new GameState(config);
					} else {
						instance.configure(config);
					}

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

		this.#weather = {};
		if (config.weather) {
			Object.entries(config.weather)
				.forEach(([key, val]) => {
					this.#weather[key] = new WeatherType(val);
				});
		}
		Object.freeze(this.#weather);

		this.#clock.configure(Parse.required(config.clock, "clock"));

		// TODO: Validate the weather types against the calendar month weather refs

		this.#hunger.configure(Parse.required(config.hunger, "hunger"));
		this.#thirst.configure(Parse.required(config.thirst, "thirst"));
		this.#fatigue.configure(Parse.required(config.fatigue, "fatigue"));
		this.#digestion.configure(Parse.required(config.digestion, "digestion"));
		this.#warmth.configure(Parse.required(config.warmth, "warmth"));
		this.#encumbrance.configure(Parse.required(config.encumbrance, "encumbrance"));
		this.#inebriation.configure(Parse.required(config.inebriation, "inebriation"));
		this.#itemTypes.configure(Parse.required(config.itemTypes, "itemTypes"));

		this.#scenarios = {};
		Object.entries(Parse.required(config.scenarios, "scenarios"))
			.forEach(([key, val]) => {
				this.#scenarios[key] = new Scenario(val);
			});
		Object.freeze(this.#scenarios);

		this.#defaultScenario = Parse.prop(config, ["defaultScenario"], null, Parse.str);
	}

	/**
	 * @type {GameStateConfig}
	 */
	get config() {
		const weather = {};
		Object.entries(this.#weather).forEach(([key, val]) => {
			weather[key] = val.config;
		});

		const scenarios = {};
		Object.entries(this.#scenarios).forEach(([key, val]) => {
			scenarios[key] = val.config;
		});

		return {
			title: this.title,
			weather: weather,
			clock: this.clock.config,

			hunger: this.hunger.config,
			thirst: this.thirst.config,
			fatigue: this.fatigue.config,
			digestion: this.digestion.config,
			warmth: this.warmth.config,
			encumbrance: this.encumbrance.config,
			inebriation: this.inebriation.config,

			itemTypes: this.itemTypes.config,
			scenarios: scenarios,
			defaultScenario: this.defaultScenario
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
		this.#title = value;
	}

	/**
	 * The defined weather types.
	 */
	get weather() {
		return this.#weather;
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

	get scenarios() {
		return this.#scenarios;
	}

	get defaultScenario() {
		return this.#defaultScenario;
	}

	get player() {
		if (this.#player == null) {
			throw new Error("No player");
		}

		return this.#player;
	}

	// encounters (no save)
	// scenarios
	//  - maps
	//	- encounters (no save)
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