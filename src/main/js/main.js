import { GameState } from "./GameState.js";

export * from "./ResourceManager.js";
export * from "./Serializer.js";
export * from "./GameState.js";
export * from "./AudioManager.js";
export * from "./AudioNotification.js";
export * from "./AudioReader.js";
export * from "./AudioClip.js";
export * from "./Karaoke.js";
export * from "./Parse.js";

export * from "./ScenarioMap.js";
export * from "./CityMapReader.js";
export * from "./DungeonMapReader.js";
export * from "./MapRenderer.js";

// These classes aren't directly referenced in any other code, so are
// removed from the bundle without these refs.   They need to be included
// as they register themselves as factories for the item loading process.
export { PotionItemType } from "./PotionItemType.js";
export { SpellItemType } from "./SpellItemType.js";



// /*

// Load the GameState with a configuration
GameState.load("../AR/shared/json/AR.json")
	.then((gameState) => {
		// TODO: Do something with the GameState here
		console.log("GameState loaded successfully:", gameState);
	})
	.catch((reason) => {
		// TODO: Report the error to the user in a nicer way
		console.error("Unable to load main resource bundle '/AR/shared/json/AR.json': "+ reason)
	});

//*/
