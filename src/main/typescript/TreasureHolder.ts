
/**
 * Represents a container or entity that holds the quantity for each type of non-item treasure
 *   in the game: Food, Water, Torch, Timepiece, Compass, Key, Crystal, Gem, Jewel, Gold, Silver,
 *   Copper.
 */
export class TreasureHolder {

/*
TODO: Implement maximums for treasure?
	gold (0-65535)
	silver (0-65535)
	copper (0-65535)
	gems (0-65535)
	jewels (0-65535)
	food packets (0-255)
	water flasks (0-255)
	torches (0-255)
	crystals (0-255)
	keys (0-255)
	compasses (0-255)
	timepieces (0-255)
*/

	/**
	 * @see [[gold]]
	 */
	private _gold: number = 0;

	/**
	 * @see [[silver]]
	 */
	private _silver: number = 0;

	/**
	 * @see [[copper]]
	 */
	private _copper: number = 0;

	/**
	 * @see [[gems]]
	 */
	private _gems: number = 0;

	/**
	 * @see [[jewels]]
	 */
	private _jewels: number = 0;

	/**
	 * @see [[foodPackets]]
	 */
	private _foodPackets: number = 0;

	/**
	 * @see [[waterFlasks]]
	 */
	private _waterFlasks: number = 0;

	/**
	 * @see [[torches]]
	 */
	private _torches: number = 0;

	/**
	 * @see [[crystals]]
	 */
	private _crystals: number = 0;

	/**
	 * @see [[keys]]
	 */
	private _keys: number = 0;

	/**
	 * @see [[compasses]]
	 */
	private _compasses: number = 0;

	/**
	 * @see [[timepieces]]
	 */
	private _timepieces: number = 0;

	constructor(clone?: any) {
		if (clone) {
			this.gold = (clone ? clone.gold : 0);
			this.silver = (clone ? clone.silver : 0);
			this.copper = (clone ? clone.copper : 0);
			this.gems = (clone ? clone.gems : 0);
			this.jewels = (clone ? clone.jewels : 0);
			this.foodPackets = (clone ? clone.foodPackets : 0);
			this.waterFlasks = (clone ? clone.waterFlasks : 0);
			this.torches = (clone ? clone.torches : 0);
			this.crystals = (clone ? clone.crystals : 0);
			this.keys = (clone ? clone.keys : 0);
			this.compasses = (clone ? clone.compasses : 0);
			this.timepieces = (clone ? clone.timepieces : 0);
		}
	} // constructor

	/**
	 * Retrieves the number of gold pieces.
	 * @return	The number of gold pieces.
	 */
	get gold(): number {
		return this._gold;
	} // gold

	/**
	 * Sets the number of gold pieces.
	 * @param	gold	The new number of gold pieces, with a minimum of 0.
	 */
	set gold(gold: number) {
		this._gold = Math.max(0, gold);
	} // gold

	/**
	 * Retrieves the number of silver pieces.
	 * @return	The number of silver pieces.
	 */
	get silver(): number {
		return this._silver;
	} // silver

	/**
	 * Sets the number of silver pieces.
	 * @param	silver	The new number of silver pieces, with a minimum of 0.
	 */
	set silver(silver: number) {
		this._silver = Math.max(0, silver);
	} // silver

	/**
	 * Retrieves the number of copper pieces.
	 * @return	The number of copper pieces.
	 */
	get copper(): number {
		return this._copper;
	} // copper

	/**
	 * Sets the number of copper pieces.
	 * @param	copper	The new number of copper pieces, with a minimum of 0.
	 */
	set copper(copper: number) {
		this._copper = Math.max(0, copper);
	} // copper

	/**
	 * Retrieves the number of gems.
	 * @return	The number of gems.
	 */
	get gems(): number {
		return this._gems;
	} // gems

	/**
	 * Sets the number of gems.
	 * @param	gems	The new number of gems, with a minimum of 0.
	 */
	set gems(gems: number) {
		this._gems = Math.max(0, gems);
	} // gems

	/**
	 * Retrieves the number of jewels.
	 * @return	The number of jewels.
	 */
	get jewels(): number {
		return this._jewels;
	} // jewels

	/**
	 * Sets the number of jewels.
	 * @param	jewels	The new number of jewels, with a minimum of 0.
	 */
	set jewels(jewels: number) {
		this._jewels = Math.max(0, jewels);
	} // jewels

	/**
	 * Retrieves the number of food packets.
	 * @return	The number of food packets.
	 */
	get foodPackets(): number {
		return this._foodPackets;
	} // foodPackets

	/**
	 * Sets the number of food packets.
	 * @param	foodPackets	The new number of food packets, with a minimum of 0.
	 */
	set foodPackets(foodPackets: number) {
		this._foodPackets = Math.max(0, foodPackets);
	} // foodPackets

	/**
	 * Retrieves the number of water flasks.
	 * @return	The number of water flasks.
	 */
	get waterFlasks(): number {
		return this._waterFlasks;
	} // waterFlasks

	/**
	 * Sets the number of water flasks.
	 * @param	waterFlasks	The new number of water flasks, with a minimum of 0.
	 */
	set waterFlasks(waterFlasks: number) {
		this._waterFlasks = Math.max(0, waterFlasks);
	} // waterFlasks

	/**
	 * Retrieves the number of torches.
	 * @return	The number of torches.
	 */
	get torches(): number {
		return this._torches;
	} // torches

	/**
	 * Sets the number of torches.
	 * @param	torches	The new number of torches, with a minimum of 0.
	 */
	set torches(torches: number) {
		this._torches = Math.max(0, torches);
	} // torches

	/**
	 * Retrieves the number of crystals.
	 * @return	The number of crystals.
	 */
	get crystals(): number {
		return this._crystals;
	} // crystals

	/**
	 * Sets the number of crystals.
	 * @param	crystals	The new number of crystals, with a minimum of 0.
	 */
	set crystals(crystals: number) {
		this._crystals = Math.max(0, crystals);
	} // crystals

	/**
	 * Retrieves the number of keys.
	 * @return	The number of keys.
	 */
	get keys(): number {
		return this._keys;
	} // keys

	/**
	 * Sets the number of keys.
	 * @param	keys	The new number of keys, with a minimum of 0.
	 */
	set keys(keys: number) {
		this._keys = Math.max(0, keys);
	} // keys

	/**
	 * Retrieves the number of compasses.
	 * @return	The number of compasses.
	 */
	get compasses(): number {
		return this._compasses;
	} // compasses

	/**
	 * Sets the number of compasses.
	 * @param	compasses	The new number of compasses, with a minimum of 0.
	 */
	set compasses(compasses: number) {
		this._compasses = Math.max(0, compasses);
	} // compasses

	/**
	 * Retrieves the number of timepieces.
	 * @return	The number of timepieces.
	 */
	get timepieces(): number {
		return this._timepieces;
	} // timepieces

	/**
	 * Sets the number of timepieces.
	 * @param	timepieces	The new number of timepieces, with a minimum of 0.
	 */
	set timepieces(timepieces: number) {
		this._timepieces = Math.max(0, timepieces);
	} // timepieces

} // TreasureHolder
