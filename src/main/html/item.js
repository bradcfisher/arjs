
import { GameState } from "../js/GameState.js";
import { Parse } from "../js/Parse.js";
import { LabelCollection, LabelEntry } from "../js/Disasm6502.js";
import { ResourceMeta } from "../js/ResourceManager.js";

/** @type {HTMLTextAreaElement} */
const itemDataInput = document.getElementById("itemDataInput");
const itemDataOutput = document.getElementById("itemDataOutput");

document.getElementById("decodeButton")
    .addEventListener("click", () => {
        decodeItems();
    });

/** @type {LabelCollection} */
let dungeonLabels;
let labelUrls = [];
[ "Dungeon11-S518.sym", "Dungeon31-S115.sym" ].forEach(labelsFile => {
    Parse.withBaseUrl("../AR/dungeon/disks/", () => {
        labelUrls.push(Parse.url(labelsFile));
    });
});

GameState.getResourceManager()
    .load(...labelUrls.map(url => new ResourceMeta(url, "text/plain")))
    .then((loaded) => {
        labelUrls.forEach(url => {
            const key = String(url);
            dungeonLabels = (dungeonLabels == null) ? new LabelCollection(key) : new LabelCollection(key, dungeonLabels);
            dungeonLabels.parse(loaded[key].data);
        });
    });

/**
 * @param {number} byte
 * @param {number} padWidth
 */
function toHex(byte, padWidth) {
    byte = Number(byte);
    if (isNaN(byte)) {
        return `NaN (${byte})`;
    }
    return byte.toString(16).padStart(padWidth, '0');
}

/**
 * @param {number} byte
 * @returns {number}
 */
function ub2sb(byte) {
    return byte > 127 ? -(byte & 127) : byte;
}

const primaryTypeDescs = [
    '[0] General/Stack/Charged Item',
    '[1] Spell',
    '[2] Ammmo',
    '[3] Weapon',
    '[4] Armor',
    '[5] Apparel',
    '[6] Potion',
    '[7] Special'
];

/**
 * @param {Uint8Array} buffer
 */
function decodeName(buffer) {
    let result = "";
    for (let byte of buffer) {
        if (byte == 0x7f) {
            result += "⚡︎";
        } else {
            result += String.fromCharCode(byte);
        }
    }

    result = result.replace(/\0+$/, "");            // Remove trailing NULs

    const unidentifiedPos = result.indexOf("\0");   // Unidentified potions may have an embedded NUL
    if (unidentifiedPos >= 0) {
        result = result.substring(0, unidentifiedPos) + `   (if identified: ${result.replace("\0", " ")})`;
    }

    return result;
}

/**
 * @param {number} offset
 * @returns {string}
 */
function decodeSaveOffset(offset) {
    /** @type {LabelEntry} */
    const label = dungeonLabels.entryForAddress(offset);
    const rel = (label != null) ? (offset - label.offset) : 0;
    return "$" + toHex(offset, 4) + (label != null ? ` [${label.name}${ rel == 0 ? "" : "+" + rel}]` : "");
}

const effectTypes = [
    "[0] Timer",
    "[1] Disease",
    "[2] Poison",
    "[3] Curse",
    "[4] Magic",
    "[5] ??",
    "[6] ??",
    "[7] ??",
];

const opTypes = [
    "[0] Increase",
    "[1] Decrease",
    "[2] NOP",
    "[3] NOP",
    "[4] XOR",
    "[5] AND",
    "[6] OR",
    "[7] ?? Debug BRK"
];

/**
 * @param {Uint8Array} buffer
 * @returns {[string, number]}
 */
function decodeEffects(buffer) {
    if (buffer.at(0) == 0) {
        return [ "", 1 ];
    }

    let result =
          "\n"
        + "[Timer Effects]\n";

    let num = 1;
    let ofs = 0;
    let e0 = buffer.at(ofs);
    while (e0 != 0) {
        const effectBuf = buffer.subarray(ofs);
        const type = e0 & 7;
        const parent = effectBuf.at(1);
        const actionTriggers = effectBuf.at(2);

        if ((e0 & 0xe0) == 0xe0) {
            const text = decodeName(effectBuf.subarray(3, 16));

            // Description
            result +=
                  "\n"
                + `${num}: (Description)\n`
                + `  [Header]\n`
                + `    0: \$${toHex(e0, 2)}\n`
                + `        Type:    ${effectTypes[type]}\n`
                + `        Visible: ${(e0 & 8) != 0}\n`
                + `        Super:   ${(e0 & 16) != 0}\n`
                + `    1: \$${toHex(parent, 2)}\n`
                + `        Parent:  ${parent}\n`
                + `    2: \$${toHex(actionTriggers, 2)}\n`
                + `        Action triggers:\n`
                + `          0000_0001: get   = ${(actionTriggers & 1) != 0}\n`
                + `          0000_0010: drop  = ${(actionTriggers & 2) != 0}\n`
                + `          0000_0100: use   = ${(actionTriggers & 4) != 0}\n`
                + `          0000_1000: unuse = ${(actionTriggers & 8) != 0}\n`
                + `          0001_0000: ??    = ${(actionTriggers & 16) != 0}\n`
                + `          0010_0000: NOP   = ${(actionTriggers & 32) != 0}\n`
                + `          0100_0000: NOP   = ${(actionTriggers & 64) != 0}\n`
                + `          1000_0000: NOP   = ${(actionTriggers & 128) != 0}\n`
                + `  [Text]\n`
                + `    ${text}\n`
                ;
        } else {
            const repetitions = effectBuf.at(3);
            const initialDelay = effectBuf.at(4) + effectBuf.at(5) * 256;
            const repetitionDelay = effectBuf.at(6) + effectBuf.at(7) * 256;
            const naturalCure = effectBuf.at(8);
            const action = effectBuf.at(9);
            const operation = ((action & 128) == 0) ? "[=] Assign" : opTypes[(action >> 4) & 7];
            const attrSize = ((action & 128) == 0) ? action : (action & 15);
            const attrRelItem = ((effectBuf.at(11) & 128) != 0);
            let attrOffset;
            let attrOffsetDesc;
            if (attrRelItem) {
                attrOffset = effectBuf.at(10) + (effectBuf.at(11) & 0x7f) * 256;
                attrOffsetDesc = `Item[ \$${toHex(attrOffset, 4)} ]`;
            } else {
                attrOffset = (0x6300 + effectBuf.at(10) + effectBuf.at(11) * 256) & 0xffff;
                attrOffsetDesc = decodeSaveOffset(attrOffset);
            }
            const steps = effectBuf.at(12);
            const stepSize = effectBuf.at(13);
            const adjAmount = effectBuf.at(14);
            const itemIndex = effectBuf.at(15);

            let stepDetails = "";
            if (steps != 1) {
                for (let i = 2; i <= steps; ++i) {
                    attrOffset += stepSize;
                    const desc = attrRelItem ? `Item[ \$${toHex(attrOffset, 4)} ]` : decodeSaveOffset(attrOffset);
                    stepDetails += `                    ${String(i).padStart(2,' ')}: ${desc}\n`;
                }

                stepDetails +=
                      `      Steps:            ${steps}\n`
                    + `      Step Size:        ${stepSize}\n`;
            }

            // Timer
            result +=
                  "\n"
                + `${num}: (Timer)\n`
                + `  [Header]\n`
                + `    0: \$${toHex(e0, 2)}\n`
                + `        Type:    ${effectTypes[type]}\n`
                + `        Linked:  ${(e0 & 8) != 0}\n`
                + `        bit 4:   ${(e0 & 16) != 0}\n`
                + `        bit 5:   ${(e0 & 32) != 0}\n`
                + `        bit 6:   ${(e0 & 64) != 0}\n`
                + `    1: \$${toHex(parent, 2)}\n`
                + `        Parent:  ${parent}\n`
                + `    2: \$${toHex(actionTriggers, 2)}\n`
                + `        Action triggers:\n`
                + `          0000_0001: get   = ${(actionTriggers & 1) != 0}\n`
                + `          0000_0010: drop  = ${(actionTriggers & 2) != 0}\n`
                + `          0000_0100: use   = ${(actionTriggers & 4) != 0}\n`
                + `          0000_1000: unuse = ${(actionTriggers & 8) != 0}\n`
                + `          0001_0000: ??    = ${(actionTriggers & 16) != 0}\n`
                + `          0010_0000: NOP   = ${(actionTriggers & 32) != 0}\n`
                + `          0100_0000: NOP   = ${(actionTriggers & 64) != 0}\n`
                + `          1000_0000: NOP   = ${(actionTriggers & 128) != 0}\n`
                + `  [Execution]\n`
                + `      Repetitions:      ${repetitions}\n`
                + `      Initial Delay:    ${initialDelay} minutes\n`
                + (repetitions == 1 ? "" :
                    `      Repetition Delay: ${repetitionDelay} minutes\n`)
                + `      Natural Cure:     ${naturalCure} (${(Math.min(32, naturalCure) / 256).toFixed(2)}%)\n`
                + `      Operation:        ${operation}\n`
                + `      Attr Size:        ${attrSize} bytes\n`
                + `      Attr Offset:   ${steps == 1 ? "  " : "1:"} ${attrOffsetDesc}\n`
                + stepDetails
                + `      Adj. Amount:      ${adjAmount}\n`
                + `      Item Index:       ${itemIndex}\n`
                ;
        }

        // Next
        ofs += 16;
        ++num;
        e0 = buffer.at(ofs);
    }

    return [ result, ofs + 1 ];
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function decodeUnknownAttributes(buffer) {
    let result = "  (structure unknown)\n";
    buffer.forEach((value, index) => {
        result += `  ${index}: \$${toHex(value, 2)} (Unsigned: ${value} Signed: ${ub2sb(value)})\n`;
    });
    return result;
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeType0Attributes(buffer, subType) {
    if (buffer.byteLength == 3) {
        // (subtype 0) Stacked standard item
        const stdItemTypes = [
            "[0] Food Packet(s)",
            "[1] Water Flask(s)",
            "[2] Unlit Torch(es)",
            "[3] Timepiece(s)",
            "[4] Compass(es)",
            "[5] Key(s)",
            "[6] Crystal(s)",
            "[7] Gem(s)",
            "[8] Jewel(s)",
            "[9] Gold",
            "[10] Silver",
            "[11] Copper"
        ];

        const typeId = buffer.at(0);
        const typeName = (typeId >= 0 && typeId < stdItemTypes.length)
                ? stdItemTypes[typeId]
                : `[${typeId}] ??`;

        const amount = buffer.at(1) * 256 + buffer.at(2);

        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0:   Type:   ${typeName}\n`
             + `  1/2: Amount: ${amount}\n`
    } else if (buffer.byteLength == 0) {
        // (subtype 1) Wand, no attributes
        return (subType == 1 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  None\n`
    } else if (buffer.byteLength == 1) {
        // (subtype 2) Card
        return (subType == 2 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Uses: ${buffer.at(0)}\n`
    }
    return decodeUnknownAttributes(buffer);
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeSpellAttributes(buffer, subType) {
    if (buffer.byteLength == 4) {
        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Cast cost: ${buffer.at(0)}\n`
             + `  1: Cur Skill: ${buffer.at(1)}%\n`
             + `  2: Backfire:  ${buffer.at(2)} HP\n`
             + `  3: ??:        ${toHex(buffer.at(3), 2)}\n`;
    }
    return decodeUnknownAttributes(buffer);
}

/**
  * @param {number} ammoTypeCode
  * @returns {string}
  */
function decodeAmmoType(ammoTypeCode) {
    switch (ammoTypeCode) {
        case 1:
            return "[1] Spell";
        case 3:
            return "[3] Crossbow";
        case 5:
            return "[5] Beam Weapon";
        case 6:
            return "[6] Gauss Rifle";
        case 255:
            return "[255] None/Melee";
        default:
            return `[${ammoTypeCode}] ??`;
    }
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeAmmoAttributes(buffer, subType) {
    if (buffer.byteLength == 13) {
        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Ammo type: ${decodeAmmoType(buffer.at(0))}\n`
             + `  1: Quantity:  ${buffer.at(1)}\n`
             + `  2: Blunt dmg: ${buffer.at(2)}\n`
             + `  3: Sharp dmg: ${buffer.at(3)}\n`
             + `  4: Earth dmg: ${buffer.at(4)}\n`
             + `  5: Air dmg:   ${buffer.at(5)}\n`
             + `  6: Fire dmg:  ${buffer.at(6)}\n`
             + `  7: Water dmg: ${buffer.at(7)}\n`
             + `  8: Power dmg: ${buffer.at(8)}\n`
             + `  9: Magic dmg: ${buffer.at(9)}\n`
             + ` 10: Good dmg:  ${buffer.at(10)}\n`
             + ` 11: Evil dmg:  ${buffer.at(11)}\n`
             + ` 12: Cold dmg:  ${buffer.at(12)}\n`;
    } else if (buffer.byteLength == 2) {
        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Ammo type: ${decodeAmmoType(buffer.at(0))}\n`
             + `  1: Quantity:  ${buffer.at(1)}\n`;
    }
    return decodeUnknownAttributes(buffer);
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeWeaponAttributes(buffer, subType) {
    if (buffer.byteLength == 19) {
        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Ammo type: ${decodeAmmoType(buffer.at(0))}\n`
             + `  1: Cur Ammo:  ${buffer.at(1)}\n`
             + `  2: Blunt dmg: ${buffer.at(2)}\n`
             + `  3: Sharp dmg: ${buffer.at(3)}\n`
             + `  4: Earth dmg: ${buffer.at(4)}\n`
             + `  5: Air dmg:   ${buffer.at(5)}\n`
             + `  6: Fire dmg:  ${buffer.at(6)}\n`
             + `  7: Water dmg: ${buffer.at(7)}\n`
             + `  8: Power dmg: ${buffer.at(8)}\n`
             + `  9: Magic dmg: ${buffer.at(9)}\n`
             + ` 10: Good dmg:  ${buffer.at(10)}\n`
             + ` 11: Evil dmg:  ${buffer.at(11)}\n`
             + ` 12: Cold dmg:  ${buffer.at(12)}\n`
             + ` 13: Min STR:   ${buffer.at(13)}\n`
             + ` 14: Min SKL:   ${buffer.at(14)}\n`
             + ` 15: Cur Dur:   ${buffer.at(15)}\n`
             + ` 16: Max Dur:   ${buffer.at(16)}\n`
             + ` 17: Flags:     \$${toHex(buffer.at(17), 2)}\n`     // TODO: More fully decode
             + ` 18: Parry:     ${buffer.at(18)}\n`
             ;
    }
    return decodeUnknownAttributes(buffer);
}

const armorPositions = [
    '[0] Head',
    '[1] Body',
    '[2] Arms',
    '[3] Legs',
];

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeArmorAttributes(buffer, subType) {
    if (buffer.byteLength == 14) {
        const position = buffer.at(0);
        return (subType == 0 ? "" : `  (assumed for subtype ${subType}, not verified)\n`)
             + `  0: Position:   ${position <= 3 ? armorPositions[position] : `[${position}] ??`}\n`
             + `  1: Blunt prot: ${buffer.at(1)}\n`
             + `  2: Sharp prot: ${buffer.at(2)}\n`
             + `  3: Earth prot: ${buffer.at(3)}\n`
             + `  4: Air prot:   ${buffer.at(4)}\n`
             + `  5: Fire prot:  ${buffer.at(5)}\n`
             + `  6: Water prot: ${buffer.at(6)}\n`
             + `  7: Power prot: ${buffer.at(7)}\n`
             + `  8: Magic prot: ${buffer.at(8)}\n`
             + `  9: Good prot:  ${buffer.at(9)}\n`
             + ` 10: Evil prot:  ${buffer.at(10)}\n`
             + ` 11: Cold prot:  ${buffer.at(11)}\n`
             + ` 12: Cur Dur:    ${buffer.at(12)}\n`
             + ` 13: Max Dur:    ${buffer.at(13)}\n`;
    }
    return decodeUnknownAttributes(buffer);
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeApparelAttributes(buffer, subType) {
    if (subType == 0) {
        return `  0: Dapper: ${buffer.at(0)}\n`
             + `  1: Warmth: ${buffer.at(1)}\n`;
    }
    return decodeUnknownAttributes(buffer);
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodePotionAttributes(buffer, subType) {
    return decodeUnknownAttributes(buffer);
}

/**
 * @param {Uint8Array} buffer
 * @param {number} subType
 * @returns {string}
 */
function decodeType7Attributes(buffer, subType) {
    return decodeUnknownAttributes(buffer);
}

const decodePrimaryTypeAttributes = [
    decodeType0Attributes,
    decodeSpellAttributes,
    decodeAmmoAttributes,
    decodeWeaponAttributes,
    decodeArmorAttributes,
    decodeApparelAttributes,
    decodePotionAttributes,
    decodeType7Attributes
];

/**
 * @param {Uint8Array} buffer
 * @param {number} primaryType
 * @param {number} subType
 * @returns {string}
 */
function decodeAttributes(buffer, primaryType, subType) {
    return "\n"
        + `[Attributes] (${buffer.byteLength} bytes)\n`
        + decodePrimaryTypeAttributes[primaryType](buffer, subType);
}

const typeSubTypeMapping = [
        [   // Type 0
            "[0] Droppped Std/Stackable Item",
            "[1] Crystal Rechargable",
            "[2] Consumable 1",
            "[3] Consumable 2"
        ],
        [   // Type 1 (Spell)
            "[0] Standard"
        ],
        [   // Type 2 (Ammo)
            "[0] Standard"
        ],
        [   // Type 3 (Weapon)
            "[0] Standard",
            "[1] Lit Torch"
        ],
        [   // Type 4 (Armor)
            "[0] Standard"
        ],
        [   // Type 5 (Apparel)
            "[0] Standard"
        ],
        [   // Type 6 (Potion)
            "[0] Standard",
            "[1] ?Curative?",
            "[2] ?Restorative?",
        ],
        [   // Type 7 (Special)
            "[0] Standard"
        ]
    ];

/**
 * @param {number} primaryType
 * @param {number} subType
 *
 * @returns {string}
 */
function decodeSubType(primaryType, subType) {
    const subTypeMapping = typeSubTypeMapping[primaryType];
    const subTypeDesc = (subTypeMapping != null) ? subTypeMapping[subType] : null;
    return (subTypeDesc != null) ? subTypeDesc : `[${subType}] ??`;
}

function encodeSymbolEntry(offset, size, type, subType, name) {
    const entry = dungeonLabels.entryForAddress(offset);
    /** @type {string} */
    let label;
    if ((entry != null) && (entry.offset == offset)) {
        label = entry.name;
    } else {
        label = name.replace(/[^a-zA-Z\s]/g, "");
        label = label.split(/\s+/).map(word => {
            if (word.length == 0) {
                return "";
            }
            const lc = word.toLowerCase();
            return lc.at(0).toUpperCase() + (lc.length > 1 ? lc.substring(1) : "");
        }).join("");
        if (label == "") {
            label = "Itm_" + toHex(offset, 4);
        }
    }

    const result = `rw  ${toHex(offset,4)},${toHex(size)}  ${label}   ; ${size} bytes: ${name}`;
    console.log(result);
    return result;
}

/**
 * @param {number} baseOffset offset of the item definition in memory
 * @param {Uint8Array} buffer bytes to decode
 * @param {number} startOffset offset to start decoding from
 *
 * @returns {[string, number]} string describing decoded item and ending offset
 */
function decodeItem(baseOffset, buffer, startOffset) {
    const itemData = buffer.subarray(startOffset == null ? 0 : startOffset);

    // Decode the item header
    const i0 = itemData.at(0);
    const primaryType = i0 & 7;
    const subType = (i0 & 0x78) >> 3;
    const held = (i0 & 0x80) != 0;

    const itemLength = itemData.at(1);
    const actionTriggers = itemData.at(2);
    const alignment = itemData.at(3);
    const weight = itemData.at(4);
    const dataOfs = itemData.at(5);

    // Decode the item name
    const name = decodeName(itemData.subarray(6, dataOfs - 1));

    const [effects, effectsLength] = decodeEffects(itemData.subarray(dataOfs, itemLength));
    const attrOffset = dataOfs + effectsLength;

    const attributes = decodeAttributes(itemData.subarray(attrOffset, itemLength), primaryType, subType);

    const symbolOffset = (baseOffset ? baseOffset : 0) + startOffset;
    const symbolEntry = encodeSymbolEntry(symbolOffset, itemLength, primaryType, subType, name)

    let decoded =
          `${name}\n`
        + `${symbolEntry}\n`
        + "\n"
        + "[Header]\n"
        // I0 - Item type
        + `  0: \$${toHex(i0, 2)}\n`
        + `        Held:         ${held}\n`
        + `        Primary type: ${primaryTypeDescs[primaryType]}\n`
        + `        Sub type:     ${decodeSubType(primaryType, subType)}\n`
        // I1 - Item length
        + `  1: \$${toHex(itemLength, 2)}\n`
        + `        Item length: ${itemLength} bytes)\n`
        // I2 - Action triggers
        + `  2: \$${toHex(actionTriggers, 2)}\n`
        + `        Action triggers:\n`
        + `          0000_0001: get   = ${(actionTriggers & 1) != 0}\n`
        + `          0000_0010: drop  = ${(actionTriggers & 2) != 0}\n`
        + `          0000_0100: use   = ${(actionTriggers & 4) != 0}\n`
        + `          0000_1000: unuse = ${(actionTriggers & 8) != 0}\n`
        + `          0001_0000: ??    = ${(actionTriggers & 16) != 0}\n`
        + `          0010_0000: NOP   = ${(actionTriggers & 32) != 0}\n`
        + `          0100_0000: NOP   = ${(actionTriggers & 64) != 0}\n`
        + `          1000_0000: NOP   = ${(actionTriggers & 128) != 0}\n`
        // I3 - Alignment requirement
        + `  3: \$${toHex(alignment, 2)}\n`
        + `        Alignment: \$${toHex(alignment, 2)} (${ub2sb(alignment)}) (<0 = good; 0 = neutral; >0 = evil)\n`
        // I4 - Item weight
        + `  4: \$${toHex(weight, 2)}\n`
        + `        Weight: ${weight}\n`
        // I5 - Attribute offset
        + `  5: \$${toHex(dataOfs, 2)}\n`
        + `        Attribute offset: ${dataOfs} bytes\n`
        + `        Name length: ${dataOfs - 6} bytes\n`
        + effects
        + attributes;

    return [ decoded, startOffset + itemLength ];
}

function decodeItems() {
    const [ buffer, baseOffset ] = parseHexText(itemDataInput.value, true);

    itemDataOutput.value = "";

    var num = 0;
    var decoded;
    var offset = 0;
    while (offset < buffer.length) {
        [decoded, offset] = decodeItem(baseOffset, buffer, offset);

        ++num;
        itemDataOutput.value += (num > 1 ? "\n\n" : "") + `Item # ${num}\n---\n` + decoded;
    }
}

/**
 * @param {string} inputStr
 * @param {boolean?} stripAddresses
 * @returns {[string, number]}
 */
function parseHexText(inputStr, stripAddresses) {
    let baseOffset = null;
    const decodedBytes = [];

    // Process each line separately
    for (var line of inputStr.split(/\r?\n/)) {
        if (stripAddresses) {
            const stripped = line.match(/^[0-9a-fA-F]+?:/);
            if (stripped != null) {
                const matchStr = stripped[0];
                line = line.substring(matchStr.length);

                if (baseOffset == null) {
                    baseOffset = Number.parseInt(matchStr.substring(0, matchStr.length - 1), 16) - decodedBytes.length;
                }
            }
        }

        // If a word is found containing a non-hex character, remove that word and the remainder of the line
        // (to allow pasting a hex dump)
        line = line.replace(/(?<=\s|^)[^\s]*[^0-9a-fA-F\s].*$/, "");

        // Remove whitespace
        line = line.replace(/\s+/g, "");

        // Remove everything after the first non-hex character (to allow pasting a hex dump)
        //line = line.replace(/[^0-9a-fA-F].*$/, "");

        if (line.length % 2 != 0) {
            throw new Error("Hex data length is odd. Please provide an even number of hex digits.");
        }

        for (var i = 0; i < line.length; i += 2) {
            const ch = line.substring(i, i + 2);
            decodedBytes[decodedBytes.length] = Number.parseInt(ch, 16);
        }
    }

    return [ new Uint8Array(decodedBytes), baseOffset ];
}



