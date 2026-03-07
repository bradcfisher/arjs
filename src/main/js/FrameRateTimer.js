
export class FrameRateTimer {
    #numFrames;
    #timestamps = [];
    #nextIndex = 0

    /**
     *
     * @param {number} numFrames the number of frames to collect timing data for.
     */
    constructor(numFrames) {
        this.#numFrames = numFrames;
        this.#timestamps.length = numFrames;

        const now = document.timeline.currentTime;
        this.#timestamps.fill(now);
    }

    // Records a new frame timestamp
    recordFrame(timestamp) {
        this.#timestamps[this.#nextIndex] = timestamp;
        this.#nextIndex = (this.#nextIndex + 1) % this.#numFrames;
        const minTimestamp = this.#timestamps[this.#nextIndex];
        const elapsedSeconds = (timestamp - minTimestamp) / 1000;

        return this.#numFrames / elapsedSeconds;
    }
}
