
export class ColorUtil {

    /**
     * Returns a randomly generated color style value.
     * @param {number=} minR the minimum R value for the color
     * @param {number=} minG the minimum G value for the color
     * @param {number=} minB the minimum B value for the color
     * @param {number=} maxR the maximum R value for the color
     * @param {number=} maxG the maximum G value for the color
     * @param {number=} maxB the maximum B value for the color
     * @returns the randomly generated color style
     */
    static random(minR = 80, minG = 80, minB = 80, maxR = 180, maxG = 180, maxB = 180) {
        const r = Math.round(minR + Math.random() * (maxR - minR));
        const g = Math.round(minG + Math.random() * (maxG - minG));
        const b = Math.round(minB + Math.random() * (maxB - minB));
        return `rgb(${r}, ${g}, ${b})`;
    }

}
