
import { EventDispatcher } from "./EventDispatcher.js";
import { Player } from "./Player.js";
import { AnimationManager } from "./Animation.js";
import { FrameRateTimer } from "./FrameRateTimer.js";
import { ScenarioMap, MapCell, WallStyle, Ray } from "./ScenarioMap.js";
import { Texture } from "./Texture.js";

export class Renderer extends EventDispatcher {

    #animationFrameRequested = false;

    /**
     *
     * @param {HTMLCanvasElement} canvas the canvas to draw into
     * @param {ScenarioMap} worldMap the world map to render
     * @param {Player} player the player
     */
    constructor(canvas, worldMap, player) {
        super();

        /**
         * The canvas to render the scene into.
         * @type {HTMLCanvasElement}
         * @readonly
         */
        this.canvas = canvas;

        /**
         * The 2D rendering context to use for drawing into the canvas.
         * @type {CanvasRenderingContext2D}
         * @readonly
         */
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        //this.ctx.imageSmoothingQuality = "low";

        /**
         * @type {ScenarioMap}
         */
        this.worldMap = worldMap;

        // Camera properties
        this.player = player;

        // Rendering settings
        /**
         * Maximum distance to cast rays.
         * @type {number}
         */
        this.renderDistance = 64;

        /**
         * Camera field of view angle (0 to PI).
         * Wider values zoom out, narrower values zoom in.
         * @type {number}
         */
        this.fieldOfView = Math.PI / 2;

        /**
         * Distance from the player position to the camera plane.
         * @type {number}
         */
        this.cameraDistance = 1;

        /**
         * The ratio of wall width over wall height.
         * This ratio controls the "squareness" of the walls.
         * A value of 1 results in square walls with equal width and height,
         * while a value of 2 would produce walls that are twice as wide as they are tall.
         *
         * @type {number}
         */
        this.wallWidthToHeightRatio = 2;

        /**
         * Offset from the center of the screen as a percentage of the screen height to adjust the
         * projection plane by.
         *
         * This value controls the view direction up or down (e.g. looking up or down)
         *
         * @type {number}
         */
        this.projectionPlaneOffset = 0;

        /**
         * Whether wall distance shading is enabled or not.
         * @type {boolean}
         */
        this.wallShading = true;

        /**
         * @type {AnimationManager}
         * @readonly
         */
        this.animations = new AnimationManager();

        /**
         * @type {FrameRateTimer}
         * @readonly
         */
        this.frameRateTimer = new FrameRateTimer(120);

        /**
         * Whether the mini-map should be rendered or not.
         * @type {boolean}
         */
        this.drawMap = false;

        /**
         * @type {ImageData}
         * @readonly
         */
        this.imageBuffer = new ImageData(this.width, this.height);

        this.requestUpdate();
    }

    /**
     * The width of the canvas.
     */
    get width() {
        return this.canvas.width;
    }

    /**
     * The height of the canvas.
     */
    get height() {
        return this.canvas.height;
    }

    get projectionPlaneCenter() {
        const height = this.canvas.height;
        return (height / 2) + this.projectionPlaneOffset * height
    }

    /**
     * The tangent of half the field of view angle times the distance of the camera plane from the player position.
     * In other words, this represents a vector proportional to half the magnitude of the camera plane.
     */
    get cameraFovMagnitude() {
        return Math.tan(this.fieldOfView / 2) * this.cameraDistance;
    }

    /**
     *
     * @param {HitData} hitData
     * @returns {boolean?}
     */
    #shouldRenderWallStyle(hitData) {
        if (hitData.wallStyle.transparent) {
            // Include, but don't stop looking for more
            return null;
        }
        // Include and stop looking further
        return true;
    }

    // Render a single vertical slice
    /**
     *
     * @param {number} x
     * @param {DOMHighResTimeStamp} timestamp
     */
    #renderColumn(x, timestamp) {
        // Calculate ray vector relative to camera plane
        const dirX = Math.cos(this.player.orientation);
        const dirY = Math.sin(this.player.orientation);
        const cameraSweep = (-1 + (x * 2 / this.width));
        const cameraDirX = -dirY * this.cameraFovMagnitude;
        const cameraDirY = dirX * this.cameraFovMagnitude;
        const rayDirX = dirX + cameraDirX * cameraSweep;
        const rayDirY = dirY + cameraDirY * cameraSweep;

        const hits = this.worldMap.castRay(this.player.x, this.player.y, rayDirX, rayDirY, this.renderDistance, this.#shouldRenderWallStyle);

        // Draw each hit in reverse order (painter's algorithm)
        let n = hits.length;
        let firstPass = true;
        while (n > 0) {
            n--;
            const ray = hits[n];

            // Calculate wall height
            const wallHeight = (ray.distance < this.renderDistance && ray.wallType)
                ? Math.min(100000, (this.width / this.wallWidthToHeightRatio) / (ray.distance * this.cameraFovMagnitude * 2))
                : 0;

            const playerYOffset = this.player.height + this.player.headBob;
            const wallTop = this.projectionPlaneCenter - wallHeight / 2 + playerYOffset * wallHeight;

            if (firstPass) {
                // TODO: Remove to improve performance
                // Draw solid red background first for testing
                const displayHeight = this.height;
                const destImageData = this.imageBuffer;
                const imgWidth = destImageData.width;
                const buf = destImageData.data;
                const clr = 0xe0 + Math.sin((timestamp & 0xfff) / 1023 * Math.PI * 2) * 0x1f;
                for (let y = 0; y < displayHeight; y++) {
                    let ofs = (x + y * imgWidth) * 4;
                    buf[ofs] = clr;
                    buf[ofs + 1] = 0;
                    buf[ofs + 2] = 0;
                    buf[ofs + 3] = 0xff;
                }

                // Draw ceiling and floor (only on first iteration)
                firstPass = false;

                this.#drawFloorOrCeiling(timestamp, this.#getCeilingTexture, x, playerYOffset, true, ray, wallTop);
                this.#drawFloorOrCeiling(timestamp, this.#getFloorTexture, x, playerYOffset, false, ray, wallTop + wallHeight);
            }

            // Draw wall slice
            if (wallHeight > 0) {
                // Get wall texture or color
                const texture = ray.wallStyle.textureProvider.getTexture(timestamp);

                this.#drawTextureWallSlice(texture, ray.wallPosition, x, wallTop, wallHeight, ray.distance, firstPass);
            }
        }
    }

    /**
     *
     * @param {Texture} texture the texture for the wall.
     * @param {number} fraction the horizontal texel position.
     * @param {number} dstX the x position of the wall slice to draw in the projection plane.
     * @param {number} wallTop the y position of the top of the wall in the projection plane.
     * @param {number} wallHeight the height of the wall being drawn.
     * @param {number} distance the distance of the wall from the projection plane.
     * @param {boolean} replaceDest
     */
    #drawTextureWallSlice(texture, fraction, dstX, wallTop, wallHeight, distance, replaceDest) {
        const destImageData = this.imageBuffer;

        const dstY = Math.trunc((wallTop < 0) ? 0 : wallTop);
        let dstOfs = (dstX + dstY * destImageData.width);
        const maxY = Math.trunc(Math.min(wallTop + wallHeight, destImageData.height));
        let maxDstOfs = (dstX + maxY * destImageData.width);

        const srcYStep = texture.height / wallHeight;
        let srcX = texture.x + Math.floor(texture.width * fraction);
        let srcY = texture.y + ((wallTop < 0) ? Math.floor((-wallTop / wallHeight) * texture.height) : 0);
        const srcWidth = texture.imageData.width;
        const dstYStep = destImageData.width;

        // TODO: This could be a lookup, based on the wallTop y position on the screen relative to the vertical center
        const shade = this.wallShading ? Math.max(0, 1 - distance / this.renderDistance) : 1;

        this.#drawTextureWallSliceAlpha(texture.imageData.data, srcX, srcY, srcWidth, srcYStep,
                destImageData.data, dstOfs, maxDstOfs, dstYStep, shade);
    }

    /**
     *
     * @param {ImageDataArray} srcData the source texture data.
     * @param {number} srcX the x coordinate into the source texture.
     * @param {number} srcY the initial y coordinate into the source texture.
     * @param {number} srcWidth the width of the source texture
     * @param {number} srcYStep amount to increase srcY by to move to the next row.
     * @param {ImageDataArray} dstData the destination buffer to draw into.
     * @param {number} dstOfs the starting offset into the dstData.
     * @param {number} maxDstOfs the maximum dstOffset value. Iteration stops when dstOfs exceeds this amount.
     * @param {number} dstYStep amount to increase dstOfs by to move to the next row.
     * @param {number} shade
     */
    #drawTextureWallSliceAlpha(srcData, srcX, srcY, srcWidth, srcYStep, dstData, dstOfs, maxDstOfs, dstYStep, shade) {
        dstOfs *= 4;
        maxDstOfs *= 4;
        dstYStep = dstYStep * 4;

        while (dstOfs < maxDstOfs) {
            let srcOfs = (srcX + Math.floor(srcY) * srcWidth) * 4;

            const alpha = srcData[srcOfs + 3];
            if (alpha > 10) {
                dstData[dstOfs] = srcData[srcOfs++];
                dstData[dstOfs + 1] = srcData[srcOfs++];
                dstData[dstOfs + 2] = srcData[srcOfs];
                dstData[dstOfs + 3] = alpha * shade;
            }

            dstOfs += dstYStep;
            srcY += srcYStep;
        }
    }

    /**
     * Retrieves the ceiling texture for the given cell at the given timestamp.
     * @param {ScenarioMap} map the map the cell belongs to.
     * @param {MapCell} cell the cell to retrieve the ceiling texture for.
     * @param {DOMHighResTimeStamp} timestamp the timestamp for the texture to retrieve.
     * @return {Texture} the texture to use for the cell.
     */
    #getCeilingTexture(map, cell, timestamp) {
        return map.getCeilingStyle(cell ? cell.ceiling : undefined).getTexture(timestamp);
    }

    /**
     * Retrieves the floor testure for the given cell at the given timestamp.
     * @param {ScenarioMap} map the map the cell belongs to.
     * @param {MapCell} cell the cell to retrieve the floor texture for.
     * @param {DOMHighResTimeStamp} timestamp the timestamp for the texture to retrieve.
     * @return {Texture} the texture to use for the cell.
     */
    #getFloorTexture(map, cell, timestamp) {
        if (cell && cell.floor) {
            return map.getFloorStyle(cell.floor).getTexture(timestamp);
        }
        return map.getFloorStyle("default").getTexture(timestamp);
    }

    /**
     *
     * @param {DOMHighResTimeStamp} timestamp the timestamp to render for
     * @param {(map:ScenarioMap, cell:MapCell, timestamp:number) => Texture} textureProvider texture provider
     *        for retrieving cell floor textures
     * @param {number} x the screen column to render
     * @param {number} yOffset the vertical offset of the camera from the screen center, as a percentage of the screen height.
     * @param {boolean} ceiling whether to draw the ceiling or the floor
     * @param {Ray} ray the ray that was cast
     * @param {number} startY the screen top (ceiling) or bottom (floor) of the wall that the ray intersected.
     */
    #drawFloorOrCeiling(timestamp, textureProvider, x, yOffset, ceiling, ray, startY) {
        // FLOOR CASTING (vertical version, directly after drawing the vertical wall stripe for the current x)
        startY = Math.trunc(startY);

        // Calculate number of pixels and offsets to fill in current wall stripe
        const displayHeight = this.height;
        const drawHeight = ceiling ? startY : displayHeight - startY;

        let dstOfs = (x + startY * this.width) * 4;
        let dstOfsStep;
        let endY;
        let yStep;

        if (ceiling) {
            endY = 0;
            if (startY < endY) {
                return;
            }
            yStep = -1;
            dstOfsStep = this.width * -4;
        } else {
            endY = displayHeight;
            if (startY > endY) {
                return;
            }
            yStep = 1;
            dstOfsStep = this.width * 4;
        }

        const destImageData = this.imageBuffer;
        const dstData = destImageData.data;

        // Retrieve texture for current cell
        let txtCellX = ray.cellX;
        let txtCellY = ray.cellY;
        let texture = textureProvider(this.worldMap, ray.cell, timestamp);
        let textureW = texture.width;
        let textureH = texture.height;
        let srcData = texture.imageData.data;
        let srcDataWidth = texture.imageData.width;

        // Draw the slice from the center to the edge of the screen

        if (x == 300 && !ceiling) {
            this.setFoo(
                "timestamp = " + timestamp.toFixed(4) + "\n" +
                "fov = " + this.fieldOfView.toFixed(3) + "\n" +
                "cameraDist = "+ this.cameraDistance + "\n" +
                "cameraFovMagnitude = " + this.cameraFovMagnitude + "\n" +
                "projectionPlaneOffset = " + this.projectionPlaneOffset + "\n" +
                "wallShading = " + this.wallShading + "\n" +
                "ray.distance = " + ray.distance.toFixed(6) + "\n" +
                "ray.startX = " + ray.startX.toFixed(3) + " (cellX = " + ray.cellX + ")\n" +
                "ray.startY = " + ray.startY.toFixed(3) + " (cellY = " + ray.cellY + ")\n" +
                "ray.endX = " + ray.endX.toFixed(3) + "\n" +
                "ray.endY = " + ray.endY.toFixed(3) + "\n" +
                "ray.rayDirX = " + ray.rayDirX.toFixed(6) + "\n" +
                "ray.rayDirY = " + ray.rayDirY.toFixed(6) + "\n" +
                "texture size = " + texture.width + " x " + texture.height + "\n" +
                "dstOfs = " + dstOfs + " (" + x + ")\n" +
                "dstOfsStep = " + dstOfsStep + " \n" +
                "x = " + x + "\n" +
                "startY = " + startY + "\n" +
                "yStep = " + yStep + "\n" +
                "endY = " + endY + "\n" +
                "drawHeight = " + drawHeight
            )
        }

        const skyScale = this.cameraFovMagnitude * 4;
        let skyTexelYStep = skyScale / displayHeight;
        let skyTexelY = 1 - skyScale * (this.projectionPlaneCenter - startY) / displayHeight;

        let skyTexelX = Math.atan2(ray.rayDirY, ray.rayDirX);
        if (skyTexelX < 0) {
            skyTexelX += Math.PI * 2;
        }
        skyTexelX /= Math.PI * 2;

        let distRatio = -this.width /
                this.wallWidthToHeightRatio * (1/2 + (ceiling ? -yOffset : yOffset)) /
                (this.cameraFovMagnitude * 2);

        for (let y = startY; y != endY; y += yStep, skyTexelY -= skyTexelYStep) {
            // This is the calculation for wallHeight & wallTop used to render the walls,
            // solved for distance
            let currentDist = Math.abs(distRatio / (y - this.projectionPlaneCenter));

            // Compute the map cell for the current position on the screen
            const mapX = ray.startX + ray.rayDirX * currentDist;
            const mapY = ray.startY + ray.rayDirY * currentDist;
            const cellX = Math.floor(mapX);
            const cellY = Math.floor(mapY);
            if ((cellX != txtCellX) || (cellY != txtCellY)) {
                // Update texture if moved into a new cell
                txtCellX = cellX;
                txtCellY = cellY;

                const cell = this.worldMap.getCell(cellX, cellY);

                texture = textureProvider(this.worldMap, cell, timestamp);
                textureW = texture.width;
                textureH = texture.height;
                srcData = texture.imageData.data;
                srcDataWidth = texture.imageData.width;

                if (!cell && (cellX < -1 || cellY < -1 || cellX > this.worldMap.width || cellY > this.worldMap.height)) {
                    // If outside the map, draw the first pixel in red for a nice grid effect
                    let shade = this.wallShading ? Math.max(0, 1 - currentDist / this.renderDistance) : 1;
                    dstData[dstOfs] = 160;
                    dstData[dstOfs + 1] = 0;
                    dstData[dstOfs + 2] = 0;
                    dstData[dstOfs + 3] = Math.trunc(255 * shade);
                    dstOfs += dstOfsStep;
                    continue;
                }
            }

            let srcX;
            let srcY;
            let shade = 1;
            if (texture.isSky) {
                // Sky/background texture
                srcX = texture.x + Math.trunc(textureW * skyTexelX);
                srcY = texture.y + (skyTexelY < 0 ? 0 : Math.trunc(textureH * skyTexelY));
            } else {
                srcX = texture.x + Math.trunc((mapX - cellX) * textureW) % textureW;
                srcY = texture.y + Math.trunc((mapY - cellY) * textureH) % textureH;
                shade = this.wallShading ? Math.max(0, 1 - currentDist / this.renderDistance) : 1;
            }

            // Copy that pixel
            let srcOfs = (srcX + srcY * srcDataWidth) * 4;
            dstData[dstOfs] = srcData[srcOfs];
            dstData[dstOfs + 1] = srcData[srcOfs + 1];
            dstData[dstOfs + 2] = srcData[srcOfs + 2];
            dstData[dstOfs + 3] = Math.trunc(srcData[srcOfs + 3] * shade);

            dstOfs += dstOfsStep;
        }
    }

    /**
     *
     * @param {DOMHighResTimeStamp} timestamp
     */
    render(timestamp) {
        // Render each column
        for (let x = 0; x < this.width; x++) {
            this.#renderColumn(x, timestamp);
        }
        this.ctx.putImageData(this.imageBuffer, 0, 0);

        this.#drawPlayerIndicator();

        if (this.drawMap) {
            this.#drawMap();
        }
    }

    #drawPlayerIndicator() {
        // Simple crosshair
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const ctx = this.ctx;

        ctx.strokeStyle = 'rgb(0 255 255 / 40%)';
        ctx.lineWidth = 4;
        const size = 15;
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY);
        ctx.lineTo(centerX + size, centerY);
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX, centerY + size);
        ctx.stroke();
    }

    #drawMap() {
        const visibleCells = 10;
        const width = 200;
        const leftX = this.width - width - 10;
        const topY = 10;
        const ctx = this.ctx;
        const worldMap = this.worldMap;
        const player = this.player;

        const cellSize = width / visibleCells;
        const height = cellSize * visibleCells;

        // Set clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(leftX, topY, width, height);
        ctx.clip();

        ctx.fillStyle = "rgb(255 255 255 / 5%)";
        ctx.fillRect(leftX, topY, width, height);

        const horizMin = visibleCells / 2;
        const vertMin = visibleCells / 2;
        let relativeX = player.x - horizMin;
        let relativeY = player.y - vertMin;
        if (relativeX < 0) {
            relativeX = 0;
        } else if (relativeX > worldMap.width - visibleCells) {
            relativeX = Math.max(0, worldMap.width - visibleCells);
        }
        if (relativeY < 0) {
            relativeY = 0;
        } else if (relativeY > worldMap.height - visibleCells) {
            relativeY = Math.max(0, worldMap.height - visibleCells);
        }

        const startCellX = Math.floor(relativeX);
        const endCellX = Math.min(worldMap.width, startCellX + visibleCells + 1);
        const startCellY = Math.floor(relativeY);
        const endCellY = Math.min(worldMap.height, startCellY + visibleCells + 1);

        for (let y = startCellY; y < endCellY; ++y) {
            for (let x = startCellX; x < endCellX; ++x) {
                const cell = worldMap.getCell(x, y);
                const x1 = leftX + ((x - relativeX) * cellSize) + 1;
                const x2 = x1 + cellSize - 2;
                const y1 = topY + ((y - relativeY) * cellSize) + 1;
                const y2 = y1 + cellSize - 2;

                // Background
                let cellBackground;
                if (cell.ceiling) {
                    // Enclosed area
                    cellBackground = this.worldMap.getCeilingStyle(cell.ceiling).color;
                } else if (cell.special & 1) {
                    // Establishment
                    let establishmentColors = [
                        'rgb(0,    90, 240)', // Inns
                        'rgb(240, 120,   0)', // Taverns
                        'rgb(0,   210,   0)', // Banks
                        'rgb(240, 240,   0)', // Shops
                        'rgb(240,   0,   0)', // Smiths
                        'rgb(120, 120, 120)', // Scenarios
                        'rgb(  0, 210, 240)', // Healers
                        'rgb(240,   0, 240)', // Guilds
                    ];
                    cellBackground = establishmentColors[cell.special >>> 1];
                }

                if (cellBackground) {
                    ctx.fillStyle = cellBackground;
                    ctx.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
                }

                if (cell.special & 1) {
                    ctx.font = `${Math.max(1, cellSize - 4)}}px sans-serif`;
                    ctx.fillStyle = "black";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.textRendering = "optimizeSpeed";
                    ctx.fillText(cell.descriptionIndex.toString(16), (x1 + x2) / 2, (y1 + y2) / 2);
                }

                //

                ctx.lineWidth = 2;
                const missingColorStrokeStyle = "#D04040";

                // North wall
                const northWall = cell.northWall;
                if (northWall) {
                    ctx.strokeStyle = worldMap.getWallStyle(northWall).color || missingColorStrokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y1);
                    ctx.stroke();
                }

                // East wall
                const eastWall = cell.eastWall;
                if (eastWall) {
                    ctx.strokeStyle = worldMap.getWallStyle(eastWall).color || missingColorStrokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(x2, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }

                // South wall
                const southWall = cell.southWall;
                if (southWall) {
                    ctx.strokeStyle = worldMap.getWallStyle(southWall).color || missingColorStrokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(x1, y2);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }

                // West wall
                const westWall = cell.westWall;
                if (westWall) {
                    ctx.strokeStyle = worldMap.getWallStyle(westWall).color || missingColorStrokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x1, y2);
                    ctx.stroke();
                }
            }
        }

        // Draw player position
        const centerX = (player.x - relativeX) * cellSize + leftX;
        const centerY = (player.y - relativeY) * cellSize + topY;

        // Draw a ray ahead of the player
        this.#drawMapRay(player.orientation - this.fieldOfView / 2, visibleCells, centerX, centerY, cellSize, '#0000ff');
        this.#drawMapRay(player.orientation + this.fieldOfView / 2, visibleCells, centerX, centerY, cellSize, '#0000ff');
        this.#drawMapRay(player.orientation, visibleCells, centerX, centerY, cellSize, '#00ff00');

        // Draw player marker
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        const rad = cellSize * 0.6;
        const sweep = Math.PI * 2 / 3;
        ctx.moveTo(centerX + Math.cos(player.orientation) * rad,
            centerY + Math.sin(player.orientation) * rad);
        ctx.lineTo(centerX + Math.cos(player.orientation + sweep) * rad,
            centerY + Math.sin(player.orientation + sweep) * rad);
        ctx.lineTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(player.orientation + sweep * 2) * rad,
            centerY + Math.sin(player.orientation + sweep * 2) * rad);
        ctx.closePath()
        ctx.fill();

        ctx.restore();
    }

    /**
     *
     * @param {number} angle
     * @param {number} castDistance
     * @param {number} drawX
     * @param {number} drawY
     * @param {number} cellSize
     * @param {string | CanvasGradient | CanvasPattern} color
     */
    #drawMapRay(angle, castDistance, drawX, drawY, cellSize, color) {
        const hits = this.worldMap.castRayAtAngle(this.player.x, this.player.y, angle, castDistance, (hitData) => !hitData.wallStyle.transparent);
        const ray = hits[0];
        const ctx = this.ctx;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + Math.cos(angle) * ray.distance * cellSize,
            drawY + Math.sin(angle) * ray.distance * cellSize);
        //this.ctx.lineTo(startX + ray.endX * cellSize, startY + ray.endY * cellSize);
        ctx.stroke();
    }

    renderLoop() {
        this.#animationFrameRequested = false;
        const timestamp = document.timeline.currentTime;
        this.animations.updateAnimations(timestamp);
        this.render(timestamp);

        this.requestUpdate();
        const fps = this.frameRateTimer.recordFrame(timestamp);
        this.triggerEvent('render', {
            timestamp: timestamp,
            fps: fps
        });
    }

    requestUpdate() {
        if (!this.#animationFrameRequested) {
            this.#animationFrameRequested = true;
            requestAnimationFrame(() => this.renderLoop());
        }
    }

    setFoo(txt) {
        if (!this._foo) {
            this._foo = document.getElementById("foo");
        }
        this._foo.innerText = txt;
    }

}



// For a more advanced version with sprites:
class AdvancedRenderer extends Renderer {
    constructor(canvasId, worldMap) {
        super(canvasId, worldMap);
        this.sprites = [];
        this.spriteCache = new Map();
    }

    addSprite(x, y, type, size = 1) {
        this.sprites.push({
            x,
            y,
            type,
            size,
            id: Date.now() + Math.random()
        });
    }

    renderSprites() {
        // Sort sprites by distance from player
        const sortedSprites = this.sprites
            .map(sprite => {
                const dx = sprite.x - this.player.x;
                const dy = sprite.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return { ...sprite, distance };
            })
            .sort((a, b) => b.distance - a.distance);

        // Render each sprite
        sortedSprites.forEach(sprite => {
            this.renderSprite(sprite);
        });
    }

    renderSprite(sprite) {
        // Calculate sprite position on screen
        const dx = sprite.x - this.player.x;
        const dy = sprite.y - this.player.y;

        // Rotate sprite to player's view
        const angle = Math.atan2(dy, dx) - this.player.orientation;

        // Only render if sprite is in field of view
        if (Math.abs(angle) > this.fieldOfView / 2) return;

        // Calculate distance and screen position
        const distance = Math.sqrt(dx * dx + dy * dy);
        const spriteHeight = Math.min(this.height / distance, this.height);
        const spriteWidth = spriteHeight;

        const screenX = (angle / this.fieldOfView + 0.5) * this.width;
        const screenY = (this.height - spriteHeight) / 2;

        // Draw sprite
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(screenX - spriteWidth / 2, screenY, spriteWidth, spriteHeight);
    }

    render(timestamp) {
        super.render(timestamp);
        this.renderSprites();
    }

}
