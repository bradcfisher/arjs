
import { ResourceManager, ResourceMeta, ResourceEntry } from "./ResourceManager";
import { AudioManager } from "./AudioManager";
import { AudioClip } from "./AudioClip";
import { AudioNotification } from "./AudioNotificationEntry";

/**
 * Represents the current state of the Karaoke player.
 */
class MessageStatus {
	/**
	 * The calculated width of the current line.
	 */
	width: number = 0;

	/**
	 * The current horizontal output position.
	 */
	x: number = 0;

	/**
	 * The current verse number.
	 */
	verse: number = 0;

	/**
	 * The text of the current line.
	 */
	line: string = "";

	/**
	 * The horizontal position of the start of the line.
	 */
	lineStart: number = 0;

	/**
	 * The color to apply when rendering the line.
	 * A value of "none" means do not render.
	 */
	lineColor: string = "none";
}

/**
 * Utility class that handles registration of audio notifications for rendering of Karaoke lyrics.
 */
export class Karaoke {

	/**
	 * @param	audioClip	The AudioClip instance to register the notifications on.  This
	 *						method will only add new notifications, and does not alter any
	 *						existing notifications already defined for the clip.
	 *
	 * @param	notifications	Array of objects defining the notifications to add to the clip.
	 *							The JSON format for audio notifications is as follows:
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
	 *
	 * `when` - [REQUIRED] The timestamp to register the notification for, in seconds.  May be an
	 *			absolute timestamp (eg. `12.5`), or an offset from the timestamp of the previous
	 *			entry (eg. `+0.2`).  Offsets are relative to the start of the clip if there is no
	 *			previous entry.
	 * `text` - Text (usually a syllable) to output at the current position when this notification is
	 *			triggered.  This may be either a string or an array of strings.  If a string, it will
	 *			be output.  If an array of strings, the string corresponding to the currently selected
	 *			verse (see `randomize`) will be output.
	 * `line` - A full line of text to output.  The value of this property is rendered and also
	 *			used for positioning subsequent `text` output, which will be rendered starting at the
	 *			beginning of the line.  The last `line` value read will be output immediately before
	 *			rendering a `text` value.  To prevent this behavior, set the `color` of the `line` to
	 *			"none".  Note that the output area will still be cleared when a new `line` is set,
	 *			even when the `color` is "none".  The value may be either a string or an array of
	 *			strings.  If a string, it will be used.  If an array of strings, the string
	 *			corresponding to the currently selected verse (see `randomize`) will be used.
	 * `color` - Specifies a color to use for any text output.  May be set to any valid string value
	 *			assignable to the HTML Canvas element's `fillStyle` property.  If set to 'none',
	 *			no output will be performed, though all positioning calculations will still be
	 *			performed.
	 * `reset` - When `true`, causes the current output position to reset back to the computed position
	 *			for the start of the current line before rendering any associated `text`.  This
	 *			property would typically be used to reset the output position when rendering the first
	 *			word in a line.
	 * `seek` - Indicates a position, in seconds, to seek the clip output to.
	 * `randomize` - If specified, causes the random selection of an integer 'verse' number between
	 *			0 and the value specified.
	 * `data` - Arbitrary data value associated with the notification.  Can be used by registered
	 *			listeners to perform arbitrary actions timed with the audio source.
	 *
	 * @param	lyricCanvas	The canvas element that Karaoke text should be rendered into.  The
	 *						rendered text will be centered within the canvas based on the current
	 *						line length, and will use the height of the canvas for the font size.
	 *
	 * @param	callback	An AudioNotification.Callback to invoke for each notification after
	 *						the standard processing is executed.
	 */
	static registerNotifications(
		audioClip: AudioClip,
		notifications: any[],
		lyricCanvas: HTMLCanvasElement,
		callback?: AudioNotification.Callback
	) {
		if (!lyricCanvas)
			throw new Error("lyricCanvas cannot be null");

		let tmpCtx: CanvasRenderingContext2D|null = lyricCanvas.getContext("2d");
		let messageCtx: CanvasRenderingContext2D;
		if (tmpCtx != null)
			messageCtx = tmpCtx;
		else
			throw new Error("Unable to retrieve 2D canvas context");

		messageCtx.font = (messageCtx.canvas.height * 0.9) + "px AlternateRealityTheDungeon";
		messageCtx.textBaseline = "bottom";
		messageCtx.setTransform(1, 0, 0, 1, 0, 0);

		let pos: number = 0;

		// Note: This is unique state created for each call to this method
		//		Normally, that should never be a problem, but could be an issue
		//		if the method is called multiple times on the same clip.
		let messageStatus: MessageStatus = new MessageStatus();

		for (let entry of notifications) {
			// Resolve relative time references
			let p: any = entry.when;
			if (typeof p == "string" && p.substr(0, 1) == "+")
				pos += Number(p) / 1000;
			else
				pos = Number(p) / 1000;

			// TODO: Clone entry instead of modifying the value passed in?

			entry.when = pos;
			entry._id = audioClip.addNotification(
				pos,
				entry,
				(notification: AudioNotification) => {
					let data: any = notification.data;

					if (data.randomize != null) {
						if (data.randomize < 1)
							data.randomize = 1;

						messageStatus.verse = Math.trunc(Math.random() * data.randomize);
					}

					if (data.line != null) {
						let line: any = data.line;
						if (Array.isArray(line)) {
							line = line[messageStatus.verse];
							if (line == null)
								line = "";
						}

						messageStatus.line = line;

						messageStatus.width = messageCtx.measureText(line).width;

						messageStatus.lineStart =
							messageStatus.x =
								(messageCtx.canvas.width - messageStatus.width) / 2;

						messageCtx.clearRect(0, 0, messageCtx.canvas.width, messageCtx.canvas.height);
					} else if (data.reset) {
						messageStatus.x = messageStatus.lineStart;
					}

					if (data.color) {
						if (data.line != null) {
							messageStatus.lineColor = data.color;
						} else {
							messageCtx.fillStyle = data.color.toLowerCase();
						}
					}

					if ((messageStatus.line != null) && (messageStatus.lineColor != "none")) {
						let currentColor: string|CanvasGradient|CanvasPattern = messageCtx.fillStyle;
						messageCtx.fillStyle = messageStatus.lineColor;
						messageCtx.fillText(messageStatus.line, messageStatus.lineStart, messageCtx.canvas.height);
						messageCtx.fillStyle = currentColor;
					}

					if (data.text) {
						let text: any = data.text;
						if (Array.isArray(text))
							text = text[messageStatus.verse];

						let width: number = messageCtx.measureText(text).width;
						messageCtx.clearRect(messageStatus.x, 0, Math.round(width), messageCtx.canvas.height);
						messageCtx.fillText(text, messageStatus.x, messageCtx.canvas.height);
						messageStatus.x += width;
					}

					if (data.seek != null) {
						requestAnimationFrame(function() {
							audioClip.position = data.seek;
							if (!audioClip.playing)
								audioClip.start();
						});
					}

					if (callback) callback(notification);
				}
			);
		}
	} // registerNotifications

	loadSong(
		resourceManager: ResourceManager,
		audioManager: AudioManager,
		audioSource: string|ResourceMeta,
		lyricSource: string|ResourceMeta
	): Promise<AudioClip> {
		let audioMeta: ResourceMeta;
		if (typeof audioSource === "string") {
			// TODO: type detection based on extension?
			audioMeta = new ResourceMeta(audioSource, "audio/ogg");
		} else
			audioMeta = (audioSource as ResourceMeta);

		let lyricMeta: ResourceMeta;
		if (typeof lyricSource === "string") {
			lyricMeta = new ResourceMeta(lyricSource, "application/json");
		} else
			lyricMeta = (lyricSource as ResourceMeta);

		audioMeta.depends = [lyricMeta.url];
		lyricMeta.depends = [audioMeta.url];

		return new Promise<AudioClip>((accept, reject) => {
			resourceManager.load(audioMeta, lyricMeta)
				.then(
					(loadedResources: { [url: string]: ResourceEntry; }) => {
						let audioClip = new AudioClip(
							audioManager,
							audioMeta.url,
							loadedResources[audioMeta.url].data as AudioBuffer
						);
						accept(audioClip);
					},
					(error: Error) => {
						reject(error);
					}
				);
		});
	} // loadSong

} // Karaoke
