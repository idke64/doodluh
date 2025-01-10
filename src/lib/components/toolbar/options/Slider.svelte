<script lang="ts">
	import { toolSettings } from '$lib/shared';
	import type { ToolSettings } from '$lib/types';
	import { camelToTitleCase } from '$lib/utils';

	let { tool, setting, min, max } = $props();
</script>

<div class="flex flex-col gap-y-3">
	<div class="flex items-end justify-between">
		<span class="text-xs text-text-3">{camelToTitleCase(setting)}</span>
		<span class="flex w-8 justify-center rounded-sm bg-text-3/10 text-xs text-text-1"
			>{toolSettings[tool][setting]}</span
		>
	</div>
	<input type="range" {min} {max} step="1" bind:value={toolSettings[tool][setting]} class="range" />
</div>
