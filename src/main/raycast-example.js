
import { Renderer } from "./js/Renderer.js";
import { Controls } from "./js/Controls.js";
import { Player } from "./js/Player.js";
import { ResourceManager } from "./js/ResourceManager.js";
import { CityMapReader } from "./js/CityMapReader.js";

let resourcesReady = false;
let domReady = false;

const cityMapReader = new CityMapReader();
cityMapReader.readMap(
    "/AR/city/CityMapWalls.bin",
    "/AR/city/CityMapLocations.bin",
    "/AR/city/json/cityDescriptions.json",
    "/AR/city/json/cityWalls.json",
    "/AR/city/json/cityFloorAndCeiling.json",
    "/AR/city/json/cityPatches.json");

cityMapReader.on("complete", () => {
    console.log("loaded map: " + cityMapReader.map.metadata.description);
    resourcesReady = true;
    checkReady();
});

document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    checkReady();
});

function checkReady() {
    if (!(resourcesReady && domReady)) {
        return;
    }

    const worldMap = cityMapReader.map;

    // TODO: Wall loader
    

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
    const player = new Player();
    player.map = worldMap;

    const renderer = new Renderer(canvasElement, worldMap, player);
    renderer.drawMap = true;

    const statusElement = document.getElementById("status");
    const fpsElement = document.getElementById("fps");
    const descElement = document.getElementById("description");

    player.on('move', (data) => {
        const cell = worldMap.getCell(Math.floor(data.position.x), Math.floor(data.position.y));

        statusElement.innerText =
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' angle: ' + data.position.angle.toFixed(2) +
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

    player.on('collision', (data) => {
        console.log('COLLISION: ' +
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' angle: ' + data.position.angle.toFixed(2) +
            ' height: ' + data.position.height.toFixed(2) +
            ' hit: ', data.hit);
    });

    player.on('passage', (data) => {
        console.log('PASSAGE: ' +
            'x: ' + data.position.x.toFixed(2) +
            ' y: ' + data.position.y.toFixed(2) +
            ' angle: ' + data.position.angle.toFixed(2) +
            ' height: ' + data.position.height.toFixed(2) +
            ' hit: ', data.hit);
    });

    let lastTimestamp = 0;
    renderer.on('render', (data) => {
        fpsElement.innerText = ' fps: ' + data.fps.toFixed(2);

        // Add some visual effects to make it more interesting
        // Simple flickering effect
        if (data.timestamp - lastTimestamp > 100) {
            lastTimestamp = data.timestamp;
            //renderer.ctx.globalAlpha = 0.95 + Math.random() * 0.05;
        }
    });

    const controls = new Controls(renderer); // for side-effects. registers key event listeners, etc

    /*
    Object.entries({
        0x1: "/images/brickbard-strawberries-8832147_1920.png",
        0x2: "/images/andrey_and_olesya-leaves-5825458_1920.jpg",
        0x3: "/images/monstreh-pattern-3296033_1920.png",
        0x4: "/images/prawny-seamless-1315302_1920.jpg",
        0x5: "/images/arzusumer-cat-7635983_1920.png",
        0x6: "/images/davidzydd-beige-756197_1920.jpg",
        0x7: "/images/macey11-waves-9273752_1920.jpg",
        0x8: "/images/prawny-seamless-2030343_1920.jpg",
        0xd: "/images/canvas_create_pattern.png"
    }).forEach(([wallType, src]) => {

        worldMap.loadImage('wall_texture_' + wallType, src, (id, img) => {
            worldMap.getWallStyle(wallType).textureProvider = (timestamp) => img;
        });
    });
    */

    // The floating gate
    player.setPosition(35.5, 36.5, -Math.PI / 2);

    //player.setPosition(35.5, 27.5, Math.PI / 2);
    //player.setPosition(33.5, 33.5, -Math.PI / 2);
    //player.setPosition(35.5, 0.5, -Math.PI / 2);

    //player.setPosition(41.5, 59.5, 0.5);
    //player.setPosition(47.5, 57.5, 0);

}