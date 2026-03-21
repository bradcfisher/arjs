
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
	playButton.addEventListener('click', playAudio);

	pauseButton = document.getElementById("Pause");
	pauseButton.addEventListener('click', pauseAudio);

	stopButton = document.getElementById("Stop");
	stopButton.addEventListener('click', stopAudio);

	document.getElementById("DecreaseGain").addEventListener('click', () => adjustGain(-0.1));
	document.getElementById("IncreaseGain").addEventListener('click', () => adjustGain(+0.1));

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
			"/AR/city/sounds/intro.ogg",
			"audio/ogg",
			"Alternate Reality: The City - Intro",
			["/AR/city/sounds/intro.json"]
		),
		new arjs.ResourceMeta(
			"/AR/city/sounds/intro.json",
			"Alternate Reality: The City - Intro lyrics",
			["/AR/city/sounds/intro.ogg"]
		),

		new arjs.ResourceMeta(
			"/AR/shared/sounds/death.ogg",
			"audio/ogg",
			"Alternate Reality: The Dungeon - Death",
			["/AR/shared/sounds/death.json"]
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

			function processClip(url, resource) {
console.log("creating promise for clip: "+ url, resource.data, resource.meta);

                // Process JSON
                let notifications = [];
                const json = resources.get(url.replace(/\.[^.]*$/, '.json'));
                if (json) {
                    notifications = arjs.Karaoke.registerNotifications(
                        json,
                        document.getElementById("Message"),
                        (data) => {
                            let el = document.getElementById("Notification_"+ data.id);
                            if (el) {
                                el.focus();
                            }

                            console.log(data);
                        }
                    );
                }

				notifications.push(new arjs.AudioNotification(resource.data.duration,
					(activeAudio) => activeAudio.triggerEvent('stop')));

                // Create audio clip
                const clip = new arjs.AudioClip(resource.data, {
					notifications
				});
				audio.registerClip(url, clip);
			}

			let options = [];
			for (var p in loadedResources) if (loadedResources.hasOwnProperty(p)) {
				if (loadedResources[p].meta.type.substring(0,6) == 'audio/') {
					processClip(p, loadedResources[p]);

					const option = document.createElement('option');
					option.value = p;
					option.text = loadedResources[p].meta.description;
					options.push(option);
				}
			};

			while (sourceSelect.firstChild) {
				sourceSelect.removeChild(sourceSelect.firstChild);
			}

			options.sort((a, b) => a.text < b.text ? -1 : (a.text > b.text ? 1 : 0));
			for (let option of options) {
				sourceSelect.appendChild(option);
			}

            console.log("all audio resources loaded, continuing");

            setCurrentClip("/AR/city/sounds/let_in_the_lite.ogg");
		}
	)
});

function setCurrentClip(name) {
	if (currentClip) {
		stopAudio();
	}

	sourceSelect.value = name;

	const clip = audio.getClip(name);
	currentClip = audio.prepare(clip);
	currentClip.on('stop', stopAudio);
	updateNotifications(clip.notifications);

	playButton.disabled = false;
	playButton.style.display = 'inline';
	pauseButton.style.display = 'none';

	stopButton.disabled = true;

	console.log('currentClip changed', currentClip);
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

	//currentClip = audio.prepare(sourceSelect.value);
	currentClip.play();

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
	/** @type {HTMLElement?} */
	let T;
	/** @type {HTMLElement?} */
	let P = updatePosition.Position;
	if (!P) {
		P = updatePosition.Position = document.querySelector("#Slider .Position");
		T = updatePosition.Time = document.querySelector("#Slider .Time");
	} else {
		T = updatePosition.Time;
	}

	let x = (P.parentElement.clientWidth - P.clientWidth) * (currentClip ? currentClip.position / currentClip.duration : 0);
	P.style.left = x +"px";

	if (currentClip)
		T.innerText = formatTime(currentClip.position) +" / "+ formatTime(currentClip.duration)
	// +" (gain: "+ currentClip.gain.toFixed(1) +")";
	else
		T.innerText = "";

	if (currentClip && currentClip.status == 'playing') {
		requestAnimationFrame(updatePosition);
	}
} // updatePosition

function clearMessageContext() {
	let messageCtx = document.getElementById("Message").getContext("2d");
	messageCtx.clearRect(0, 0, messageCtx.canvas.width, messageCtx.canvas.height);
} // clearMessageContext

function updateNotifications(notifications) {
	let N = document.getElementById("Notifications");
	while (N.firstChild) {
		N.removeChild(N.firstChild);
	}

	const createContainer = document.createElement("SPAN");
	for (let notification of notifications) {
		if (notification.data && (notification.data.text || notification.data.line)) {
			createContainer.innerHTML = '<div class="Notification" id="Notification_'+ notification.id +'" tabindex="0" _when="'+ notification.when +'">'+
				'<span class="Id">'+ notification.id +'</span>'+
				'<span class="Position">'+ notification.when.toFixed(3) +'</span>'+
				'<span class="Text"'+ (notification.data.color ? ' style="color:'+ notification.data.color +'"' : '') +'>'+ (notification.data.text ? notification.data.text : "&nbsp;") +'</span>'+
				'<span class="Line">'+ (notification.data.line ? notification.data.line : "&nbsp;") +'</span>'+
				'<span class="Json">'+ JSON.stringify(notification.data) +'</span>' +
				'</div>';

			let elem = N.appendChild(createContainer.firstChild);
			elem.addEventListener("click", function(evt) {
				/** @type {HTMLElement} */
				let row = evt.target;
				if (row.nodeName != "DIV") {
					row = row.parentElement;
				}
				let pos = Number(row.getAttribute("_when"));

				if (currentClip) {
					let playing = (currentClip.status == 'playing');
					if (playing) {
						currentClip.stop();
					}

					setPosition(pos - 0.01);

					if (playing) {
						currentClip.play();
					}
				}
			});
		}
	}
} // updateNotifications