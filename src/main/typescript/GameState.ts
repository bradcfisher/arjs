import { Character } from "./Character"
import { GameTime } from "./GameTime"
import { Calendar } from "./Calendar"

export class GameState {

	/**
	 * @see [[time]]
	 */
	private _time: GameTime;

	/**
	 * @see [[character]]
	 */
	private _character: Character;

	/**
	 * Constructs a new GameState instance.
	 *
	 * @parame	config	
	 */
	constructor(config: Object) {
//		this._time = new GameTime(Parse.getProp(config, null, "time"));
/*
		new Calendar([
			// TODO: Need month configs here...
		]));
*/
	} // constructor

	/**
	 * Retrieves the current in-game time.
	 * @return 	The current in-game time.
	 */
	get time(): GameTime {
		return this._time;
	} // time

	get character(): Character {
		return this._character;
	} // character

	// weather type definitions (no save)
	// monsters (no save)
	// maps
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

} // GameState