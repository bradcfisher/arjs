import { Character } from "./Character"
import { GameTime } from "./GameTime"
import { Calendar } from "./Calendar"

export class GameState {

	/**
	 * @see [[time]]
	 */
	private _time: GameTime;

	/**
	 * Constructs a new GameState instance.
	 *
	 * @parame	config	
	 */
	constructor(config: Object) {
		this._time = new GameTime(new Calendar([
			// TODO: Need month configs here...
		]));
	} // constructor

	/**
	 * Retrieves the current in-game time.
	 * @return 	The current in-game time.
	 */
	get time(): GameTime {
		return this._time;
	} // time

	// character data
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