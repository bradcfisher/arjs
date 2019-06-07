import { LatentEffects } from "./LatentEffects";


/*
0 - none
1 - wall
2 - secret door
3 - door
 - locked door - requires key (or spell?)
 - bolted door
 - enchanted door - requires spell?
 - archway
*/


export class MapCell {
	// TODO: Floor and ceiling may be based on zones?  Or perhaps an "indoor" flag instead of ceiling type?
	private _floor: number = 0;
	private _ceiling: number = 0;

	private _northWall: number = 0;		// type, texture, height?
	private _eastWall: number = 0;
	private _southWall: number = 0;
	private _westWall: number = 0;

	private _description: string = "";
	private _zone: number = 0;			// lighting / temperature / encounters / etc?
	private _message: string = "";
	private _special: number = 0;		// Does this include Lighting?  Or is that based on zones?

//	private _items / _data;

	// Perhaps these should just be on the zone instead?
	private readonly _effects: LatentEffects = new LatentEffects();		// enter (first? every?), leave
}


// Skybox
export class Map {

	private _width: number;
	private _height: number;
	private _cells: MapCell[];

	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;
		this._cells = new Array<MapCell>(width * height);
	}

}
