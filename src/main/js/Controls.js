
import { EventDispatcher } from "./EventDispatcher.js";
import { Animation } from "./Animation.js";
import { Renderer } from "./Renderer.js";

export class Controls extends EventDispatcher {

    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        super();

        // Set up event listeners for controls
        this.setupControls(renderer);
    }

    /**
     *
     * @param {Renderer} renderer
     */
    setupControls(renderer) {
        const gameState = renderer.gameState;
        const player = renderer.gameState.player;
        const animations = renderer.animations;
        const headBobDuration = 500;
        const headBobHeight = 0.02;

        const moveForwardAnimation = new Animation({
            id: 'moveForward',
            duration: headBobDuration,
            repetitions: Infinity,
            callback: (percentComplete, amount) => {
                player.headBob = Math.sin(percentComplete * Math.PI * 2) * headBobHeight;
                player.moveForward(amount);
            }
        });

        const moveBackwardAnimation = new Animation({
            id: 'moveBackward',
            duration: headBobDuration,
            repetitions: Infinity,
            callback: (percentComplete, amount) => {
                player.headBob = Math.sin(percentComplete * Math.PI * 2) * headBobHeight;
                player.moveBackward(amount);
            }
        });

        const strafeLeftAnimation = new Animation({
            id: 'strafeLeft',
            duration: headBobDuration,
            repetitions: Infinity,
            callback: (percentComplete, amount) => {
                player.headBob = Math.sin(percentComplete * Math.PI * 2) * headBobHeight;
                player.strafeLeft(amount);
            }
        });

        const strafeRightAnimation = new Animation({
            id: 'strafeRight',
            duration: headBobDuration,
            repetitions: Infinity,
            callback: (percentComplete, amount) => {
                player.headBob = Math.sin(percentComplete * Math.PI * 2) * headBobHeight;
                player.strafeRight(amount);
            }
        });

        const turnLeftAnimation = new Animation({
            id: 'turnLeft',
            callback: (percentComplete, amount) => !amount || player.turnLeft(amount)
        });

        const turnRightAnimation = new Animation({
            id: 'turnRight',
            callback: (percentComplete, amount) => !amount || player.turnRight(amount)
        });

        const jumpAnimation = new Animation({
            id: 'jump',
            duration: 600,
            repeat: true,
            callback: (percentComplete) => {
                const jumpHeight = 0.4;
                player.height = jumpHeight * Math.sin(Math.PI * percentComplete);
            }
        });

        let inputSuspended = false;

        gameState.on("suspendInput", () => {
            inputSuspended = true;

            // Stop active animations
            animations.end(moveForwardAnimation);
            animations.end(moveBackwardAnimation);
            animations.end(strafeLeftAnimation);
            animations.end(strafeRightAnimation);
            animations.end(turnLeftAnimation);
            animations.end(turnRightAnimation);
            jumpAnimation.repetitions = 1;
        });

        gameState.on("resumeInput", () => {
            inputSuspended = false;
        });

        document.addEventListener('keydown', (e) => {
            if (inputSuspended) {
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    animations.addIfNotPresent(moveForwardAnimation,
                            { ratePerSecond : () => player.effectiveSpeed });
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    animations.addIfNotPresent(moveBackwardAnimation,
                            { ratePerSecond : () => player.effectiveSpeed });
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    animations.addIfNotPresent(strafeLeftAnimation,
                            { ratePerSecond : () => player.effectiveSpeed });
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    animations.addIfNotPresent(strafeRightAnimation,
                            { ratePerSecond : () => player.effectiveSpeed });
                    break;
                case 'PageUp':
                case 'q':
                case 'Q':
                    animations.addIfNotPresent(turnLeftAnimation,
                            { ratePerSecond : () => player.effectiveTurnSpeed });
                    break;
                case 'PageDown':
                case 'e':
                case 'E':
                    animations.addIfNotPresent(turnRightAnimation,
                            { ratePerSecond : () => player.effectiveTurnSpeed });
                    break;
                case ' ':
                    jumpAnimation.repetitions = Infinity;
                    animations.addIfNotPresent(jumpAnimation);
                    break;
                case 'Shift':
                    if (player.speedMultiplier != 1) {
                        player.speedMultiplier = 1;
                    } else {
                        player.speedMultiplier = 2;
                    }
                    break;
                case 'Control':
                    if (player.speedMultiplier != 1) {
                        player.speedMultiplier = 1;
                    } else {
                        player.speedMultiplier = 0.1;
                    }
                    break;
                case 'm':
                case 'M':
                    renderer.drawMap = !renderer.drawMap;
                    break;
                case '(':
                    // Reduce FOV
                    if (renderer.fieldOfView > 0.2) {
                        renderer.fieldOfView -= 0.1
                    }
                    break;
                case ')':
                    // increase FOV
                    if (renderer.fieldOfView < Math.PI - 0.1) {
                        renderer.fieldOfView += 0.1
                    }
                    break;
                case '9':
                    // Reduce camera distance
                    if (renderer.cameraDistance > 0.2) {
                        renderer.cameraDistance -= 0.1
                    }
                    break;
                case '0':
                    // Increase camera distance
                    renderer.cameraDistance += 0.1
                    break;
                case '-':
                    // Reset camera
                    renderer.fieldOfView = Math.PI / 4;
                    renderer.cameraDistance = 1;
                    break;
                case '~':
                case '`':
                    renderer.wallShading = !renderer.wallShading;
                    break;

                // Face North
                case 'i':
                case 'I':
                    player.orientation = -Math.PI / 2;
                    break;
                // Face North-West
                case 'o':
                case 'O':
                    player.orientation = -Math.PI / 4;
                    break;
                // Face South
                case 'k':
                case 'K':
                case '<':
                case ',':
                    player.orientation = Math.PI / 2;
                    break;
                // Face South-West
                case '.':
                case '>':
                    player.orientation = Math.PI / 4;
                    break;
                // Face West
                case 'j':
                case 'J':
                    player.orientation = Math.PI;
                    break;
                // Face South-East
                case 'm':
                case 'M':
                    player.orientation = Math.PI * 3 / 4;
                    break;
                // Face East
                case 'l':
                case 'L':
                    player.orientation = 0;
                    break;
                // Face North-East
                case 'u':
                case 'U':
                    player.orientation = -Math.PI * 3 / 4;
                    break;
                // Move to center of North edge of current cell
                case 't':
                case 'T':
                    player.setPosition(Math.floor(player.x) + 0.5, Math.floor(player.y));
                    break;
                // Move to center of South edge of current cell
                case 'b':
                case 'B':
                    player.setPosition(Math.floor(player.x) + 0.5, Math.floor(player.y) + 0.999);
                    break;
                // Move to center of West edge of current cell
                case 'f':
                case 'F':
                    player.setPosition(Math.floor(player.x), Math.floor(player.y) + 0.5);
                    break;
                // Move to center of East edge of current cell
                case 'h':
                case 'H':
                    player.setPosition(Math.floor(player.x) + 0.999, Math.floor(player.y) + 0.5);
                    break;
                // Move to center of current cell
                case 'g':
                case 'G':
                    player.setPosition(Math.floor(player.x) + 0.5, Math.floor(player.y) + 0.5);
                    break;
                // Move to North-West corner of current cell
                case 'r':
                case 'R':
                    player.setPosition(Math.floor(player.x), Math.floor(player.y));
                    break;
                // Move to North-East corner of current cell
                case 'y':
                case 'Y':
                    player.setPosition(Math.floor(player.x) + 0.999, Math.floor(player.y));
                    break;
                // Move to South-West corner of current cell
                case 'v':
                case 'V':
                    player.setPosition(Math.floor(player.x), Math.floor(player.y) + 0.999);
                    break;
                // Move to South-East corner of current cell
                case 'n':
                case 'N':
                    player.setPosition(Math.floor(player.x) + 0.999, Math.floor(player.y) + 0.999);
                    break;
                // Move player forward 1 square, ignoring collision
                case '1':
                    player.moveForward(1, true);
                    break;
                // Look down
                case '2':
                    renderer.projectionPlaneOffset -= 0.1;
                    break;
                // Look up
                case '3':
                    renderer.projectionPlaneOffset += 0.1;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    animations.end(moveForwardAnimation);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    animations.end(moveBackwardAnimation);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    animations.end(strafeLeftAnimation);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    animations.end(strafeRightAnimation);
                    break;
                case 'PageUp':
                case 'q':
                case 'Q':
                    animations.end(turnLeftAnimation);
                    break;
                case 'PageDown':
                case 'e':
                case 'E':
                    animations.end(turnRightAnimation);
                    break;
                case ' ':
                    jumpAnimation.repetitions = 1;
                    break;
                case 'Tab':
                    if (!inputSuspended) {
                        renderer.gameState.map.useTarget(player);
                    }
                    break;
                case 'Shift':
                    //player.speedMultiplier = 1;
                    break;
                case 'Control':
                    //player.speedMultiplier = 1;
                    break;
                case 'm':
                case 'M':
                    // renderer.drawMap = false;
                    break;
            }
        });

        renderer.canvas.addEventListener('click', (e) => {
            if (!inputSuspended) {
                console.log("click");
                renderer.gameState.map.useTarget(player);
            }
        })
    }

}
