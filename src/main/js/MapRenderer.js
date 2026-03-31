import { ScenarioMap, MapCell } from "./ScenarioMap.js";


export class MapRenderer {

    /** @type {{[k: string]: HTMLCanvasElement}?} */
    #wallOverlays;

    /** @type {boolean} */
    useBitmapCache = false;

    /** @type {boolean} */
    #invalidated = false;

    /** @type {CanvasRenderingContext2D} */
    #context;
    /** @type {ScenarioMap?} */
    #map;
    /** @type {number} */
    #cellSize = 30;
    /** @type {number} */
    #scale = 1;

    /** @type {number} */
    #x = 0;
    /** @type {number} */
    #y = 0;
    /** @type {string} */
    #backgroundColor = "white";
    /** @type {string} */
    #textColor = "black";
    /** @type {string} */
    #gridColor = "#e0e0e0";
    /** @type {string} */
    #unknownColor = "red";
    /** @type {string[]} */
    #archwayColor = [ "green", "cyan" ];
    /** @type {string[]} */
    #wallColor = ["red", "green", "black", "cyan", "blue"];
    /** @type {string[]} */
    #doorColor = [ "green", "cyan" ];
    /** @type {string} */
    #obstructionColor = "red";
    /** @type {string[]} */
    #secretColor = [ "green", "cyan", "blue" ];

    /** @type {boolean} */
    #showPointsOfInterest = true;
    /** @type {boolean} */
    #showEnclosedAreas = true;
    /** @type {boolean} */
    #showSpecialCode = true;

    /**
     * @readonly
     */
    #poiColors = [
        "blue",     // 0 Inn
        "orange",   // 1 Tavern
        "green",    // 2 Bank
        "yellow",   // 3 Shop
        "red",      // 4 Smithy
        "#c0c0c0",  // 5 Expansion/addon
        "cyan",     // 6 Healer
        "magenta"   // 7 Guild
    ];

    /**
     * @readonly
     */
    #enclosedColors = [
        "tan", // type 0
        "#9a2808", // type 1
        "#809052", // type 2
        "#8c5e5e"  // type 3
    ];

    // TODO: Additional configuration

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {ScenarioMap?} map
     */
    constructor(context, map) {
        this.#context = context;
        this.#map = map;
        this.invalidate(true);
    }

    /**
     *
     * @param {DOMHighResTimeStamp} timestamp
     */
    #handleAnimationFrame(timestamp) {
        this.renderMap();
        this.#invalidated = false;
    }

    invalidate(resized) {
        if (resized) {
            const canvas = this.#context.canvas;
            console.log("resize -> w=", canvas.clientWidth, "h=", canvas.clientHeight)
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            //this.#context = canvas.getContext("2d");
        }

        if (!this.#invalidated) {
            window.requestAnimationFrame((timestamp) => this.#handleAnimationFrame(timestamp));
            this.#invalidated = true;
        }
    }

    get context() {
        return this.#context;
    }

    set context(value) {
        this.#context = value;
        this.invalidate();
    }

    get map() {
        return this.#map;
    }

    set map(value) {
        this.#map = value;
        this.invalidate();
    }

    get cellSize() {
        return this.#cellSize;
    }

    set cellSize(value) {
        if (!((value >= 1) && (value <= 500))) {
            throw new Error("The cellSize must be between 0 and 500");
        }
        this.#cellSize = value;
        this.invalidate();
    }

    get scale() {
        return this.#scale;
    }

    set scale(value) {
        if (!(value > 0)) {
            throw new Error("The scale must be greater than 0");
        }
        this.#scale = value;
        this.invalidate();
    }

    get x() {
        return this.#x;
    }

    set x(value) {
        this.#x = value;
        this.invalidate();
    }

    get y() {
        return this.#y;
    }

    set y(value) {
        this.#y = value;
        this.invalidate();
    }

    get backgroundColor() {
        return this.#backgroundColor;
    }

    set backgroundColor(value) {
        this.#backgroundColor = value;
        this.invalidate();
    }

    get textColor() {
        return this.#textColor;
    }

    set textColor(value) {
        this.#textColor = value;
        this.invalidate();
    }

    get gridColor() {
        return this.#gridColor;
    }

    set gridColor(value) {
        this.#gridColor = value;
        this.invalidate();
    }

    get unknownColor() {
        return this.#unknownColor;
    }

    set unknownColor(value) {
        this.#unknownColor = value;
        this.invalidate();
    }

    /**
     * Colors to use for the archway variants.
     * Value is an array of 2 colors.
     */
    get archwayColor() {
        return this.#archwayColor;
    }

    set archwayColor(value) {
        if (!Array.isArray(value) || value.length != 2) {
            throw new Error("The value must be an array of two colors");
        }
        this.#archwayColor = value;
        this.invalidate();
    }

    /**
     * Colors to use for the Wall variants.
     * Value is an array of 5 colors.
     */
    get wallColor() {
        return this.#wallColor;
    }

    set wallColor(value) {
        if (!Array.isArray(value) || value.length != 5) {
            throw new Error("The value must be an array of five colors");
        }
        this.#wallColor = value;
        this.invalidate();
    }

    /**
     * Colors to use for the door variants.
     * Value is an array of 2 colors.
     */
    get doorColor() {
        return this.#doorColor;
    }

    set doorColor(value) {
        if (!Array.isArray(value) || value.length != 2) {
            throw new Error("The value must be an array of two colors");
        }
        this.#doorColor = value;
        this.invalidate();
    }

    get obstructionColor() {
        return this.#obstructionColor;
    }

    set obstructionColor(value) {
        this.#obstructionColor = value;
        this.invalidate();
    }

    /**
     * Colors to use for the secret door variants.
     * Value is an array of 3 colors.
     */
    get secretColor() {
        return this.#secretColor;
    }

    set secretColor(value) {
        if (!Array.isArray(value) || value.length != 3) {
            throw new Error("The value must be an array of three colors");
        }
        this.#secretColor = value;
        this.invalidate();
    }

    get showPointsOfInterest() {
        return this.#showPointsOfInterest;
    }

    set showPointsOfInterest(value) {
        this.#showPointsOfInterest = value;
        this.invalidate();
    }

    get showEnclosedAreas() {
        return this.#showEnclosedAreas;
    }

    set showEnclosedAreas(value) {
        this.#showEnclosedAreas = value;
        this.invalidate();
    }

    get showSpecialCode() {
        return this.#showSpecialCode;
    }

    set showSpecialCode(value) {
        this.#showSpecialCode = value;
        this.invalidate();
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     */
    #drawUnknown(context) {
        context.fillStyle = this.#unknownColor;
        context.fillRect(0, 0, 1, 0.1);
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} variant
     */
    #drawSolidWall(context, variant) {
        context.strokeStyle = this.#wallColor[variant];
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(1, 0);
        context.stroke();
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} variant
     */
    #drawArchway(context, variant) {
        context.strokeStyle = this.#archwayColor[variant];
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(0.3, 0.15, 0.7, 0.15, 1, 0);
        context.stroke();
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} variant
     */
    #drawSecretDoor(context, variant) {
        context.strokeStyle = this.#secretColor[variant];
        let oldDash = context.getLineDash();
        context.setLineDash([0.7 / 4, 0.1]);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(1, 0);
        context.stroke();
        context.setLineDash(oldDash);
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} variant
     */
    #drawDoor(context, variant) {
        context.strokeStyle = this.#doorColor[variant];
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0.3, 0);
        context.moveTo(0.7, 0);
        context.lineTo(1, 0);
        context.stroke();

        context.beginPath();
        context.moveTo(0.3, 0);
        context.lineTo(0.3, 0.1);
        context.moveTo(0.7, 0);
        context.lineTo(0.7, 0.1);
        context.stroke();
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     */
    #drawLockedDoor(context) {
        this.#drawDoor(context, 0);
        context.strokeStyle = this.#obstructionColor;
        context.beginPath();
        context.moveTo(0.4, 0.1);
        context.lineTo(0.4, 0);
        context.lineTo(0.6, 0);
        context.stroke();
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     */
    #drawBoltedDoor(context) {
        this.#drawDoor(context, 0);
        context.strokeStyle = this.#obstructionColor;
        context.strokeRect(0.35, 0, 0.3, 0.1);
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     */
    #drawEnchantedDoor(context) {
        this.#drawDoor(context, 0);
        context.strokeStyle = this.#obstructionColor;
        context.beginPath();
        context.moveTo(0.35, 0);
        context.lineTo(0.5, 0.1);
        context.lineTo(0.5, 0);
        context.lineTo(0.65, 0.1);
        context.stroke();
    }

    /**
     *
     * @param {string} type
     *
     * @return {HTMLCanvasElement|undefined}
     */
    #getOverlayForType(type) {
        if (this.#wallOverlays == null) {
            this.#wallOverlays = {};
            this.#wallOverlays[1] = this.#createWallOverlay(this.#drawArchway, 0);
            this.#wallOverlays[2] = this.#createWallOverlay(this.#drawArchway, 1);
            this.#wallOverlays[3] = this.#createWallOverlay(this.#drawDoor, 0);
            this.#wallOverlays[4] = this.#createWallOverlay(this.#drawDoor, 1);
            this.#wallOverlays[5] = this.#createWallOverlay(this.#drawSecretDoor, 0);
            this.#wallOverlays[6] = this.#createWallOverlay(this.#drawSecretDoor, 1);
            this.#wallOverlays[7] = this.#createWallOverlay(this.#drawSecretDoor, 2);
            this.#wallOverlays[8] = this.#createWallOverlay(this.#drawLockedDoor);
            this.#wallOverlays[9] = this.#createWallOverlay(this.#drawBoltedDoor);
            this.#wallOverlays[10] = this.#createWallOverlay(this.#drawEnchantedDoor);
            this.#wallOverlays[11] = this.#createWallOverlay(this.#drawSolidWall, 0);
            this.#wallOverlays[12] = this.#createWallOverlay(this.#drawSolidWall, 1);
            this.#wallOverlays[13] = this.#createWallOverlay(this.#drawSolidWall, 2);
            this.#wallOverlays[14] = this.#createWallOverlay(this.#drawSolidWall, 3);
            this.#wallOverlays[15] = this.#createWallOverlay(this.#drawSolidWall, 4);
        }

        return this.#wallOverlays[type & 0xf];
    }

    /**
     *
     * @param {(context: CanvasRenderingContext2D) => void} drawFunction
     * @param {number=} variant
     * @returns {HTMLCanvasElement}
     */
    #createWallOverlay(drawFunction, variant) {
        const canvas = new HTMLCanvasElement();
        canvas.width = canvas.height = this.#cellSize;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Unable to retrieve 2D rendering context");
        }

        const lineWidth = this.#cellSize / 20;

        context.lineCap = "square";
        context.lineJoin = "miter";

        context.scale(canvas.width - lineWidth, canvas.height - lineWidth);

        context.lineWidth = lineWidth / this.#cellSize;
        context.translate(context.lineWidth / 2, context.lineWidth / 2);

        drawFunction(context, variant);

        return canvas;
    }

    /**
     *
     * @param {string} type
     * @param {CanvasRenderingContext2D} context
     */
    #drawWallType(type, context) {
        if (type) {
            if (this.useBitmapCache) {
                let overlay = this.#getOverlayForType(type)
                if (!overlay) {
                    console.log("Can't draw unknown wall type: ", type);
                    this.#drawUnknown(context);
                } else {
                    context.drawImage(overlay, 0, 0, 1, 1);
                }
            } else {
                context.save();
                let s = 1 - context.lineWidth;
                context.translate(context.lineWidth / 2, context.lineWidth / 2);
                context.scale(s, s);
                switch (type) {
                    case 1:
                    case 2:
                        this.#drawArchway(context, type - 1);
                        break;
                    case 3:
                    case 4:
                        this.#drawDoor(context, type - 3);
                        break;
                    case 5:
                    case 6:
                    case 7:
                        this.#drawSecretDoor(context, type - 5);
                        break;
                    case 8: this.#drawLockedDoor(context); break;
                    case 9: this.#drawBoltedDoor(context); break;
                    case 10: this.#drawEnchantedDoor(context); break;
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        this.#drawSolidWall(context, type - 11); break;
                    default:
                        console.log("Can't draw unknown wall type: ", type);
                        this.#drawUnknown(context);
                }
                context.restore();
            }
        }

        // Rotate coordinates by 90 degrees for next wall
        context.translate(0.5, 0.5);
        context.rotate(Math.PI / 2);
        context.translate(-0.5, -0.5);
    }

    /**
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} sizeRatio
     * @param {string|number|boolean} text
     */
    #fillCenteredText(x1, y1, x2, y2, sizeRatio, text) {
        text = String(text);
        const context = this.#context;

        const w = x2 - x1;
        const h = y2 - y1;

        const x = w / 2;
        const y = h / 2;

        context.save();
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = (h * sizeRatio) +"px monospace";

        const metrics = context.measureText(text);
        const scale = Math.min((w * sizeRatio) / metrics.width, 1);

        context.translate(x, y);
        context.scale(scale, scale);
        context.fillText(text, 0, 0);
        context.restore();
    }

    /**
     *
     * @param {number} byte
     * @returns {string}
     */
    #byteToHex(byte) {
        byte = byte & 0xff;
        const chars = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
        return chars[(byte >> 4) & 0x0f] + chars[byte & 0xf];
    }

    /**
     * Draws the specified cell at the origin of the provided context.
     * @param {MapCell} cell the cell to draw.
     */
    #drawCell(cell) {
        const context = this.#context;

        // Render the poi background if enabled
        let color;
        if (this.#showEnclosedAreas && cell.ceiling) {
            color = this.#enclosedColors[cell.ceiling - 1];
        } else if (this.#showPointsOfInterest && (cell.special & 0x10)) {
            color = this.#poiColors[cell.special >> 5];
        }
        if (color) {
            context.fillStyle = color;

            let a = context.lineWidth;
            let b = 1 - context.lineWidth;
            context.fillRect(a, a, b, b);
        }

        // Render the border
        context.strokeStyle = this.#gridColor;
        let a = context.lineWidth / 2;
        let b = 1 - context.lineWidth / 2;
        context.strokeRect(a, a, b, b);

        // Render the data (description code / special code)
        if (this.#showSpecialCode && cell.special) {
            context.fillStyle = this.#textColor;
            this.#fillCenteredText(0, 0, 1, 1, 0.6, this.#byteToHex(cell.special));
        }

        // Draw the wall representations
        this.#drawWallType(cell.northWall, context);
        this.#drawWallType(cell.eastWall, context);
        this.#drawWallType(cell.southWall, context);
        this.#drawWallType(cell.westWall, context);
    }

    renderMap() {
        let context = this.#context;

        let width = context.canvas.width;
        let height = context.canvas.height;

        let cellSize = this.#cellSize * this.#scale;
        let lineWidth = cellSize / 20;

        context.save();
        context.lineCap = "square";
        context.lineJoin = "miter";

        // Clear background
        context.fillStyle = this.#backgroundColor;
        context.fillRect(0, 0, width, height);

        if (this.#map) {
            const xPos = this.#x;
            const yPos = this.#y;

            const xOfs = ((xPos < 0) ? xPos : xPos - Math.trunc(xPos));
            const yOfs = ((yPos < 0) ? yPos : yPos - Math.trunc(yPos));

            context.scale(cellSize, cellSize);
            context.translate(-xOfs, -yOfs);
            context.lineWidth = lineWidth / cellSize;

            let firstX = (xPos < 0 ? 0 : Math.trunc(xPos));
            const lastX = Math.min(
                firstX + Math.ceil(width / cellSize - (xOfs < 0 ? -xOfs : 1 - xOfs)) + 1,
                this.#map.width
            );

            let firstY = (yPos < 0 ? 0 : Math.trunc(yPos));
            const lastY = Math.min(
                firstY + Math.ceil(height / cellSize - (yOfs < 0 ? -yOfs : 1 - yOfs)) + 1,
                this.#map.height
            );

            // Iterate over each visible map square
            for (let y = firstY; y < lastY; ++y) {
                context.save();
                for (let x = firstX; x < lastX; ++x) {
                    this.#drawCell(this.#map.getCell(x, y));
                    context.translate(1, 0);
                }
                context.restore();
                context.translate(0, 1);
            }
        } else {
            context.fillStyle = this.#textColor;
            this.#fillCenteredText(0, 0, width, height, 0.4, "No map to render");
            console.log("No map to render");
        }

        context.restore();
    }

}