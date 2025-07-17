<script>
	import Fa from 'svelte-fa';

	let { value = $bindable(), options = [], optionsIcons = [], onupdate } = $props();
</script>

<div class="relative flex rounded border-2 border-border p-0.5">
	{#each optionsIcons as icon, index}
		<button
			onclick={() => onupdate?.(options[index])}
			class="flex aspect-square h-5 w-5 items-center justify-center rounded-sm {value !=
			options[index]
				? 'hover:bg-btn-hover'
				: ''}"
			><Fa
				class={value == options[index] ? 'text-text-4' : 'text-text-3 hover:text-text-1'}
				{icon}
			/></button
		>
	{/each}
	<div
		class="absolute -z-10 aspect-square h-5 w-5 rounded-sm bg-palette-cyan transition-transform duration-200"
		style="transform: translateX({options.indexOf(value) * 20}px)"
	></div>
</div>
