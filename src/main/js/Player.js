
import { EventDispatcher } from "./EventDispatcher.js"
import { ScenarioMap, WallSide, HitData } from "./ScenarioMap.js";
import { Stat } from "./Stat.js"
import { Denizen } from "./Denizen.js"

/**
 * @readonly
 * @enum {number}
 */
export const Gender = Object.freeze({
	/**
	 * (0) A male player
	 * @readonly
	 */
	Male: 0,

	/**
	 * (1) A female player
	 * @readonly
	 */
	Female: 1
}); // Gender

/**
 *
 * @extends {Denizen}
 * @implements {EventDispatcher}
 *
 * Events:
 * @event move - sent when the player's position is updated. Position details for the event are in `data.position`.
 * @event collision - sent when the player attempts to move into a colliding wall
 * @event passage - sent when the player moves through a non-colliding wall
 */
export class Player extends Denizen {

    	/**
	 * @type {Gender}
	 */
	#gender = Gender.Male;

	/**
	 * @type {number}
	 */
	#level = 0;

	/**
	 * @type {number}
	 */
	#requiredExperience = 200;

	/**
	 * @type {number}
	 */
	#experience = 0;

	/**
	 * @type {boolean}
	 */
	#delusion = false;

	/**
	 * @type {number|undefined}
	 */
	#delusionHp;

	/**
	 * @type {number}
	 */
	#hunger = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#hungerRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#fatigue = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#fatigueRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#thirst = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#thirstRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#digestion = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#digestionRate = new Stat(0.5);

    /**
     * The player's horizontal map position.
     * @type {number}
     */
    #x = 0.5;

    /**
     * The player's vertical map position.
     * @type {number}
     */
    #y = 0.5;

    /**
     * The direction the player is facing.
     * @type {number}
     */
    #orientation = 0;

    /**
     * The player's viewpoint position relative to the center of the view.
     * @type {number}
     */
    #height = 0;

    /**
     * @type {EventDispatcher}
     */
    #eventDispatcher;

    /**
     * Creates a new Player instance.
     *
	 * @param {string} name The player name.  Cannot be empty string, defaults to "Player".
	 * @param {Gender} gender The player gender. Defaults to `Gender.Male`.
     */
    constructor(name = 'Player', gender = Gender.Male) {
        super();

        this.#eventDispatcher = new EventDispatcher(this);
        this.on = (type, listener) => this.#eventDispatcher.on(type, listener);
        this.off = (type, listener) => this.#eventDispatcher.off(type, listener);
        this.triggerEvent = (type, data) => this.#eventDispatcher.triggerEvent(type, data);

        this.name = name;
        this.gender = gender;

        this.hp = this.hpMaximum = 10;

        /**
         * Amount of head bob (heaight adjustment) to apply for movement animations.
         * This value is added with the height to provide a final height adjustment when rendering.
         */
        this.headBob = 0;

        /**
         * Modifier to apply to the player's speed.
         * Can be used for effects that modify movement speed like running or sneaking.
         * @type {number}
         */
        this.speedMultiplier = 1;

        /**
         * The player's natural movement speed in map cells/second.
         * @type {number}
         */
        this.movementSpeed = 2;

        /**
         * The player's natural movement speed in radians/second.
         * @type {number}
         */
        this.turnSpeed = Math.PI * 0.5;

        /**
         * The minimum distance between the player and a colliding wall.
         * @type number
         */
        this.minWallDist = 0.1;

        /**
         * The map the player is currently on.
         * @type ScenarioMap?
         */
        this.map = undefined;


		// TODO: Finish remaining player attributes
/*
		//this.treasureFinding: TreasureFinding = new TreasureFinding(0);
		// If you have treasure finding > 0, your chance to find treasure is increased
		// by your treasure finding level, if you find that treasure you will get the
		// maximum number of items possible for that monster, or at least 1 item in
		// the event the maximum possible is 0. Then your treasure finding level drops
		// by one.
		// TODO: Perhaps this should be a list of adjustments with timeouts?  For example, the Treasure Finding spell will
        //   expire and should remove any remaining treasure finding for the spell, but probably shouldn't remove any due to a potion, etc.

		morale/happiness?	// Reference on wikipedia & elsewhere.  Not sure how it's used?
							// Decreases over time & increases when completing jobs, etc?
							// What effects would it have?

		alcohol.bloodConcentration  // Can be cured over time, or by visiting healer
		alcohol.bloodDigestionRate = 3;

		alcohol.intestineConcentration
		alcohol.digestionRate
		alcohol.blackoutDuration // Number of game minutes before end of blackout

		coordination // When affected, bottom status screen randomly changes. (boolean? set by inebriation)
		balance  // When affected, random moves occur. (boolean? set by inebriation)

		warmth/temperature
		protectionFromLowTemperature - This probably doesn't exist in the original game, but could lead to some intersting items/effects
		protectionFromHighTemperature - Affected by clothing worn

		encumbrance: number;	// The player can carry a base weight of 224 units. The
								// encumbrance is defined by the following formula:
								// 	encumbrance = carried weight - (effective strength + 224)

		blindness: number  // affected by inebriation (0 = can see; >0 sight affected (decreased brightness of screen?) [0-255])
		clarity: boolean // affected by Cold/Hot effect
		delusion: boolean // Player is delusional (cure by visiting healer)

		invisibility: boolean // Invisible to all but magical and elemental monsters
			// Nullified/cancelled by rain or removing all of your clothing

		TODO: Need to track whether the player "knows" a particular potion?  Possibly only for potions held, and not for new potions?
		TODO: Need to track item inventory (treasure/potions/spells/etc)
*/
    }

    #triggerMovedEvent() {
        this.triggerEvent('move', {
            position: this.getPosition()
        });
    }

    get effectiveSpeed() {
        return this.movementSpeed * this.speedMultiplier;
    }

    get effectiveTurnSpeed() {
        return this.turnSpeed * this.speedMultiplier;
    }

    /**
     * @fires moved when updated
     */
    set x(value) {
        if (value != this.#x) {
            this.#x = value;
            this.#triggerMovedEvent();
        }
    }

    /**
     * The player's current map x position.
     */
    get x() {
        return this.#x;
    }

    /**
     * @fires moved when updated
     */
    set y(value) {
        if (value != this.#y) {
            this.#y = value;
            this.#triggerMovedEvent();
        }
    }

    /**
     * The player's current map x position.
     */
    get y() {
        return this.#y;
    }

    /**
     * @fires moved when updated
     */
    set height(height) {
        if (height != this.#height) {
            this.#height = height;
            this.#triggerMovedEvent();
        }
    }

    get height() {
        return this.#height;
    }

    /**
     * @fires moved when updated
     */
    set orientation(angle) {
        angle = this.#normalizeAngle(angle);
        if (angle !== this.#orientation) {
            this.#orientation = angle;
            this.#triggerMovedEvent();
        }
    }

    /**
     * The direction the player is facing.
     */
    get orientation() {
        return this.#orientation;
    }

    /**
     * Determines whether a wall should be considered a hit for collision checking or not.
     * @param {HitData} hitData the details of the potential collision.
     */
    #isHit(hitData) {
        if (hitData.wallStyle.isCollision(hitData.wallPosition)) {
            // Stop for walls with collision
            return true;
        }
        // Include other walls for passage events
        return null;
    }

    #compose(fn1, fn2) {
        return () => { fn1(); fn2() };
    }

    /**
     * Checks whether the player will collide with a wall if moved from the current position
     * to the provided position.
     *
     * @param {number} toX the new x position
     * @param {number} toY the new y position
     *
     * @returns {[number, number, () => void]} the adjusted location in the direction of travel and
     *          an optional callback to invoke after the position properties are updated (for triggering
     *          appropriate collision and passage events).
     */
    #checkCollision(toX, toY) {
        let x = toX;
        let y = toY;
        let eventCallback = () => null;
        let collision = false;
        let hitData = {};

        const dx = x - this.#x;
        const dy = y - this.#y;

        const movementDistance = Math.hypot(dx, dy);
        const maxCastDistance = movementDistance + this.minWallDist * 2;
        const movementAngle = Math.atan2(dy, dx);

        const hits = this.map.castRayAtAngle(this.#x, this.#y, movementAngle, maxCastDistance, this.#isHit);

        for (let hit of hits) {
            if (hit.isHit === false) {
                // No collision possible
                continue;
            }

            // Constrain potential hit position to the cell to avoid ambiguity on boundaries
            let tx = hit.endX;
            if (tx - hit.cellX >= 1) {
                tx = hit.cellX + 0.999999;
            }
            let ty = hit.endY;
            if (ty - hit.cellY >= 1) {
                ty = hit.cellY + 0.999999;
            }
            const td = Math.hypot(tx - this.#x, ty - this.#y);

            let potentialCollision = (hit.isHit === true);
            if (!potentialCollision && (td < movementDistance)) {
                const hd = {
                    cell: hit.cell,
                    cellX: hit.cellX,
                    cellY: hit.cellY,
                    wallStyle: hit.wallStyle,
                    wallType: hit.wallType,
                    wallPosition: hit.wallPosition,
                    side: hit.side
                };
                eventCallback = this.#compose(eventCallback, () => {
                    this.#processWallStyleActions(hd, "passage");
                    this.triggerEvent('passage', {
                        position: {
                            x: hit.endX,
                            y: hit.endY,
                            height: this.#height,
                            orientation: this.#orientation
                        },
                        hit: hd
                    });
                });
            }

            if (potentialCollision && (td < movementDistance)) {
                x = tx;
                y = ty;
                collision = true;

                hitData.cell = hit.cell;
                hitData.cellX = hit.cellX;
                hitData.cellY = hit.cellY;
                hitData.wallStyle = hit.wallStyle;
                hitData.wallType = hit.wallType;
                hitData.wallPosition = hit.wallPosition;
                hitData.side = hit.side;

                break;
            }
        }

        // Check edges of current cell
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        const cell = this.map.getCell(cellX, cellY);

        if (cell) {
            const xDelta = x - cellX;
            const yDelta = y - cellY;
            if ((xDelta < this.minWallDist) && cell.westWall) {
                hitData = {
                    cell,
                    cellX,
                    cellY,
                    wallStyle: this.map.getWallStyle(cell.westWall),
                    wallType: cell.westWall,
                    wallPosition: yDelta,
                    side: WallSide.WEST
                };

                if (collision || this.#isHit(hitData)) {
                    x = cellX + this.minWallDist;
                    collision = true;
                }
            } else if ((xDelta > 1 - this.minWallDist) && cell.eastWall) {
                hitData = {
                    cell,
                    cellX,
                    cellY,
                    wallStyle: this.map.getWallStyle(cell.eastWall),
                    wallType: cell.eastWall,
                    wallPosition: yDelta,
                    side: WallSide.EAST
                };

                if (collision || this.#isHit(hitData)) {
                    x = cellX + 1 - this.minWallDist;
                    collision = true;
                }
            }

            if ((yDelta < this.minWallDist) && cell.northWall) {
                hitData = {
                    cell,
                    cellX,
                    cellY,
                    wallStyle: this.map.getWallStyle(cell.northWall),
                    wallType: cell.northWall,
                    wallPosition: xDelta,
                    side: WallSide.NORTH
                };

                if (collision || this.#isHit(hitData)) {
                    y = cellY + this.minWallDist;
                    collision = true;
                }
            } else if ((yDelta > 1 - this.minWallDist) && cell.southWall) {
                hitData = {
                    cell,
                    cellX,
                    cellY,
                    wallStyle: this.map.getWallStyle(cell.southWall),
                    wallType: cell.southWall,
                    wallPosition: xDelta,
                    side: WallSide.SOUTH
                };

                if (collision || this.#isHit(hitData)) {
                    y = cellY + 1 - this.minWallDist;
                    collision = true;
                }
            }
        }

        // TODO: This can be removed at some point.
        const actualMoveDistance = Math.hypot(x - this.#x, y - this.#y);
        if (actualMoveDistance > movementDistance) {
            console.warn("Expected to move ", movementDistance, " but moved ", actualMoveDistance,
                " instead (", actualMoveDistance - movementDistance, " further than expected). Original from [",
            this.#x, ",", this.#y, "] to [", toX, ",", toY, "]. Adjusted from [", this.#x, ",", this.#y, "] to [", x, ",", y, "]");
        }

        if (collision) {
            eventCallback = this.#compose(eventCallback, () => {
                this.#processWallStyleActions(hitData, "collision");
                this.triggerEvent('collision', {
                    position: {
                        x: x,
                        y: y,
                        height: this.#height,
                        orientation: this.#orientation
                    },
                    hit: hitData
                });
            });
        }

        return [ x, y, eventCallback ];
    }

    /**
     *
     * @param {HitData} hitData
     * @param {string} eventType
     * */
    #processWallStyleActions(hitData, eventType) {
        const actions = hitData.wallStyle.on.get(eventType);
        if (actions) {
            console.log("processWallStyleActions: " + eventType, actions);
            for (let action of actions) {
                action(hitData);
            }
        }
    }

    /**
     * Moves the player by the specified amounts.
     * @param {number} deltaX amount to move the player horizontally
     * @param {number} deltaY amount to move the player vertically
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    move(deltaX, deltaY, ignoreCollision = false) {
        let [ x, y, eventCallback ] = (ignoreCollision
            ? [ this.#x + deltaX, this.#y + deltaY, () => {} ]
            : this.#checkCollision(this.#x + deltaX, this.#y + deltaY));

        let moved = false;

        if (x != this.#x) {
            this.#x = x;
            moved = true;
        }

        if (y != this.#y) {
            this.#y = y;
            moved = true;
        }

        if (moved) {
            this.#triggerMovedEvent();
            eventCallback();
        }
    }

    /**
     * Moves the player in a specified direction.
     * @param {number} angle the angle representing the direction of movment
     * @param {number=} distance the distance to move. If not specified, the player will be
     *        moved based on the standard movement speed.
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    moveAtAngle(angle, distance, ignoreCollision = false) {
        if (distance === undefined) {
            distance = this.movementSpeed * this.speedMultiplier;
        }
        this.move(Math.cos(angle) * distance, Math.sin(angle) * distance, ignoreCollision);
    }

    /**
     * Moves the player forward by the specified distance.
     * @param {number|undefined} distance the distance to move. If not specified, the player will be
     *        moved based on the standard movement speed.
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    moveForward(distance, ignoreCollision = false) {
        this.moveAtAngle(this.#orientation, distance, ignoreCollision);
    }

    /**
     * Moves the player backward by the specified distance.
     * @param {number|undefined} distance the distance to move. If not specified, the player will be
     *        moved based on the standard movement speed.
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    moveBackward(distance, ignoreCollision = false) {
        this.moveAtAngle(this.#orientation, -distance, ignoreCollision);
    }

    /**
     * Moves the player horizontally to the player's left by the specified distance.
     * @param {number|undefined} distance the distance to move. If not specified, the player will be
     *        moved based on the standard movement speed.
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    strafeLeft(distance, ignoreCollision = false) {
        this.moveAtAngle(this.#orientation - Math.PI / 2, distance, ignoreCollision);
    }

    /**
     * Moves the player horizontally to the player's right by the specified distance.
     * @param {number|undefined} distance the distance to move. If not specified, the player will be
     *        moved based on the standard movement speed.
     * @param {boolean=} ignoreCollision whether to ignore wall collision or not (default false)
     *
     * @fires passage if `ignoreCollision` is false and the player passes through a non-colliding wall.
     * @fires collision if `ignoreCollision` is false and the player collides with a solid wall.
     * @fires move
     */
    strafeRight(distance, ignoreCollision) {
        this.moveAtAngle(this.#orientation + Math.PI / 2, distance, ignoreCollision);
    }

    /**
     * Rotate the player by the specified amount.
     * @param {number} angle the amount to rotate the player by.
     * @fires move
     */
    rotate(angle) {
        this.orientation += angle;
    }

    #normalizeAngle(angle) {
        const twoPi = Math.PI * 2;
        angle = angle % twoPi;
        if (angle >= Math.PI) {
            angle -= twoPi;
        } else if (angle <= -Math.PI) {
            angle += twoPi;
        }
        return angle;
    }

    /**
     * Turn the player to the left by the specified amount.
     * @param {number} angle the amount to rotate the player by. If not specified, the player will be
     *        rotated based on the standard turn speed.
     * @fires move
     */
    turnLeft(angle) {
        if (angle === undefined) {
            angle = this.turnSpeed * this.speedMultiplier;
        }
        this.rotate(-angle);
    }

    /**
     * Turn the player to the right by the specified amount.
     * @param {number} angle the amount to rotate the player by. If not specified, the player will be
     *        rotated based on the standard turn speed.
     * @fires move
     */
    turnRight(angle) {
        if (angle === undefined) {
            angle = this.turnSpeed * this.speedMultiplier;
        }
        this.rotate(angle);
    }

    /**
     * Sets the player's position.
     *
     * This method does not check for wall collisions or trigger any collision or passage events.
     *
     * @param {number} x the new horizontal map position for the player
     * @param {number} y the new vertical map position for the player
     * @param {number=} orientation the new orientation for the player
     * @param {number=} height the new height for the player
     */
    setPosition(x, y, orientation, height) {
        let moved = false;
        if (x != this.#x) {
            this.#x = x;
            moved = true;
        }
        if (y != this.#y) {
            this.#y = y;
            moved = true;
        }

        if (orientation != null) {
            orientation = this.#normalizeAngle(orientation)
            if (orientation != this.#orientation) {
                this.#orientation = orientation;
                moved = true;
            }
        }

        if (height != null && height != this.#height) {
            this.#height = height;
            moved = true;
        }

        if (moved) {
            this.#triggerMovedEvent();
        }
    }

    getPosition() {
        return {
            x: this.#x,
            y: this.#y,
            height: this.#height,
            orientation: this.#orientation
        };
    }

    /**
	 * The player's gender.
	 */
	get gender() {
		return this.#gender;
	} // gender

	/**
	 * Sets the player's gender.
	 * @param {Gender} gender The new gender for the player.
	 */
	set gender(gender) {
		this.#gender = gender;
	} // gender

	/**
	 * The player's current level.
	 */
	get level() {
		return this.#level;
	} // level

	/**
	 * The amount of experience required for the player to reach to the next level.
	 */
	get requiredExperience() {
		return this.#requiredExperience;
	} // requiredExperience

	/**
	 * The player's experience.
	 */
	get experience() {
		return this.#experience;
	} // experience

	/**
	 * Adds to the player's experience.
	 * @param {number} experienceGain The amount of experience to add.  Values of 0 or less will be ignored.
	 */
	addExperience(experienceGain) {
		if (experienceGain > 0) {
			this.#experience += experienceGain;
			this.#checkLevelUp();
			// TODO: Should an event be dispatched to notify of any level change, or should the method return something to indicate a level change occurred?
		}
	} // addExperience

	/**
	 * Processes any pending level up actions, if any.
	 */
	#checkLevelUp() {
		while (this.#experience >= this.#requiredExperience) {
			this.#requiredExperience *= 2;
			++this.#level;

			// HP & Max HP both increase based on effective stamina (note bonus & penalty included!)
			const hpIncrease = Math.round(Math.random() * this.stamina.effective);
			this.hpMaximum += hpIncrease;
			this.hp += hpIncrease;

			this.#increaseStatForLevelUp(this.stamina);
			this.#increaseStatForLevelUp(this.charisma);
			this.#increaseStatForLevelUp(this.strength);
			this.#increaseStatForLevelUp(this.intelligence);
			this.#increaseStatForLevelUp(this.wisdom);
			this.#increaseStatForLevelUp(this.skill);
			this.#increaseStatForLevelUp(this.speed);

			// TODO: Should an event be dispatched to notify of the level change, or should the method return something to indicate a level change occurred?
		}
	} // checkLevelUp

	/**
	 * Increases the specified stat for a level up.
	 *
	 * The stat increase is computed as:
	 * ```typescript
	 * base += 0.5 + 0.5 * Math.random() * (MAX_STAT_VALUE - base) / MAX_STAT_VALUE;
	 * ```
	 *
	 * Therefore, the higher the base stat value is, the lower the amount that may awarded.
	 *
	 * @param {Stat} stat the stat to level up.
	 */
	#increaseStatForLevelUp(stat) {
		stat.base += 0.5 + 0.5 * Math.random() * (Stat.MAX_VALUE - stat.base) / Stat.MAX_VALUE;
	} // increaseStatForLevelUp

	/**
	 * Whether the player is delusional or not.
	 */
	get delusion() {
		return this.#delusion;
	}

	set delusion(value) {
		this.#delusion = value;
	}

	/**
	 * The HP displayed when the player is delusional.
	 */
	get delusionHp() {
		return this.#delusionHp;
	}

	set delusionHp(value) {
		if (typeof value === "number")
			this.#delusionHp = Math.max(value, 0);
		else
			this.#delusionHp = undefined;
	}

	/**
	 * The current hunger level for the player.
	 */
	get hunger() {
		return this.#hunger;
	}

	set hunger(value) {
		if (Number.isNaN(value)) {
			throw new Error("hunger must be a valid number");
		}

		this.#hunger = Math.max(0, value);
	}

	/**
	 * The amount by which the player's hunger increases for each hunger interval.
	 */
	get hungerRate() {
		return this.#hungerRate;
	}

	/**
	 * The current fatigue level for the player.
	 */
	get fatigue() {
		return this.#fatigue;
	}

	set fatigue(value) {
		if (Number.isNaN(value)) {
			throw new Error("fatigue must be a valid number");
		}

		this.#fatigue = Math.max(0, value);
	}

	/**
	 * The amount by which the player's fatigue increases for each fatigue interval.
	 */
	get fatigueRate() {
		return this.#fatigueRate;
	}

	/**
	 * The current thirst level for the player.
	 */
	get thirst() {
		return this.#thirst;
	}

	set thirst(value) {
		if (Number.isNaN(value)) {
			throw new Error("thirst must be a valid number");
		}

		this.#thirst = Math.max(0, value);
	}

	/**
	 * The amount by which the player's thirst increases for each thirst interval.
	 */
	get thirstRate() {
		return this.#thirstRate;
	}

	/**
	 * The current digestion level for the player.
	 */
	get digestion() {
		return this.#digestion;
	}

	set digestion(value) {
		if (Number.isNaN(value))
			throw new Error("digestion must be a valid number");

		this.#digestion = Math.max(0, value);
	}

	/**
	 * The amount by which the player's digestion increases for each digestion interval.
	 */
	get digestionRate() {
		return this.#digestionRate;
	}

}
