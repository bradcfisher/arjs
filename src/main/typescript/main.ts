import { GameState } from "./GameState";

export * from "./ResourceManager";
export * from "./Serializer";
export * from "./GameState";
export * from "./AudioManager";
export * from "./AudioClip";
export * from "./Karaoke";
export * from "./Parse";

export * from "./ScenarioMap";
export * from "./CityMapReader";
export * from "./MapRenderer";

// These classes aren't directly referenced in any other code, so are
// removed from the bundle without these refs.   They need to be included
// a they register themselves as factories for the item loading process.
export { PotionItemType } from "./PotionItemType";
export { SpellItemType } from "./SpellItemType";



// /*

// Load the GameState with a configuration
GameState.load("./AR.json")
	.then((gameState: GameState): void => {
		// TODO: Do something with the GameState here
		console.log("GameState loaded successfully:", gameState);
	})
	.catch((reason): void => {
		// TODO: Report the error to the user in a nicer way
		alert("Unable to load main resource bundle: "+ reason)
	});

//*/
