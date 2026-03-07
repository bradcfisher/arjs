

export class TextureProvider {
    /**
     * Retrieve the texture for the specified timestamp.
     * @param {number} timestamp the timestamp the texture is being retrieved for.
     * @returns {Texture} the texture to display for the timestamp.
     */
    getTexture(timestamp) {
        throw new Error("Not implemented. Subclasses must implement this method.");
    }
}

export class Texture extends TextureProvider {
    /**
     * Constructs a new texture sourced from the provided image data.
     * @overload
     *
     * @param {ImageData} imageData the source image data containing the texture.
     */
    /**
     * Constructs a new texture sourced from the provided image data.
     * @overload
     *
     * @param {ImageData} imageData the source image data containing the texture.
     * @param {number} x the starting x coordinate of the texture within the source image data.
     * @param {number} y the starting y coordinate of the texture within the source image data.
     * @param {number} width the width of the texture within the source image data. If this value
     *        is a negative number, the texture will be reversed horizontally relative to the source
     *        image data.
     * @param {number} height the height of the texture within the source image data. If this value
     *        is a negative number, the texture will be reversed vertically relative to the source
     *        image data.
     */
    constructor(imageData, x, y, width, height) {
        super();

        /**
         * The source image data containing the texture.
         * @type {ImageData}
         */
        this.imageData = imageData;

        if (arguments.length == 5) {
            if (x < 0 || x >= imageData.width) {
                throw new Error("Invalid texture x value " + x +". Value must be between 0 and " + (imageData.width - 1));
            }
            if (y < 0 || y >= imageData.height) {
                throw new Error("Invalid texture y value " + y +". Value must be between 0 and " + (imageData.height - 1));
            }
            if (x + width < -1 || x + width > imageData.width) {
                throw new Error("Invalid texture width value " + width +". Sum of x and width must be between 0 and " + (imageData.width - 1));
            }
            if (y + height < -1 || y + height > imageData.height) {
                throw new Error("Invalid texture height value " + width +". Sum of y and height must be between 0 and " + (imageData.height - 1));
            }

            /**
             * The starting x coordinate of the texture within the source image data.
             * @type {number}
             */
            this.x = x;

            /**
             * The starting y coordinate of the texture within the source image data.
             * @type {number}
             */
            this.y = y;

            /**
             * The width of the texture within the source image data. If this value is a negative number,
             * the texture will be reversed horizontally relative to the source image data.
             * @type {number}
             */
            this.width = width;

            /**
             * The height of the texture within the source image data. If this value is a negative number,
             * the texture will be reversed vertically relative to the source image data.
             * @type {number}
             */
            this.height = height;
        } else if (arguments.length == 1) {
            this.x = 0;
            this.y = 0;
            this.width = imageData.width;
            this.height = imageData.height;
        } else {
            throw new Error("Must provide either 1 or 5 arguments. " + arguments.length + " provided.");
        }
    }

    desc() {
        return "[x=" + this.x + ", y=" + this.y + " | w=" + this.width + " x h=" + this.height + "] of [" +
            this.imageData.width + " x " + this.imageData.height + "]";
    }

    toString() {
        return "Texture(" + this.desc() + ")";
    }

    /**
     * Retrieve the texture for the specified timestamp.
     *
     * This implementation always returns this texture. Other types, such as AnimatedTexture
     * may return different textures based on the timestamp.
     *
     * @param {number} timestamp the timestamp the texture is being retrieved for.
     * @returns {Texture} this texture.
     */
    getTexture(timestamp) {
        return this;
    }

}

const size = 512;
const offscreenCanvas = new OffscreenCanvas(size, size);
const offscreenCtx = offscreenCanvas.getContext("2d", {"willReadFrequently": true});

/**
 * Creates a 512 x 512 image data with a solid primary fill color.
 * @param {string} fillColor the primary fill color for the texture.
 * @param {string=} borderColor the border color for the texture. If not provided, no border is drawn.
 * @param {number} lineWidth the width for the border, if one is drawn.
 * @param {string=} labelText text to render in the middle of the texture. If text is specified, it is rendered
 *        center justified using a 70px sans-serif font. Multiple lines may be separated with new line characters,
 *        but no other formatting is supported.
 * @returns {ImageData} the newly created texture image data.
 */
function createSolidColorTextureImageData(fillColor, borderColor, lineWidth = 2, labelText) {
    offscreenCtx.fillStyle = fillColor;
    offscreenCtx.fillRect(0, 0, size, size);

    if (borderColor) {
        offscreenCtx.strokeStyle = borderColor;
        offscreenCtx.lineWidth = lineWidth;
        offscreenCtx.strokeRect(0, 0, size, size);
    }

    if (labelText) {
        const fontHeight = 70;
        offscreenCtx.font = `${fontHeight}px sans-serif`;
        offscreenCtx.textAlign = "center";
        offscreenCtx.textBaseline = "middle";
        offscreenCtx.fillStyle = "black";

        const lines = labelText.split("\n");
        let y = (size - (lines.length - 1) * fontHeight) / 2;

        for (let line of lines) {
            offscreenCtx.fillText(line, size / 2, y, size - 4);
            y += fontHeight;
        }
    }

    return offscreenCtx.getImageData(0, 0, size, size);
}

export class SolidColorTexture extends Texture {
    constructor(color, borderColor = "white", label) {
        super(createSolidColorTextureImageData(color, borderColor, 4, label));

        /**
         * The color of the texture.
         * @type {string}
         */
        this.color = color;

        this.borderColor = borderColor;

        this.label = label;
    }

    toString() {
        return `SolidColorTexture(${this.desc()}, color = ${this.color}, borderColor = ${this.borderColor}, label=${this.label})`;
    }
}

export class TextureFrame extends Texture {
    /**
     * Constructs a new texture frame sourced from the provided image data.
     * @overload
     *
     * @param {number} duration the amount of time this texture should be displayed before progressing to the next frame.
     * @param {ImageData} imageData the source image data containing the texture.
     */
    /**
     * Constructs a new texture frame sourced from the provided image data.
     * @overload
     *
     * @param {number} duration the amount of time this texture should be displayed before progressing to the next frame.
     * @param {ImageData} imageData the source image data containing the texture.
     * @param {number} x the starting x coordinate of the texture within the source image data.
     * @param {number} y the starting y coordinate of the texture within the source image data.
     * @param {number} width the width of the texture within the source image data. If this value
     *        is a negative number, the texture will be reversed horizontally relative to the source
     *        image data.
     * @param {number} height the height of the texture within the source image data. If this value
     *        is a negative number, the texture will be reversed vertically relative to the source
     *        image data.
     */
    constructor(duration, imageData, x, y, width, height) {
        super(imageData, x, y, width, height);
        this.duration = duration;
    }

    toString() {
        return "TextureFrame(" + this.desc() + ", duration=" + this.duration + ")";
    }
}

export class AnimatedTextureProvider extends TextureProvider {
    /**
     * Constructs a new AnimatedTextureProvider from a list of TextureFrames.
     * @param {TextureFrame[]} frames list of TextureFrames that comprise the animation.
     */
    constructor(frames) {
        super();

        /**
         * The total duration of the animation
         * @type {number}
         */
        this.duration = 0;

        frames.forEach((f) => {
            this.duration += f.duration;
        });

        /**
         * The frames of the animation.
         * @type {TextureFrame[]}
         */
        this.frames = frames;

        this.currentFrameNum = 0;
        this.currentFrame = this.frames[0];
        this.firstFrameDuration = this.currentFrame.duration;
        this.nextTimestamp = this.firstFrameDuration;
    }

    /**
     * Retrieve the texture for the specified timestamp.
     * @param {number} timestamp the timestamp the texture is being retrieved for.
     * @returns {Texture} the texture to display for the timestamp.
     */
    getTexture(timestamp) {
        let time = timestamp % this.duration;

        if (this.currentFrameNum > 0 && time < this.firstFrameDuration) {
            this.currentFrameNum = 0;
            this.currentFrame = this.frames[0];
            this.nextTimestamp = this.firstFrameDuration;
        } else {
            while (time > this.nextTimestamp) {
                this.currentFrameNum++;
                this.currentFrame = this.frames[this.currentFrameNum];
                this.nextTimestamp += this.currentFrame.duration;
            }
        }

        return this.currentFrame;
    }

    toString() {
        return "AnimatedTextureProvider(duration = " + this.duration +
            ", currentFrameNum = " + this.currentFrameNum +
            ", nextTimestamp = " + this.nextTimestamp +
            ", frames = " + this.frames + ")";
    }
}
