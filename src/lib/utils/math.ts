import type { Box, Point, Edge } from '$lib/types';

export const getSquaredDistance = (p1: Point, p2: Point): number => {
	return (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
};

export const getBoxCorners = (box: Box): Point[] => {
	const c = Math.cos(box.rotation);
	const s = Math.sin(box.rotation);
	const cx = box.pos.x + box.width / 2;
	const cy = box.pos.y + box.height / 2;

	return [
		{
			x: cx + ((-box.width / 2) * c - (-box.height / 2) * s),
			y: cy + ((-box.width / 2) * s + (-box.height / 2) * c)
		},
		{
			x: cx + ((box.width / 2) * c - (-box.height / 2) * s),
			y: cy + ((box.width / 2) * s + (-box.height / 2) * c)
		},
		{
			x: cx + ((box.width / 2) * c - (box.height / 2) * s),
			y: cy + ((box.width / 2) * s + (box.height / 2) * c)
		},
		{
			x: cx + ((-box.width / 2) * c - (box.height / 2) * s),
			y: cy + ((-box.width / 2) * s + (box.height / 2) * c)
		}
	];
};

export const boxContainsBox = (b1: Box, b2: Box): boolean => {
	if (b1.rotation === 0 && b2.rotation === 0) {
		return (
			b1.pos.x <= b2.pos.x &&
			b1.pos.y <= b2.pos.y &&
			b1.pos.x + b1.width >= b2.pos.x + b2.width &&
			b1.pos.y + b1.height >= b2.pos.y + b2.height
		);
	}

	const corners2 = getBoxCorners(b2);
	return corners2.every((corner) => boxContainsPoint(b1, corner));
};

export const boxContainsPoint = (box: Box, p: Point): boolean => {
	if (box.rotation === 0) {
		return (
			p.x >= box.pos.x &&
			p.x <= box.pos.x + box.width &&
			p.y >= box.pos.y &&
			p.y <= box.pos.y + box.height
		);
	}

	const corners = getBoxCorners(box);
	return pointInPolygon(p, corners);
};

function getEdges(poly: Point[]): Edge[] {
	return poly.map((p, i) => {
		const next = poly[(i + 1) % poly.length];
		return { start: { x: p.x, y: p.y }, end: { x: next.x - p.x, y: next.y - p.y } };
	});
}

function pointInPolygon(p: Point, poly: Point[]) {
	const edges: Edge[] = getEdges(poly);
	let intersects = 0;
	for (const edge of edges) {
		const vectorEdge: Point = { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };
		if (vectorEdge.y == 0) {
			continue;
		}
		const vectorPointToStart: Point = { x: edge.start.x - p.x, y: edge.start.y - p.y };
		if (
			-(vectorPointToStart.y / vectorEdge.y) >= 0 &&
			-(vectorPointToStart.y / vectorEdge.y) <= 1 &&
			vectorPointToStart.x - (vectorPointToStart.y / vectorEdge.y) * vectorEdge.x > 0
		) {
			intersects++;
		}
	}
	return intersects % 2 === 1;
}

export const boxesOverlap = (b1: Box, b2: Box): boolean => {
	if (b1.rotation === 0 && b2.rotation === 0) {
		return !(
			b1.pos.x + b1.width < b2.pos.x ||
			b2.pos.x + b2.width < b1.pos.x ||
			b1.pos.y + b1.height < b2.pos.y ||
			b2.pos.y + b2.height < b1.pos.y
		);
	}

	const corners1 = getBoxCorners(b1);
	const corners2 = getBoxCorners(b2);
	return polygonsOverlap(corners1, corners2);
};

export const polygonsOverlap = (poly1: Point[], poly2: Point[]): boolean => {
	const edges1: Edge[] = getEdges(poly1);
	const edges2: Edge[] = getEdges(poly2);

	for (const edge of [...edges1, ...edges2]) {
		const axis = normalize({ x: -edge.end.y, y: edge.end.x });
		const [min1, max1] = projectPolygon(poly1, axis);
		const [min2, max2] = projectPolygon(poly2, axis);

		if (max1 < min2 || max2 < min1) {
			return false;
		}
	}

	return true;
};

function normalize(v: Point): Point {
	const len = Math.sqrt(v.x * v.x + v.y * v.y);
	return { x: v.x / len, y: v.y / len };
}

function projectPolygon(poly: Point[], axis: Point): [number, number] {
	const dots = poly.map((p) => p.x * axis.x + p.y * axis.y);
	return [Math.min(...dots), Math.max(...dots)];
}
