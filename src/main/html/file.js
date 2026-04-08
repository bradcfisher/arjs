
import { GameState } from "../js/GameState.js";
import { Parse } from "../js/Parse.js";

const xfdLength = 0x16800;
const atrLength = 0x16810;
const dungeonFileIdVerifyMask = 0xE000;
const dungeonFileIdVerifyCode = 0x4000;
const dungeonFileIdSectorMask = 0x03ff;

/** @type {RgbPalette} */
let palette;

const files = {
    "../AR/dungeon/disks/Dungeon11.xfd": [
        { id: 0x4205, description: "D1S1 S - Portal 2" }
    ],
    "../AR/dungeon/disks/Dungeon21.xfd": [
        { id: 0x480A, description: "D2S1 S010 - Map 0 (Level 1.1 NW)", type: "map" },
        { id: 0x4833, description: "D2S1 S052 - Map 1 (Level 1.2 NW)", type: "map" },
        { id: 0x485C, description: "D2S1 S093 - Map 2 (Level 1.3 NW)", type: "map" },
        { id: 0x4885, description: "D2S1 S134 - Map 3 (Level 1.4 NW)", type: "map" },
        { id: 0x48AE, description: "D2S1 S175 - Map 4 (Level 2)", type: "map" },
        { id: 0x48D7, description: "D2S1 S216 - Map 5 (Level 3)", type: "map" },
        { id: 0x4900, description: "D2S1 S257 - Map 6 (Level 4)", type: "map" },
        { id: 0x4929, description: "D2S1 S298 - Texture Set 1 (Normal)", type: "image", width: 72, hscale: 2 },
        { id: 0x4955, description: "D2S1 S342 - Texture Set 2 (Mirror & Crystal)", type: "image", width: 72, hscale: 2 },
        { id: 0x4981, description: "D2S1 S386 - Texture Set 3 (Dragon)", type: "image", width: 72, hscale: 2 },
        { id: 0x49AD, description: "D2S1 S430 - Texture Set 4 (Goblin)", type: "image", width: 72, hscale: 2 },
        { id: 0x49D9, description: "D2S1 S474 - Texture Set 5 (Mausoleum)", type: "image", width: 72, hscale: 2 },
        { id: 0x4A05, description: "D2S1 S518 - Texture Set 6 (Alien)", type: "image", width: 72, hscale: 2 },
        { id: 0x4A31, description: "D2S1 S562 - Unknown 1 (Executable loaded at $96F0)" },
        { id: 0x4A7F, description: "D2S1 S640 - Unknown 2 (Executable loaded at $7600)"},
        { id: 0x4ABC, description: "D2S1 S653 - Unknown 3 (Executable loaded at $7600)"}
    ],
    "../AR/dungeon/disks/Dungeon22.xfd": [
        { id: 0x4C01, description: "D2S2 S - Fountain" },
        { id: 0x4C24, description: "D2S2 S - Chapel" },
        { id: 0x4C5D, description: "D2S2 S - Sphinx" },
        { id: 0x4C86, description: "D2S2 S - Ferryman" },
        { id: 0x4CA7, description: "D2S2 S - Clothes Horse" },
        { id: 0x4CC6, description: "D2S2 S - Dwarven Smithy" },
        { id: 0x4D07, description: "D2S2 S - Brewery" },
        { id: 0x4D4C, description: "D2S2 S - Crypt" },
        { id: 0x4D6D, description: "D2S2 S - Dragon" },
        { id: 0x4D99, description: "D2S2 S - Death's Door" },
        { id: 0x4DAF, description: "D2S2 S - Machine Room" },
        { id: 0x4DEE, description: "D2S2 S - Elevator" },
        { id: 0x4DFD, description: "D2S2 S - Unknown 2" },
        { id: 0x4E06, description: "D2S2 S - Unknown 3" }
    ],
    "../AR/dungeon/disks/Dungeon31.xfd": [
        { id: 0x5001, description: "D3S1 S - Combat Data" },
        { id: 0x5072, description: "D3S1 S - Item Data" },
        { id: 0x50C7, description: "D3S1 S - Inn" },
        { id: 0x524C, description: "D3S1 S - Encounters Data", startSector: 0xEC, length: 0xB000 },
        { id: 0x524D, description: "D3S1 S - Dead Song", type: "song" },
        { id: 0x525C, description: "D3S1 S - Location Names" },
        { id: 0x529F, description: "D3S1 S - Unknown 4" }
    ],
    "../AR/dungeon/disks/Dungeon32.xfd": [
        { id: 0x5401, description: "D3S2 S - Grahm's Gold Exchange Vault" },
        { id: 0x5422, description: "D3S2 S - Goblin Troll" },
        { id: 0x545B, description: "D3S2 S - Acrinimiril's Tomb" },
        { id: 0x547E, description: "D3S2 S - Ozob" },
        { id: 0x54B7, description: "D3S2 S - Guild" },
        { id: 0x5506, description: "D3S2 S - Shop" },
        { id: 0x5547, description: "D3S2 S - Oracle" },
        { id: 0x557E, description: "D3S2 S - Enchantress" },
        { id: 0x55AF, description: "D3S2 S - Tavern" },
        { id: 0x55EE, description: "D3S2 S - Picture 7", type: "image" },
        { id: 0x55FE, description: "D3S2 S - Picture 8", type: "image" },
        { id: 0x560E, description: "D3S2 S - Tavern Monster Song", type: "song" },
        { id: 0x5629, description: "D3S2 S - Devourer Song", type: "song" },
        { id: 0x5636, description: "D3S2 S - Unknown Song", type: "song" },
        { id: 0x563F, description: "D3S2 S - Tavern Talk" },
        { id: 0x566E, description: "D3S2 S - Lost Song", type: "song" },
        { id: 0x568F, description: "D3S2 S - Blackheart Song", type: "song" },
        { id: 0x56AC, description: "D3S2 S - Unknown 5" }
    ]
};

/** @type {HTMLSelectElement} */
const fileSelect = document.getElementById("fileSelect");
/** @type {HTMLInputElement} */
const loadButton = document.getElementById("loadButton");
/** @type {HTMLInputElement} */
const saveButton = document.getElementById("saveButton");
/** @type {HTMLInputElement} */
const decodeImageAsTextureCheckbox = document.getElementById("decodeImageAsTextureCheckbox");
/** @type {HTMLInputElement} */
const widthInput = document.getElementById("widthInput");
/** @type {HTMLInputElement} */
const startOffsetInput = document.getElementById("startOffsetInput");
/** @type {HTMLSelectElement} */
const paletteSelect = document.getElementById("paletteSelect");
/** @type {HTMLInputElement} */
const color0Input = document.getElementById("color0Input");
/** @type {HTMLInputElement} */
const color1Input = document.getElementById("color1Input");
/** @type {HTMLInputElement} */
const color2Input = document.getElementById("color2Input");
/** @type {HTMLInputElement} */
const color3Input = document.getElementById("color3Input");

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

    saveButton.addEventListener("click", async (evt) => {
        const fileName = document.getElementById("fileName").innerText + ".bin";

        // create a new handle
        const newHandle = await window.showSaveFilePicker({ id: "arjs-extract-file", suggestedName: fileName });

        // create a FileSystemWritableFileStream to write to
        const writableStream = await newHandle.createWritable();

        // write our file
        await writableStream.write(getFileData());

        // close the file and write the contents to disk.
        await writableStream.close();
    });

    const updateImageOnChange = (evt) => {
        decodeImage(getFileData());
    };
    startOffsetInput.addEventListener("change", updateImageOnChange);
    widthInput.addEventListener("change", updateImageOnChange);

    const updateNumberInputOnKeydown = (evt) => {
        const targetInput = evt.target;
        let changed = false;

        switch (evt.key) {
        case "ArrowUp":
            targetInput.value = Number(targetInput.value) + 1;
            changed = true;
            break;
        case "ArrowDown":
            targetInput.value = Number(targetInput.value) - 1;
            changed = true;
            break;
        }

        if (changed) {
            targetInput.dispatchEvent(new Event("change"));
        }
    };

    decodeImageAsTextureCheckbox.addEventListener("change", (evt) => {
        let labelColor = "black";
        if (decodeImageAsTextureCheckbox.checked) {
            startOffsetInput.disabled = true;
            widthInput.disabled = true;
            labelColor = "gray";
        } else {
            startOffsetInput.disabled = false;
            widthInput.disabled = false;
        }
        startOffsetInput.labels.forEach((label) => {
            label.style.color = labelColor;
        });
        widthInput.labels.forEach((label) => {
            label.style.color = labelColor;
        });

        updateImageOnChange(evt);
    });

    startOffsetInput.addEventListener("keydown", updateNumberInputOnKeydown);
    widthInput.addEventListener("keydown", updateNumberInputOnKeydown);

    paletteSelect.addEventListener("change", (evt) => {
        const selectedOption = paletteSelect.selectedOptions[0];
        /** @type {number[]} */
        const colors = selectedOption.value.split(",");
        console.log("Applying image palette '" + selectedOption.text + "': ", colors);

        color0Input.value = colors[0];
        color1Input.value = colors[1];
        color2Input.value = colors[2];
        color3Input.value = colors[3];

        updateImageOnChange(evt);
    });

    color0Input.addEventListener("change", updateImageOnChange);
    color1Input.addEventListener("change", updateImageOnChange);
    color2Input.addEventListener("change", updateImageOnChange);
    color3Input.addEventListener("change", updateImageOnChange);
});

function formatNumberAsHex(value, digits) {
    let result = Number(value).toString(16);
    return '0'.repeat(Math.max(0, digits - result.length)) + result;
}

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
    const keyOfs = ((keySector - 1) * 128);

    const decodedBytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        const j = i % 16;

        let d = diskBuffer[ofs + i];

        // Rotate right 1 bit
        if ((d & 1) == 1) {
            d = (d >>> 1) | 0x80;
        } else {
            d = d >>> 1;
        }

        d = d ^ diskBuffer[keyOfs + j];

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

    return resourceManager.load(diskUrl).then((loaded) => {
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

        const fileName = document.getElementById("fileName");
        fileName.innerText = fileDetails.description;

        const fileInfo = document.getElementById("fileInfo");
        fileInfo.innerText = ` [${fileDetails.type || "binary"}] (${fileData.length} bytes)`;

        switch (fileDetails.type) {
        case "image":
            if (fileDetails.width != null) {
                widthInput.value = fileDetails.width;
            }

            // TODO: Decode and display image
            outputBase64(fileData);
            decodeImage(fileData);
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

/**
 *
 * @returns {Uint8Array}
 */
function getFileData() {
    const outputInput = document.getElementById("output");
    return Uint8Array.fromBase64(outputInput.value);
}

function decodeImage(fileData) {
    /** @type {HTMLCanvasElement} */
    const imageCanvas = document.getElementById("imageCanvas");
    const context = imageCanvas.getContext("2d");
    const imageData = context.createImageData(imageCanvas.width, imageCanvas.height);
    imageData.data.fill(0);

    const colors = getColors();

    if (decodeImageAsTextureCheckbox.checked) {
        decodeTextureSet(imageData, colors, fileData);
    } else {
        decodeImageData(imageData, 0, 0, colors, fileData, Number(startOffsetInput.value), Number(widthInput.value));
    }

    context.putImageData(imageData, 0, 0);
}

/**
 *
 * @param {ImageData} imageData destination ImageData to write the decoded image into
 * @param {[color0: number, color1: number, color2: number, color3: number]} colors
 * @param {Uint8Array} fileData data containing the texture image to decode
 */
function decodeTextureSet(imageData, colors, fileData) {
    decodeTextureMipMaps(imageData, 0,   0, colors, fileData,  105);
    decodeTextureMipMaps(imageData, 0,  75, colors, fileData, 1887);
    decodeTextureMipMaps(imageData, 0, 150, colors, fileData, 3669);
}

function getColors() {
    return [
        Number.parseInt(color0Input.value, 16),
        Number.parseInt(color1Input.value, 16),
        Number.parseInt(color2Input.value, 16),
        Number.parseInt(color3Input.value, 16)
    ];
}

/**
 * @param {ImageData} imageData destination ImageData to write the decoded image into
 * @param {number} xOffset destination X position for top-left corner of decoded image
 * @param {number} yOffset destination Y position for top-left corner of decoded image
 * @param {[color0: number, color1: number, color2: number, color3: number]} colors
 * @param {Uint8Array} fileData data containing the texture image to decode
 * @param {number} startOffset the starting byte offset of the image data
 */
function decodeTextureMipMaps(imageData, xOffset, yOffset, colors, fileData, startOffset) {
    decodeImageData(imageData, xOffset,       yOffset,      colors, fileData, startOffset,        72, 72, 2);
    decodeImageData(imageData, xOffset + 150, yOffset,      colors, fileData, startOffset + 1296, 36, 36, 2);
    decodeImageData(imageData, xOffset + 150, yOffset + 40, colors, fileData, startOffset + 1620, 18, 18, 2);
}

/**
 *
 * @param {ImageData} imageData destination ImageData to write the decoded image into
 * @param {number} xOffset destination X position for top-left corner of decoded image
 * @param {number} yOffset destination Y position for top-left corner of decoded image
 * @param {[color0: number, color1: number, color2: number, color3: number]} colors
 * @param {Uint8Array} fileData data containing the texture image to decode
 * @param {number} startOffset the starting byte offset of the image data
 * @param {number} width width of the image in pixels.
 * @param {number=} height height of the image in pixel rows. Default is unlimited if not provided (e.g. decode to end of buffer)
 * @param {number=} hscale integer horizontal scaling factor. Default is 1 if not provided
 */
function decodeImageData(
    imageData, xOffset, yOffset, colors,
    fileData, startOffset, width, height = Number.MAX_SAFE_INTEGER,
    hscale = 1
) {
    const byteWidth = Math.ceil(width / 4);
    width *= hscale;

    colors = colors.map((color) => palette.getRgbForColor(color));

    const outWidth = imageData.width;

    let x = 0;
    let y = 0;
    for (let ofs = startOffset; y < height && ofs < fileData.length; ++ofs) {
        let byte = fileData[ofs];

        // Render each pixel encoded in this byte
        for (let i = 0; i < 4; ++i) {
            const pxl = (byte & 0xC0) >>> 6;
            byte = byte << 2;

            const rgb = colors[pxl];

            for (let s = 0; s < hscale; ++s) {
                const imgOfs = (xOffset + x + (yOffset + y) * outWidth) * 4;
                imageData.data[imgOfs]     = rgb[0];
                imageData.data[imgOfs + 1] = rgb[1];
                imageData.data[imgOfs + 2] = rgb[2];
                imageData.data[imgOfs + 3] = 0xff;
                ++x;
            }

            if (x == width) {
                x = 0;
                ++y;
                // Reached edge of image, break containing loop to skip remaining pixels in current byte
                break;
            }
        }
    }
}


class RgbPalette {
    #buffer;

    constructor(buffer) {
        this.#buffer = new Uint8Array(buffer);
        if (this.#buffer.length != 256 * 3) {
            throw new Error("Palette data must be exactly " + (256 * 3) +" bytes, got " + this.#buffer.length);
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


