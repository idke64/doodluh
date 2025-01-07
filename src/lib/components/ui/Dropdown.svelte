<script lang="ts">
	import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { Fa } from 'svelte-fa';
	import { scale } from 'svelte/transition';

	let { options = [], value = $bindable(), label = '', className = '' } = $props();

	let isOpen = $state(false);

	function handleSelect(option: any) {
		value = option;
		isOpen = false;
	}

	let dropdown: HTMLElement | null = $state(null);

	function handleClickOutside(e: MouseEvent) {
		if (dropdown && !dropdown.contains(e.target as Node) && isOpen) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative flex items-center gap-x-2 {className}" bind:this={dropdown}>
	<span class="whitespace-nowrap text-text-3 max-sm:hidden">{label}</span>
	<button
		class="btn-secondary flex h-8 w-40 items-center justify-between px-2 max-md:w-32 max-sm:w-full {isOpen
			? 'border-text-3/30 bg-text-3/10'
			: ''}"
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="text-text-3">{value}</span>
		<Fa icon={faChevronDown} class="duration-200 {isOpen ? 'rotate-180' : ''}" />
	</button>
	{#if isOpen}
		<div
			class="absolute right-0 top-full mt-1 w-40 rounded bg-bg-2 p-1 shadow max-md:w-32 max-sm:w-full"
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			{#each options as option}
				<button class="btn-dropdown" onclick={() => handleSelect(option)}>
					<span>{option}</span>
					{#if option === value}
						<Fa icon={faCheck} />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
