import { AudioNotification } from "./AudioNotification.js";
import { Parse } from "./Parse.js";


/**
 * Parses an audio sample position/duration value, returning the number of samples it represents
 * within an audio stream with the specified sample rate.
 *
 * @param {(number|string)?} position the value to parse.
 * @param {(number|string)?} defaultPosition the default value to use if the `position` is
 *        null. If this value is also null, the method will throw an error.
 * @param {number} sampleRate the number of samples per second for the audio.
 *
 * @returns {number} the parsed sample position.
 *
 * @throws {Error} if both `position` and `defaultPosition` are null.
 */
function parseSample(position, defaultPosition, sampleRate) {
	if (position == null) {
		if (defaultPosition == null) {
			throw new Error("Audio sample number or value in seconds required");
		}
		position = defaultPosition;
	}

	if (isNaN(position)) {
		position = Parse.duration(position, defaultPosition, "s") * sampleRate;
	}

	// Absolute sample position
	return Math.trunc(position);
}


export class AudioClipOptions {

	/**
	 * Gain amount to apply to the clip.
	 * @type {number}
	 * @readonly
	 */
	gain;

	/**
	 * Pitch adjustment to apply to the clip.
	 *
	 * For example, values of +100 and -100 detune the source up or down by one
	 * semitone, while +1200 and -1200 detune it up or down by one octave.
	 *
	 * @type {number}
	 * @readonly
	 */
	detune;

	/**
	 * Playback rate adjustment to apply to the clip.
	 *
	 * A value of 1.0 indicates it should play at the same speed as its sampling rate,
	 * values less than 1.0 cause the sound to play more slowly, while values greater
	 * than 1.0 result in audio playing faster than normal.
	 * @type {number}
	 * @readonly
	 */
	playbackRate;

	/**
	 * Whether the clip should loop repeatedly or not.
	 * @type {boolean}
	 * @readonly
	 */
	loop;

	/**
	 * X position of the audio in map space.
	 * @type {number?}
	 * @readonly
	 */
	x;

	/**
	 * Y position of the audio in map space.
	 * @type {number}
	 * @readonly
	 */
	y;

	/**
	 * Height of the audio clip in map space.
	 * @type {number}
	 * @readonly
	 */
	height;

	/**
	 * The sample position within the buffer where playback will begin.
	 * @type {number}
	 * @readonly
	 */
	start;

	/**
	 * The length of playback in samples.
	 * @type {number}
	 * @readonly
	 */
	length;

	/**
	 * Notifications registered for this clip.
	 * @type {AudioNotification[]}
	 * @readonly
	 */
	notifications;

}

/**
 * A reusable AudioClip definition.
 *
 * AudioClips can be provided to an AudioManager for playback or to register them for retrieval
 * and playback at a later time.
 */
export class AudioClip {

	/**
	 * The AudioBuffer containing the audio data for this clip.
	 * @readonly
	 * @type {AudioBuffer}
	 */
	#buffer;

	/**
	 * The AudioBuffer containing the audio data for this clip.
	 */
	get buffer() {
		return this.#buffer;
	}

	/**
	 * @type {number}
	 */
	#gain = 1;

	/**
	 * Gain amount to apply to the clip.
	 */
	get gain() {
		return this.#gain;
	}

	/**
	 * @type {number}
	 */
	#detune = 0;

	/**
	 * Pitch adjustment to apply to the clip.
	 *
	 * For example, values of +100 and -100 detune the source up or down by one
	 * semitone, while +1200 and -1200 detune it up or down by one octave.
	 *
	 * @see {@link AudioBufferSourceNode.detune}
	 */
	get detune() {
		return this.#detune;
	}

	/**
	 * @type {number}
	 */
	#playbackRate = 1;

	/**
	 * Playback rate adjustment to apply to the clip.
	 *
	 * A value of 1.0 indicates it should play at the same speed as its sampling rate,
	 * values less than 1.0 cause the sound to play more slowly, while values greater
	 * than 1.0 result in audio playing faster than normal.
	 *
	 * The default value is 1 (unchanged).
	 *
	 * @see {@link AudioBufferSourceNode.}
	 */
	get playbackRate() {
		return this.#playbackRate;
	}

	/**
	 * @type {boolean}
	 */
	#loop = false;

	/**
	 * Whether the clip should loop repeatedly or not.
	 * The default is `false`.
	 */
	get loop() {
		return this.#loop;
	}

	/**
	 * @type {number?}
	 */
	#x;

	/**
	 * X position of the audio in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get x() {
		return this.#x;
	}

	/**
	 * @type {number?}
	 */
	#y;

	/**
	 * Y position of the audio in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get y() {
		return this.#y;
	}

	/**
	 * @type {number?}
	 */
	#height;

	/**
	 * Height of the audio clip in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get height() {
		return this.#height;
	}

	/**
	 * @type {number}
	 */
	#startSample = 0;

	/**
	 * The sample position within the buffer where playback will begin.
	 */
	get startSample() {
		return this.#startSample;
	}

	/**
	 * The ending sample for the clip (non-inclusive).
	 * @type {number}
	 */
	#endSample;

	/**
	 * The ending sample for the clip (non-inclusive).
	 */
	get endSample() {
		return this.#endSample;
	}

	/**
	 * The length of playback in samples.
	 */
	get length() {
		return this.#endSample - this.#startSample;
	}

	/**
	 * Notifications registered for this clip.
	 */
	#notifications = [];

	get notifications() {
		return this.#notifications;
	}

	/**
	 * The number of audio channels for this clip.
	 */
	get numberOfChannels() {
		return this.#buffer.numberOfChannels;
	}

	/**
	 * The sample rate of the underlying audio buffer, in Hz.
	 */
	get sampleRate() {
		return this.#buffer.sampleRate;
	}

	/**
	 * The duration of the clip playback, in seconds.
	 * The duration reported is a combination of the duration of the AudioBuffer
	 * and the assigned playback rate.
	 */
	get duration() {
		return this.length / this.sampleRate / this.#playbackRate;
	}

	/**
	 * @type {AudioClipOptions}
	 */
	get config() {
		return {
			start: this.#startSample,
			length: this.length,
			gain: this.#gain,
			detune: this.#detune,
			playbackRate: this.#playbackRate,
			loop: this.#loop,
			x: this.#x,
			y: this.#y,
			height: this.#height,
			notifications: this.#notifications.slice()
		};
	}

	/**
	 * Creates a new AudioClip.
	 * @param {AudioBuffer} buffer the AudioBuffer containing the sprite's audio.
	 * @param {AudioClipOptions} options the options for configuring the AudioClip.
	 */
	constructor(buffer, options) {
		if (!(buffer instanceof AudioBuffer)) {
			throw new Error("An AudioBuffer is required, not " + buffer);
		}

		if (options == null) {
			options = {};
		}

		this.#buffer = buffer;
		this.#startSample = parseSample(options.start, 0, buffer.sampleRate);
		this.#endSample = (options.length == null)
			? buffer.length
			: this.#startSample + parseSample(options.length, null, buffer.sampleRate);
		this.#detune = Parse.prop(options, ["detune"], 0, Parse.num);
		this.#loop = Parse.prop(options, ["loop"], false, Parse.bool);
		this.#gain = Parse.prop(options, ["gain"], 1, Parse.num);
		this.#playbackRate = Parse.prop(options, ["playbackRate"], 1, Parse.num);
		this.#x = (options.x == null ? null : Parse.prop(options, ["x"], null, Parse.num));
		this.#y = (options.y == null ? null : Parse.prop(options, ["y"], null, Parse.num));
		this.#height = Parse.prop(options, ["height"], 0, Parse.num);

		if (this.#startSample < 0 || this.#startSample >= buffer.length) {
			throw new Error("Start sample must be between [0, " + buffer.length +
					"): " + this.#startSample);
		}

		if (this.#endSample <= this.#startSample || this.#endSample > buffer.length) {
			throw new Error("Sample length must be in [1, " +
				(buffer.length - this.#startSample) + "]: " +
				(this.#endSample - this.#startSample));
		}

		this.#notifications = Parse.array(options.notifications, [], (value) => {
			const whenSample = parseSample(value.when, null, buffer.sampleRate);

			if (whenSample < 0 || whenSample >= length) {
				throw new Error("Notification sample must be between [0, " + length +
					"): " + whenSample);
			}

			return new AudioNotification(whenSample, Parse.action(value.callback));
		});
		this.#notifications.sort((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0));
	}

}
