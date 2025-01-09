import type { Box, Point } from './geometry';

export type Tool = keyof ToolSettings | 'eraser' | 'hand' | 'arrow';

export interface ToolSettings {
	pencil: {
		thickness: number;
		color: string;
		opacity: number;
		useContrast: boolean;
	};
	shapes: {
		shape: 'ellipse' | 'rectangle' | 'triangle' | 'rhombus' | 'star';
		thickness: number;
		color: string;
		fillColor: string;
		opacity: number;
		fillOpacity: number;
		useContrast: boolean;
		useContrastFill: boolean;
	};
	line: {
		thickness: number;
		color: string;
		opacity: number;
		useContrast: boolean;
	};
	text: {
		fontSize: number;
		thickness: number;
		color: string;
		fillColor: string;
		fillOpacity: number;
		fontFamily: string;
		useContrast: boolean;
		useContrastFill: boolean;
		opacity: number;
	};
}

export interface Object {
	id: string;
	type: 'pencil' | 'shapes' | 'line' | 'text' | 'image' | 'group';
	box: Box;
	start: Point;
	end: Point;
	color: string;
	opacity: number;
	useContrast: boolean;
	thickness: number;
	zIndex: number;
	style: {
		children?: Object[];
		useContrastFill?: boolean;
		points?: Point[];
		shape?: 'ellipse' | 'rectangle' | 'triangle' | 'rhombus' | 'star';
		fillColor?: string;
		fillOpacity?: number;
		fontSize?: number;
		fontFamily?: string;
		text?: string;
		image?: string;
	};
}

export type TransportObject = [
	string, // [0] id
	string, // [1] type (pencil | shapes | line | text | image | group)
	number[], // [2] box [x, y, width, height]
	number[], // [3] start [x, y]
	number[], // [4] end [x, y]
	string, // [5] color (hex)
	number, // [6] opacity (0-1)
	boolean, // [7] useContrast
	number, // [8] thickness
	number, // [9] zIndex
	[
		TransportObject[] | null, // [10][0] children (for groups)
		boolean | null, // [10][1] useContrastFill
		[number, number][] | null, // [10][2] points array [[x, y], ...]
		string | null, // [10][3] shape (ellipse | rectangle | triangle | rhombus | star)
		string | null, // [10][4] fillColor (hex)
		number | null, // [10][5] fillOpacity (0-1)
		number | null, // [10][6] fontSize
		string | null, // [10][7] fontFamily
		string | null, // [10][8] text content
		string | null // [10][9] image data URL
	]
];

export interface Board {
	id: string;
	name: string;
	backgroundColor: string;
	grid: 'dots' | 'lines' | 'none';
	visibility: 'private' | 'shared' | 'public';
	userId?: string;
	objects: Object[];
	thumbnail?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface GestureState {
	distance: number;
	scale: number;
	offset: Point;
	midpoint: Point;
}

export interface Action {
	type: 'add' | 'update' | 'remove';
	objects: Object[];
	updatedObjects?: Object[];
}

export interface Collaborator {
	id: string;
	name: string;
	picture?: string;
	cursor: Point;
	userId?: string;
	color: string;
	objectsSelectedIds: string[];
	objectsSelectedBox: Box;
	lastActive: Date;
}
