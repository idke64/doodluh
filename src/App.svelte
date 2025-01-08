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
		BoardBar
	} from '$lib/components';
	import Collaborators from '$lib/components/settings/Collaborators.svelte';
	import { currModal } from '$lib/shared';

	import type { Point, Action, Object, Box, Tool } from '$lib/types';
	import { onMount } from 'svelte';

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

	function handleKeyDown(e: KeyboardEvent) {
		const key = e.key;
		keysDown.add(key);
		if (key >= '1' && key <= '7' && !isDrawing) {
			tool = (['arrow', 'pencil', 'eraser', 'shapes', 'line', 'text', 'hand'] as Tool[])[
				parseInt(key) - 1
			];
		}

		if (key === 'Backspace' || key === 'Delete') {
			if (collaborators.self.objectsSelected.length > 0) {
				actions = [
					...actions.slice(0, actionsIndex[0] + 1),
					{
						type: 'remove',
						objects: collaborators.self.objectsSelected
					}
				];
				actionsIndex = [actions.length - 1, 0];
				board.deleteObjects(collaborators.self.objectsSelected.map((object: Object) => object.id));
				collaborators.updateSelf({ objectsSelected: [] });
			}
		}

		if (keysDown.has('Control')) {
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
	<div class="absolute left-4 top-4 flex w-[calc(100%-32px)] items-start justify-between gap-3">
		<div class="flex items-center gap-3 max-sm:flex-col max-sm:items-start">
			<BoardBar {board} {loading} />
			<Collaborators others={collaborators.others} />
		</div>
		<Menu />
	</div>
	<div class="absolute bottom-4 right-4 flex gap-x-2">
		<UndoRedoControl bind:actions bind:actionsIndex />
		<ZoomControl bind:scale {changeScale} />
	</div>
	<Toolbar bind:tool />
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
</main>

<svelte:window onkeydown={handleKeyDown} onkeyup={(e) => keysDown.delete(e.key)} />
