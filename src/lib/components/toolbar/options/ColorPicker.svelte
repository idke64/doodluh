<script lang="ts">
	import { toolSettings, theme } from '$lib/shared';
	import type { ToolSettings } from '$lib/types';
	import { camelToTitleCase, getThemeAwareColor } from '$lib/utils';

	let { tool, setting, contrast } = $props();

	const colors = [
		'contrast',
		'#f94144',
		'#00cc66',
		'#147df5',
		'#ff8700',
		'#29CCC1',
		'#f15bb5',
		'#662e9b',
		'#f8c421',
		'#876e68'
	];
</script>

<div class="flex flex-col gap-y-3">
	<div class="flex items-end justify-between">
		<span class="text-xs text-text-3">{camelToTitleCase(setting)}</span>
		<div
			class="aspect-square h-4 w-4 rounded-full"
			style="background-color: {getThemeAwareColor(
				toolSettings[tool][setting],
				toolSettings[tool][contrast],
				$theme
			)};"
		></div>
	</div>
	<div class="grid w-full grid-cols-5 gap-2.5">
		{#each colors as color}
			{#if color == 'contrast'}
				<div class="flex w-full items-center justify-center">
					<button
						class="aspect-square w-full rounded-full border duration-200 hover:scale-105"
						style="background-color: {$theme === 'dark' ? '#ffffff' : '#000000'};"
						aria-label="Contrast Selection"
						onclick={() => {
							toolSettings[tool][setting] = $theme === 'dark' ? '#ffffff' : '#000000';
							toolSettings[tool][contrast] = true;
						}}
					></button>
				</div>
			{:else}
				<div class="flex w-full items-center justify-center">
					<button
						class={`aspect-square w-full rounded-full ring-text-3 duration-200 hover:scale-105`}
						aria-label="Red"
						style={`background-color: ${color};`}
						onclick={() => {
							toolSettings[tool][setting] = color;
							toolSettings[tool][contrast] = false;
						}}
					></button>
				</div>
			{/if}
		{/each}
	</div>
</div>
