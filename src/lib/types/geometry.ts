export type Point = { x: number; y: number };

export interface Edge {
	start: Point;
	end: Point;
}

export interface Box {
	pos: Point;
	width: number;
	height: number;
	rotation: number;
}
