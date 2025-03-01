<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { onMount, untrack } from 'svelte';
	import { theme, toolSettings } from '$lib/shared';
	import type { Object, Point, GestureState, Box, Board, Tool, Collaborator } from '$lib/types';
	import {
		boxContainsBox,
		boxesOverlap,
		boxContainsPoint,
		getBoxCorners,
		getThemeAwareColor,
		getSquaredDistance
	} from '$lib/utils';
	import { innerWidth, innerHeight, devicePixelRatio } from 'svelte/reactivity/window';

	let {
		isDrawing = $bindable(),
		tool = $bindable<Tool>(),
		scale = $bindable(),
		offset = $bindable(),
		actions = $bindable([]),
		actionsIndex = $bindable(),
		board,
		collaborators,
		tempObjects
	} = $props();

	let canvas: HTMLCanvasElement;
	let canvasTemp: HTMLCanvasElement;
	let canvasOutline: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let ctxTemp: CanvasRenderingContext2D;
	let ctxOutline: CanvasRenderingContext2D;

	let textInput: HTMLTextAreaElement;

	let dpr = $derived(devicePixelRatio.current!);

	let canvasWidth = $derived(innerWidth.current! * dpr);
	let canvasHeight = $derived(innerHeight.current! * dpr);

	function handleResize(): void {
		[canvas, canvasTemp, canvasOutline].forEach((c) => {
			c.width = window.innerWidth * dpr;
			c.height = window.innerHeight * dpr;
			c.style.width = `${window.innerWidth}px`;
			c.style.height = `${window.innerHeight}px`;
		});

		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctxTemp.lineJoin = 'round';
		ctxTemp.lineCap = 'round';

		draw();
	}

	onMount(() => {
		if (!canvas || !canvasTemp || !canvasOutline) return;

		ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		ctxTemp = canvasTemp.getContext('2d', { willReadFrequently: true })!;
		ctxOutline = canvasOutline.getContext('2d', { willReadFrequently: true })!;

		handleResize();

		window.addEventListener('touchstart', handleStart, { passive: false });
		window.addEventListener('touchmove', handleMove, { passive: false });
		window.addEventListener('touchend', handleStop, { passive: false });
		window.addEventListener('touchcancel', handleStop, { passive: false });
		window.addEventListener('resize', handleResize);

		return () => {
			canvas.removeEventListener('touchstart', handleStart);
			canvas.removeEventListener('touchmove', handleMove);
			canvas.removeEventListener('touchend', handleStop);
			canvas.removeEventListener('touchcancel', handleStop);
			window.removeEventListener('resize', handleResize);
		};
	});

	$effect(() => {
		collaborators.self.objectsSelectedIds;
		collaborators.others.map((other: Collaborator) => {
			other.objectsSelectedIds;
			other.cursor;
		});
		board.objects;
		scale;
		offset;
		$theme;
		actions;
		actionsIndex;
		untrack(() => {
			requestAnimationFrame(draw);
		});
	});

	$effect(() => {
		if (actionsIndex[1] == 0) return;

		untrack(() => {
			collaborators.updateSelf({
				objectsSelectedIds: [],
				objectsSelectedBox: { rotation: 0, pos: { x: 0, y: 0 }, width: 0, height: 0 }
			});

			if (actionsIndex[1] == 1) {
				switch (actions[actionsIndex[0]].type) {
					case 'add':
						board.updateObjects(actions[actionsIndex[0]].objects);
						break;
					case 'remove':
						board.deleteObjects(
							actions[actionsIndex[0]].objects.map((object: Object) => object.id)
						);
						break;
					case 'update':
						board.updateObjects(actions[actionsIndex[0]].updatedObjects);
						break;
				}
			} else {
				switch (actions[actionsIndex[0] + 1].type) {
					case 'add':
						board.deleteObjects(
							actions[actionsIndex[0] + 1].objects.map((object: Object) => object.id)
						);

						break;
					case 'remove':
						board.updateObjects(actions[actionsIndex[0] + 1].objects);
						break;
					case 'update':
						board.updateObjects(actions[actionsIndex[0] + 1].objects);
						break;
				}
			}
		});
	});

	let strokePath: Point[] = [];
	let max: Point = { x: 0, y: 0 };
	let min: Point = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
	let start: Point = { x: 0, y: 0 };

	function drawOutlines(): void {
		ctxOutline.clearRect(0, 0, canvasWidth, canvasHeight);

		for (const other of collaborators.others) {
			for (const objectId of other.objectsSelectedIds ?? []) {
				const object = board.objects.find((object: Object) => object.id === objectId);
				if (object.type === 'line') {
					drawLineOutline(object, other.color);
				} else {
					drawBoxOutline(object.box, other.objectsSelectedIds.length == 1, false, other.color);
				}
			}
			if (other.objectsSelectedIds?.length > 1) {
				drawBoxOutline(other.objectsSelectedBox, true, true, other.color);
			}
		}

		for (const objectId of collaborators.self.objectsSelectedIds ?? []) {
			const object = board.objects.find((object: Object) => object.id === objectId);
			if (object.type === 'line') {
				drawLineOutline(object);
			} else {
				drawBoxOutline(object.box, collaborators.self.objectsSelectedIds.length == 1);
			}
		}
		if (collaborators.self.objectsSelectedIds.length > 1) {
			drawBoxOutline(collaborators.self.objectsSelectedBox, true, true);
		}
	}

	function drawGridLines() {
		const logGridScale = Math.log(scale * 100) / Math.log(4);
		const lowerLog = Math.floor(logGridScale);
		const upperLog = lowerLog + 1;

		const gridSize = (10000 / Math.pow(4, lowerLog)) * scale;
		const subGridProgress = upperLog - Math.round(logGridScale);

		ctx.save();
		ctx.strokeStyle = $theme === 'dark' ? '#f5f5f5' : '#2d2b32';
		ctx.lineWidth = 2;
		ctx.globalAlpha = 0.1;

		let gridOffset: Point = { x: offset.x % gridSize, y: offset.y % gridSize };

		for (let x = gridOffset.x; x < canvasWidth; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvasHeight);
			ctx.stroke();
		}
		for (let y = gridOffset.y; y < canvasHeight; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvasWidth, y);
			ctx.stroke();
		}

		if (subGridProgress < 0.8) {
			gridOffset = { x: offset.x % (gridSize / 4), y: offset.y % (gridSize / 4) };
			ctx.lineWidth = 1;
			ctx.globalAlpha = 0.05;
			for (let x = gridOffset.x; x < canvasWidth; x += gridSize / 4) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, canvasHeight);
				ctx.stroke();
			}

			for (let y = gridOffset.y; y < canvasHeight; y += gridSize / 4) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(canvasWidth, y);
				ctx.stroke();
			}
		}

		ctx.restore();
	}

	function drawCursors(): void {
		for (const other of collaborators.others) {
			const localCursor = getLocalPoint(other.cursor);

			ctx.save();
			ctx.beginPath();
			if (new Date(other.lastActive).getTime() < Date.now() - 5000) {
				ctx.globalAlpha = 0.4;
			} else {
				ctx.globalAlpha = 1;
			}
			ctx.arc(localCursor.x, localCursor.y, 8, 0, Math.PI * 2);

			ctx.font = '16px Inter, system-ui, sans-serif';
			const textMetrics = ctx.measureText(other.name);
			const padding = 8;
			const textX = localCursor.x + 20;
			const textY = localCursor.y - 20;

			ctx.beginPath();
			ctx.fillStyle = other.color;
			ctx.roundRect(
				textX - padding,
				textY - 16 - padding / 2,
				textMetrics.width + padding * 2,
				24 + padding,
				4
			);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.arc(localCursor.x, localCursor.y, 8, 0, Math.PI * 2);
			ctx.lineWidth = 6;
			ctx.strokeStyle = other.color;
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.fillStyle = '#ffffff';
			ctx.fillText(other.name, textX, textY);
			ctx.closePath();
		}
	}

	// function drawTemp(): void {
	// 	ctxTemp.clearRect(0,0, canvasWidth, canvasHeight)
	// }

	function draw(): void {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctxOutline.clearRect(0, 0, canvasWidth, canvasHeight);
		if (board.grid === 'lines') {
			drawGridLines();
		}
		drawBoard();
		drawOutlines();
		drawCursors();
	}

	function drawBoard(): void {
		for (const object of board.objects) {
			ctx.save();
			if (!object.style) continue;

			const { type, box, start, end, color, opacity, useContrast, thickness } = object;

			const { points, useContrastFill, shape, fillColor, fillOpacity } = object.style!;

			const localItemDim = {
				x: (object.box.width - 32) * scale,
				y: (object.box.height - 32) * scale
			};

			const localItemPos = getLocalPoint({
				x: object.box.pos.x + 16,
				y: object.box.pos.y + 16
			});

			const localItemCenter = {
				x: localItemPos.x + localItemDim.x / 2,
				y: localItemPos.y + localItemDim.y / 2
			};

			ctx.translate(localItemCenter.x, localItemCenter.y);
			ctx.rotate(box.rotation);
			ctx.translate(-localItemCenter.x, -localItemCenter.y);

			ctx.strokeStyle = getThemeAwareColor(color, useContrast, $theme);
			ctx.lineWidth = thickness * scale;
			ctx.globalAlpha = opacity / 100;
			switch (type) {
				case 'pencil':
					ctx.beginPath();
					const absolutePoints = points!.map((point: Point) => ({
						x: point.x + box.pos.x,
						y: point.y + box.pos.y
					}));
					let p1: Point = absolutePoints![0];
					if (absolutePoints!.length == 1) {
						const localP1 = getLocalPoint(p1);
						ctx.moveTo(localP1.x, localP1.y);
						ctx.lineTo(localP1.x + 1, localP1.y + 1);
						ctx.stroke();
						break;
					}
					let p2: Point = absolutePoints![1];
					let localP1 = getLocalPoint(p1);
					ctx.moveTo(localP1.x, localP1.y);
					for (let i = 1; i < absolutePoints!.length; i++) {
						const midPoint: Point = getLocalPoint({
							x: (p1.x + p2.x) / 2,
							y: (p1.y + p2.y) / 2
						});
						ctx.quadraticCurveTo(localP1.x, localP1.y, midPoint.x, midPoint.y);
						p1 = absolutePoints![i];
						p2 = absolutePoints![i + 1];
						localP1 = getLocalPoint(p1);
					}
					ctx.stroke();
					break;
				case 'shapes':
					ctx.beginPath();
					ctx.fillStyle = getThemeAwareColor(fillColor!, useContrastFill!, $theme);

					switch (shape) {
						case 'ellipse':
							ctx.ellipse(
								localItemCenter.x,
								localItemCenter.y,
								localItemDim.x / 2,
								localItemDim.y / 2,
								0,
								0,
								Math.PI * 2
							);
							break;
						case 'rectangle':
							ctx.rect(localItemPos.x, localItemPos.y, localItemDim.x, localItemDim.y);
							break;
						case 'triangle':
							ctx.moveTo(localItemPos.x, localItemPos.y + localItemDim.y);
							ctx.lineTo(localItemPos.x + localItemDim.x / 2, localItemPos.y);
							ctx.lineTo(localItemPos.x + localItemDim.x, localItemPos.y + localItemDim.y);
							ctx.closePath();
							break;
						case 'rhombus':
							ctx.moveTo(localItemCenter.x, localItemPos.y);
							ctx.lineTo(localItemPos.x + localItemDim.x, localItemCenter.y);
							ctx.lineTo(localItemCenter.x, localItemPos.y + localItemDim.y);
							ctx.lineTo(localItemPos.x, localItemCenter.y);
							ctx.closePath();
							break;
						case 'star':
							const spikes = 5;
							const outerRadius = Math.min(localItemDim.x, localItemDim.y) / 2;
							const innerRadius = outerRadius * 0.4;

							for (let i = 0; i < spikes * 2; i++) {
								const radius = i % 2 === 0 ? outerRadius : innerRadius;
								const angle = (i * Math.PI) / spikes;
								const x = localItemCenter.x + Math.sin(angle) * radius;
								const y = localItemCenter.y - Math.cos(angle) * radius;
								i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
							}

							ctx.closePath();
							break;
					}
					if (fillColor != 'transparent') {
						ctx.stroke();
						ctx.globalAlpha = fillOpacity! / 100;
						ctx.fill();
					} else {
						ctx.stroke();
					}
					break;
				case 'line':
					ctx.strokeStyle = getThemeAwareColor(color, useContrast, $theme);
					ctx.lineWidth = thickness * scale;
					ctx.globalAlpha = opacity / 100;
					ctx.beginPath();
					ctx.moveTo(start.x * scale + offset.x, start.y * scale + offset.y);
					ctx.lineTo(end.x * scale + offset.x, end.y * scale + offset.y);
					ctx.stroke();
					break;
				case 'text':
					break;
			}
			ctx.restore();
		}
	}

	function drawTemp(): void {}

	let initialGesture: GestureState;

	let isPanZoom = false;
	let isDragging = false;

	function handleStart(e: MouseEvent | TouchEvent) {
		const target = e.target as HTMLElement;
		if (!canvas.contains(target)) {
			return;
		}
		if (e instanceof TouchEvent && e.touches.length >= 2) {
			e.preventDefault();

			collaborators.updateSelf({
				objectsSelectedIds: [],
				objectsSelectedBox: { rotation: 0, pos: { x: 0, y: 0 }, width: 0, height: 0 }
			});

			if (strokePath.length > 2) {
				return;
			} else {
				strokePath = [];
			}

			isPanZoom = true;

			const rect = canvas.getBoundingClientRect();

			const touches = Array.from(e.touches);

			initialGesture = {
				distance:
					(touches[1].clientX - touches[0].clientX) ** 2 +
					(touches[1].clientY - touches[0].clientY) ** 2,
				scale: scale,
				offset: { ...offset },
				midpoint: {
					x: ((touches[0].clientX + touches[1].clientX) / 2 - rect.left) * dpr,
					y: ((touches[0].clientY + touches[1].clientY) / 2 - rect.top) * dpr
				}
			};
			return;
		}

		isDrawing = true;
		start = getEventPoint(e);
		[min.x, max.x, min.y, max.y] = [start.x, start.x, start.y, start.y];
		erased = [];
		strokePath = [start];

		if (tool === 'arrow') {
			selectTopItem();
			if (boxContainsPoint(collaborators.self.objectsSelectedBox, start)) {
				isDragging = true;
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'update',
						objects: board.objects.filter((object: Object) =>
							collaborators.self.objectsSelectedIds.includes(object.id)
						),
						updatedObjects: board.objects.filter((object: Object) =>
							collaborators.self.objectsSelectedIds.includes(object.id)
						)
					}
				];
				actionsIndex = [actionsIndex[0] + 1, 0];
			} else {
				if (collaborators.self.objectsSelectedIds.length > 0) {
					collaborators.updateSelf({
						objectsSelectedIds: [],
						objectsSelectedBox: { rotation: 0, pos: { x: 0, y: 0 }, width: 0, height: 0 }
					});
				}
			}
		} else {
			if (collaborators.self.objectsSelectedIds.length > 0) {
				collaborators.updateSelf({
					objectsSelectedIds: [],
					objectsSelectedBox: { rotation: 0, pos: { x: 0, y: 0 }, width: 0, height: 0 }
				});
			}
		}
	}

	function selectTopItem(): void {
		for (let i = board.objects.length - 1; i >= 0; i--) {
			const object = board.objects[i];

			if (boxContainsPoint(object.box, start)) {
				if (collaborators.self.objectsSelectedIds.indexOf(object.id) == -1) {
					collaborators.updateSelf({
						objectsSelectedIds: [object.id],
						objectsSelectedBox: object.box
					});
				}
				break;
			}
		}
	}
	function handleMove(e: MouseEvent | TouchEvent) {
		collaborators.updateSelf({ cursor: getEventPoint(e) });

		if (e instanceof TouchEvent && e.touches.length >= 2 && isPanZoom) {
			handleStop(e, false);
			e.preventDefault();

			ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

			const rect = canvas.getBoundingClientRect();

			const touches = Array.from(e.touches);

			const dist =
				(touches[1].clientX - touches[0].clientX) ** 2 +
				(touches[1].clientY - touches[0].clientY) ** 2;
			const scaleDelta = (initialGesture.scale * dist) / initialGesture.distance - scale;
			const zoomInDamping = 0.05;
			const zoomOutDamping = 0.2;
			const dampingFactor = scaleDelta > 0 ? zoomInDamping : zoomOutDamping;
			const newScale = Math.max(scale + scaleDelta * dampingFactor, 0.1);

			const midpoint = {
				x: ((touches[0].clientX + touches[1].clientX) / 2 - rect.left) * dpr,
				y: ((touches[0].clientY + touches[1].clientY) / 2 - rect.top) * dpr
			};

			const zoomOffsetX =
				initialGesture.midpoint.x -
				(initialGesture.midpoint.x - initialGesture.offset.x) * (newScale / initialGesture.scale);
			const zoomOffsetY =
				initialGesture.midpoint.y -
				(initialGesture.midpoint.y - initialGesture.offset.y) * (newScale / initialGesture.scale);

			offset = {
				x: zoomOffsetX + (midpoint.x - initialGesture.midpoint.x),
				y: zoomOffsetY + (midpoint.y - initialGesture.midpoint.y)
			};

			scale = newScale;

			return;
		}

		if (!isDrawing) return;

		const curr = getEventPoint(e);
		if (curr.x - start.x == 0 && curr.y - start.y == 0) return;

		switch (tool) {
			case 'arrow':
				moveArrow(curr);
				break;
			case 'pencil':
				movePencil(curr);
				break;
			case 'eraser':
				moveEraser(curr);
				break;
			case 'shapes':
				moveShapes(curr);
				break;
			case 'line':
				moveLine(curr);
				break;
			case 'hand':
				moveHand(curr);
				break;
		}
	}

	function getEventPoint(e: MouseEvent | TouchEvent): Point {
		const rect = canvas.getBoundingClientRect();

		if (e instanceof MouseEvent) {
			return {
				x: ((e.clientX - rect.left) * dpr - offset.x) / scale,
				y: ((e.clientY - rect.top) * dpr - offset.y) / scale
			};
		}

		if (e.touches && e.touches.length > 0) {
			return {
				x: ((e.touches[0].clientX - rect.left) * dpr - offset.x) / scale,
				y: ((e.touches[0].clientY - rect.top) * dpr - offset.y) / scale
			};
		}

		if (e.changedTouches && e.changedTouches.length > 0) {
			return {
				x: ((e.changedTouches[0].clientX - rect.left) * dpr - offset.x) / scale,
				y: ((e.changedTouches[0].clientY - rect.top) * dpr - offset.y) / scale
			};
		}

		return { x: 0, y: 0 };
	}

	function getLocalPoint(p: Point): Point {
		return { x: p.x * scale + offset.x, y: p.y * scale + offset.y };
	}

	function drawLineOutline(object: Object, color: string = '#16bceb') {
		ctxOutline.save();

		ctxOutline.strokeStyle = color;
		ctxOutline.lineWidth = 2;
		ctxOutline.globalAlpha = 1;

		const localItemPos = getLocalPoint(object.box.pos);
		const localItemDim = {
			x: object.box.width * scale,
			y: object.box.height * scale
		};
		const localItemCenter = {
			x: localItemPos.x + localItemDim.x / 2,
			y: localItemPos.y + localItemDim.y / 2
		};

		ctxOutline.translate(localItemCenter.x, localItemCenter.y);
		ctxOutline.rotate(object.box.rotation);
		ctxOutline.translate(-localItemCenter.x, -localItemCenter.y);

		const localStart = getLocalPoint(object.start);
		const localEnd = getLocalPoint(object.end);

		ctxOutline.moveTo(localStart.x, localStart.y);
		ctxOutline.lineTo(localEnd.x, localEnd.y);
		ctxOutline.stroke();

		const handleSize = 10;

		const nodes = [
			[localStart.x, localStart.y],
			[localEnd.x, localEnd.y]
		];

		ctxOutline.lineWidth = 1;

		nodes.forEach(([x, y]) => {
			ctxOutline.beginPath();
			ctxOutline.arc(x, y, handleSize / 2, 0, Math.PI * 2);
			ctxOutline.fillStyle =
				board.backgroundColor === 'transparent'
					? $theme === 'dark'
						? '#2d2b32'
						: '#f5f5f5'
					: board.backgroundColor;
			ctxOutline.fill();
			ctxOutline.stroke();
			ctxOutline.closePath();
		});
		ctxOutline.restore();
	}

	function drawBoxOutline(
		box: Box,
		showNodes: boolean,
		dotted: boolean = false,
		color: string = '#16bceb'
	) {
		ctxOutline.save();

		const handleSize = 10;

		ctxOutline.strokeStyle = color;
		ctxOutline.lineWidth = 1;
		ctxOutline.globalAlpha = 1;

		ctxOutline.setLineDash(dotted ? [4, 3] : []);

		const outlinePos: Point = getLocalPoint({
			x: box.pos.x,
			y: box.pos.y
		});
		[outlinePos.x, outlinePos.y] = [outlinePos.x, outlinePos.y];
		const offsetDim: Point = {
			x: box.width * scale,
			y: box.height * scale
		};

		const localItemPos = getLocalPoint(box.pos);
		const localItemDim = {
			x: box.width * scale,
			y: box.height * scale
		};
		const localItemCenter = {
			x: localItemPos.x + localItemDim.x / 2,
			y: localItemPos.y + localItemDim.y / 2
		};

		ctxOutline.translate(localItemCenter.x, localItemCenter.y);
		ctxOutline.rotate(box.rotation);
		ctxOutline.translate(-localItemCenter.x, -localItemCenter.y);

		ctxOutline.rect(outlinePos.x, outlinePos.y, offsetDim.x, offsetDim.y);
		ctxOutline.stroke();

		ctxOutline.setLineDash([]);

		if (showNodes) {
			const nodes: Point[] = [
				{
					x: outlinePos.x - handleSize / 2 - handleSize / 2,
					y: outlinePos.y - handleSize / 2 - handleSize / 2
				},
				{
					x: outlinePos.x + offsetDim.x - handleSize / 2 + handleSize / 2,
					y: outlinePos.y - handleSize / 2 - handleSize / 2
				},
				{
					x: outlinePos.x - handleSize / 2 - handleSize / 2,
					y: outlinePos.y + offsetDim.y - handleSize / 2 + handleSize / 2
				},
				{
					x: outlinePos.x + offsetDim.x - handleSize / 2 + handleSize / 2,
					y: outlinePos.y + offsetDim.y - handleSize / 2 + handleSize / 2
				}
			];

			nodes.forEach((node) => {
				ctxOutline.beginPath();
				ctxOutline.roundRect(node.x, node.y, handleSize, handleSize, 1);
				ctxOutline.fillStyle =
					board.backgroundColor === 'transparent'
						? $theme === 'dark'
							? '#2d2b32'
							: '#f5f5f5'
						: board.backgroundColor;
				ctxOutline.fill();
				ctxOutline.stroke();
				ctxOutline.closePath();
			});

			const rotationHandle: Point = {
				x: outlinePos.x + offsetDim.x / 2,
				y: outlinePos.y - handleSize * 2
			};

			ctxOutline.beginPath();
			ctxOutline.arc(rotationHandle.x, rotationHandle.y, handleSize / 2, 0, Math.PI * 2);
			ctxOutline.fill();
			ctxOutline.stroke();
			ctxOutline.closePath();
		}

		ctxOutline.restore();
	}

	function selectItems(start: Point, curr: Point) {
		const selectionBox: Box = {
			pos: { x: Math.min(start.x, curr.x), y: Math.min(start.y, curr.y) },
			width: Math.abs(curr.x - start.x),
			height: Math.abs(curr.y - start.y),
			rotation: 0
		};
		const objectsSelected = board.objects.filter(
			(object: Object) =>
				boxContainsBox(selectionBox, object.box) || boxesOverlap(selectionBox, object.box)
		);

		let topLeft: Point = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
		let bottomRight: Point = { x: 0, y: 0 };

		objectsSelected.forEach((object: Object) => {
			const corners: Point[] = getBoxCorners(object.box);
			corners.forEach((corner) => {
				topLeft = {
					x: Math.min(topLeft.x, corner.x),
					y: Math.min(topLeft.y, corner.y)
				};
				bottomRight = {
					x: Math.max(bottomRight.x, corner.x),
					y: Math.max(bottomRight.y, corner.y)
				};
			});
		});

		if (objectsSelected.length != collaborators.self.objectsSelectedIds.length) {
			collaborators.updateSelf({
				objectsSelectedIds: objectsSelected.map((object: Object) => object.id),
				objectsSelectedBox: {
					pos: topLeft,
					width: bottomRight.x - topLeft.x,
					height: bottomRight.y - topLeft.y,
					rotation: 0
				}
			});
		}
	}

	function moveArrow(curr: Point) {
		if (isDragging) {
			const diff = {
				x: curr.x - start.x,
				y: curr.y - start.y
			};

			collaborators.updateSelf({
				objectsSelectedBox: {
					...collaborators.self.objectsSelectedBox,
					pos: {
						x: collaborators.self.objectsSelectedBox.pos.x + diff.x,
						y: collaborators.self.objectsSelectedBox.pos.y + diff.y
					}
				}
			});
			const selectedSet = new Set(collaborators.self.objectsSelectedIds);

			const updatedObjects = board.objects
				.filter((object: Object) => selectedSet.has(object.id))
				.map((object: Object) => {
					return {
						...object,
						start: {
							x: object.start.x + diff.x,
							y: object.start.y + diff.y
						},
						end: {
							x: object.end.x + diff.x,
							y: object.end.y + diff.y
						},
						box: {
							...object.box,
							pos: {
								x: object.box.pos.x + diff.x,
								y: object.box.pos.y + diff.y
							}
						}
					};
				});
			board.updateObjects(updatedObjects);

			if (actions.length > 0) {
				actions[actionsIndex[0]].updatedObjects = updatedObjects;
			}

			start = curr;
			return;
		}
		ctxTemp.save();

		ctxTemp.strokeStyle = '#00c864';
		ctxTemp.lineWidth = 1;
		ctxTemp.globalAlpha = 1;

		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

		ctxTemp.beginPath();

		const localStart = getLocalPoint(start);
		const localCurr = getLocalPoint({ x: curr.x, y: curr.y });

		const width = localCurr.x - localStart.x;
		const height = localCurr.y - localStart.y;

		ctxTemp.rect(localStart.x, localStart.y, width, height);
		ctxTemp.stroke();
		ctxTemp.globalAlpha = 0.09;
		ctxTemp.fillStyle = '#00c864';
		ctxTemp.fill();

		selectItems(start, curr);

		ctxTemp.restore();
	}

	function movePencil(curr: Point) {
		if (
			getSquaredDistance(getLocalPoint(curr), getLocalPoint(strokePath[strokePath.length - 1])) < 30
		) {
			return;
		}

		[min.x, max.x, min.y, max.y] = [
			Math.min(min.x, curr.x),
			Math.max(max.x, curr.x),
			Math.min(min.y, curr.y),
			Math.max(max.y, curr.y)
		];
		const { thickness, color, opacity, useContrast } = toolSettings.pencil;

		strokePath.push({ x: curr.x, y: curr.y });

		ctxTemp.save();

		ctxTemp.strokeStyle = getThemeAwareColor(color, useContrast, $theme);
		ctxTemp.lineWidth = thickness * scale;
		ctxTemp.globalAlpha = opacity / 100;

		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

		ctxTemp.beginPath();

		if (strokePath.length < 3) {
			const p1 = getLocalPoint(strokePath[0]);
			const p2 = getLocalPoint({ x: curr.x, y: curr.y });
			ctxTemp.moveTo(p1.x, p1.y);
			ctxTemp.lineTo(p2.x, p2.y);
		} else {
			const starting = getLocalPoint(strokePath[0]);
			ctxTemp.moveTo(starting.x, starting.y);

			for (let i = 1; i < strokePath.length - 2; i++) {
				const p1 = getLocalPoint(strokePath[i]);
				const p2 = getLocalPoint(strokePath[i + 1]);
				const xc = (p1.x + p2.x) / 2;
				const yc = (p1.y + p2.y) / 2;

				ctxTemp.quadraticCurveTo(p1.x, p1.y, xc, yc);
			}

			const p1 = getLocalPoint(strokePath[strokePath.length - 2]);
			const p2 = getLocalPoint(strokePath[strokePath.length - 1]);
			ctxTemp.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
		}
		ctxTemp.stroke();

		ctxTemp.restore();
	}

	let erased: Object[] = [];

	function moveEraser(curr: Point) {
		board.deleteObjects(
			board.objects
				.filter((object: Object) => boxContainsPoint(object.box, curr))
				.map((object: Object) => object.id)
		);
	}

	function moveShapes(curr: Point) {
		const {
			shape,
			thickness,
			color,
			fillColor,
			opacity,
			useContrast,
			useContrastFill,
			fillOpacity
		} = toolSettings.shapes;

		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

		ctxTemp.save();

		ctxTemp.strokeStyle = getThemeAwareColor(color, useContrast, $theme);
		ctxTemp.lineWidth = thickness * scale;
		ctxTemp.fillStyle = getThemeAwareColor(fillColor, useContrastFill, $theme);
		ctxTemp.globalAlpha = opacity / 100;

		const shapeBox: Box = {
			pos: getLocalPoint({
				x: Math.min(start.x, curr.x),
				y: Math.min(start.y, curr.y)
			}),
			width: Math.abs(start.x - curr.x) * scale,
			height: Math.abs(start.y - curr.y) * scale,
			rotation: 0
		};

		const center = {
			x: shapeBox.pos.x + shapeBox.width / 2,
			y: shapeBox.pos.y + shapeBox.height / 2
		};

		ctxTemp.beginPath();

		switch (shape) {
			case 'ellipse':
				const radiusX = Math.abs(shapeBox.width / 2);
				const radiusY = Math.abs(shapeBox.height / 2);
				ctxTemp.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
				break;
			case 'rectangle':
				ctxTemp.rect(shapeBox.pos.x, shapeBox.pos.y, shapeBox.width, shapeBox.height);
				break;
			case 'triangle':
				ctxTemp.moveTo(shapeBox.pos.x, shapeBox.pos.y + shapeBox.height);
				ctxTemp.lineTo(shapeBox.pos.x + shapeBox.width / 2, shapeBox.pos.y);
				ctxTemp.lineTo(shapeBox.pos.x + shapeBox.width, shapeBox.pos.y + shapeBox.height);
				ctxTemp.closePath();
				break;
			case 'rhombus':
				ctxTemp.moveTo(center.x, shapeBox.pos.y);
				ctxTemp.lineTo(shapeBox.pos.x + shapeBox.width, center.y);
				ctxTemp.lineTo(center.x, shapeBox.pos.y + shapeBox.height);
				ctxTemp.lineTo(shapeBox.pos.x, center.y);
				ctxTemp.closePath();
				break;
			case 'star':
				const spikes = 5;
				const outerRadius = Math.min(Math.abs(shapeBox.width), Math.abs(shapeBox.height)) / 2;
				const innerRadius = outerRadius * 0.4;

				for (let i = 0; i < spikes * 2; i++) {
					const radius = i % 2 === 0 ? outerRadius : innerRadius;
					const angle = (i * Math.PI) / spikes;
					const x = center.x + Math.sin(angle) * radius;
					const y = center.y - Math.cos(angle) * radius;
					i === 0 ? ctxTemp.moveTo(x, y) : ctxTemp.lineTo(x, y);
				}
				ctxTemp.closePath();
				break;
		}

		if (fillColor != 'transparent') {
			ctxTemp.stroke();
			ctxTemp.globalAlpha = fillOpacity! / 100;
			ctxTemp.fill();
		} else {
			ctxTemp.stroke();
		}
		ctxTemp.restore();
	}

	function moveLine(curr: Point) {
		const { thickness, color, opacity, useContrast } = toolSettings.line;

		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

		ctxTemp.save();

		ctxTemp.strokeStyle = getThemeAwareColor(color, useContrast, $theme);
		ctxTemp.lineWidth = thickness * scale;
		ctxTemp.globalAlpha = opacity / 100;

		const localStart = getLocalPoint(start);
		const localCurr = getLocalPoint({ x: curr.x, y: curr.y });

		ctxTemp.beginPath();
		ctxTemp.moveTo(localStart.x, localStart.y);
		ctxTemp.lineTo(localCurr.x, localCurr.y);
		ctxTemp.stroke();

		ctxTemp.restore();
	}

	function createText(curr: Point) {
		const { fontSize, color, opacity, fontFamily, useContrast } = toolSettings.text;

		textInput.focus();
	}

	function moveHand(curr: Point) {
		const delta: Point = { x: curr.x - start.x, y: curr.y - start.y };

		offset = { x: offset.x + delta.x * scale, y: offset.y + delta.y * scale };
	}

	function getItem(curr: Point): Object {
		const toolConfig = toolSettings[tool as keyof typeof toolSettings];
		const object: Object = {
			id: uuidv4(),
			type: tool,
			box: {
				pos: {
					x: tool === 'pencil' ? min.x : Math.min(start.x, curr.x) - 16,
					y: tool === 'pencil' ? min.y : Math.min(start.y, curr.y) - 16
				},
				width: tool === 'pencil' ? max.x - min.x : Math.abs(curr.x - start.x) + 32,
				height: tool === 'pencil' ? max.y - min.y : Math.abs(curr.y - start.y) + 32,
				rotation: 0
			},
			start: { x: start.x, y: start.y },
			end: { x: curr.x, y: curr.y },
			color: toolSettings[tool as keyof typeof toolSettings].color,
			opacity: toolConfig.opacity,
			useContrast: toolConfig.useContrast,
			thickness: toolConfig.thickness,
			zIndex: 500,
			style: {
				...toolConfig,
				points:
					strokePath.length > 0
						? strokePath.map((p: Point) => {
								return { x: p.x - min.x, y: p.y - min.y };
							})
						: undefined
			}
		};

		return object;
	}

	function resetDrawingState(): void {
		isDrawing = false;
		isDragging = false;
		[start.x, start.y] = [0, 0];
		strokePath = [];
	}

	function handleStop(e: MouseEvent | TouchEvent, resetPanZoom: boolean = true) {
		if (resetPanZoom) {
			handleMove(e);
		}
		const curr = getEventPoint(e);

		if (!isDrawing) {
			resetDrawingState();
			return;
		}

		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

		let currItem: Object;

		switch (tool) {
			case 'arrow':
				break;
			case 'pencil':
				strokePath.push({ x: curr.x, y: curr.y });
				if (strokePath.length == 1 && isPanZoom) break;
				currItem = getItem(curr);
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'add',
						objects: [currItem]
					}
				];
				actionsIndex = [actionsIndex[0] + 1, 0];
				board.updateObjects([currItem]);
				break;
			case 'eraser':
				if (erased.length == 0) break;
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'remove',
						objects: erased
					}
				];
				actionsIndex = [actionsIndex[0] + 1, 0];
				erased = [];
				break;
			case 'shapes':
				if (curr.x == start.x || curr.y == start.y) break;
				currItem = getItem(curr);
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'add',
						objects: [currItem]
					}
				];
				actionsIndex = [actionsIndex[0] + 1, 0];
				board.updateObjects([currItem]);
				break;
			case 'line':
				if (curr.x == start.x && curr.y == start.y) break;
				currItem = getItem(curr);
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'add',
						objects: [currItem]
					}
				];
				actionsIndex = [actionsIndex[0] + 1, 0];
				board.updateObjects([currItem]);
				break;
			case 'text':
				createText(curr);
				break;
			case 'hand':
				break;
		}

		if (resetPanZoom) isPanZoom = false;
		resetDrawingState();
	}

	function handleZoom(zoom: number, center: Point) {
		const newScale = Math.max(scale * zoom, 0.1);

		offset = {
			x: center.x - (center.x - offset.x) * (newScale / scale),
			y: center.y - (center.y - offset.y) * (newScale / scale)
		};

		scale = newScale;
	}

	function handlePan(delta: Point) {
		offset = { x: offset.x - delta.x, y: offset.y - delta.y };
	}

	function detectTrackPad(e: WheelEvent): boolean {
		const { deltaY } = e;
		if (deltaY && !Number.isInteger(deltaY)) {
			return true;
		}
		return false;
	}

	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey) {
			const rect = canvas.getBoundingClientRect();

			const pointer = {
				x: (e.clientX - rect.left) * dpr,
				y: (e.clientY - rect.top) * dpr
			};

			let zoom;

			if (detectTrackPad(e)) {
				zoom = 1 - e.deltaY * 0.01;
			} else {
				zoom = 1 - e.deltaY * 0.001;
			}

			handleZoom(zoom, pointer);
		} else {
			handlePan({ x: e.deltaX, y: e.deltaY });
		}
	}
</script>

<div class="relative -z-10 h-full w-full">
	<canvas
		bind:this={canvas}
		class={`absolute z-20 ${tool === 'pencil' || tool === 'shapes' || tool === 'line' ? 'cursor-crosshair' : tool === 'hand' ? 'cursor-grab' : tool === 'text' ? 'cursor-text' : 'cursor-auto'} ${'background-color-' + board.backgroundColor}`}
		onwheel={handleWheel}
	></canvas>
	<canvas bind:this={canvasOutline} class="pointer-events-none absolute z-40"></canvas>
	<canvas bind:this={canvasTemp} class="pointer-events-none absolute z-30"></canvas>
	<textarea
		bind:this={textInput}
		class="absolute z-50 hidden min-h-[1em] min-w-[1ch] resize-none overflow-hidden whitespace-nowrap border-none bg-transparent p-0 outline-none"
	>
	</textarea>
</div>

<svelte:window
	onmousedown={handleStart}
	onmousemove={handleMove}
	onmouseup={handleStop}
	onmouseleave={handleStop}
/>
