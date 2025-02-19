<script lang="ts">
	import { toolSettings } from '$lib/shared';
	import { camelToTitleCase } from '$lib/utils';

	let { tool, setting, min, max } = $props();
</script>

<div class="flex flex-col gap-y-3">
	<div class="flex items-end justify-between">
		<span class="text-xs text-text-3">{camelToTitleCase(setting)}</span>
		<input class="flex w-8 justify-center items-center rounded-sm bg-text-3/10 text-xs text-text-1 focus:border-transparent outline-none text-center"
		oninput={(e) => {
			const input = e.target as HTMLInputElement;
			input.value = input.value.replace(/[^0-9]/g, '');
		}}
		onblur={(e) => {
			const input = e.target as HTMLInputElement;
			const num = Number(input.value);
			const clamped = Math.min(Math.max(num, min), max);
			toolSettings[tool][setting] = clamped;
			input.value = clamped.toString();
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				e.currentTarget.blur();
			}
		}}
		value={toolSettings[tool][setting]}/>
	</div>
	<input type="range" {min} {max} step="1" bind:value={toolSettings[tool][setting]} class="range" />
</div>
