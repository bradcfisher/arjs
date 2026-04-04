
import { GameState } from "../js/GameState.js";
import { Parse } from "../js/Parse.js";

const xfdLength = 0x16800;
const atrLength = 0x16810;
const dungeonFileIdVerifyMask = 0xE000;
const dungeonFileIdVerifyCode = 0x4000;
const dungeonFileIdSectorMask = 0x03ff;

let palette;

const files = {
    "../AR/dungeon/disks/Dungeon11.xfd": [
        { id: 0x4205, description: "D1 S1 - Portal 2" }
    ],
    "../AR/dungeon/disks/Dungeon21.xfd": [
        { id: 0x480A, description: "D2 S1 - Map 0 (Level 1.1 NW)", type: "map" },
        { id: 0x4833, description: "D2 S1 - Map 1 (Level 1.2 NW)", type: "map" },
        { id: 0x485C, description: "D2 S1 - Map 2 (Level 1.3 NW)", type: "map" },
        { id: 0x4885, description: "D2 S1 - Map 3 (Level 1.4 NW)", type: "map" },
        { id: 0x48AE, description: "D2 S1 - Map 4 (Level 2)", type: "map" },
        { id: 0x48D7, description: "D2 S1 - Map 5 (Level 3)", type: "map" },
        { id: 0x4900, description: "D2 S1 - Map 6 (Level 4)", type: "map" },
        { id: 0x4929, description: "D2 S1 - Picture 1", type: "image" },
        { id: 0x4955, description: "D2 S1 - Picture 2", type: "image" },
        { id: 0x4981, description: "D2 S1 - Picture 3", type: "image" },
        { id: 0x49AD, description: "D2 S1 - Picture 4", type: "image" },
        { id: 0x49D9, description: "D2 S1 - Picture 5", type: "image" },
        { id: 0x4A05, description: "D2 S1 - Picture 6", type: "image" },
        { id: 0x4A31, description: "D2 S1 - Unknown 1" }
    ],
    "../AR/dungeon/disks/Dungeon22.xfd": [
        { id: 0x4C01, description: "D2 S2 - Fountain" },
        { id: 0x4C24, description: "D2 S2 - Chapel" },
        { id: 0x4C5D, description: "D2 S2 - Sphinx" },
        { id: 0x4C86, description: "D2 S2 - Ferryman" },
        { id: 0x4CA7, description: "D2 S2 - Clothes Horse" },
        { id: 0x4CC6, description: "D2 S2 - Dwarven Smithy" },
        { id: 0x4D07, description: "D2 S2 - Brewery" },
        { id: 0x4D4C, description: "D2 S2 - Crypt" },
        { id: 0x4D6D, description: "D2 S2 - Dragon" },
        { id: 0x4D99, description: "D2 S2 - Death's Door" },
        { id: 0x4DAF, description: "D2 S2 - Machine Room" },
        { id: 0x4DEE, description: "D2 S2 - Elevator" },
        { id: 0x4DFD, description: "D2 S2 - Unknown 2" },
        { id: 0x4E06, description: "D2 S2 - Unknown 3" }
    ],
    "../AR/dungeon/disks/Dungeon31.xfd": [
        { id: 0x5001, description: "D3 S1 - Combat Data" },
        { id: 0x5072, description: "D3 S1 - Item Data" },
        { id: 0x50C7, description: "D3 S1 - Inn" },
        { id: 0x524C, description: "D3 S1 - Encounters Data", startSector: 0xEC, length: 0xB000 },
        { id: 0x524D, description: "D3 S1 - Dead Song", type: "song" },
        { id: 0x525C, description: "D3 S1 - Location Names" },
        { id: 0x529F, description: "D3 S1 - Unknown 4" }
    ],
    "../AR/dungeon/disks/Dungeon32.xfd": [
        { id: 0x5401, description: "D3 S2 - Grahm's Gold Exchange Vault" },
        { id: 0x5422, description: "D3 S2 - Goblin Troll" },
        { id: 0x545B, description: "D3 S2 - Acrinimiril's Tomb" },
        { id: 0x547E, description: "D3 S2 - Ozob" },
        { id: 0x54B7, description: "D3 S2 - Guild" },
        { id: 0x5506, description: "D3 S2 - Shop" },
        { id: 0x5547, description: "D3 S2 - Oracle" },
        { id: 0x557E, description: "D3 S2 - Enchantress" },
        { id: 0x55AF, description: "D3 S2 - Tavern" },
        { id: 0x55EE, description: "D3 S2 - Picture 7", type: "image" },
        { id: 0x55FE, description: "D3 S2 - Picture 8", type: "image" },
        { id: 0x560E, description: "D3 S2 - Tavern Monster Song", type: "song" },
        { id: 0x5629, description: "D3 S2 - Devourer Song", type: "song" },
        { id: 0x5636, description: "D3 S2 - Unknown Song", type: "song" },
        { id: 0x563F, description: "D3 S2 - Tavern Talk" },
        { id: 0x566E, description: "D3 S2 - Lost Song", type: "song" },
        { id: 0x568F, description: "D3 S2 - Blackheart Song", type: "song" },
        { id: 0x56AC, description: "D3 S2 - Unknown 5" }
    ]
};

const fileSelect = document.getElementById("file");
const loadButton = document.getElementById("loadButton");

document.addEventListener("DOMContentLoaded", () => {
    loadPalette("../AR/shared/Atari800Palette-Altirra310NTSC.pal").then((p) => {
        palette = p;
        console.log("Loaded palette: ", palette)
    });

    while (fileSelect.firstChild) {
        fileSelect.removeChild(fileSelect.firstChild);
    }

    Object.entries(files)
        .sort((a,b) => { a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0) })
        .forEach(([diskName, fileList]) => {
            fileList.forEach((fileDetails, index) => {
                fileSelect.appendChild(new Option(fileDetails.description, diskName + ":" + index));
            });
        });

    loadButton.addEventListener("click", (evt) => {
        const [diskName, index] = fileSelect.value.split(":");
        console.log("Load file: disk=", diskName, " index=", index);

        const fileDetails = files[diskName][index];
        console.log("fileDetails=", fileDetails);

        handleExtractFile(diskName, fileDetails);
    });
});


/**
 * Decodes a file
 *
 * @param {Uint8Array} diskBuffer buffer containing the disk data
 * @param {number} startSector starting sector for the file data
 * @param {number} keySector sector containing the key data
 * @param {number} length file length in bytes
 *
 * @return {Uint8Array} the decoded file bytes
 */
function decodeDungeonFile(diskBuffer, startSector, keySector, length) {
    console.log("Decoding file: startSector=" + startSector + " keySector=" + keySector + " length=" + length);
    const ofs = ((startSector - 1) * 128);
    const okey = ((keySector - 1) * 128);

    const decodedBytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        const j = i % 16;

        let d = diskBuffer[ofs + i];

        if ((d & 1) == 1) {
            d = (d >>> 1) | 0x80;
        } else {
            d = d >>> 1;
        }

        d = d ^ (0xff & diskBuffer[okey + j]);

        decodedBytes[i] = (d & 0xff);
    }

    return decodedBytes;
}

/**
 *
 * @param {Uint8Array} diskBuffer buffer containing the disk data
 * @param {number} fileId
 * @param {number=} startSector starting sector for the file data. Must be provided if `length` is given.
 * @param {number=} length file length in bytes. Must be provided if `startSector` is given.
 *
 * @return {Uint8Array} the decoded file bytes
 */
function decodeDungeonFileUsingKey(diskBuffer, fileId, startSector, length) {
    const keySector = fileId & dungeonFileIdSectorMask;

    if (startSector != null) {
        return decodeDungeonFile(diskBuffer, startSector, keySector, length);
    }

    if (keySector == 0) {
        throw new Error("Start sector can not be 0") // sector is 1 based
    }

    const ofs = ((keySector - 1) * 128);

    // check extraction key
    if ((diskBuffer[ofs] != ((fileId >> 8) & 0xff)) || (diskBuffer[ofs + 1] != (fileId & 0xff))) {
        throw new Error("File ID does not match");
    }

    // determine length
    length = diskBuffer[ofs + 2] + (256 * diskBuffer[ofs + 3]);

    const fileBytes = decodeDungeonFile(diskBuffer, keySector + 1, keySector, length);

    // verify checksum
    let checkSum1 = 0;

    for (let i = 0; i < length; i++) {
        checkSum1 += fileBytes[i];
    }

    const checkSum2 = (checkSum1 >> 8) & 0xff;
    checkSum1 = checkSum1 & 0xff;

    if ((checkSum1 != diskBuffer[ofs + 4])
        || (checkSum2 != diskBuffer[ofs + 5])
    ) {
        throw new Error(`Checksum of file does not match ([${checkSum1} ${checkSum2}] != [${diskBuffer[ofs + 4]} ${diskBuffer[ofs + 5]}])`);
    }

    return fileBytes;
}

/**
 *
 * @param {Uint8Array} fileData
 */
function outputBase64(fileData) {
    console.log("Displaying base64 for bytes: ", fileData);

    /** @type {HTMLTextAreaElement} */
    const outputInput = document.getElementById("output");
    outputInput.value = fileData.toBase64();
}

function handleExtractFile(diskName, fileDetails) {
    const diskSide = ((0x0400 & fileDetails.id) >> 10) + 1;
    const diskNumber = ((0x1800 & fileDetails.id) >> 11) + 1;

    const resourceManager = GameState.getResourceManager();

    const diskUrl = Parse.url(diskName);
    console.log("Selected file is on Disk " + diskNumber + " Side " + diskSide + ". Loading disk from " + diskUrl);

    resourceManager.load(diskUrl).then((loaded) => {
        let diskData = new Uint8Array(loaded[diskUrl].data);

        // check file length for .xfd or .atr file
        if (diskData.length == atrLength) {
            // Skip first 16 bytes for ATR files
            diskData = diskData.subarray(16);
        } else if (diskData.length != xfdLength) {
            console.error("Disk file length " + diskData.length + " does not match .xfd or .atr format ("
                + xfdLength + " or " + atrLength + ")");
            return;
        }

        console.log("Loaded disk:" + diskUrl + ", Data:", diskData);

        const fileData = decodeDungeonFileUsingKey(diskData, fileDetails.id, fileDetails.startSector, fileDetails.length);

        switch (fileDetails.type) {
        case "image":
            // TODO: Decode and display image
            console.log("TODO: Decode and display image");
            outputBase64(fileData);
            break;
        case "map":
            // TODO: Decode and display map?
            console.log("TODO: Decode and display map?");
            outputBase64(fileData);
            break;
        case "song":
            // TODO: Decode and play song?
            console.log("TODO: Decode and play song?");
            outputBase64(fileData);
            break;
        default:
            outputBase64(fileData);
        }
    });
}

class RgbPalette {
    #buffer;

    constructor(buffer) {
        this.#buffer = new Uint8Array(buffer);
        if (this.#buffer.length != 256 * 3) {
            throw new Error("Pallette data must be exactly " + (256 * 3) +" bytes, got " + this.#buffer.length);
        }
    }

    getRgbForHueLuminance(hue, luminance) {
        return this.getRgbForColor((hue << 4) + luminance);
    }

    /**
     * Retrieves an array of RGB values for a given color number.
     * @param {number} colorNumber the color number (0 to 255) to retrieve the RGB values for
     * @returns {[r:number, g:number, b:number]} array of R, G, B values from 0 to 255.
     */
    getRgbForColor(colorNumber) {
        if ((colorNumber < 0) || (colorNumber > 255)) {
            throw new Error();
        }
        const ofs = colorNumber * 3;
        return [ this.#buffer[ofs], this.#buffer[ofs + 1], this.#buffer[ofs + 2] ];
    }
}

async function loadPalette(url) {
    url = Parse.url(url);
    const loaded = await GameState.getResourceManager().load(url);
    return new RgbPalette(loaded[url].data);
}


