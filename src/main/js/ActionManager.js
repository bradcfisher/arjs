
import { AudioClip } from "./AudioClip.js"
import { GameState } from "./GameState.js";
import { Parse } from "./Parse.js";
import { HitData, WallSide } from "./ScenarioMap.js";

/**
 * Callback which executes an action or computation.
 *
 * @callback ActionCallback
 * @param {{[name:string]: any}?} parameters map of parameter values
 * @return {any} the result of the action (if any)
 */

export function ActionCallbackConstructor() {}


/**
 * @interface
 */
export class PlaySoundParameters {
    /**
     * The clip name or AudioClip of the sound resource to play.
     * If the value contains a hash (#) character, it will be treated as a URL
     * and resolved relative to the source file.
     * @type {string|AudioClip}
     */
    clip;
}

/**
 * @interface
 */
export class DoorActionParameters {

    /**
     * Data describing the map location and door the player is interacting with.
     * @type {HitData}
     */
    hitData;

    /**
     * Interaction event actions.
     * @type {{[type:string]: {
     *         key: ActionCallback[],
     *         force: ActionCallback[],
     *         disenchant: ActionCallback[],
     *         success: ActionCallback[],
     *         identified: ActionCallback[]
     *       }}}
     */
    on;

}

/**
 * @iterface
 */
export class PatchDoorConfig {
    /**
     * Data describing the map location and door to patch.
     * @type {HitData}
     */
    hitData;

    /**
     * The new wall type to replace the door with.
     * @type {string}
     */
    wallType;
}

/**
 * @interface
 */
export class TeleportActionParameters {
    /**
     * The map to teleport to. If omitted the player will teleport within the current map.
     * @type {string?}
     */
    map;

    /**
     * The new X position for the player.
     * @type {number}
     */
    x;

    /**
     * The new y position for the player.
     * @type {number}
     */
    y;

    /**
     * The new orientation for the player. If omitted, the player orientation remains unchanged.
     * @type {number?}
     */
    orientation;
}


export class CoreAction {

    /**
     * Plays a sound resource
     * @param {PlaySoundParameters} parameters configuration specifying the resource to play.
     */
    static playSound(parameters) {
        const clip = GameState.getAudioManager().prepare(parameters.clip);
        if (clip) {
            clip.play();
        } else {
            console.warn("Clip not registered with AudioManager: " + parameters.clip);
        }
    }

    /**
     * Triggers a player interaction to interact with a locked door.
     *
     * @param {DoorActionParameters} parameters configuration parameters
     */
    static checkLockedDoorCollision(parameters) {
        // trigger interaction when attempting to pass through a locked door
        // the player can examine/try a key/try to force/try to disenchant the door
        console.warn("TODO Interact with locked door");
    }

    /**
     * Triggers a player interaction to interact with a barred door.
     *
     * @param {DoorActionParameters} parameters configuration parameters
     */
    static checkBoltedDoorCollision(parameters) {
        // trigger interaction when attempting to pass through a bolted door
        // the player can examine/try a key/try to force/try to disenchant the door
        console.warn("TODO Interact with locked door");
    }

    /**
     * Triggers a player interaction to interact with an enchanted door.
     *
     * @param {DoorActionParameters} parameters configuration parameters
     */
    static checkEnchantedDoorCollision(parameters) {
        // trigger interaction when attempting to pass through an enchanted door
        // the player can examine/try a key/try to force/try to disenchant the door
        console.warn("TODO Interact with locked door");
    }

    /**
     * Applies a map patch to a door to change it to a different wall type.
     *
     * This is typically used to make locked/barred/enchanted doors permanently visible
     * or to permanently unobstruct a locked/barred/enchanted door.
     *
     * @param {PatchDoorConfig} parameters door patching parameters
     */
    static patchDoor(parameters) {
        const patchConfig = {
            x: parameters.cellX,
            y: parameters.cellY
        };

        switch (parameters.side) {
            case WallSide.NORTH:
                patchConfig.northWall = parameters.wallType;
                break;
            case WallSide.SOUTH:
                patchConfig.southWall = parameters.wallType;
                break;
            case WallSide.EAST:
                patchConfig.eastWall = parameters.wallType;
                break;
            case WallSide.WEST:
                patchConfig.westWall = parameters.wallType;
                break;
        }

        CoreAction.patchCell(patchConfig);
    }

    static patchCell(parameters) {
        // x, y (or omit to use current player pos)
        // cell options to apply

        const cell = GameState.getInstance().map.getCell(parameters.x, parameters.y);

        // TODO: Apply the patch to the map cell
        console.warn("TODO Apply patch to map cell");

        // TODO: Apply the patch to the player's patch store so it can be saved and reapplied on a reload.
        console.warn("TODO Apply patch to player save state");

    }

    /**
     * Teleports the player to a new location.
     * @param {TeleportActionParameters} parameters configuration parameters
     */
    static teleport(parameters) {
        // TODO: Load the map...

        GameState.getInstance().player.setPosition(parameters.x, parameters.y, parameters.orientation);

        // TODO: Trigger 'teleport' event? What context should this be dispatched on? player? map? gamestate?
        //   Player seems most obvious, but 'teleport' is not an intrinsic event.
        console.warn("TODO Trigger 'teleport' event");
    }

}


export class ActionManager {

    /**
     * @type {Map<string,ActionCallback>}
     */
    #registeredActions = new Map();

    constructor() {
        this.register("core:playSound", CoreAction.playSound, undefined, (parameters) => {
                // If the clip name contains a hash, then resolve it as a URL
                const clip = String(parameters.clip);
                if (clip.indexOf("#") >= 0) {
                    parameters.clip = Parse.url(parameters.clip);
                    console.log("playSound: resolve parameters: ", parameters);
                }
            })
            .register("core:checkLockedDoorCollision", CoreAction.checkLockedDoorCollision)
            .register("core:checkBoltedDoorCollision", CoreAction.checkBoltedDoorCollision)
            .register("core:checkEnchantedDoorCollision", CoreAction.checkEnchantedDoorCollision)
            .register("core:patchDoor", CoreAction.patchDoor)
            .register("core:patchCell", CoreAction.patchCell)
            .register("core:teleport", CoreAction.teleport);
    }

    /**
     * Registers an action for later execution.
     *
     * @param {string} name name to register the callback under. Each registered action must have a uniaue name.
     * @param {ActionCallback} actionCallback the callback to register.
     * @param {{[name:string]: any}?} defaultParameters default parameters to provide to the callback when it's invoked.
     * @param {({[name:string]: any}) => void} parameterResolver function invoked with the action parameters
     *        before the action itself. This function can perform validation or augment the data
     *        such as by resolving resources from URLs, etc.
     *
     * @return {this}
     *
     * @throws {Error} if an action with the specified name already exists.
     */
    register(name, actionCallback, defaultParameters, parameterResolver) {
        if (this.#registeredActions.has(name)) {
            throw new Error("An action named '" + name + "' is already defined. Each registered action must have a unique name.");
        }

        if (actionCallback == null) {
            throw new Error("An ActionCallback must be provided");
        }

        if (actionCallback.constructor !== ActionCallbackConstructor) {
            // If the function provided does not have the ActionCallbackConstructor, then
            // assume it's being registered as a pre-defined action and mock it up to look like a
            // RegisteredAction reference.
            actionCallback.constructor = ActionCallbackConstructor;
            actionCallback.actionConfig = {
                action: name
            };
            if (defaultParameters != null) {
                actionCallback.actionConfig.parameters = defaultParameters;
            }
        }

        if (parameterResolver && (defaultParameters != null)) {
            parameterResolver(defaultParameters);
        }

        this.#registeredActions.set(name, [this.bindDefaultParameters(actionCallback, defaultParameters), parameterResolver]);

        return this;
    }

    /**
     * Given an ActionCallback, creates a new callback which applies the specified default parameters.
     *
     * @param {ActionCallback} actionCallback the callback to bind default parameters to.
     * @param {{[name:string]:any}?} defaultParameters the default parameters to bind. These parameters
     *        will override any previously defined defaults with the same names, but will be overridden
     *        by any parameters of the same name provided when the action is invoked.
     * @returns {ActionCallback} an callback with the specified default parameter values bound.
     */
    bindDefaultParameters(actionCallback, defaultParameters) {
        if (defaultParameters == null) {
            return actionCallback;
        }

        const boundCallback = (parameters) => {
            const params = {};
            Object.assign(params, defaultParameters);

            if (parameters != null) {
                Object.assign(params, parameters);
            }

            actionCallback(params);
        };

        boundCallback.actionConfig = actionCallback.actionConfig;
        boundCallback.constructor = actionCallback.constructor;

        return boundCallback;
    }

    /**
     * Retrieves the action with the specified name.
     *
     * @param {string} name the name of the action to retrieve.
     * @param {{[name:string]:any}?} defaultParameters if provided, specifies default parameter bindings.
     *        These parameters will override any previously defined defaults with the same names, but will
     *        be overridden by any parameters of the same name provided when the action is invoked.
     *
     * @returns {ActionCallback?} the previously registered callback or null if no callback has
     *          been registered with the name provided.
     */
    get(name, defaultParameters) {
        const [ action, parameterResolver ] = this.#registeredActions.get(name);

        if (parameterResolver && (defaultParameters != null)) {
            parameterResolver(defaultParameters);
        }

        return this.bindDefaultParameters(action, defaultParameters);
    }

    /**
     * Executes a previously registered action.
     * @param {string} name name of the action to execute.
     * @param {{[name:string]:any}?} parameters parameters to provide to the action.
     * @return {any} the value produced by the action.
     */
    execute(name, parameters) {
        const [ action, parameterResolver ] = this.#registeredActions.get(name);
        if (action == null) {
            throw new Error("No action registered with name '" + name + "'");
        }

        if (parameterResolver && (parameters != null)) {
            parameterResolver(parameters);
        }

        return action(parameters);
    }

}
