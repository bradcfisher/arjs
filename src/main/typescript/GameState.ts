import { Parse } from "./Parse"
import { Character } from "./Character"
import { GameClock, GameClockConfig } from "./GameClock"
import { OptionsConfig, RecurringOptionsConfig, Options, RecurringOptions, TemperatureOptionsConfig, TemperatureOptions } from "./ConfigOptions"
import { ItemTypeConfig } from "./ItemType";
import { ItemTypes } from "./ItemTypes";
import { ResourceManager } from "./ResourceManager";
import { Configurable } from "./Configurable";
import { ClassRegistry, Serializer, Deserializer, ClassEntry, SerializedData } from "./Serializer";


export interface GameStateConfig {
	readonly title: string;
	//readonly weather?: WeatherConfig;
	readonly clock: GameClockConfig;

	readonly hunger?: RecurringOptionsConfig;
	readonly thirst?: RecurringOptionsConfig;
	readonly fatigue?: RecurringOptionsConfig;
	readonly digestion?: RecurringOptionsConfig;
	readonly warmth?: TemperatureOptionsConfig;
	readonly encumbrance?: OptionsConfig;
	//readonly inebriation?: InebriationConfig;

	readonly itemTypes?: ReadonlyArray<ItemTypeConfig>;
	//readonly scenarios: ScenarioConfig[];
	//readonly defaultScenario: string;
}


/**
 * The singleton GameState instance.
 */
let instance: GameState;
let loading: boolean = false;
let loadingConfig: string|GameStateConfig|undefined;
let loadingPromise: Promise<GameState>|undefined;

let resourceManager: ResourceManager = new ResourceManager();


export class GameState
	implements Configurable<GameStateConfig>
{

	private _title: string = "<Untitled>";

	//private _weather: Weather;

	/**
	 * @see [[clock]]
	 */
	private _clock: GameClock = new GameClock();

	private readonly _hunger: RecurringOptions = new RecurringOptions();

	private readonly _thirst: RecurringOptions = new RecurringOptions();

	private readonly _fatigue: RecurringOptions = new RecurringOptions();

	private readonly _digestion: RecurringOptions = new RecurringOptions();

	private readonly _warmth: TemperatureOptions = new TemperatureOptions();

	private readonly _encumbrance: Options = new Options();

	private readonly _itemTypes: ItemTypes = new ItemTypes();

	/**
	 * @see [[character]]
	 */
	private _character?: Character;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_GameState: void = (() => {
		ClassRegistry.registerClass(
			"GameState", GameState,
			(obj: GameState, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: GameState, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as GameStateConfig);
			},
			(classEntry: ClassEntry, data: SerializedData, deserializer: Deserializer): GameState => {
				return GameState.getInstance();
			}
		);
	})();

	/**
	 * Loads a configuration into the GameState singleton, intializing the instance.
	 *
	 * @param config the configuration to apply to the GameState.
	 * @return a Promise that resolves to the GameState singleton populated with
	 * 		the specified configuration on success.
	 */
	static load(config: GameStateConfig|string): Promise<GameState> {
		let rv: Promise<GameState>;

		if (loading) {
			if (config != loadingConfig)
				throw new Error("Already loading a different config");

			if (loadingPromise == null)
				throw new Error("loading set, but no promise? shouldn't happen");

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
				loadingPromise = rv = new Promise<GameState>((resolve, reject): void => {
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
	static getInstance(): GameState {
		if (instance == null) {
			throw new Error("GameState not loaded");
		}
		return instance;
	}

	/**
	 * Retrieves the ResourceManager used by the GameState for loading assets.
	 */
	static getResourceManager(): ResourceManager {
		return resourceManager;
	}

	/**
	 * Constructs a new GameState instance.
	 *
	 * @parame	config
	 */
	private constructor(config: GameStateConfig) {
		this.configure(config);
	}

	configure(config: GameStateConfig) {
		this.title = Parse.str(config.title, "<Untitled>");
		//this._weather = new Weather(config.weather);
		this._clock.configure(Parse.required(config.clock, "clock"));

		// TODO: Validate the weather types against the calendar month weather refs

		this._hunger.configure(Parse.required(config.hunger, "hunger"));
		this._thirst.configure(Parse.required(config.thirst, "thirst"));
		this._fatigue.configure(Parse.required(config.fatigue, "fatigue"));
		this._digestion.configure(Parse.required(config.digestion, "digestion"));
		this._warmth.configure(Parse.required(config.warmth, "warmth"));
		this._encumbrance.configure(Parse.required(config.encumbrance, "encumbrance"));
		//this._inebriation.configure(Parse.required(config.inebriation, "inebriation"));

		this._itemTypes.configure(Parse.required(config.itemTypes, "itemTypes"));

		/*
		"scenarios"
		*/
	}

	get config(): GameStateConfig {
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
	get title(): string {
		return this._title;
	}

	set title(value: string) {
		this._title = value;
	}

	/**
	 * The current in-game clock.
	 */
	get clock(): GameClock {
		return this._clock;
	}

	get hunger(): RecurringOptions {
		return this._hunger;
	}

	get thirst(): RecurringOptions {
		return this._thirst;
	}

	get fatigue(): RecurringOptions {
		return this._fatigue;
	}

	get digestion(): RecurringOptions {
		return this._digestion;
	}

	get warmth(): Options {
		return this._warmth;
	}

	get encumbrance(): Options {
		return this._encumbrance;
	}

	get itemTypes(): ItemTypes {
		return this._itemTypes;
	}

	get character(): Character {
		if (this._character == null)
			throw new Error("No character");

		return this._character;
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