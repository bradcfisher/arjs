

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
	private _floor: number;
	private _ceiling: number;
	private _northWall: number;		// type, texture, height?
	private _eastWall: number;
	private _southWall: number;
	private _westWall: number;

	private _description: string;
	private _zone: number;
	private _message: string;
	private _special: number;		// Does this include Lighting?  Or is that based on zones?

//	private _items / _data;
	private _events: any[];		// enter (first? every?), leave
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
