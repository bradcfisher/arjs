
import * as arjs from "../js/main.js";
/** @type {arjs.AudioManager} */
let audio;
/** @type {arjs.ActiveAudio} */
let currentClip;

/** @type {HTMLSelectElement} */
let sourceSelect;
/** @type {HTMLButtonElement} */
let playButton;
/** @type {HTMLButtonElement} */
let pauseButton;
/** @type {HTMLButtonElement} */
let stopButton;


document.addEventListener('DOMContentLoaded', function () {
	console.log("document ready");

	sourceSelect = document.getElementById("Source");
	playButton = document.getElementById("Play");
	pauseButton = document.getElementById("Pause");
	stopButton = document.getElementById("Stop");

	sourceSelect.addEventListener("change", function(evt) {
		setCurrentClip(sourceSelect.value);
	});

	document.querySelector("#Slider .Bar").addEventListener("mousedown", function(evt) {
		if (currentClip) {
			let P =
				currentClip.duration * evt.offsetX / evt.currentTarget.offsetWidth;

			setPosition(P);
		}
	});

	const resources = arjs.GameState.getResourceManager();
	audio = new arjs.AudioManager();

	resources.load(
		new arjs.ResourceMeta(
			"../AR/city/sounds/intro.ogg",
			"audio/ogg",
			"Alternate Reality: The City - Intro",
			["../AR/city/sounds/intro.json"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/intro.json",
			"Alternate Reality: The City - Intro lyrics",
			["../AR/city/sounds/intro.ogg"]
		),

		new arjs.ResourceMeta(
			"../AR/shared/sounds/death.ogg",
			"audio/ogg",
			"Alternate Reality: The Dungeon - Death",
			["../AR/shared/sounds/death.json"]
		),
		new arjs.ResourceMeta(
			"/AR/shared/sounds/death.json",
			"Alternate Reality: The Dungeon - Death lyrics",
			["/AR/shared/sounds/death.ogg"]
		),

		new arjs.ResourceMeta(
			"/AR/dungeon/sounds/rathskeller.ogg",
			"audio/ogg",
			"Alternate Reality: The Dungeon - The Devourer",
			["/AR/dungeon/sounds/rathskeller.json"]
		),
		new arjs.ResourceMeta(
			"/AR/dungeon/sounds/rathskeller.json",
			"Alternate Reality: The Dungeon - The Devourer lyrics",
			["/AR/dungeon/sounds/rathskeller.ogg"]
		),

		new arjs.ResourceMeta(
			"/AR/dungeon/sounds/rathskeller2.ogg",
			"audio/ogg",
			"Alternate Reality: The Dungeon - "
			//["/AR/dungeon/sounds/rathskeller2.json"]
		),
/*
		new arjs.ResourceMeta(
			"/AR/dungeon/sounds/rathskeller2.json",
			"Alternate Reality: The Dungeon -  lyrics",
			["/AR/dungeon/sounds/rathskeller2.ogg"]
		),
*/

		new arjs.ResourceMeta(
			"/AR/city/sounds/thoreandan.ogg",
			"audio/ogg",
			"Alternate Reality: The City - Thoreandan",
			["/AR/city/sounds/thoreandan.json"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/thoreandan.json",
			"Alternate Reality: The City - Thoreandan lyrics",
			["/AR/city/sounds/thoreandan.ogg"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/waves.ogg",
			"audio/ogg",
			"Alternate Reality: The City - Waves",
			["/AR/city/sounds/waves.json"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/waves.json",
			"Alternate Reality: The City - Waves lyrics",
			["/AR/city/sounds/waves.ogg"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/let_in_the_lite.ogg",
			"audio/ogg",
			"Alternate Reality: The City - Let in the Lite",
			["/AR/city/sounds/let_in_the_lite.json"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/let_in_the_lite.json",
			"Alternate Reality: The City - Let in the Lite lyrics",
			["/AR/city/sounds/let_in_the_lite.ogg"]
		)
	).then(
		(loadedResources) => {
			console.log("loaded resources: ", loadedResources);

			function processClip(url) {
console.log("creating promise for clip: "+ url, resources.get(url), resources.getEntry(url));

                // Process JSON
                const notifications = [];
                const json = resources.get(url.replace(/\.[^.]*$/, '.json'));
                if (json) {

                    arjs.Karaoke.registerNotifications(
                        clip,
                        json,
                        document.getElementById("Message"),
                        (notification) => {
                            let data = notification.data;
                            let el = document.getElementById("Notification_"+ notification.id);
                            if (el) {
                                el.focus();
                            }

                            console.log(data);
                        }
                    );
                }

                // Create audio clip
                const clip = new arjs.AudioClip(resources.get(url));
				audio.registerClip(url, clip);
			}

			for (var p in loadedResources) if (loadedResources.hasOwnProperty(p)) {
				if (loadedResources[p].meta.type.substring(0,6) == 'audio/') {
					processClip(p);
				}
			};

            console.log("all audio resources loaded, continuing");
            setCurrentClip(Parse.url("/AR/city/sounds/let_in_the_lite.ogg"));
		}
	)
});

function setCurrentClip(name) {
	if (currentClip) {
		stopAudio();
	}

	sourceSelect.value = name;

	currentClip = audio.prepare(name);
	updateNotifications(currentClip);

	playButton.disabled = false;
	playButton.style.display = 'inline';
	pauseButton.style.display = 'none';

	stopButton.disabled = true;
} // setCurrentClip

function setPosition(pos) {
	if (currentClip) {
		console.log("Setting position: ", pos);
		currentClip.position = pos;
		updatePosition();
	} else {
		console.log("Request to set position to", pos, ", but no current clip.");
	}
}

function playAudio() {
	playButton.style.display = 'none';
	pauseButton.style.display = 'inline';
	stopButton.disabled = false;

	currentClip = audio.prepare(sourceSelect.value);
	currentClip.start();

    // TODO...
	currentClip.on('stop', {"processEvent":stopAudio});

console.log('currentClip changed', currentClip);

	currentClip.manager.resume();
	requestAnimationFrame(updatePosition);
} // playAudio


function pauseAudio() {
	playButton.style.display = 'inline';
	pauseButton.style.display = 'none';
	currentClip.stop();
} // pauseAudio


function stopAudio() {
	playButton.style.display = 'inline';
	pauseButton.style.display = 'none';
	stopButton.disabled = true;
	currentClip.stop();
    currentClip.position = 0;
	clearMessageContext()
	//currentClip = undefined;
} // stopAudio

function adjustGain(delta) {
	if (currentClip) {
		let gain = currentClip.gain + delta;
		currentClip.gain = (gain < 0 ? 0 : (gain > 1.0 ? 1.0 : gain));
	}
} // adjustGain

function formatTime(seconds) {
	let s = (seconds % 60).toFixed(1);
	if (s.length == 3) {
		s = "0"+ s;
	}
	return Math.trunc(seconds / 60) +":"+ s;
} //formatTime

function updatePosition() {
	let T;
	let P = updatePosition.Position;
	if (!P) {
		P = updatePosition.Position = document.querySelector("#Slider .Position");
		T = updatePosition.Time = document.querySelector("#Slider .Time");
	} else
		T = updatePosition.Time;

	let x = (P.parent().width() - P.width()) * (currentClip ? currentClip.position / currentClip.duration : 0);
	P.css({ 'left' : x +"px" });

	if (currentClip)
		T.text(formatTime(currentClip.position) +" / "+ formatTime(currentClip.duration) +" (gain: "+ currentClip.gain.toFixed(1) +")");
	else
		T.text("");

	if (currentClip && currentClip.status == 'playing')
		requestAnimationFrame(updatePosition);
} // updatePosition

function clearMessageContext() {
	let messageCtx = document.getElementById("Message").getContext("2d");
	messageCtx.clearRect(0, 0, messageCtx.canvas.width, messageCtx.canvas.height);
} // clearMessageContext

function updateNotifications(clip) {
	let N = document.getElementById("Notifications");
	N.empty();

	for (let notification of clip.notifications) {
		if (notification.data && (notification.data.text || notification.data.line)) {
			let elem = N.append(
				'<div class="Notification" id="Notification_'+ notification.id +'" tabindex="0" _when="'+ notification.when +'">'+
				'<span class="Id">'+ notification.id +'</span>'+
				'<span class="Position">'+ notification.when.toFixed(3) +'</span>'+
				'<span class="Text"'+ (notification.data.color ? ' style="color:'+ notification.data.color +'"' : '') +'>'+ (notification.data.text ? notification.data.text : "&nbsp;") +'</span>'+
				'<span class="Line">'+ (notification.data.line ? notification.data.line : "&nbsp;") +'</span>'+
				'</div>'
			);
			elem.on("click", function(evt) {
				let row = $(evt.target);
				if (row[0].tagName != "DIV") {
					row = row.parent();
				}
				let pos = Number(row.attr("_when"));

				if (currentClip) {
					let playing = currentClip.playing;
					if (playing)
						currentClip.stop();

					setPosition(pos - 0.01);

					if (playing)
						currentClip.start();
				}
			});
		}
	}
} // updateNotifications