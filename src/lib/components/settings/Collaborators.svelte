<script lang="ts">
	import { theme } from '$lib/shared';
	import { getThemeAwareColor } from '$lib/utils';
	// import { faFaceSmile, faSmile, faUser } from '@fortawesome/free-solid-svg-icons';
	import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
	import Fa from 'svelte-fa';

	let { others } = $props();
</script>

<div class="flex gap-x-2">
	{#each others as other}
		<div class="tooltip-bottom relative" style="--label: '{other.name}'">
			<div
				class="flex aspect-square h-9 items-center justify-center overflow-hidden rounded-full border-[3px] object-contain"
				style="background-color: {other.color}; border-color: {other.color};"
			>
				{#if other?.picture}
					<img src={other.picture} alt="thumbnail" class="h-full w-full" />
				{:else}
					<Fa icon={faFaceSmile} class="text-2xl text-bg-2" />
				{/if}
			</div>
		</div>
	{/each}
</div>
