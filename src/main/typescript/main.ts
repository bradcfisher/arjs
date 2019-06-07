import { GameState } from "./GameState";

export * from "./ResourceManager";
export * from "./Serializer";
export * from "./GameState";
export * from "./AudioManager";
export * from "./AudioClip";
export * from "./Karaoke";
export * from "./Parse";

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
