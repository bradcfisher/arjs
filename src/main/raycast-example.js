
import { Renderer } from "./js/Renderer.js";
import { Controls } from "./js/Controls.js";
import { GameState } from "./js/GameState.js";
/** @import { EventDetail } from "./js/EventDispatcher.js" */


/** @type {GameState} */
let gameState = null;
let domReady = false;

GameState.load("./AR/shared/json/AR.json")
    .then(async (gs) => {
        gameState = gs;

        await gameState.loadPlayer();
        await gameState.loadLocation(gameState.defaultLocation);

        console.log("loaded map: " + gameState.map.metadata.description);
        checkReady();
    });

document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    checkReady();
});

function checkReady() {
    if (!(gameState && domReady)) {
        return;
    }

    const player = gameState.player;

/*
            0: new WallStyle({ transparent: true, collision: false }), // No wall (should never be drawn)
            1: new WallStyle({ color: 'rgb(192 192 192 / 50%)', transparent: true, collision: false }),
            2: new WallStyle({ color: '#CCCC00' }),
            3: new WallStyle({ color: '#66CC00' }),
            4: new WallStyle({ color: '#006666' }),
            5: new WallStyle({ color: '#0080FF' }),
            6: new WallStyle({ color: '#CC99FF' }),
            7: new WallStyle({ color: '#FF33FF' }),
            8: new WallStyle({ color: '#FF9999' }),
            9: new WallStyle({ color: '#CC4400' }),
            10: new WallStyle({ color: '#004C99' }),
            11: new WallStyle({ color: '#008800' }),
            12: new WallStyle({ color: '#FF6666' }),
            13: new WallStyle({ color: '#00FFFF' }),
            14: new WallStyle({ color: '#AA00AA' }),
            15: new WallStyle({ color: '#808080' }),
*/
0
    // Initialize the game when page loads
    const canvasElement = document.getElementById("gameCanvas");

    const renderer = new Renderer(canvasElement, gameState);
    renderer.drawMap = true;

    const statusElement = document.getElementById("status");
    const fpsElement = document.getElementById("fps");
    const descElement = document.getElementById("description");

    player.on('move', (event) => {
        const data = event.data;
        const cell = gameState.map.getCell(Math.floor(data.position.x), Math.floor(data.position.y));

        statusElement.innerText =
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' orientation: ' + data.position.orientation.toFixed(2) +
            ' height: ' + data.position.height.toFixed(2) +
            '\ncell: ' + cell;

            const position = `[${String(Math.trunc(data.position.x)).padStart(2)}, ${String(Math.trunc(data.position.y)).padStart(2)}]`;
            if (cell) {
                descElement.innerText = position + " You are " + cell.description;
            } else {
                descElement.innerText = position + " You are a lost soul";
            }

        if ((Math.floor(data.position.x) != 33) || (Math.floor(data.position.y) != 33)) {
            //console.error("WTF?!");
        }
    });

    player.on('collision', (/** @type {EventDetail} */ event) => {
        const data = event.data;
        console.log('COLLISION (classifier=' + (event.classifier ? event.classifier : "") + '): ' +
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' orientation: ' + data.position.orientation.toFixed(2) +
            ' height: ' + data.position.height.toFixed(2) +
            ' hit: ', data.hit);
    });

    player.on('passage', (event) => {
        const data = event.data;
        console.log('PASSAGE: ' +
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' orientation: ' + data.position.orientation.toFixed(2) +
            ' height: ' + data.position.height.toFixed(2) +
            ' hit: ', data.hit);
    });

    let lastTimestamp = 0;
    renderer.on('render', (event) => {
        const data = event.data;
        fpsElement.innerText = ' fps: ' + data.fps.toFixed(2);

        // Add some visual effects to make it more interesting
        // Simple flickering effect
        if (data.timestamp - lastTimestamp > 100) {
            lastTimestamp = data.timestamp;
            //renderer.ctx.globalAlpha = 0.95 + Math.random() * 0.05;
        }
    });

    const controls = new Controls(renderer); // for side-effects. registers key event listeners, etc

    // The City - The floating gate
    //player.setPosition(35.5, 36.5, -Math.PI / 2);

    // The Dungeon - Near Damon & Pythia's shop
    //player.setPosition(49.5, 3.5, -Math.PI);

    //player.setPosition(35.5, 27.5, Math.PI / 2);
    //player.setPosition(33.5, 33.5, -Math.PI / 2);
    //player.setPosition(35.5, 0.5, -Math.PI / 2);

    //player.setPosition(41.5, 59.5, 0.5);
    //player.setPosition(47.5, 57.5, 0);

}