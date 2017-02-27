import { Denizen } from "./Denizen";

/**
 * Class representing a monster or other opponent encountered in the game.
 *
 * Example:
 * The Devourer.
 *   Up to 1 may appear at level 4+
 *   It has 72 base hit points
 *   Base alignment: Neutral
 *   Pointers to code: p2: 0x244 p4: 0 p5: 0xa2 
 *   Picture id: 0
 *   sta: 20  cha: 8  str: 30  int: 0  wis: 22  skl: 60  spd: 50  
 *   Treasure: food: 0  water: 0  torch: 0  timepiece: 0  compass: 0  key: 0  crystal: 0  gems: 0  jewels: 0  gold: 0  silver: 0  copper: 0  
 *   Armor:  blunt: 55  sharp: 55  earth: 33  air: 33  fire: 33  water: 33  power: 33  magic: 33  good: 33  evil: 33  cold: 33   
 * 
 */
export class Opponent
	extends Denizen
{

/*
	animation
	character level before encountering?
	weapons [1 - 4?]
	armor

	encounter {
		level: 1,	// Minimum character level before appearance
		maximum: 1,	// Number that can appear an one time
		timeOfDay: Day | Night,
		weather: Clear | Rain | Invisible,
		sound (if not set, default to alignment-based sound?)
	}
*/

} // Opponent
