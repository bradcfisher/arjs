
import * as arjs from "../js/main.js";

const mapTypes = {
    "city" : {
        "description": "The City",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/city/CityMapWalls.bin",
                "application/octet-stream",
                "Alternate Reality: The City - Map Wall Data",
                ["AR/city/CityMapLocations.bin"]
            ),
            new arjs.ResourceMeta(
                "/AR/city/CityMapLocations.bin",
                "Alternate Reality: The City - Map Location Data",
                ["AR/city/CityMapWalls.bin"]
            )
        ]
    },
    "city-alt": {
        "description": "The City (alt)",
        "config": {
            "type": "city",
            "baseUrl": "../AR/city/json/",
            "wallBinaryUrl": "../CityMapWalls.bin",
            "locationBinaryUrl": "../CityMapLocations.bin",
            "wallTextureJsonUrl": "./cityWalls.json",
            "floorAndCeilingTextureJsonUrl": "./cityFloorAndCeiling.json",
            "descriptionJsonUrl": "./cityDescriptions.json",
            "zoneJsonUrl": "./cityZones.json",
            "messageJsonUrl": "./cityMessages.json",
            "encounterJsonUrl": "./cityEncounters.json",
            "patchJsonUrl": "./cityPatches.json"
        }
    },
    "dungeon-1-alt" : {
        "description": "The Dungeon - Level 1 (alt)",
        "config": {
            "type": "dungeon",
            "baseUrl": "../AR/dungeon/json/",

            "width": 64,
            "height": 64,
            "mapBinaryUrl": [
                {
                    "idPrefix": "NW",
                    "x": 0,
                    "y": 0,
                    "url": "../DungeonMap1.bin"
                },
                {
                    "idPrefix": "NE",
                    "x": 32,
                    "y": 0,
                    "url": "../DungeonMap2.bin"
                },
                {
                    "idPrefix": "SW",
                    "x": 0,
                    "y": 32,
                    "url": "../DungeonMap3.bin"
                },
                {
                    "idPrefix": "SE",
                    "x": 32,
                    "y": 32,
                    "url": "../DungeonMap4.bin"
                }
            ],
            "wallTextureJsonUrl": "./level1/walls.json",
            "floorAndCeilingTextureJsonUrl": "./level1/floorAndCeiling.json",
            "zoneJsonUrl": "./level1/zones.json",
            "messageJsonUrl": "./level1/messages.json",
            "encounterJsonUrl": "./level1/encounters.json",
            "patchJsonUrl": "./level1/patches.json"
        }
    },
    "dungeon-11" : {
        "description": "The Dungeon - Level 1.1 (NW)",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap1.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 1.1 (NW)"
            )
        ]
    },
    "dungeon-12" : {
        "description": "The Dungeon - Level 1.2 (NE)",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap2.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 1.2 (NE)"
            )
        ]
    },
    "dungeon-13" : {
        "description": "The Dungeon - Level 1.3 (SW)",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap3.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 1.3 (SW)"
            )
        ]
    },
    "dungeon-14" : {
        "description": "The Dungeon - Level 1.4 (SE)",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap4.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 1.4 (SE)"
            )
        ]
    },
    "dungeon-2" : {
        "description": "The Dungeon - Level 2",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap5.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 2"
            )
        ]
    },
    "dungeon-3" : {
        "description": "The Dungeon - Level 3",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap6.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 3"
            )
        ]
    },
    "dungeon-4" : {
        "description": "The Dungeon - Level 4",
        "resources": [
            new arjs.ResourceMeta(
                "/AR/dungeon/DungeonMap7.bin",
                "application/octet-stream",
                "Alternate Reality: The Dungeon - Map Level 4"
            )
        ]
    }
};

/** @type {arjs.ResourceManager} */
const resources = new arjs.ResourceManager();
/** @type {arjs.MapRenderer} */
let renderer;
let resourcesReady = false;
let pageReady = false;

/** @type {HTMLSelectElement} */
const source = document.getElementById("Source");
const scaleInput = document.getElementById("Scale");
const positionXInput = document.getElementById("PositionX");
const positionYInput = document.getElementById("PositionY");
const canvasElement = document.getElementById("Display");

const showPointsOfInterestInput = document.getElementById("showPointsOfInterest");
const showSpecialCodeInput = document.getElementById("showSpecialCode");
const showEnclosedAreasInput = document.getElementById("showEnclosedAreas");
const showZonesInput = document.getElementById("showZones");

(function() {
    let toLoad = [];

    for (let key in mapTypes) if (mapTypes.hasOwnProperty(key)) {
        let item = mapTypes[key];
        source.appendChild(new Option(item.description, key));
        if (source.resources) {
            toLoad.push(...item.resources);
        }
    }

    resources.load(...toLoad).then(
        (loadedResources) => {
            console.log("loaded resources: ", loadedResources);
            resourcesReady = true;
            checkReady();
        }
    );
})();

document.addEventListener('DOMContentLoaded', function () {
    console.log("document ready");

    source.addEventListener("change", function(evt) {
        loadMap(source.value);
    });

    scaleInput.addEventListener("change", function(evt) {
        renderer.scale = Number(evt.target.value) / 100;
    });

    positionXInput.addEventListener("change", function(evt) {
        renderer.x = Number(evt.target.value);
    });

    positionYInput.addEventListener("change", function(evt) {
        renderer.y = Number(evt.target.value);
    });

    window.addEventListener("resize", (e) => {
        console.log("Window resized");
        renderer.invalidate(true);
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            moveUp();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moveDown();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moveRight();
            break;
        case 'PageUp':
        case 'q':
        case 'Q':
            zoomOut();
            break;
        case 'PageDown':
        case 'e':
        case 'E':
            zoomIn();
            break;
        }
    });

    renderer = new arjs.MapRenderer(canvasElement.getContext("2d"));

    showPointsOfInterestInput.addEventListener("change",
        (evt) => renderer.showPointsOfInterest = showPointsOfInterestInput.checked);
    showSpecialCodeInput.addEventListener("click", (evt) => renderer.showSpecialCode = showSpecialCodeInput.checked);
    showEnclosedAreasInput.addEventListener("click", (evt) => renderer.showEnclosedAreas = showEnclosedAreasInput.checked);
    showZonesInput.addEventListener("click", (evt) => renderer.showZones = showZonesInput.checked);

    showPointsOfInterestInput.checked = renderer.showPointsOfInterest;
    showSpecialCodeInput.checked = renderer.showSpecialCode;
    showEnclosedAreasInput.checked = renderer.showEnclosedAreas;
    showZonesInput.checked = renderer.showZones;

    pageReady = true;

    checkReady();
});

function triggerChangeEvent(element) {
    var event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

function moveUp() {
    const y = Number(positionYInput.value);
    if (y > 0) {
        positionYInput.value = y - 1;
        triggerChangeEvent(positionYInput);
    }
}

function moveDown() {
    if (renderer.map) {
        const y = Number(positionYInput.value);
        if (y < renderer.map.height - 1) {
            positionYInput.value = y + 1;
            triggerChangeEvent(positionYInput);
        }
    }
}

function moveLeft() {
    const x = Number(positionXInput.value);
    if (x > 0) {
        positionXInput.value = x - 1;
        triggerChangeEvent(positionXInput);
    }
}

function moveRight() {
    if (renderer.map) {
        const x = Number(positionXInput.value);
        if (x < renderer.map.width - 1) {
            positionXInput.value = x + 1;
            triggerChangeEvent(positionXInput);
        }
    }
}

function zoomIn() {
    const scale = Number(scaleInput.value);
    if (scale < 5000) {
        scaleInput.value = scale + 1;
        triggerChangeEvent(scaleInput);
    }
}

function zoomOut() {
    const scale = Number(scaleInput.value);
    if (scale > 1) {
        scaleInput.value = scale - 1;

        triggerChangeEvent(scaleInput);
    }
}

function checkReady() {
    if (pageReady && resourcesReady) {
        source.disabled = false;
    }
}

async function loadMap(type) {
    if (type == "") {
        renderer.map = null;

        positionXInput.value = 0;
        positionYInput.value = 0;
    } else {
        let entry = mapTypes[type];

        if (entry.config) {
            if (entry.config.type == "city") {
                const reader = new arjs.CityMapReader();
                await reader.readMap(entry.config, entry.config.baseUrl);
                renderer.map = reader.map;
            } else {
                const reader = new arjs.DungeonMapReader();
                await reader.readMap(entry.config, entry.config.baseUrl);
                renderer.map = reader.map;
            }
        } else if (type == "city") {
            let reader = new arjs.CityMapReader();

            await Promise.all([
                reader.readCellWalls(entry.resources[0].url),
                reader.readJsonDescriptions("/AR/city/json/cityDescriptions.json")
                    .then(() => reader.readCellLocationCodes(entry.resources[1].url))
            ]);

            renderer.map = reader.map;
        } else {
            let reader = new arjs.DungeonMapReader();
            await reader.readBinaryMapData(entry.resources[0].url);
            renderer.map = reader.map;
        }

        if (positionXInput.value >= renderer.map.width) {
            positionXInput.value = renderer.map.width - 1;
        }

        if (positionYInput.value >= renderer.map.height) {
            positionYInput.value = renderer.map.height - 1;
        }
    }

    triggerChangeEvent(positionXInput);
    triggerChangeEvent(positionYInput);
}
