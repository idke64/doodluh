<script lang="ts">
	import { currModal } from '$lib/shared';
	let { children } = $props();
</script>

<button
	type="button"
	class={`${currModal.value == null ? 'hidden' : ''} absolute z-40 flex h-full w-full cursor-default items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity`}
	onclick={() => (currModal.value = null)}
	aria-label="Close modal"
></button>

<div class="pointer-events-none absolute z-50 flex h-full w-full items-center justify-center">
	{@render children()}
</div>
