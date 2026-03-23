
import * as arjs from "../js/main.js";

function executeConsoleCode() {
	console.log("executeConsoleCode");

	let source = document.getElementById("Console").value;
	let fn = arjs.Parse.action(source, null, ['arjs', 'gameState']);
	fn(arjs, gameState);
}

let cal;
let gameClock;
let gameState;

document.addEventListener('DOMContentLoaded', function () {
	console.log("document ready");

	document.querySelectorAll("button.GameSpeed").forEach((button) => {
		button.addEventListener("click", (evt) => {
			const speed = Number(evt.target.getAttribute("_speed"));
			console.log("Setting game speed to ", speed);
			gameClock.tickDelay = speed;
		});
	});

	document.getElementById("ApplyCurrentTime").addEventListener("click", (evt) => {
		const currentTime = document.getElementById('TimestampInput').value;
		console.log("Setting current game time to ", currentTime);
		gameClock.setCurrent(currentTime);
	});

	document.getElementById("ExecuteConsoleCode")
		.addEventListener("click", (evt) => { executeConsoleCode(); });

	arjs.GameState.load("/AR/shared/json/AR.json").then((gs) => {
		gameState = gs;
		jsonLoaded();
	});
});

function jsonLoaded() {
	cal = gameState.clock.calendar;
	gameClock = gameState.clock;

/*
	let action = arjs.Parse.listener("console.log(event);");
	gameClock.on("minuteRollover", action);
	gameClock.on("hourRollover", action);
	gameClock.on("dayRollover", action);
	gameClock.on("monthRollover", action);
	gameClock.on("yearRollover", action);
*/

	console.log("created game config");

	let tickDelaySpan = document.getElementById("TickDelay");
	let timestampSpan = document.getElementById("Timestamp");
	let gameDateSpan = document.getElementById("GameDate");
	let tsToDateSpan = document.getElementById("TimestampDate");
	let dateToTsSpan = document.getElementById("DateTimestamp");
	let normTimeSpan = document.getElementById("NormalizedTime");
	let numDateSpan = document.getElementById("NumericDate");

	if (tickDelaySpan == null || timestampSpan == null || gameDateSpan == null || tsToDateSpan == null || dateToTsSpan == null || normTimeSpan == null || numDateSpan == null) {
		throw new Error("Unable to find required document element");
	}

	function animate(now) {
		timestampSpan.innerHTML = String(gameClock.current);
		tickDelaySpan.innerHTML = gameClock.tickDelay;
		let a = gameDateSpan.innerHTML = cal.dateToString(gameClock);
		let b = tsToDateSpan.innerHTML = cal.dateToString(cal.timestampToDate(gameClock.current));
		let c = dateToTsSpan.innerHTML = cal.dateToTimestamp(gameClock);
		let d = normTimeSpan.innerHTML = cal.dateToString(cal.normalizeDate(gameClock));

		let month = gameClock.month + 1;
		let e = numDateSpan.innerHTML =
			(gameClock.year < 100 ? "0" : "") + (gameClock.year < 100 ? "0" : "") +
			(gameClock.year < 10 ? "0" : "") + gameClock.year + "-" +
			(month < 10 ? "0" : "") + month + "-" +
			(gameClock.day < 10 ? "0" : "") + gameClock.day + " " +
			(gameClock.hour < 10 ? "0" : "") + gameClock.hour + ":" +
			(gameClock.minute < 10 ? "0" : "") + gameClock.minute;

		gameClock.update(now);

/*
		if (a != b)
			console.error("The timestamps do not match (a,b): "+ a +" != "+ b);

		if (a != c)
			console.error("The timestamps do not match (a,c): "+ a +" != "+ c);

		if (b != c)
			console.error("The timestamps do not match (b,c): "+ b +" != "+ c);
*/

		requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
}