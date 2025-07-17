<script lang="ts">
	import { theme } from '$lib/shared';
	import { getThemeAwareColor } from '$lib/utils';
	import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
	import { faUser } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { fly } from 'svelte/transition';

	let { others } = $props();
	const MAX_COLLABORATORS = 5;
</script>

<div class="flex gap-x-2">
	{#each others.slice(0, MAX_COLLABORATORS) as other}
		<div class="tooltip-bottom relative" style="--label: '{other.name}'">
			<div
				class="flex aspect-square h-9 items-center justify-center overflow-hidden rounded-full border-[3px] object-contain"
				style="background-color: {other.color}; border-color: {other.color};"
			>
				{#if other?.picture}
					<img src={other.picture} alt="thumbnail" class="h-full w-full" />
				{:else}
					<Fa icon={faUser} class="text-lg text-bg-2" />
				{/if}
			</div>
		</div>
	{/each}
	{#if others.length > MAX_COLLABORATORS}
		<div
			class="tooltip-bottom relative"
			style="--label: '{others.length - MAX_COLLABORATORS} more'"
		>
			<div
				class="flex aspect-square h-9 items-center justify-center rounded-full bg-bg-2 text-sm font-medium text-text-3"
			>
				+{others.length - MAX_COLLABORATORS}
			</div>
		</div>
	{/if}
</div>
