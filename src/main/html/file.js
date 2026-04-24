
import { GameState } from "../js/GameState.js";
import { Parse } from "../js/Parse.js";
import { atari800Labels, disassemble, LabelCollection, SegmentCollection, SegmentEntry } from "../js/Disasm6502.js";
import { ResourceMeta } from "../js/ResourceManager.js";

// 720 sectors total
const xfdLength = 0x16800;
const atrLength = 0x16810;
const dungeonFileIdVerifyMask = 0xE000;
const dungeonFileIdVerifyCode = 0x4000;
const dungeonFileIdSectorMask = 0x03ff;

/** @type {RgbPalette} */
let palette;

/** @type {LabelCollection} */
let dungeonLabels;

/**
 * @typedef {{
 *   id: number;
 *   description: string;
 *   startSector: number?;
 *   keySector: number?;
 *   key: string?;
 *   length: number?;
 *   type: ("binary" | "directory" | "map" | "texture" | "image-2bpp" | "image-1bpp" | "charset-2bpp" | "charset-1bpp" | "song")?;
 *   width: number?;
 *   hscale: number?;
 *   labels: ResourceMeta[];
 *   segments: SegmentCollection;
 * }} FileEntry
 *
 * @type {{ [diskPath:string] : FileEntry[] }}
 */
const files = {
    // $4000 | ((Disk-1)<<11) | ((Side-1)<<10) | Sector (10 bits)
    // D1S1 base = $4000 + 0 + 0

    // width (image [pixels]/charset [characters])
    // startSector, length, segments (for disassembly)
    // keySector (if set, normal encryption mode), key (alternative to keySector, custom encryption mode)

    "../AR/dungeon/disks/Dungeon11.xfd": [
        { id: 0x0001, description: "D1S1 S001 - Boot Sector", startSector:1, length: 0x80, segments: 0x600,
            labels: "Dungeon11-S001.sym" },
        { id: 0x0002, description: "D1S1 S002 - File Directory", startSector:2, length: 0x200, type:"directory",
            labels: "Dungeon11-S002.sym",
            segments: [{ start: 0x280, rawBytes: true }] },
        { id: 0x0006, description: "D1S1 S006 - Boot Screen", startSector:6, length: 0x280,
            segments: [{ start: 0xbd80, rawBytes: true }] },
        { id: 0x000B, description: "D1S1 S011 - Alternate Boot Screen", startSector:11, length: 0x280,
            segments: [{ start: 0xbd80, rawBytes: true }] },

        { id: 0x0002, description: "D1S1 S014 - Secondary Boot", startSector:14, length: 0x100,
            labels: "Dungeon11-S014.sym",
            segments: [{ size: 0x100, start: 0x600, name: "SEG_0600" }] },

        //{ id: 0x0010, description: "D1S1 S016 - Secondary Boot", startSector:16, length: 0x880 },
        //{ id: 0x0021, description: "D1S1 S033 - Game Intro Sequence", startSector:33, length: 0x7000 },
        { id: 0x0010, description: "D1S1 S016 - Game Intro Sequence", startSector:16, length: 0x7880,
            labels: "Dungeon11-S016.sym",
            segments: [
                { size: 0x0080, start: 0xbc00, name: "SEG_BC00" }, // Loader code (read & executed at boot)
                { size: 0x2000, start: 0x0600, name: "SEG_0600" },
                { size: 0x2000, start: 0x6300, name: "SEG_6300" },
                { size: 0x4C00, start: 0x2000, name: "SEG_2000" }
             ]},
        { id: 0x00CD, description: "D1S1 S205 - Kernel Loader", startSector:205, length: 0xA00, segments: [
            { size: 0x0A00, start: 0x8000, name: "SEG_8000" }
                //{ size: 0x0223, start: 0x8000, name: "SEG_8000" },
                //{ size: 0x0700, start: 0xF900, name: "SEG_F900" },
                //{ size: 0x00DD, start: 0x8923, name: "SEG_8923" }
            ]},
        { id: 0x00E1, description: "D1S1 S225 - Unknown 2", startSector:225, length: 0x1080, segments: 0x1E00 },
        { id: 0x4102, description: "D1S1 S259 - Load Character", segments: 0x7600 }, // length = 0x1A00 (6656)
        { id: 0x4137, description: "D1S1 S312 - Transfer City Character", segments: 0x7600 }, // length = 0x2000 (8192)
        { id: 0x4178, description: "D1S1 S377 - Character Creation Image", type: "charset-2bpp", segments: 0x9800 }, // length = 0x2500 (9472)
        { id: 0x41C3, description: "D1S1 S452 - Character Death", segments: 0x7600 }, // length = 0x700 (1792)
        { id: 0x41D2, description: "D1S1 S467 - Save Character", segments: 0x7600 }, // length = 0x600 (1536)
        { id: 0x01DF, description: "D1S1 S479 - Unknown 3", startSector: 479, length: 128, key: "41d50b120b41336d3a1f4ed4d453a87a" },
        { id: 0x41E0, description: "D1S1 S481 - Blank Character Data", segments: 0x6300 }, // length = 0x1200 (4608)
        { id: 0x4205, description: "D1S1 S518 - Game Kernel", segments: 0x1400 }, // length = 0x4F00 (20224)
        { id: 0x42A4, description: "D1S1 S677 - Copy Protection Check", segments: 0x9000 }, // length = 0x100 (256)
        { id: 0x42A7, description: "D1S1 S680 - Copy Protection Check (char save)", segments: 0x9000 }, // length = 0x100 (256)
        { id: 0x02AA, description: "D1S1 S682 - Unused space", length: 0x1380 } // length = 0x1380 (4992)
/*
Entry  14: [4021 0070] D1 S1: sector= 33 [021], length=28672
Entry  25: [4102 001a] D1 S1: sector=258 [102], length=6656
Entry  34: [4137 0020] D1 S1: sector=311 [137], length=8192
Entry  42: [4178 0025] D1 S1: sector=376 [178], length=9472
Entry  47: [41c3 0007] D1 S1: sector=451 [1c3], length=1792
Entry  49: [41d2 0006] D1 S1: sector=466 [1d2], length=1536
Entry  54: [41df 0000] D1 S1: sector=479 [1df], length=   0
  - 82 ab 16 24 16 82 66 da 74 3e 9c a9 a9 a6 51 f4 -> 41 d5 0b 12 0b 41 33 6d 3a 1f 4e d4 d4 53 a8 7a
Entry  59: [41e0 0012] D1 S1: sector=480 [1e0], length=4608
Entry  60: [4205 004f] D1 S1: sector=517 [205], length=20224
Entry  61: [42a4 0001] D1 S1: sector=676 [2a4], length= 256
Entry  62: [42a7 0001] D1 S1: sector=679 [2a7], length= 256
*/
    ],
    "../AR/dungeon/disks/Dungeon21.xfd": [
        { id: 0x0001, description: "D2S1 S001 - Disk Copy Utility", length: 0x480,
            segments: [
                { size: 0x003A, start: 0x279D },
                { size: 0x0446, start: 0xB7D7 }
            ]},
        { id: 0x480A, description: "D2S1 S011 - Map 0 (Level 1.1 NW)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x4833, description: "D2S1 S052 - Map 1 (Level 1.2 NW)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x485C, description: "D2S1 S093 - Map 2 (Level 1.3 NW)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x4885, description: "D2S1 S134 - Map 3 (Level 1.4 NW)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x48AE, description: "D2S1 S175 - Map 4 (Level 2)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x48D7, description: "D2S1 S216 - Map 5 (Level 3)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x4900, description: "D2S1 S257 - Map 6 (Level 4)", type: "map", segments: 0xAC00 }, // length = 0x1400 (5120)
        { id: 0x4929, description: "D2S1 S298 - Texture Set 1 (Normal)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x4955, description: "D2S1 S342 - Texture Set 2 (Mirror & Crystal)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x4981, description: "D2S1 S386 - Texture Set 3 (Dragon)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x49AD, description: "D2S1 S430 - Texture Set 4 (Goblin)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x49D9, description: "D2S1 S474 - Texture Set 5 (Mausoleum)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x4A05, description: "D2S1 S518 - Texture Set 6 (Alien)", type: "texture", segments: 0x96F0 }, // length = 0x1510 (5392) (incl 112 unused bytes 0x1580 (5504))
        // 112 bytes of the final sector of the texture are 0 and not part of the texture itself
        { id: 0x4A31, description: "D2S1 S562 - Unknown 1 (Executable loaded at $96F0)", type: "scenario", segments: 0x96F0 },
        { id: 0x4A3C, description: "D2S1 S573 - Unknown 2 (compass and arrows character sets)" },
        { id: 0x4A7F, description: "D2S1 S640 - Dungeon Exit (Executable loaded at $7600)", type: "scenario", segments: 0x7600 },
        { id: 0x4A8C, description: "D2S1 S653 - Stairway (Executable loaded at $7600)", type: "scenario", segments: 0x7600 },
        { id: 0x02B9, description: "D2S1 S697 - Unused space", length: 0xC00 } // length = 0xc00 (3072)
/*
Entry   1: [480a 0014] D2 S1: sector= 10 [00a], length=5120
Entry   2: [4833 0014] D2 S1: sector= 51 [033], length=5120
Entry   3: [485c 0014] D2 S1: sector= 92 [05c], length=5120
Entry   4: [4885 0014] D2 S1: sector=133 [085], length=5120
Entry   5: [48ae 0014] D2 S1: sector=174 [0ae], length=5120
Entry   6: [48d7 0014] D2 S1: sector=215 [0d7], length=5120
Entry   7: [4900 0014] D2 S1: sector=256 [100], length=5120
Entry   8: [4929 1015] D2 S1: sector=297 [129], length=5392
Entry   9: [4955 1015] D2 S1: sector=341 [155], length=5392
Entry  10: [4981 1015] D2 S1: sector=385 [181], length=5392
Entry  11: [49ad 1015] D2 S1: sector=429 [1ad], length=5392
Entry  12: [49d9 1015] D2 S1: sector=473 [1d9], length=5392
Entry  13: [4a05 1015] D2 S1: sector=517 [205], length=5392
Entry  15: [4a31 0005] D2 S1: sector=561 [231], length=1280
Entry  16: [4a3c f020] D2 S1: sector=572 [23c], length=8432
Entry  20: [4a7f 0006] D2 S1: sector=639 [27f], length=1536
Entry  21: [4a8c 0016] D2 S1: sector=652 [28c], length=5632
*/
    ],
    "../AR/dungeon/disks/Dungeon22.xfd": [
        { id: 0x4C01, description: "D2S2 S002 - Fountain", type: "scenario", segments: 0x7600 }, // length = 0x1100 (4352)
        { id: 0x4C24, description: "D2S2 S037 - Chapel", type: "scenario", segments: 0x7600 }, // length = 0x1C00 (7168)
        { id: 0x4C5D, description: "D2S2 S094 - Sphinx", type: "scenario", segments: 0x7600 }, // length = 0x1400 (5120)
        { id: 0x4C86, description: "D2S2 S135 - Ferryman", type: "scenario", segments: 0x7600 }, // length = 0x1000 (4096)
        { id: 0x4CA7, description: "D2S2 S168 - Clothes Horse", type: "scenario", segments: 0x7600 }, // length = 0xF00 (3840)
        { id: 0x4CC6, description: "D2S2 S199 - Dwarven Smithy", type: "scenario", segments: 0x7600 }, // length = 0x2000 (8192)
        { id: 0x4D07, description: "D2S2 S264 - Brewery", type: "scenario", segments: 0x7600 }, // length = 0x2200 (8704)
        { id: 0x4D4C, description: "D2S2 S333 - Crypt", type: "scenario", segments: 0x7600 }, // length = 0x1000 (4096)
        { id: 0x4D6D, description: "D2S2 S366 - Dragon", type: "scenario", segments: 0x7600 }, // length = 0x1500 (5376)
        { id: 0x4D98, description: "D2S2 S409 - Death's Door", type: "scenario", segments: 0x7600 }, // length = 0xB00 (2816)
        { id: 0x4DAF, description: "D2S2 S432 - Machine Room", type: "scenario", segments: 0x7600 }, // length = 0x1F00 (7936)
        { id: 0x4DEE, description: "D2S2 S495 - Elevator", type: "scenario", segments: 0x7600 }, // length = 0x700 (1792)
        { id: 0x4DFD, description: "D2S2 S510 - Unknown 1" }, // length = 0x400 (1024)
        { id: 0x4E06, description: "D2S2 S519 - Unknown 2 (charset image)", segments: 0x1000 }, // length = 0x880 (2176)
        { id: 0x4E18, description: "D2S2 S537 - Unknown 3", segments: 0x96F0 }, // length = 0x500 (1280)
        { id: 0x0223, description: "D2S2 S547 - Unknown 4 / Unused space", length: 0x2180 }, // length = 0x2180 (8576)
        { id: 0x0266, description: "D2S2 S614 - Unused space 2", length: 0x3580 }, // length = 0x3580 (13696)
        /*
Entry  19: [4c01 0011] D2 S2: sector=  1 [001], length=4352
Entry  26: [4c24 001c] D2 S2: sector= 36 [024], length=7168
Entry  30: [4c5d 0014] D2 S2: sector= 93 [05d], length=5120
Entry  35: [4c86 0010] D2 S2: sector=134 [086], length=4096
Entry  36: [4ca7 000f] D2 S2: sector=167 [0a7], length=3840
Entry  37: [4cc6 0020] D2 S2: sector=198 [0c6], length=8192
Entry  38: [4d07 0022] D2 S2: sector=263 [107], length=8704
Entry  39: [4d4c 0010] D2 S2: sector=332 [14c], length=4096
Entry  40: [4d6d 0015] D2 S2: sector=365 [16d], length=5376
Entry  41: [4d98 000b] D2 S2: sector=408 [198], length=2816
Entry  43: [4daf 001f] D2 S2: sector=431 [1af], length=7936
Entry  44: [4dee 0007] D2 S2: sector=494 [1ee], length=1792
Entry  48: [4dfd 0004] D2 S2: sector=509 [1fd], length=1024
Entry  50: [4e06 8008] D2 S2: sector=518 [206], length=2176
Entry  66: [4e18 0005] D2 S2: sector=536 [218], length=1280
*/
    ],
    "../AR/dungeon/disks/Dungeon31.xfd": [
        { id: 0x5001, description: "D3S1 S002 - Combat Data", segments: 0x7600 }, // length = 0x3800 (14336)
        { id: 0x5072, description: "D3S1 S115 - Item Data", segments: 0x7600 }, // length = 0x2A00 (10752)
        { id: 0x50C7, description: "D3S1 S200 - Inn", segments: 0x7600 }, // length = 0x1200 (4608)
        { id: 0x00EC, description: "D3S1 S236 - Encounters Data", startSector: 0xEC, length: 0xB080,
            key: "00000000000000000000000000000000",
            segments: [
                // Note: Each segment should point at the start of a monster entry.
                //    Each entry is a variable length.
                //    Only one monster type needs to be loaded at any given time.
                { start: 0xAA00, size: 0x1000, name: "MONST01_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST02_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST03_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST04_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST05_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST06_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST07_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST08_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST09_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST10_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST11_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST12_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST13_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST14_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST15_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST16_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST17_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST18_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST19_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST20_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST21_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST22_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST23_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST24_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST25_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST26_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST27_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST28_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST29_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST30_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST31_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST32_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST33_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST34_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST35_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST36_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST37_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST38_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST39_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST40_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST41_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST42_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST43_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST44_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST45_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST46_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST47_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST48_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST49_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST50_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST51_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST52_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST53_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST54_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST55_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST56_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST57_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST58_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST59_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST60_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST61_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST62_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST63_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST64_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST65_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST66_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST67_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST68_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST69_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST70_AA00" },
                { start: 0xAA00, size: 0x1000, name: "MONST71_AA00" },
                { start: 0x0100, size: 0x00FF, name: "REST_0100" }
            ] }, // length = 0xB000 ()
        { id: 0x524D, description: "D3S1 S590 - Dead Song", type: "song", segments: 0x7600 }, // length = 0x700 (1792)
        { id: 0x525C, description: "D3S1 S605 - Location Names", segments: 0x7600 }, // length = 0x2100 (8448)
        { id: 0x529F, description: "D3S1 S672 - Unknown 2", segments: 0x96F0 }, // length = 0x500 (1280)
        { id: 0x02AA, description: "D3S1 S682 - Unused space", length: 0x1380 } // length = 0x1380 (4992)
/*
Entry   0: [1007 0304] D3 S1: sector=  7 [007], length=1027

Entry  17: [5001 0038] D3 S1: sector=  1 [001], length=14336
Entry  18: [5072 002a] D3 S1: sector=114 [072], length=10752
Entry  31: [50c7 0012] D3 S1: sector=199 [0c7], length=4608
Entry  46: [50ec 00b0] D3 S1: sector=236 [0ec], length=45056
Entry  53: [524d 0007] D3 S1: sector=589 [24d], length=1792
Entry  63: [525c f020] D3 S1: sector=604 [25c], length=8432
Entry  67: [529f 0005] D3 S1: sector=671 [29f], length=1280
*/
    ],
    "../AR/dungeon/disks/Dungeon32.xfd": [
        { id: 0x5401, description: "D3S2 S002 - Grahm's Gold Exchange Vault", type: "scenario", segments: 0x7600 }, // length = 0x1000 (4096)
        { id: 0x5422, description: "D3S2 S035 - Goblin Troll", type: "scenario", segments: 0x7600 }, // length = 0x1C00 (7168)
        { id: 0x545B, description: "D3S2 S092 - Acrinimiril's Tomb", type: "scenario", segments: 0x7600 }, // length = 0x1100 (4352)
        { id: 0x547E, description: "D3S2 S127 - Ozob", type: "scenario", segments: 0x7600 }, // length = 0x1C00 (7168)
        { id: 0x54B7, description: "D3S2 S184 - Guild", type: "scenario", segments: 0x7600 }, // length = 0x2700 (9984)
        { id: 0x5506, description: "D3S2 S263 - Shop", type: "scenario", segments: 0x7600 }, // length = 0x2000 (8192)
        { id: 0x5547, description: "D3S2 S328 - Oracle", type: "scenario", segments: 0x7600 }, // length = 0x1B00 (6912)
        { id: 0x557E, description: "D3S2 S383 - Enchantress", type: "scenario", segments: 0x7600 }, // length = 0x1800 (6144)
        { id: 0x55AF, description: "D3S2 S432 - Tavern", type: "scenario", segments: 0x7600 }, // length = 0x1F00 (7936)
        { id: 0x55EE, description: "D3S2 S495 - Picture 7", type: "charset-2bpp", segments: 0x96F0 }, // length = 0x780 (1920)
        { id: 0x55FE, description: "D3S2 S511 - Picture 8", type: "charset-2bpp", segments: 0x890B }, // length = 0x780 (1920)
        { id: 0x560E, description: "D3S2 S527 - Tavern Monster Song", type: "song", segments: 0x8A00 }, // length = 0xD00 (3328)
        { id: 0x5629, description: "D3S2 S554 - Devourer Song", type: "song", segments: 0x8A00 }, // length = 0x600 (1536)
        { id: 0x5636, description: "D3S2 S567 - Unknown Song", type: "song", segments: 0x8A00 }, // length = 0x400 (1024)
        { id: 0x563F, description: "D3S2 S576 - Tavern Talk", segments: 0x9EF0 }, // length = 0x1700 (5888)
        { id: 0x566E, description: "D3S2 S623 - Lost Song", type: "song", segments: 0x9FF0 }, // length = 0x1000 (4096)
        { id: 0x568F, description: "D3S2 S656 - Blackheart Song", type: "song", segments: 0x9FF0 }, // length = 0xE00 (3584)
        { id: 0x56AC, description: "D3S2 S685 - Unknown 5", segments: 0x96F0 }, // length = 0x500 (1280)
        { id: 0x02B7, description: "D3S2 S695 - Unused space / Unknown 6", length: 0x180 }, // length = 0x180 (384)
        { id: 0x02BA, description: "D3S2 S698 - Unused space", length: 0xB80 } // length = 0xB80 (2944)
/*
Entry  22: [5401 0010] D3 S2: sector=  1 [001], length=4096
Entry  23: [5422 001c] D3 S2: sector= 34 [022], length=7168
Entry  24: [545b 0011] D3 S2: sector= 91 [05b], length=4352
Entry  27: [547e 001c] D3 S2: sector=126 [07e], length=7168
Entry  28: [54b7 0027] D3 S2: sector=183 [0b7], length=9984
Entry  29: [5506 0020] D3 S2: sector=262 [106], length=8192
Entry  32: [5547 001b] D3 S2: sector=327 [147], length=6912
Entry  33: [557e 0018] D3 S2: sector=382 [17e], length=6144
Entry  45: [55af 001f] D3 S2: sector=431 [1af], length=7936
Entry  51: [55ee 8007] D3 S2: sector=494 [1ee], length=1920
Entry  52: [55fe 8007] D3 S2: sector=510 [1fe], length=1920
Entry  55: [560e 000d] D3 S2: sector=526 [20e], length=3328
Entry  56: [5629 0006] D3 S2: sector=553 [229], length=1536
Entry  57: [5636 0004] D3 S2: sector=566 [236], length=1024
Entry  58: [563f 0017] D3 S2: sector=575 [23f], length=5888
Entry  64: [566e 0010] D3 S2: sector=622 [26e], length=4096
Entry  65: [568f 000e] D3 S2: sector=655 [28f], length=3584
Entry  68: [56ac 0005] D3 S2: sector=684 [2ac], length=1280
*/
    ]
};

// Post-process to expand abbreviated segment definitions
Object.entries(files).forEach(([diskUrl, value]) => {
    value.forEach((fileDetails) => {
        if (fileDetails.labels == null) {
            fileDetails.labels = [];
        } else if (!Array.isArray(fileDetails.labels)) {
            fileDetails.labels = [ fileDetails.labels ];
        }
        Parse.withBaseUrl(diskUrl, () => {
            fileDetails.labels.unshift("Dungeon.sym");

            fileDetails.labels =
                fileDetails.labels.map((entry) => {
                    return new ResourceMeta(Parse.url(entry), "text/plain");
                });
        });

        if (fileDetails.segments != null) {
            if (!isNaN(fileDetails.segments)) {
                const size = fileDetails.length;
                const start = Number(fileDetails.segments);
                const name = 'SEG_' + leftPad(start.toString(16), 4, '0');

                // Expand shorthand
                fileDetails.segments = [new SegmentEntry({ offset: 0, size, start, name })];
            } else {
                let curOfs = 0;
                let remaining = fileDetails.length;

                fileDetails.segments = new SegmentCollection(...fileDetails.segments.map((segment) => {
                    if (segment.offset == null) {
                        segment.offset = curOfs;
                    }
                    if (segment.size == null) {
                        segment.size = remaining;
                    } else {
                        if (remaining != null) {
                            remaining -= segment.size;
                        }
                        curOfs += segment.size;
                    }

                    return (segment instanceof SegmentEntry ? segment : new SegmentEntry(segment));
                }));
            }
        }
    });
});

console.log("files: ", files);


/** @type {HTMLSelectElement} */
const fileSelect = document.getElementById("fileSelect");
/** @type {HTMLSelectElement} */
const segmentSelect = document.getElementById("segmentSelect");
/** @type {HTMLInputElement} */
const loadButton = document.getElementById("loadButton");

/** @type {HTMLSelectElement} */
const diskSelect = document.getElementById("diskSelect");
/** @type {HTMLInputElement} */
const sectorInput = document.getElementById("sectorInput");
/** @type {HTMLInputElement} */
const lengthInput = document.getElementById("lengthInput");
/** @type {HTMLSelectElement} */
const decryptSelect = document.getElementById("decryptSelect");
/** @type {HTMLLabelElement} */
const keySectorLabel = document.getElementById("keySectorLabel");
/** @type {HTMLInputElement} */
const keySectorInput = document.getElementById("keySectorInput");
/** @type {HTMLInputElement} */
const customKeyInput = document.getElementById("customKeyInput");
/** @type {HTMLLabelElement} */
const customKeyLabel = document.getElementById("customKeyLabel");

/** @type {HTMLInputElement} */
const checksumOffsetInput = document.getElementById("checksumOffsetInput");
/** @type {HTMLInputElement} */
const checksumLengthInput = document.getElementById("checksumLengthInput");
/** @type {HTMLInputElement} */
const saveButton = document.getElementById("saveButton");

/** @type {HTMLSelectElement} */
const imageTypeSelect = document.getElementById("imageTypeSelect");
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

/** @type {HTMLInputElement} */
const byteOutputOffsetInput = document.getElementById("byteOutputOffset");
/** @type {HTMLInputElement} */
const byteOutputLengthInput = document.getElementById("byteOutputLength");
/** @type {HTMLSelectElement} */
const dumpModeSelect = document.getElementById("dumpModeSelect");
/** @type {HTMLInputElement} */
const byteOutputColumnsInput = document.getElementById("byteOutputColumns");
/** @type {HTMLSelectElement} */
const byteOutputRadixSelect = document.getElementById("byteOutputRadix");
/** @type {HTMLInputElement} */
const segmentStartInput = document.getElementById("segmentStartInput");
/** @type {HTMLSelectElement} */
const disassembleTypeSelect = document.getElementById("disassembleTypeSelect");

/** @type {HTMLInputElement} */
const crackInput = document.getElementById("crackInput");


document.addEventListener("DOMContentLoaded", () => {
    loadPalette("../AR/shared/Atari800Palette-Altirra310NTSC.pal").then((p) => {
        palette = p;
        console.log("Loaded palette: ", palette)
    });

    diskSelect.addEventListener("change", (evt) => {
        while (fileSelect.firstChild) {
            fileSelect.removeChild(fileSelect.firstChild);
        }

        const fileList = files[diskSelect.value];
        fileList.forEach((fileDetails, index) => {
            fileSelect.appendChild(new Option(fileDetails.description, index));
        });

        fileSelect.dispatchEvent(new Event("change"));
    });
    diskSelect.dispatchEvent(new Event("change"));

    const updateChecksumDisplay = (evt) => {
        const offset = Number(checksumOffsetInput.value);
        const length = (checksumLengthInput.value.trim() != "") ? Number(checksumLengthInput.value) : undefined;
        const checksum = computeChecksum(getFileData(), offset, length);
        document.getElementById("checksum").innerText = `${leftPad(checksum.toString(16), 4, '0')} (${checksum})`;
    };
    checksumOffsetInput.addEventListener('change', updateChecksumDisplay);
    checksumLengthInput.addEventListener('change', updateChecksumDisplay);

    fileSelect.addEventListener('change', (evt) => {
        const diskName = diskSelect.value;
        const index = fileSelect.value;
        const fileDetails = files[diskName][index];

        lengthInput.value = (fileDetails.length != null) ? fileDetails.length : "";

        if (fileDetails.key != null) {
            decryptSelect.value = "custom";
            customKeyInput.value = fileDetails.key;
            keySectorInput.value = "";
        } else if (fileDetails.keySector == null) {
            decryptSelect.value = ((fileDetails.id & 0xC000) > 0) ? "normal" : "raw";

            customKeyInput.value = "";
            if (decryptSelect.value == "normal") {
                keySectorInput.value = (fileDetails.id & dungeonFileIdSectorMask);
            } else {
                keySectorInput.value = "";
            }
        } else {
            decryptSelect.value = "normal";
        }

        if (fileDetails.startSector != null) {
            sectorInput.value = Number(fileDetails.startSector);
        } else if (decryptSelect.value == "normal") {
            sectorInput.value = Number(keySectorInput.value) + 1;
        } else {
            sectorInput.value = (fileDetails.id & dungeonFileIdSectorMask);
        }

        decryptSelect.dispatchEvent(new Event("change"));
    });
    fileSelect.dispatchEvent(new Event("change"));

    decryptSelect.addEventListener("change", (evt) => {
        switch (decryptSelect.value) {
            case "normal":
                keySectorLabel.style.display = "inline";
                customKeyLabel.style.display = "none";
                break;
            case "custom":
                keySectorLabel.style.display = "none";
                customKeyLabel.style.display = "inline";
                break;
            case "raw":
                keySectorLabel.style.display = "none";
                customKeyLabel.style.display = "none";
                break;
        }
    });

    loadButton.addEventListener("click", (evt) => {
        const diskName = diskSelect.value;
        const index = fileSelect.value;
        console.log("Load file: disk=", diskName, " index=", index);

        const fileDetails = Object.assign({}, files[diskName][index]);
        fileDetails.startSector = Number(sectorInput.value);
        fileDetails.keySector = (decryptSelect.value == "normal") ? Number(keySectorInput.value) : undefined;
        fileDetails.key = (decryptSelect.value == "custom") ? parseCustomKey(customKeyInput) : undefined;
        fileDetails.length = (lengthInput.value.trim() != "") ? Number(lengthInput.value) : undefined;

        console.log("fileDetails=", fileDetails);

        /** @type {object[]} */
        const segments = (fileDetails.segments != null) ? fileDetails.segments.slice() : [new SegmentEntry()];

        console.log("segments:", segments);
        segmentSelect.options.length = 0;

        if (segments.length != 1) {
            const option = new Option("All", JSON.stringify(segments));
            segmentSelect.options.add(option);
        }

        for (let segment of segments) {
            const option = new Option(segment.toString(), JSON.stringify([segment]));
            segmentSelect.options.add(option);
        }

        segmentSelect.selectedIndex = 0;
        segmentSelect.dispatchEvent(new Event("change"));

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

    imageTypeSelect.addEventListener("change", (evt) => {
        if (imageTypeSelect.value == "texture") {
            startOffsetInput.disabled = true;
            widthInput.disabled = true;
        } else {
            startOffsetInput.disabled = false;
            widthInput.disabled = false;
        }
        startOffsetInput.labels.forEach((label) => {
            label.style.color = startOffsetInput.disabled ? "gray" : "black";
        });
        widthInput.labels.forEach((label) => {
            label.style.color = widthInput.disabled ? "gray" : "black";
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

    segmentSelect.addEventListener('change', (evt) => {
        const length = getFileData().length;

        /** @type {SegmentCollection} */
        const segments = getSelectedSegments(length);

        if (segments.length == 1) {
            const segment = segments[0];
            segmentStartInput.value = (segment.start == null ? "" : "0x" + segment.start.toString(16));
            disassembleTypeSelect.value = (segment.rawBytes ? "raw" : "exe");
            byteOutputOffsetInput.value = (segment.offset == null ? 0 : "0x" + segment.offset.toString(16));
            byteOutputLengthInput.value = (segment.size == null ? "" : "0x" + segment.size.toString(16));
        } else {
            byteOutputOffsetInput.value = 0;
            byteOutputLengthInput.value = "0x" + length.toString(16);
            segmentStartInput.value = "";
        }

        dumpModeSelect.dispatchEvent(new Event('change'));
    });

    const updateByteDumpOnChange = (evt) => { outputByteCodes(getFileData()); };
    byteOutputOffsetInput.addEventListener('change', updateByteDumpOnChange);
    byteOutputLengthInput.addEventListener('change', updateByteDumpOnChange);
    byteOutputColumnsInput.addEventListener('change', updateByteDumpOnChange);
    byteOutputRadixSelect.addEventListener('change', updateByteDumpOnChange);
    dumpModeSelect.addEventListener('change', (evt) => {
        switch (dumpModeSelect.value) {
        case "dump":
            dumpOptions.style.display = 'inline';
            dissassembleOptions.style.display = 'none';

            break;

        case "disassemble":
            dumpOptions.style.display = 'none';
            dissassembleOptions.style.display = 'inline';
            break;
        }

        updateByteDumpOnChange(evt);
    });
    segmentStartInput.addEventListener('change', updateByteDumpOnChange);
    disassembleTypeSelect.addEventListener('change', updateByteDumpOnChange);

    document.getElementById("tryCrackButton").addEventListener("click", (evt) => {
        const key = parseCustomKey(crackInput);

        const cracked = new Uint8Array(key.length);
        for (let i = 0; i < key.length; ++i) {
            const b = key[i];
            cracked[i] = ((b & 1) << 7) | ((b & 0xff) >>> 1);
        }

        document.getElementById("crackedKey").innerText = dumpBytesRaw(cracked);
    });

});

/**
 *
 * @param {HTMLInputElement} input
 * @returns
 */
function parseCustomKey(input) {
    input.value = input.value.replace(/\s+/g, "");
    const val = input.value;

    if (val.length != 32) {
        throw new Error("Invalid key length " + val.length + ". The key must contain exactly 32 hex digits (16 bytes).");
    }

    const result = new Uint8Array(16);
    for (let i = 0; i < 16; ++i) {
        result[i] = Number.parseInt(val.substring(i * 2, i * 2 + 2), 16);
        if (isNaN(result[i])) {
            throw new Error("Unable to parse key at byte " + i);
        }
    }

    return result;
}

/**
 * Decodes a file
 *
 * No decryption is performed if neither keySector nor key are provided.
 *
 * @param {Uint8Array} diskBuffer buffer containing the disk data
 * @param {number} startSector starting sector for the file data
 * @param {number} length file length in bytes
 * @param {Uint8Array} key key bytes to use for decryption. If not provided, no decryption is performed
 *
 * @return {Uint8Array} the decoded file bytes
 */
function decodeDungeonFile(diskBuffer, startSector, length, key) {
    console.log(`Decoding file: startSector=${startSector} length=${length} key=${key != null ? dumpBytesRaw(key) : undefined}`);
    const ofs = ((startSector - 1) * 128);

    if (key == null) {
        // Return raw bytes
        return diskBuffer.subarray(ofs, ofs + length);
    }

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

        d = d ^ key[j];

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
 * @param {number=} keySector sector containing the key data. Ignored if key is provided.
 * @param {Uint8Array=} key key bytes to use for decryption.
 *
 * @return {Uint8Array} the decoded file bytes
 */
function decodeDungeonFileUsingKey(diskBuffer, fileId, startSector, length, keySector, key) {
    if (startSector == null && keySector == null) {
        keySector = (fileId & 0x4000 > 0) ? fileId & dungeonFileIdSectorMask : undefined;
    }

    if (keySector <= 0) {
        throw new Error("Key sector must be greater than 0") // sector is 1 based
    }

    if (key == null && keySector != null) {
        const ofs = ((keySector - 1) * 128);
        key = diskBuffer.subarray(ofs, ofs + 16);
    }

    if (key != null) {
        // check extraction key
        const extractedFileId = key[0] * 256 + key[1];
        if (extractedFileId != fileId) {
            console.warn(`File ID does not match (expected ${leftPad(fileId.toString(16), 4, '0')}, ` +
                `read ${leftPad(extractedFileId.toString(16), 4, '0')})`);
        }

        if (length == null) {
            // determine length
            length = key[2] + (256 * key[3]);
        }
    }

    if (startSector == null) {
        if (keySector != null) {
            startSector = keySector - 1;
        } else {
            throw new Error("One or both of keySector or startSector must be provided.");
        }
    }

    if (startSector <= 0) {
        throw new Error("Start sector must be greater than 0") // sector is 1 based
    }

    const fileBytes = decodeDungeonFile(diskBuffer, startSector, length, key);

    if (key != null) {
        const checkSum = computeChecksum(fileBytes);
        const checkSumLo = checkSum & 0xff;
        const checkSumHi = (checkSum >> 8) & 0xff;

        if ((checkSumLo != key[4]) || (checkSumHi != key[5])) {
            console.warn(`Checksum of file does not match ([${checkSumLo} ${checkSumHi}] != [${key[4]} ${key[5]}])`);
        }
    }

    return fileBytes;
}

/**
 * Computes a 16 bit checksum of the specified bytes.
 *
 * @param {Uint8Array} bytes
 * @param {number=} offset offset within the specified bytes to start computing the checksum. Default is 0 if not
 *        provided.
 * @param {number=} length number of bytes to compute the checksum for. Default is all bytes from specified offset
 *        to the end of the buffer.
 */
function computeChecksum(bytes, offset, length) {
    if (offset == null) {
        offset = 0;
    }

    if (length == null) {
        length = bytes.length - offset;
    }

    let checkSum = 0;

    for (let i = 0; i < length; i++) {
        checkSum += bytes[offset + i];
    }

    return checkSum & 0xffff;
}

/**
 *
 * @param {Uint8Array} fileData
 */
function outputBase64(fileData) {
    /** @type {HTMLTextAreaElement} */
    const outputInput = document.getElementById("base64Output");
    outputInput.value = fileData.toBase64();
}

function getSelectedOutputLength(bufferLength) {
    bufferLength = (bufferLength == null ? getFileData().length : Number.parseInt(bufferLength));
    let length = byteOutputLengthInput.value;
    length = (length == "" ? bufferLength - Number.parseInt(byteOutputOffsetInput.value) : Number.parseInt(length));
    return length;
}

function getSelectedSegments(length) {
    let remaining = length;
    let curOfs = 0;

    const segments = new SegmentCollection(...JSON.parse(segmentSelect.value).map((segment) => {
            if (segment.offset == null) {
                segment.offset = curOfs;
            }
            if (segment.size == null) {
                segment.size = remaining;
            } else {
                remaining -= segment.size;
                curOfs += segment.size;
            }

            return new SegmentEntry(segment);
        }));
    segments.optimize();

    console.log("Selected segments: ", segments);

    return segments;
}

/**
 *
 * @param {Uint8Array} bytes the buffer containing the bytes to output
 */
function outputByteCodes(bytes) {
    /** @type {HTMLTextAreaElement} */
    const outputInput = document.getElementById("byteOutput");
    const offset = Number(byteOutputOffsetInput.value);
    const bytesPerRow = Number(byteOutputColumnsInput.value);
    const radix = Number(byteOutputRadixSelect.value);

    const length = getSelectedOutputLength(bytes.length);

    if (dumpModeSelect.value == "disassemble") {
        const segments = (segmentStartInput.value == ""
            ? getSelectedSegments(length)
            : new SegmentCollection(new SegmentEntry({
                offset: offset,
                size: length,
                start: Number.parseInt(segmentStartInput.value),
                rawBytes: disassembleTypeSelect.value == "raw"
            })) );

        outputInput.value = disassemble(
            bytes.subarray(offset, offset + length),
            {
                labels: (disassembleTypeSelect.value == "exe-system") ? atari800Labels : dungeonLabels,
                baseOffset: offset,
                segments
            }
        );
    } else {
        outputInput.value = dumpBytes(bytes, offset, bytesPerRow, radix, length, 16);
    }
}

/**
 *
 * @param {Uint8Array} bytes the buffer containing the bytes to output
 * @param {number=} offset starting offset in the buffer. Default is 0.
 * @param {number=} rowSize number of bytes to display per row. Default is 16 bytes.
 * @param {number=} radix radix to display each byte code in. Default is 16 (hex).
 * @param {number=} length number of bytes to dump. Default is to dump from the specified
 *        offset to the end of the buffer.
 * @param {number=} offsetRadix radix to use to display the row offsets. Default is 16 (hex).
 */
function dumpBytes(bytes, offset = 0, rowSize = 16, radix = 16, length, offsetRadix = 16) {
    console.log("dump bytes: offset=" + offset + " rowSize=" + rowSize + " radix=" + radix + " length=" + length + " offsetRadix=" + offsetRadix);

    let value = "";
    let sep = "";
    if (length == null) {
        length = bytes.length - offset;
    }
    for (; offset < length; offset += rowSize) {
        value += sep + dumpBytesRow(bytes, offset, rowSize, radix, offsetRadix);
        sep = "\n";
    }
    return value;
}

/**
 *
 * @param {*} value the value to convert to string and pad.
 * @param {number} length length to pad to.
 * @param {string=} padChar character to use for padding. If not specified, the space character is used.
 * @returns {string} the padded string value.
 */
function leftPad(value, length, padChar) {
    value = String(value);

    if (value.length < length) {
        padChar = (padChar == null) ? " " : String(padChar);
        if (padChar.length == 0) {
            padChar = " ";
        } else if (padChar.length > 1) {
            padChar = padChar.substring(0, 1);
        }

        value = padChar.repeat(length - value.length) + value;
    }

    return value;
}

/**
 *
 * @param {Uint8Array} bytes the buffer containing the bytes to output
 * @param {number} offset starting offset in the buffer. Default is 0.
 * @param {number} rowSize number of bytes to display per row. Default is 16 bytes.
 * @param {number} radix radix to display each byte code in. Default is 16 (hex).
 * @param {number} offsetRadix radix to use to display the row offsets. Default is 16 (hex).
 */
function dumpBytesRow(bytes, offset, rowSize, radix, offsetRadix) {
    if (offsetRadix == null) {
        offsetRadix = 16;
    }
    const ofsColWidth = Number(65535).toString(offsetRadix).length;

    let endOffset = offset + rowSize;
    if (endOffset > bytes.length) {
        endOffset = bytes.length;
    }

    var value = leftPad(Number(offset).toString(offsetRadix), ofsColWidth, '0') + ": ";

    value += dumpBytesRaw(bytes, offset, rowSize, radix, " ");

    value += " |";

    for (let i = 0; i < rowSize; ++i) {
        const ofs = offset + i;
        if (ofs < endOffset) {
            const byte = bytes[ofs];
            if (byte >= 0x20 && byte <= 0x7f) {
                value += String.fromCharCode(byte);
            } else {
                value += ".";
            }
        } else {
            value += " ";
        }
    }

    value += "|";

    return value;
}

/**
 *
 * @param {Uint8Array} bytes buffer containing bytes to output.
 * @param {number} offset starting offset. Default is 0.
 * @param {number} length number of bytes to output. Default is until the end of the buffer.
 * @param {number} radix radix to display each byte code in. Default is 16 (hex).
 * @param {string} separator separator to use between bytes. Default is empty string.
 */
function dumpBytesRaw(bytes, offset, length, radix, separator) {
    if (offset == null) {
        offset = 0;
    }

    if (length == null) {
        length = bytes.length - offset;
    }

    if (radix == null) {
        radix = 16;
    }

    if (separator == null) {
        separator = "";
    }

    let endOffset = offset + length;
    if (endOffset > bytes.length) {
        endOffset = bytes.length;
    }

    const byteColWidth = Number(255).toString(radix).length;
    let value = "";

    for (let i = 0; i < length; ++i) {
        const ofs = offset + i;
        if (ofs < endOffset) {
            const byte = bytes[ofs].toString(radix);
            value += (i > 0 ? separator : "") + leftPad(byte, byteColWidth, '0');
        } else {
            value += (i > 0 ? separator : "") + " ".repeat(byteColWidth);
        }
    }

    return value;
}

/**
 *
 * @param {string} diskName
 * @param {FileEntry} fileDetails
 * @returns
 */
function handleExtractFile(diskName, fileDetails) {
    const diskSide = ((0x0400 & fileDetails.id) >> 10) + 1;
    const diskNumber = ((0x1800 & fileDetails.id) >> 11) + 1;

    const resourceManager = GameState.getResourceManager();

    const diskUrl = Parse.url(diskName);
    console.log("Selected file is on Disk " + diskNumber + " Side " + diskSide + ". Loading disk from " + diskUrl);

    const resources = [ diskUrl ];
    if (fileDetails.labels.length) {
        resources.push(...fileDetails.labels);
    }

    return resourceManager.load(...resources).then((loaded) => {
        let diskData = new Uint8Array(loaded[diskUrl].data);

        dungeonLabels = atari800Labels;
        for (let labels of fileDetails.labels) {
            dungeonLabels = new LabelCollection(dungeonLabels);
            dungeonLabels.source = String(labels.url);
            dungeonLabels.parse(loaded[dungeonLabels.source].data);
        }

        // check file length for .xfd or .atr file
        if (diskData.length == atrLength) {
            // Skip first 16 bytes for ATR files
            diskData = diskData.subarray(16);
        } else if (diskData.length != xfdLength) {
            console.error("Disk file length " + diskData.length + " does not match .xfd or .atr format ("
                + xfdLength + " or " + atrLength + ")");
            return;
        }

        console.log("Loaded disk:" + diskUrl);

        const fileData = decodeDungeonFileUsingKey(diskData,
            fileDetails.id, fileDetails.startSector, fileDetails.length,
            fileDetails.keySector, fileDetails.key
        );

        const fileName = document.getElementById("fileName");
        fileName.innerText = fileDetails.description;

        const fileInfo = document.getElementById("fileInfo");
        fileInfo.innerText = ` [${fileDetails.type || "binary"}] (${fileData.length} bytes)`;

        outputBase64(fileData);
        outputByteCodes(fileData);

        document.getElementById("fileId").innerText =
            `${leftPad(fileDetails.id.toString(16), 4, '0')} (${fileDetails.id})`;

        checksumOffsetInput.value = "0";
        checksumLengthInput.value = "";
        checksumOffsetInput.dispatchEvent(new Event("change"));

        switch (fileDetails.type) {
        case "texture":
        case "image-2bpp":
        case "image-1bpp":
        case "charset-2bpp":
        case "charset-1bpp":
            if (fileDetails.offset != null) {
                startOffsetInput.value = fileDetails.offset;
            }
            if (fileDetails.width != null) {
                widthInput.value = fileDetails.width;
            }

            imageTypeSelect.value = fileDetails.type;
            decodeImage(fileData);
            break;
        case "map":
            // TODO: Decode and display map?
            console.log("TODO: Decode and display map?");
           break;
        case "song":
            // TODO: Decode and play song?
            console.log("TODO: Decode and play song?");
            break;
        case "directory":
            decodeSegmentDirectory(fileData);
            break;
        default:
            // Nothing special, binary/unknown type
        }
    });
}

/**
 *
 * @returns {Uint8Array}
 */
function getFileData() {
    const outputInput = document.getElementById("base64Output");
    return Uint8Array.fromBase64(outputInput.value);
}

function decodeImage(fileData) {
    /** @type {HTMLCanvasElement} */
    const imageCanvas = document.getElementById("imageCanvas");
    const context = imageCanvas.getContext("2d");
    const imageData = context.createImageData(imageCanvas.width, imageCanvas.height);
    imageData.data.fill(0);

    const colors = getColors();

    const offset = Number(startOffsetInput.value);
    const width = Number(widthInput.value);

    if (imageTypeSelect.value == "texture") {
        decodeTextureSet(imageData, colors, fileData);
    } else if (imageTypeSelect.value == "charset-2bpp") {
        decodeCharsetImage(imageData, mode2bpp, 0, 0, colors, fileData, offset, width);
    } else if (imageTypeSelect.value == "charset-1bpp") {
        decodeCharsetImage(imageData, mode1bpp, 0, 0, colors, fileData, offset, width);
    } else if (imageTypeSelect.value == "image-2bpp") {
        decodeImageData(imageData, mode2bpp, 0, 0, colors, fileData, offset, width);
    } else if (imageTypeSelect.value == "image-1bpp") {
        decodeImageData(imageData, mode1bpp, 0, 0, colors, fileData, offset, width);
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
    decodeImageData(imageData, mode2bpp, xOffset,       yOffset,      colors, fileData, startOffset,        72, 72, 2);
    decodeImageData(imageData, mode2bpp, xOffset + 150, yOffset,      colors, fileData, startOffset + 1296, 36, 36, 2);
    decodeImageData(imageData, mode2bpp, xOffset + 150, yOffset + 40, colors, fileData, startOffset + 1620, 18, 18, 2);
}

/**
 * Pixel decoder which maps a byte using 1bpp encoding.
 * @param {number} byte the byte to decode to pixels.
 * @return {number[]} an 8 byte array of pixel values (0-1)
 */
function mode1bpp(byte) {
  return [
        ((byte >> 7) & 1),
        ((byte >> 6) & 1),
        ((byte >> 5) & 1),
        ((byte >> 4) & 1),
        ((byte >> 3) & 1),
        ((byte >> 2) & 1),
        ((byte >> 1) & 1),
        (byte & 1)
    ];
}

/**
 * Pixel decoder which maps a byte using 2bpp encoding.
 * @param {number} byte the byte to decode to pixels.
 * @return {number[]} a 4 byte array of pixel values (0-3)
 */
function mode2bpp(byte) {
  return [
        ((byte >> 6) & 3),
        ((byte >> 4) & 3),
        ((byte >> 2) & 3),
        (byte & 3)
    ];
}

function decodeCharsetImage(
    imageData, pixelDecoder, xOffset, yOffset, colors,
    fileData, startOffset, width
) {
    if (startOffset == null) {
        startOffset = 0;
    }
    if (width == null) {
        width = 32;
    }

    colors = colors.map((color) => palette.getRgbForColor(color));
    const outWidth = imageData.width;

    const pixelsPerByte = pixelDecoder(0).length;
    const hscale = (pixelsPerByte == 8) ? 1 : 2;

    let x = xOffset;
    let column = 0;
    let y = yOffset;

    for (let ofs = startOffset; ofs < fileData.length;) {
        // Render a character glyph
        for (let scanline = 0; scanline < 8; ++scanline) {
            const pixels = pixelDecoder(fileData[ofs]);

            let tx = x;
            for (let i = 0; i < pixels.length; ++i) {
                const rgb = colors[pixels[i]];

                for (let s = 0; s < hscale; ++s) {
                    const imgOfs = (xOffset + tx + (yOffset + y + scanline) * outWidth) * 4;
                    imageData.data[imgOfs]     = rgb[0];
                    imageData.data[imgOfs + 1] = rgb[1];
                    imageData.data[imgOfs + 2] = rgb[2];
                    imageData.data[imgOfs + 3] = 0xff;
                    ++tx;
                }
            }

            ofs++;
            if (ofs >= fileData.length) {
                break;
            }
        }

        // Move to next character position
        ++column;
        if (column >= width) {
            x = xOffset;
            y += 8;
            column = 0;
        } else {
            x += pixelsPerByte * hscale;
        }
    }
}


/**
 *
 * @param {ImageData} imageData destination ImageData to write the decoded image into
 * @param {(byte: number) : number[]} pixelDecoder function which produces pixel values for each pixel encoded in a
 *        byte.
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
    imageData, pixelDecoder, xOffset, yOffset, colors,
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
        // Render each pixel encoded in this byte
        const pixels = pixelDecoder(fileData[ofs]);
        for (let i = 0; i < pixels.length; ++i) {
            const rgb = colors[pixels[i]];

            for (let s = 0; s < hscale; ++s) {
                const imgOfs = (xOffset + x + (yOffset + y) * outWidth) * 4;
                imageData.data[imgOfs]     = rgb[0];
                imageData.data[imgOfs + 1] = rgb[1];
                imageData.data[imgOfs + 2] = rgb[2];
                imageData.data[imgOfs + 3] = 0xff;
                ++x;
            }

            if (x >= width) {
                x = 0;
                ++y;
                // Reached edge of image, break containing loop to skip remaining pixels in current byte
                break;
            }
        }
    }
}


function decodeSegmentDirectory(fileData) {
    let entry = 0;
    let ofs = 0;
    let result = "";

    while (ofs < fileData.length) {
        const b0 = fileData[ofs];
        const disk = ((b0 >> 3) & 3) + 1;
        const side = ((b0 >> 2) & 1) + 1
        const sector = fileData[ofs + 1] + ((b0 & 3) << 8);
        const length = (fileData[ofs + 3] << 8) + fileData[ofs + 2];

        if (sector == 0) {
            break;
        }

        result += `\nEntry ${leftPad(entry, 3)}: [${leftPad(b0.toString(16), 2, '0')}` +
            `${leftPad(fileData[ofs + 1].toString(16), 2, '0')} ${leftPad(fileData[ofs + 2].toString(16), 2, '0')}` +
            `${leftPad(fileData[ofs + 3].toString(16), 2, '0')}] D${disk} S${side}: ` +
            `encrypted=${leftPad((b0 & 0xC0) > 0, 5)}, sector=${leftPad(sector, 3)} ` +
            `[${leftPad(sector.toString(16), 3, '0')}], length=${leftPad(length,4)}`;

        entry += 1;
        ofs += 4;
    }

    result = entry + " entries:\n" + result;
    console.log(result);
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

