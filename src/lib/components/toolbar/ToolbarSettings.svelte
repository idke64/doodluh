<script lang="ts">
	import { Slider, ColorPicker, ShapePicker } from '$lib/components';
	let { setting } = $props();
</script>

<div class="flex select-none flex-col gap-y-4">
	{#if setting == 'pencil'}
		<Slider tool="pencil" setting="thickness" min={1} max={80} />
		<ColorPicker tool="pencil" setting="color" contrast="useContrast" />
		<Slider tool="pencil" setting="opacity" min={1} max={100} />
	{:else if setting == 'shapes'}
		<ShapePicker />
		<Slider tool="shapes" setting="thickness" min={1} max={80} />
		<ColorPicker tool="shapes" setting="color" contrast="useContrast" />
		<Slider tool="shapes" setting="opacity" min={1} max={100} />
		<ColorPicker tool="shapes" setting="fillColor" contrast="useContrastFill" />
		<Slider tool="shapes" setting="fillOpacity" min={0} max={100} />
	{:else if setting == 'line'}
		<Slider tool="line" setting="thickness" min={1} max={80} />
		<ColorPicker tool="line" setting="color" contrast="useContrast" />
		<Slider tool="line" setting="opacity" min={1} max={100} />
	{:else if setting == 'text'}
		<Slider tool="text" setting="fontSize" min={1} max={10} />
		<ColorPicker tool="text" setting="color" contrast="useContrast" />
	{/if}
</div>
