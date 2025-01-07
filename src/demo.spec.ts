import { describe, it, expect, test } from 'vitest';
import { boxContainsBox, boxContainsPoint, camelToTitleCase, getBoxCorners } from '$lib/utils';

/*
describe('camelToTitleCase', () => {
	it('should convert camelCase to Title Case', () => {
		expect(camelToTitleCase('helloWorldExtraWords')).toBe('Hello World Extra Words');
	});
});
*/

describe('Box Functions', () => {
	describe('getBoxCorners', () => {
		it('should return the corners of a non-rotated box', () => {
			const box = {
				pos: { x: 50, y: 50 },
				width: 100,
				height: 100,
				rotation: 0
			};
			expect(getBoxCorners(box)).toEqual(
				expect.arrayContaining([
					{ x: 50, y: 50 },
					{ x: 150, y: 150 },
					{ x: 50, y: 150 },
					{ x: 150, y: 50 }
				])
			);
		});
		it('should return the corners of a rotated box', () => {
			const box = {
				pos: { x: 50, y: 50 },
				width: 100,
				height: 100,
				rotation: Math.PI / 4
			};
			expect(getBoxCorners(box)).toEqual(
				expect.arrayContaining([
					{ x: 100, y: 100 - 50 * Math.sqrt(2) },
					{ x: 50 * (Math.sqrt(2) + 2), y: 100 },
					{ x: 100, y: 50 * (Math.sqrt(2) + 2) },
					{ x: 100 - 50 * Math.sqrt(2), y: 100 }
				])
			);
		});
	});
	describe('boxContainsBox', () => {
		const box1 = {
			pos: { x: 50, y: 50 },
			width: 100,
			height: 100,
			rotation: 0
		};
		const box2 = {
			pos: { x: 60, y: 60 },
			width: 80,
			height: 80,
			rotation: 0
		};
		const box3 = {
			pos: { x: 1000, y: 1000 },
			width: 100,
			height: 100,
			rotation: Math.PI / 4
		};
		const box4 = {
			pos: { x: 50, y: 50 },
			width: 100,
			height: 100,
			rotation: Math.PI / 2
		};
		const box5 = {
			pos: { x: 50, y: 50 },
			width: 100,
			height: 100,
			rotation: Math.PI / 4
		};
		it('should return true if a box contains another box', () => {
			expect(boxContainsBox(box1, box2)).toBe(true);
			expect(boxContainsBox(box1, box3)).toBe(false);
			expect(boxContainsBox(box1, box1)).toBe(true);
			expect(boxContainsBox(box1, box4)).toBe(true);
			expect(boxContainsBox(box1, box5)).toBe(false);
		});
	});
	describe('boxContainsPoint', () => {
		it('should return true if a box contains a point', () => {
			const box = {
				pos: { x: 50, y: 50 },
				width: 100,
				height: 100,
				rotation: Math.PI / 4
			};
			expect(boxContainsPoint(box, { x: 75, y: 51 })).toBe(true);
		});
	});
});
