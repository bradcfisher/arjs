
import { Protection } from "./Protection";

/**
 * Class containing values for all of the protections defined in the game.
 * Blunt, Sharp, Earth, Air, Fire, Water, Power, Mental/Magic, Good/Cleric, Evil, Cold
 */
export class Protections {

	/**
	 * @see [[blunt]]
	 */
	private _blunt: Protection;

	/**
	 * @see [[sharp]]
	 */
	private _sharp: Protection;

	/**
	 * @see [[earth]]
	 */
	private _earth: Protection;

	/**
	 * @see [[air]]
	 */
	private _air: Protection;

	/**
	 * @see [[fire]]
	 */
	private _fire: Protection;

	/**
	 * @see [[water]]
	 */
	private _water: Protection;

	/**
	 * @see [[power]]
	 */
	private _power: Protection;

	/**
	 * @see [[magic]]
	 */
	private _magic: Protection;

	/**
	 * @see [[good]]
	 */
	private _good: Protection;

	/**
	 * @see [[evil]]
	 */
	private _evil: Protection;

	/**
	 * @see [[cold]]
	 */
	private _cold: Protection;

	/**
	 * Constructs a new Protections instance.
	 */
	constructor(config?: any) {
		this._blunt = new Protection(config ? config.blunt : null);
		this._sharp = new Protection(config ? config.sharp : null);
		this._earth = new Protection(config ? config.earth : null);
		this._air = new Protection(config ? config.air : null);
		this._fire = new Protection(config ? config.fire : null);
		this._water = new Protection(config ? config.water : null);
		this._power = new Protection(config ? config.power : null);
		this._magic = new Protection(config ? config.magic : null);
		this._good = new Protection(config ? config.good : null);
		this._evil = new Protection(config ? config.evil : null);
		this._cold = new Protection(config ? config.cold : null);
	} // constructor

	/**
	 * Retrieves the protection against 'blunt' damage.
	 * @return	The protection against 'blunt' damage.
	 */
	get blunt(): Protection {
		return this._blunt;
	} // blunt

	/**
	 * Retrieves the protection against 'sharp' damage.
	 * @return	The protection against 'sharp' damage.
	 */
	get sharp(): Protection {
		return this._sharp;
	} // sharp

	/**
	 * Retrieves the protection against 'earth' damage.
	 * @return	The protection against 'earth' damage.
	 */
	get earth(): Protection {
		return this._earth;
	} // earth

	/**
	 * Retrieves the protection against 'air' damage.
	 * @return	The protection against 'air' damage.
	 */
	get air(): Protection {
		return this._air;
	} // air

	/**
	 * Retrieves the protection against 'fire' damage.
	 * @return	The protection against 'fire' damage.
	 */
	get fire(): Protection {
		return this._fire;
	} // fire

	/**
	 * Retrieves the protection against 'water' damage.
	 * @return	The protection against 'water' damage.
	 */
	get water(): Protection {
		return this._water;
	} // water

	/**
	 * Retrieves the protection against 'power' damage.
	 * @return	The protection against 'power' damage.
	 */
	get power(): Protection {
		return this._power;
	} // power

	/**
	 * Retrieves the protection against 'magic' damage.
	 * @return	The protection against 'magic' damage.
	 */
	get magic(): Protection {
		return this._magic;
	} // magic

	/**
	 * Retrieves the protection against 'good' damage.
	 * @return	The protection against 'good' damage.
	 */
	get good(): Protection {
		return this._good;
	} // good

	/**
	 * Retrieves the protection against 'evil' damage.
	 * @return	The protection against 'evil' damage.
	 */
	get evil(): Protection {
		return this._evil;
	} // evil

	/**
	 * Retrieves the protection against 'cold' damage.
	 * @return	The protection against 'cold' damage.
	 */
	get cold(): Protection {
		return this._cold;
	} // cold

} // Protections
