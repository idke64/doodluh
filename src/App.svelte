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
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import { currModal } from '$lib/shared';

	import type { Point, Action, Object, Tool } from '$lib/types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

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
		<div class="fixed-headers" transition:fly={{ duration: 600, y: -50 }}>
			<div class="flex items-center gap-3 max-sm:flex-col max-sm:items-start">
				<BoardBar {board} {loading} />
				<Collaborators others={collaborators.others} />
			</div>
			<Menu />
		</div>
		<div class="fixed-footers" transition:fly={{ duration: 600, y: 50 }}>
			<a
				class="btn-secondary gap-x-2 px-2 {board.id === 'local'
					? 'pointer-events-none opacity-0'
					: ''}"
				href="/"
			>
				<Fa icon={faArrowLeft} /> Local board
			</a>
			<div class="flex items-center gap-3 self-end max-sm:flex-col max-sm:items-start">
				<UndoRedoControl bind:actions bind:actionsIndex />
				<ZoomControl bind:scale {changeScale} />
			</div>
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
	{/if}
</main>

<svelte:window onkeydown={handleKeyDown} onkeyup={(e) => keysDown.delete(e.key)} />
