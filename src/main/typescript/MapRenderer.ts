import { ScenarioMap, WallType, MapCell } from "./ScenarioMap";



export class MapRenderer {

    private _wallOverlays?: {[k: string]: HTMLCanvasElement};
    useBitmapCache: boolean = false;

    private _invalidated: boolean = false;

    private _context: CanvasRenderingContext2D;
    private _map?: ScenarioMap;
    private _cellSize: number = 30;
    private _scale: number = 1;

    private _x: number = 0;
    private _y: number = 0;
    private _backgroundColor: string = "white";
    private _textColor: string = "black";
    private _gridColor: string = "#e0e0e0";
    private _unknownColor: string = "red";
    private _archwayColor: string = "green";
    private _wallColor: string = "black";
    private _doorColor: string = "green";
    private _obstructionColor: string = "red";
    private _secretColor: string = "green";

    private _showPointsOfInterest: boolean = true;
    private _showEnclosedAreas: boolean = true;
    private _showSpecialCode: boolean = true;

    private _poiColors = [
        "blue",     // 0 Inn
        "orange",   // 1 Tavern
        "green",    // 2 Bank
        "yellow",   // 3 Shop
        "red",      // 4 Smithy
        "#c0c0c0",  // 5 Expansion/addon
        "cyan",     // 6 Healer
        "magenta"   // 7 Guild
    ];

    private _enclosedColors = [
        "tan", // type 0
        "#9a2808", // type 1
        "#809052", // type 2
        "#8c5e5e"  // type 3
    ];

    // TODO: Additional configuration

    constructor(context: CanvasRenderingContext2D, map?: ScenarioMap) {
        this._context = context;
        this._map = map;
        this.invalidate();
    }

    private handleAnimationFrame(timestamp: DOMHighResTimeStamp): void {
        this.renderMap();
        this._invalidated = false;
    }

    invalidate(): void {
        if (!this._invalidated) {
            window.requestAnimationFrame((timestamp) => this.handleAnimationFrame(timestamp));
            this._invalidated = true;
        }
    }

    get context(): CanvasRenderingContext2D {
        return this._context;
    }

    set context(value: CanvasRenderingContext2D) {
        this._context = value;
        this.invalidate();
    }

    get map(): ScenarioMap|undefined {
        return this._map;
    }

    set map(value: ScenarioMap|undefined) {
        this._map = value;
        this.invalidate();
    }

    get cellSize(): number {
        return this._cellSize;
    }

    set cellSize(value: number) {
        if (!((value >= 1) && (value <= 500))) {
            throw new Error("The cellSize must be between 0 and 500");
        }
        this._cellSize = value;
        this.invalidate();
    }

    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        if (!(value > 0)) {
            throw new Error("The scale must be greater than 0");
        }
        this._scale = value;
        this.invalidate();
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        this.invalidate();
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.invalidate();
    }

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(value: string) {
        this._backgroundColor = value;
        this.invalidate();
    }

    get textColor(): string {
        return this._textColor;
    }

    set textColor(value: string) {
        this._textColor = value;
        this.invalidate();
    }

    get gridColor(): string {
        return this._gridColor;
    }

    set gridColor(value: string) {
        this._gridColor = value;
        this.invalidate();
    }

    get unknownColor(): string {
        return this._unknownColor;
    }

    set unknownColor(value: string) {
        this._unknownColor = value;
        this.invalidate();
    }

    get archwayColor(): string {
        return this._archwayColor;
    }

    set archwayColor(value: string) {
        this._archwayColor = value;
        this.invalidate();
    }

    get wallColor(): string {
        return this._wallColor;
    }

    set wallColor(value: string) {
        this._wallColor = value;
        this.invalidate();
    }

    get doorColor(): string {
        return this._doorColor;
    }

    set doorColor(value: string) {
        this._doorColor = value;
        this.invalidate();
    }

    get obstructionColor(): string {
        return this._obstructionColor;
    }

    set obstructionColor(value: string) {
        this._obstructionColor = value;
        this.invalidate();
    }

    get secretColor(): string {
        return this._secretColor;
    }

    set secretColor(value: string) {
        this._secretColor = value;
        this.invalidate();
    }

    get showPointsOfInterest(): boolean {
        return this._showPointsOfInterest;
    }

    set showPointsOfInterest(value: boolean) {
        this._showPointsOfInterest = value;
        this.invalidate();
    }

    get showEnclosedAreas(): boolean {
        return this._showEnclosedAreas;
    }

    set showEnclosedAreas(value: boolean) {
        this._showEnclosedAreas = value;
        this.invalidate();
    }

    get showSpecialCode(): boolean {
        return this._showSpecialCode;
    }

    set showSpecialCode(value: boolean) {
        this._showSpecialCode = value;
        this.invalidate();
    }

    private drawUnknown(context: CanvasRenderingContext2D): void {
        context.fillStyle = this._unknownColor;
        context.fillRect(0, 0, 1, 0.1);
    }

    private drawSolidWall(context: CanvasRenderingContext2D): void {
        context.strokeStyle = this._wallColor;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(1, 0);
        context.stroke();
    }

    private drawArchway(context: CanvasRenderingContext2D): void {
        context.strokeStyle = this._archwayColor;
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(0.3, 0.15, 0.7, 0.15, 1, 0);
        context.stroke();
    }

    private drawSecretDoor(context: CanvasRenderingContext2D): void {
        context.strokeStyle = this._secretColor;
        let oldDash = context.getLineDash();
        context.setLineDash([0.7 / 4, 0.1]);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(1, 0);
        context.stroke();
        context.setLineDash(oldDash);
    }

    private drawDoor(context: CanvasRenderingContext2D): void {
        context.strokeStyle = this._doorColor;
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

    private drawLockedDoor(context: CanvasRenderingContext2D): void {
        this.drawDoor(context);
        context.strokeStyle = this._obstructionColor;
        context.beginPath();
        context.moveTo(0.4, 0.1);
        context.lineTo(0.4, 0);
        context.lineTo(0.6, 0);
        context.stroke();
    }

    private drawBoltedDoor(context: CanvasRenderingContext2D): void {
        this.drawDoor(context);
        context.strokeStyle = this._obstructionColor;
        context.strokeRect(0.35, 0, 0.3, 0.1);
    }

    private drawEnchantedDoor(context: CanvasRenderingContext2D): void {
        this.drawDoor(context);
        context.strokeStyle = this._obstructionColor;
        context.beginPath();
        context.moveTo(0.35, 0);
        context.lineTo(0.5, 0.1);
        context.lineTo(0.5, 0);
        context.lineTo(0.65, 0.1);
        context.stroke();
    }

    private getOverlayForType(type: WallType): HTMLCanvasElement|undefined {
        if (this._wallOverlays == null) {
            this._wallOverlays = {};
            this._wallOverlays[1] = this.createWallOverlay(this.drawArchway);
            this._wallOverlays[3] = this.createWallOverlay(this.drawDoor);
            this._wallOverlays[5] = this.createWallOverlay(this.drawSecretDoor);
            this._wallOverlays[8] = this.createWallOverlay(this.drawLockedDoor);
            this._wallOverlays[9] = this.createWallOverlay(this.drawBoltedDoor);
            this._wallOverlays[10] = this.createWallOverlay(this.drawEnchantedDoor);
            this._wallOverlays[13] = this.createWallOverlay(this.drawSolidWall);
        }

        return this._wallOverlays[type & 0xf];
    }

    private createWallOverlay(drawFunction: (context: CanvasRenderingContext2D) => void): HTMLCanvasElement {
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = canvas.height = this._cellSize;

        let context: CanvasRenderingContext2D|null = canvas.getContext("2d");
        if (!context)
            throw new Error("Unable to retrieve 2D rendering context");

        let lineWidth = this._cellSize / 20;

        context.lineCap = "square";
        context.lineJoin = "miter";

        context.scale(canvas.width - lineWidth, canvas.height - lineWidth);

        context.lineWidth = lineWidth / this._cellSize;
        context.translate(context.lineWidth / 2, context.lineWidth / 2);

        drawFunction(context);

        return canvas;
    }

    private drawWallType(type: WallType, context: CanvasRenderingContext2D): void {
        if (type) {
            if (this.useBitmapCache) {
                let overlay = this.getOverlayForType(type)
                if (!overlay) {
                    console.log("Can't draw unknown wall type: ", type);
                    this.drawUnknown(context);
                } else {
                    context.drawImage(overlay, 0, 0, 1, 1);
                }
            } else {
                context.save();
                let s = 1 - context.lineWidth;
                context.translate(context.lineWidth / 2, context.lineWidth / 2);
                context.scale(s, s);
                switch (type) {
                    case 1: this.drawArchway(context); break;
                    case 3: this.drawDoor(context); break;
                    case 5: this.drawSecretDoor(context); break;
                    case 8: this.drawLockedDoor(context); break;
                    case 9: this.drawBoltedDoor(context); break;
                    case 10: this.drawEnchantedDoor(context); break;
                    case 13: this.drawSolidWall(context); break;
                    default:
                        console.log("Can't draw unknown wall type: ", type);
                        this.drawUnknown(context);
                }
                context.restore();
            }
        }

        // Rotate coordinates by 90 degrees for next wall
        context.translate(0.5, 0.5);
        context.rotate(Math.PI / 2);
        context.translate(-0.5, -0.5);
    }

    private fillCenteredText(
        x1: number, y1: number, x2: number, y2: number,
        sizeRatio: number,
        text: string|number|boolean
    ) {
        text = String(text);
        let context: CanvasRenderingContext2D = this._context;

        let w: number = x2 - x1;
        let h: number = y2 - y1;

        let x: number = w / 2;
        let y: number = h / 2;

        context.save();
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = (h * sizeRatio) +"px monospace";

        let metrics: TextMetrics = context.measureText(text);
        let scale = Math.min((w * sizeRatio) / metrics.width, 1);

        context.translate(x, y);
        context.scale(scale, scale);
        context.fillText(text, 0, 0);
        context.restore();
    }

    private byteToHex(byte: number): string {
        byte = byte & 0xff;
        let chars: string[] = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
        return chars[(byte >> 4) & 0x0f] + chars[byte & 0xf];
    }

    /**
     * Draws the specified cell at the origin of the provided context.
     * @param cell the cell to draw.
     */
    private drawCell(cell: MapCell) {
        let context: CanvasRenderingContext2D = this._context;

        // Render the poi background if enabled
        let color;
        if (this._showEnclosedAreas && cell.ceiling) {
            color = this._enclosedColors[cell.ceiling - 1];
        } else if (this._showPointsOfInterest && (cell.special & 0x10)) {
            color = this._poiColors[cell.special >> 5];
        }
        if (color) {
            context.fillStyle = color;

            let a = context.lineWidth;
            let b = 1 - context.lineWidth;
            context.fillRect(a, a, b, b);
        }

        // Render the border
        context.strokeStyle = this._gridColor;
        let a = context.lineWidth / 2;
        let b = 1 - context.lineWidth / 2;
        context.strokeRect(a, a, b, b);

        // Render the data (description code / special code)
        if (this._showSpecialCode && cell.special) {
            context.fillStyle = this._textColor;
            this.fillCenteredText(0, 0, 1, 1, 0.6, this.byteToHex(cell.special));
        }

        // Draw the wall representations
        this.drawWallType(cell.north, context);
        this.drawWallType(cell.east, context);
        this.drawWallType(cell.south, context);
        this.drawWallType(cell.west, context);
    }

    renderMap() {
        let context = this._context;

        let width = context.canvas.width;
        let height = context.canvas.height;

        let cellSize = this._cellSize * this._scale;
        let lineWidth = cellSize / 20;

        context.save();
        context.lineCap = "square";
        context.lineJoin = "miter";

        // Clear background
        context.fillStyle = this._backgroundColor;
        context.fillRect(0, 0, width, height);

        if (this._map) {
            let xPos = this._x;
            let yPos = this._y;

            let xOfs: number = ((xPos < 0) ? xPos : xPos - Math.trunc(xPos));
            let yOfs: number = ((yPos < 0) ? yPos : yPos - Math.trunc(yPos));

            context.scale(cellSize, cellSize);
            context.translate(-xOfs, -yOfs);
            context.lineWidth = lineWidth / cellSize;

            let firstX: number = (xPos < 0 ? 0 : Math.trunc(xPos));
            let lastX: number = Math.min(
                firstX + Math.ceil(width / cellSize - (xOfs < 0 ? -xOfs : 1 - xOfs)) + 1,
                this._map.width
            );

            let firstY: number = (yPos < 0 ? 0 : Math.trunc(yPos));
            let lastY: number = Math.min(
                firstY + Math.ceil(height / cellSize - (yOfs < 0 ? -yOfs : 1 - yOfs)) + 1,
                this._map.height
            );

            // Iterate over each visible map square
            for (let y = firstY; y < lastY; ++y) {
                context.save();
                for (let x = firstX; x < lastX; ++x) {
                    this.drawCell(this._map.getCell(x, y));
                    context.translate(1, 0);
                }
                context.restore();
                context.translate(0, 1);
            }
        } else {
            context.fillStyle = this._textColor;
            this.fillCenteredText(0, 0, width, height, 0.4, "No map to render");
            console.log("No map to render");
        }

        context.restore();
    }

}