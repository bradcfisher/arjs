import { Parse } from "./Parse.js"
import { Gender, Player } from "./Player.js"
import { GameClock, GameClockConfig } from "./GameClock.js"
import { OptionsConfig, RecurringOptionsConfig, Options, RecurringOptions, TemperatureOptionsConfig, TemperatureOptions, InebriationOptions, InebriationOptionsConfig } from "./ConfigOptions.js"
import { ItemTypeConfig } from "./ItemType.js";
import { ItemTypes } from "./ItemTypes.js";
import { ResourceManager } from "./ResourceManager.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";
import { AudioManager } from "./AudioManager.js";
import { ActionManager } from "./ActionManager.js";
import { Scenario, ScenarioLocation, ScenarioLocationConfig } from "./Scenario.js";
import { WeatherType, WeatherTypeConfig } from "./WeatherType.js";
import { MapReader } from "./MapReader.js";
import { CityMapReader } from "./CityMapReader.js";
import { DungeonMapReader } from "./DungeonMapReader.js";
import { ScenarioMap } from "./ScenarioMap.js";
import { ProxyMap } from "./ProxyMap.js";

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
      * The default location to place the player when starting a new game.
      * @readonly
	  * @type {ScenarioLocationConfig}
	  */
	 defaultLocation;

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
	 * @type {Map<string, WeatherType>}
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
	 * @type {Map<string, Scenario>}
	 */
	#scenarios;

	/**
	 * @type {ScenarioLocation}
	 */
	#defaultLocation;

	/**
	 * @readonly
	 * @type {Player?}
	 */
	#player;

	/**
	 * @readonly
	 * @type {ScenarioMap?}
	 */
	#map;

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

		this.#weather = new Map();
		if (config.weather) {
			Object.entries(config.weather)
				.forEach(([key, val]) => {
					this.#weather.set(key, new WeatherType(val));
				});
		}

		this.#clock.configure(Parse.required(config.clock, "clock"));

		// Validate the calendar month weather refs against the weather types
		const calendar = this.#clock.calendar;
		for (let m = calendar.numMonths - 1; m >= 0; --m) {
			const month = this.#clock.calendar.getMonth(m);
			for (let weatherTypeRef of month.weather.types) {
				if (!this.#weather.has(weatherTypeRef.type)) {
					throw new Error("No weather type defined with name '" + weatherTypeRef.type + "'");
				}
			}
		}

		this.#hunger.configure(Parse.required(config.hunger, "hunger"));
		this.#thirst.configure(Parse.required(config.thirst, "thirst"));
		this.#fatigue.configure(Parse.required(config.fatigue, "fatigue"));
		this.#digestion.configure(Parse.required(config.digestion, "digestion"));
		this.#warmth.configure(Parse.required(config.warmth, "warmth"));
		this.#encumbrance.configure(Parse.required(config.encumbrance, "encumbrance"));
		this.#inebriation.configure(Parse.required(config.inebriation, "inebriation"));
		this.#itemTypes.configure(Parse.required(config.itemTypes, "itemTypes"));

		this.#scenarios = new Map();
		Object.entries(Parse.required(config.scenarios, "scenarios"))
			.forEach(([key, val]) => {
				this.#scenarios.set(key, new Scenario(val));
			});

		this.#defaultLocation = Parse.prop(config, ["defaultLocation"], null,
            (config) => new ScenarioLocation(config));
	}

	/**
	 * @type {GameStateConfig}
	 */
	get config() {
		const weather = {};
		this.#weather.forEach((val, key) => {
			weather[key] = val.config;
		});

		const scenarios = {};
		this.#scenarios.forEach((val, key) => {
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
			defaultLocation: this.defaultLocation.config
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

	/**
	 * Globally defined teleport destinations.
	 * @type {Map<string, ScenarioLocationConfig>}
	 */
	get teleportDestinations() {
		const destinations = [];
		this.#scenarios.forEach((scenario) => {
			destinations.push(scenario.teleportDestinations);
		});
		return new ProxyMap(...destinations);
	}

	/**
	 * The loaded game scenarios.
	 */
	get scenarios() {
		return this.#scenarios;
	}

	/**
	 * The default location to place the player when starting a new game.
	 */
	get defaultLocation() {
		return this.#defaultLocation;
	}

	/**
	 * The player stats, location, inventory, etc.
	 */
	get player() {
		if (this.#player == null) {
			throw new Error("No player");
		}

		return this.#player;
	}

	async loadPlayer() {
		// TODO: Actually implement loading player details from somewhere (e.g. previously saved game state, etc)
		this.#player = new Player("George", Gender.Male);
	}

	/**
	 * The currently loaded map.
	 */
	get map() {
		if (this.#map == null) {
			throw new Error("No map");
		}

		return this.#map;
	}

	async #loadMap(scenarioName, mapName) {
		const scenario = this.scenarios.get(scenarioName);
		if (scenario == null) {
			throw new Error("Scenario not found: " + scenarioName);
		}

		const mapConfig = scenario.maps.get(mapName);
		if (scenario == null) {
			throw new Error("Map not found in scenario '" + scenarioName + "': " + mapName);
		}

		/** @type {MapReader} */
		let mapReader;
		if (mapConfig.type == "city") {
			mapReader = new CityMapReader();
		} else if (mapConfig.type == "dungeon") {
			mapReader = new DungeonMapReader();
		} else {
			throw new Error("Unsupported map type: " + mapConfig.type);
		}

		return mapReader.readMap(mapConfig, mapConfig["$source"]);
	}

	/**
     * Teleports the player to a new location.
	 *
     * @param {ScenarioLocationConfig|string} parametersOrName configuration parameters or
     *        teleport destination name. If a string is specified, the actual destination is
     *        retrieved from the GameState using the specified identifier.
	 *
	 * @return {PromiseLike<GameState>}
     */
	async loadLocation(parametersOrName) {
        const parameters = ((typeof parametersOrName === "string")
            ? this.teleportDestinations.get(parametersOrName)
            : parametersOrName);

		if (parameters == null) {
			throw new Error("Invalid teleport destination: " + parametersOrName);
		}

		this.#map = await this.#loadMap(parameters.scenario, parameters.map);

        let orientation = this.player.orientation;
        if (parameters.orientation != null) {
            orientation = Parse.orientation(parameters.orientation);
        }

		this.player.map = this.#map;
        this.player.setPosition(parameters.x, parameters.y, orientation);

        // TODO: Trigger 'teleport' event? What context should this be dispatched on? player? map? gamestate?
        //   Player seems most obvious, but 'teleport' is not an intrinsic event.
        console.warn("TODO Trigger 'teleport' event");

		return this;
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