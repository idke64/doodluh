<script lang="ts">
	import {
		Canvas,
		Toolbar,
		Menu,
		BlurContainer,
		SignInModal,
		ZoomControl,
		UndoRedoControl,
		BoardsModal,
		BoardBar,
		LoadingPage
	} from '$lib/components';
	import Collaborators from '$lib/components/settings/Collaborators.svelte';
	import Fa from 'svelte-fa';
	import { faHouse } from '@fortawesome/free-solid-svg-icons';
	import { currModal } from '$lib/shared';
	import { v4 as uuidv4 } from 'uuid';

	import type { Point, Action, Object, Tool, Box } from '$lib/types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getBoxCorners, objectToTransport } from '$lib/utils';

	let { board, collaborators, tempObjects, loading = false } = $props();

	let isDrawing: boolean = $state(false);

	let tool: Tool = $state('arrow');

	let scale: number = $state(1);
	let offset: Point = $state({ x: 0, y: 0 });

	let actions: Action[] = $state([]);
	let actionsIndex: [number, number] = $state([-1, 0]);

	let keysDown: Set<string> = new Set();

	onMount(() => {
		window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

		return () => {
			window.removeEventListener('wheel', (e) => e.preventDefault());
		};
	});

	async function handleKeyDown(e: KeyboardEvent) {
		const activeTag = document.activeElement?.tagName;
		if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

		const key = e.key;
		keysDown.add(key);
		if (key >= '1' && key <= '7' && !isDrawing) {
			tool = (['arrow', 'pencil', 'eraser', 'shapes', 'line', 'text', 'hand'] as Tool[])[
				parseInt(key) - 1
			];
		}

		if (key === 'Backspace' || key === 'Delete') {
			if (collaborators.self.objectsSelectedIds.length > 0) {
				const selectedSet = new Set(collaborators.self.objectsSelectedIds);
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'remove',
						objects: board.objects.filter((object: Object) => selectedSet.has(object.id))
					}
				];
				actionsIndex = [actions.length - 1, 0];
				board.deleteObjects(collaborators.self.objectsSelectedIds);
				collaborators.updateSelf({
					objectsSelectedIds: [],
					objectsSelectedBox: { rotation: 0, pos: { x: 0, y: 0 }, width: 0, height: 0 }
				});
			}
		}

		if (keysDown.has('Control')) {
			if (key === 'c') {
				const selectedSet = new Set(collaborators.self.objectsSelectedIds);
				await navigator.clipboard.writeText(
					JSON.stringify(board.objects.filter((object: Object) => selectedSet.has(object.id)))
				);
			}
			if (key === 'v') {
				const text = await navigator.clipboard.readText();
				console.log(await navigator.clipboard.read());
				let parsed;
				try {
					parsed = JSON.parse(text);
				} catch (err) {
					return;
				}
				if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object')) {
					const selectedBox = collaborators.self.objectsSelectedBox;
					const cursor = collaborators.self.cursor;

					let originalSelectedBox: Box = {
						width: 0,
						height: 0,
						pos: { x: Number.MAX_VALUE, y: Number.MAX_VALUE },
						rotation: 0
					};

					parsed.forEach((object: Object) => {
						const corners: Point[] = getBoxCorners(object.box);
						corners.forEach((corner) => {
							const pos: Point = {
								x: Math.min(originalSelectedBox.pos.x, corner.x),
								y: Math.min(originalSelectedBox.pos.y, corner.y)
							};
							originalSelectedBox = {
								width: Math.max(corner.x - pos.x, originalSelectedBox.width),
								height: Math.max(corner.y - pos.y, originalSelectedBox.height),
								pos,
								rotation: 0
							};
						});
					});

					const updatedObjects = parsed.map((obj) => ({
						...obj,
						zIndex: obj.zIndex + 1,
						id: uuidv4(),
						box:
							selectedBox.height > 0 && selectedBox.width > 0
								? {
										...obj.box,
										pos: {
											x: obj.box.pos.x - originalSelectedBox.pos.x + selectedBox.pos.x + 50 / scale,
											y: obj.box.pos.y - originalSelectedBox.pos.y + selectedBox.pos.y + 50 / scale
										}
									}
								: {
										...obj.box,
										pos: {
											x:
												obj.box.pos.x -
												originalSelectedBox.pos.x +
												cursor.x -
												originalSelectedBox.width / 2,
											y:
												obj.box.pos.y -
												originalSelectedBox.pos.y +
												cursor.y -
												originalSelectedBox.height / 2
										}
									}
					}));
					let topLeft: Point = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
					let bottomRight: Point = { x: 0, y: 0 };

					updatedObjects.forEach((object: Object) => {
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

					collaborators.updateSelf({
						objectsSelectedIds: updatedObjects.map((object: Object) => object.id),
						objectsSelectedBox: {
							pos: topLeft,
							width: bottomRight.x - topLeft.x,
							height: bottomRight.y - topLeft.y,
							rotation: 0
						}
					});
					actions = [
						...actions.slice(0, actionsIndex[0] + 1),
						{
							type: 'add',
							objects: updatedObjects
						}
					];
					actionsIndex = [actionsIndex[0] + 1, 0];
					board.updateObjects(updatedObjects);
				}
			}
			if (key === 'z') {
				e.preventDefault();
				if (actionsIndex[0] > -1) {
					actionsIndex = [actionsIndex[0] - 1, -1];
				}
			}
			if (key === 'y') {
				e.preventDefault();
				if (actionsIndex[0] < actions.length - 1) {
					actionsIndex = [actionsIndex[0] + 1, 1];
				}
			}
			if (key === '=') {
				e.preventDefault();
				changeScale(0.1);
			}
			if (key === '-') {
				e.preventDefault();
				changeScale(-0.1);
			}
		}
	}

	const MAX_SCALE = 100;

	const changeScale = (amt: number) => {
		const dpr = window.devicePixelRatio || 1;

		const center = {
			x: (window.innerWidth * dpr) / 2,
			y: (window.innerHeight * dpr) / 2
		};

		const prevScale = scale;
		scale = Math.min(Math.max(scale + amt, 0.1), MAX_SCALE);
		const scaleFactor = scale / prevScale;

		offset = {
			x: center.x - (center.x - offset.x) * scaleFactor,
			y: center.y - (center.y - offset.y) * scaleFactor
		};
	};
</script>

<BlurContainer>
	{#if currModal.value === 'signin'}
		<SignInModal />
	{/if}
	{#if currModal.value === 'boards'}
		<BoardsModal {board} />
	{/if}
</BlurContainer>

<main>
	{#if loading}
		<LoadingPage />
	{:else}
		<div class="fixed-headers-start" transition:fly={{ duration: 600, y: -50 }}>
			<div class="flex items-center gap-3 max-sm:flex-col max-sm:items-start">
				<BoardBar {board} {loading} />
				<Collaborators others={collaborators.others} />
			</div>
		</div>
		<div class="fixed-headers-end" transition:fly={{ duration: 600, y: -50 }}>
			<Menu />
		</div>
		<div class="fixed-footers-start" transition:fly={{ duration: 600, y: 50 }}>
			<a
				class="btn-secondary gap-x-2 px-2 {board.id === 'local'
					? 'pointer-events-none opacity-0'
					: 'tooltip-top'}"
				href="/"
				style="--label: 'Local board'"
			>
				<Fa icon={faHouse} />
			</a>
		</div>
		<div class="fixed-footers-end" transition:fly={{ duration: 600, y: 50 }}>
			<div class="flex items-center gap-3 self-end max-sm:items-start">
				<UndoRedoControl bind:actions bind:actionsIndex />
				<ZoomControl bind:scale {changeScale} />
			</div>
		</div>

		<div class="fixed-left">
			<Toolbar bind:tool />
		</div>
		<Canvas
			bind:tool
			bind:isDrawing
			bind:scale
			bind:offset
			bind:actions
			bind:actionsIndex
			{board}
			{collaborators}
			{tempObjects}
		/>
	{/if}
</main>

<svelte:window onkeydown={handleKeyDown} onkeyup={(e) => keysDown.delete(e.key)} />
