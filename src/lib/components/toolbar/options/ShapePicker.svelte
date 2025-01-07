<script lang="ts">
	import { toolSettings } from '$lib/shared';
	import { Shape } from '$lib/components';
	import type { ToolSettings } from '$lib/types';

	type ShapeOption = ToolSettings['shapes']['shape'];
	const shapes: ShapeOption[] = ['rectangle', 'triangle', 'ellipse', 'rhombus', 'star'];
</script>

<div class="flex flex-col gap-y-3">
	<div class="flex items-end justify-between">
		<span class="text-xs text-text-3">Shape</span>
		<span class="rounded-sm bg-text-3/10 px-1 text-xs text-text-1">{toolSettings.shapes.shape}</span
		>
	</div>
	<div class="grid w-full grid-cols-5 gap-2.5">
		{#each shapes as shape}
			<button
				class="flex h-6 w-full items-center justify-center rounded-sm p-0.5 duration-200 hover:bg-text-3/10"
				onclick={() => (toolSettings.shapes.shape = shape)}
			>
				<Shape class="h-full w-full stroke-2 text-text-1" {shape} />
			</button>
		{/each}
	</div>
</div>
