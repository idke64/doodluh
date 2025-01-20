<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faPencil,
		faEraser,
		faTrash,
		faMinus,
		faGripLines,
		faFont,
		faArrowPointer,
		faHand,
		faCircle
	} from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { ToolbarSettings, Shape } from '$lib/components';
	import { toolSettings } from '$lib/shared';
	import type { Point } from '$lib/types/geometry';
	import { fly } from 'svelte/transition';

	const tools = [
		{ id: 'arrow', label: 'Arrow', icon: faArrowPointer },
		{ id: 'pencil', label: 'Pencil', icon: faPencil },
		{ id: 'eraser', label: 'Eraser', icon: faEraser },
		{ id: 'shapes', label: 'Shapes', icon: faCircle },
		{ id: 'line', label: 'Line', icon: faMinus },
		{ id: 'text', label: 'Text', icon: faFont },
		{ id: 'hand', label: 'Hand', icon: faHand }
	];

	let viewportWidth = $state(0);

	onMount(() => {
		viewportWidth = window.innerWidth;

		const handleResize = () => {
			viewportWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	let { tool = $bindable() } = $props();
	let selectedSettings: string = $state('');
	let pos: Point = $state({ x: 0, y: 0 });

	function handleSelectTool(toolId: string) {
		if (tool === toolId) {
			selectedSettings = selectedSettings === toolId ? '' : toolId;
		} else {
			tool = toolId;
			selectedSettings = '';
		}
	}

	let vertical = $state(true);
</script>

<div
	class="z-10 flex select-none flex-col items-center justify-center rounded bg-bg-2 shadow"
	role="toolbar"
	tabindex="-1"
	transition:fly={{ duration: 600, x: -50 }}
>
	<div class="flex flex-col gap-3 p-1">
		<!-- <button class="flex aspect-square h-9 w-9 items-center justify-center text-text-3 duration-200">
			<Fa icon={faGripLines} /></button
		> -->
		{#each tools as t, ind}
			<div class="relative flex items-center">
				<button
					class="{tool === t.id ? 'btn-icon-active-cyan' : 'btn-icon'} tooltip-right group"
					onclick={() => handleSelectTool(t.id)}
					style="--label: '{t.label}'"
				>
					<span
						class={`${tool === t.id ? 'text-text-4' : 'text-text-3'} absolute left-1 top-0.5 select-none text-[8px]`}
					>
						{ind + 1}
					</span>
					{#if t.id == 'shapes'}
						<Shape
							class="{tool == t.id
								? 'text-text-4'
								: 'text-text-3 group-hover:text-text-1'} h-4 w-4 stroke-[3px]"
							shape={toolSettings.shapes.shape}
						/>
					{:else}
						<Fa
							class={tool == t.id ? 'text-text-4' : 'text-text-3 group-hover:text-text-1'}
							icon={t.icon}
						/>
					{/if}
				</button>
				{#if t.id != 'arrow' && t.id != 'eraser' && t.id != 'hand'}
					<div
						class={`${selectedSettings != t.id || tool != t.id ? 'pointer-events-none scale-95 opacity-0' : 'scale-100 opacity-100'} ${(pos.x * 100) / Number(viewportWidth) > 50 ? 'right-[calc(100%+12px)] origin-right' : 'left-[calc(100%+12px)] origin-left'} absolute w-44 rounded bg-bg-2 px-2 py-3 shadow duration-300`}
					>
						<ToolbarSettings setting={t.id} />
					</div>
				{/if}
			</div>
		{/each}
		<div class={`${vertical ? 'h-[1px] w-full' : 'h-full w-[4px]'} bg-border`}></div>

		<button class="btn-icon tooltip-right group" style="--label: 'Clear'">
			<Fa class="group-hover:text-text-1" icon={faTrash} />
		</button>
	</div>
</div>
