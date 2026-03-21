
import { ResourceMeta } from "./ResourceManager.js";
import { GameState } from "./GameState.js";
import { AudioClip } from "./AudioClip.js";
import { AudioNotification } from "./AudioNotification.js";
import { Parse } from "./Parse.js";

/**
 * Represents the current state of the Karaoke player.
 */
class MessageStatus {
	/**
	 * The calculated width of the current line.
	 * @type {number}
	 */
	width = 0;

	/**
	 * The current horizontal output position.
	 * @type {number}
	 */
	x = 0;

	/**
	 * The current verse number.
	 * @type {number}
	 */
	verse = 0;

	/**
	 * The text of the current line.
	 * @type {string}
	 */
	line = "";

	/**
	 * The horizontal position of the start of the line.
	 * @type {number}
	 */
	lineStart = 0;

	/**
	 * The color to apply when rendering the line.
	 * A value of "none" means do not render.
	 * @type {string}
	 */
	lineColor = "none";
}

/**
 * Configuration options for a karaoke notification.
 *
 * ```typescript
 * {
 *   {
 *     "when": 0,
 *     "text": "some text"|["option 1", "option 2", ...],
 *     "line": "line of text"|["option 1", "option 2", ...],
 *     "color": <a valid html canvas element fillStyle value>,
 *     "reset": true|false,
 *     "seek": 12345,
 *     "randomize": <for verse randomization, specifies number of verses (text/line must be arrays)>,
 *     "notify": <some JSON value to send with the notification event>
 *   },
 *   ...
 * }
 * ```
 */
export class KaraokeNotificationOptions {
	/**
	 * [REQUIRED] The timestamp to register the notification for, in seconds.  Interpreted as an
	 * absolute timestamp when no sign is present (eg. `12.5`), or an offset from the timestamp of
	 * the previous entry when preceeded by a '+' symbol (eg. `+0.2`).  Offsets are relative to the
	 * start of the clip (0) if there is no previous entry. Values may be provided in any format
	 * supported by {@link Parse.duration}.
	 *
	 * @type {number|string}
	 */
	when;

	/**
	 * Text (usually a word or syllable) to output at the current position when this notification
	 * is triggered.  This may be either a string or an array of strings.  If a string, it will
	 * be output.  If an array of strings, the string corresponding to the currently selected
	 * verse (see `randomize`) will be output.
	 * @type {string|string[]|null}
	 */
	text;

	/**
	 * A full line of text to output.  The value of this property is rendered and also
	 * used for positioning subsequent `text` output, which will be rendered starting at the
	 * beginning of the line.  The last `line` value read will be output immediately before
	 * rendering a `text` value.  To prevent this behavior, set the `color` of the `line` to
	 * "none".  Note that the output area will still be cleared when a new `line` is set,
	 * even when the `color` is "none".  The value may be either a string or an array of
	 * strings.  If a string, it will be used.  If an array of strings, the string
	 * corresponding to the currently selected verse (see `randomize`) will be used.
	 * @type {string|string[]|null}
	 */
	line;

	/**
	 * Specifies a color to use for any text output.  May be set to any valid string value
	 * assignable to the HTML Canvas element's `fillStyle` property.  If set to the string 'none',
	 * no output will be performed, though all positioning calculations will still be
	 * performed.
	 * @type {string?}
	 */
	color;

	/**
	 * When `true`, causes the current output position to reset back to the computed position
	 * for the start of the current line before rendering any associated `text`.  This
	 * property would typically be used to reset the output position when rendering the first
	 * word in a line.
	 * @type {boolean?}
	 */
	reset;

	/**
	 * Indicates a position, in seconds, to seek the clip output to.
	 * @type {number?}
	 */
	seek;

	/**
	 * If specified, causes the random selection of an integer 'verse' number between
	 * 0 and the value specified.
	 * @type {number?}
	 */
	randomize;

	/**
	 * Arbitrary data value to dispatch with a notification event.  Can be used by registered
	 * listeners to perform arbitrary actions timed with the audio source.
	 * An event is dispatched only when a non-null value is provided.
	 *
	 * TODO: What is the target of this event?
	 *
	 * @type {any}
	 */
	data;
}

/**
 * Utility class that handles registration of audio notifications for rendering of Karaoke lyrics.
 */
export class Karaoke {

	/**
	 * @param {KaraokeNotificationOptions[]} notifications Array of objects defining the
	 *        notifications to add to the clip.
	 * @param {HTMLCanvasElement} lyricCanvas The canvas element that Karaoke text should be rendered into.
	 *        The rendered text will be centered within the canvas based on the current
	 *        line length, and will use the height of the canvas for the font size.
	 * @param {((options: KaraokeNotificationOptions) => void)?} callback callback to invoke for each
	 *        notification after the standard processing is executed.
	 */
	static registerNotifications(
		notifications,
		lyricCanvas,
		callback
	) {
		if (!lyricCanvas) {
			throw new Error("lyricCanvas cannot be null");
		}

		// tmpCtx is a workaround for a possible TypeScript static analysis bug.
		// While a nullable messageCtx should be usable here due to the null check,
		// the TypeScript compiler then complains about it being potentially nullable
		// within the lambda function created below.  That seems like a bug, since
		// the lambda won't be executed unless it get's past the null check.
		const tmpCtx = lyricCanvas.getContext("2d");
		/**
		 * @type {CanvasRenderingContext2D}
		 */
		let messageCtx;
		if (tmpCtx != null) {
			messageCtx = tmpCtx;
		} else {
			throw new Error("Unable to retrieve 2D canvas context");
		}

		messageCtx.font = (messageCtx.canvas.height * 0.9) + "px AlternateRealityTheDungeon";
		messageCtx.textBaseline = "bottom";
		messageCtx.setTransform(1, 0, 0, 1, 0, 0);

		let pos = 0;

		// Note: This is unique state created for each call to this method
		//		Normally, that should never be a problem, but could be an issue
		//		if the method is called multiple times on the same clip.
		const messageStatus = new MessageStatus();

		const result = [];
		for (let entry of notifications) {
			// Resolve relative time references
			let p = String(entry.when);
			if (p.substring(0, 1) == "+") {
				pos += Parse.duration(p, null, "s");
			} else {
				pos = Parse.duration(p, null, "s");
			}

			// TODO: Clone entry instead of modifying the value passed in?

			const notif = new AudioNotification(pos, (activeAudio, data) => {
				if (entry.randomize != null) {
					if (entry.randomize < 1) {
						entry.randomize = 1;
					}

					messageStatus.verse = Math.trunc(Math.random() * entry.randomize);
				}

				if (entry.line != null) {
					let line = entry.line;
					if (Array.isArray(line)) {
						line = line[messageStatus.verse];
						if (line == null) {
							line = "";
						}
					}

					messageStatus.line = line;

					messageStatus.width = messageCtx.measureText(line).width;

					messageStatus.lineStart =
						messageStatus.x =
							(messageCtx.canvas.width - messageStatus.width) / 2;

					messageCtx.clearRect(0, 0, messageCtx.canvas.width, messageCtx.canvas.height);
				} else if (entry.reset) {
					messageStatus.x = messageStatus.lineStart;
				}

				if (entry.color) {
					if (entry.line != null) {
						messageStatus.lineColor = entry.color;
					} else {
						messageCtx.fillStyle = entry.color.toLowerCase();
					}
				}

				if ((messageStatus.line != null) && (messageStatus.lineColor != "none")) {
					const currentColor = messageCtx.fillStyle;
					messageCtx.fillStyle = messageStatus.lineColor;
					messageCtx.fillText(messageStatus.line, messageStatus.lineStart, messageCtx.canvas.height);
					messageCtx.fillStyle = currentColor;
				}

				if (entry.text) {
					let text = entry.text;
					if (Array.isArray(text)) {
						text = text[messageStatus.verse];
					}

					const width = messageCtx.measureText(text).width;
					messageCtx.clearRect(messageStatus.x, 0, Math.round(width), messageCtx.canvas.height);
					messageCtx.fillText(text, messageStatus.x, messageCtx.canvas.height);
					messageStatus.x += width;
				}

				if (entry.seek != null) {
					requestAnimationFrame(function() {
						activeAudio.position = entry.seek;
						if (activeAudio.status == 'stopped') {
							activeAudio.play();
						}
					});
				}

				if (callback) callback(entry);
			},
			entry);

			entry.id = notif.id;

			result.push(notif);
			console.log("Notif = ", notif);
		}

		return result;
	} // registerNotifications

	/**
	 *
	 * @param {string|ResourceMeta} audioSource
	 * @param {string|ResourceMeta} lyricSource
	 * @returns {PromiseLike<AudioClip>}
	 */
	loadSong(
		audioSource,
		lyricSource
	) {
		/** @type {ResourceMeta} */
		let audioMeta;
		if (typeof audioSource === "string") {
			// TODO: type detection based on extension?
			audioMeta = new ResourceMeta(audioSource, "audio/ogg");
		} else
			audioMeta = audioSource;

		/** @type {ResourceMeta} */
		let lyricMeta;
		if (typeof lyricSource === "string") {
			lyricMeta = new ResourceMeta(lyricSource, "application/json");
		} else
			lyricMeta = lyricSource;

		audioMeta.depends = [lyricMeta.url];
		lyricMeta.depends = [audioMeta.url];

		return new Promise<AudioClip>((accept, reject) => {
			GameState.getResourceManager().load(audioMeta, lyricMeta)
				.then(
					(loadedResources) => {
						let audioClip = new AudioClip(
							GameState.getAudioManager(),
							audioMeta.url,
							loadedResources[audioMeta.url].data
						);
						accept(audioClip);
					},
					(error) => {
						reject(error);
					}
				);
		});
	} // loadSong

} // Karaoke
