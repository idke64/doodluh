<script lang="ts">
	import { theme } from '$lib/shared';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if ($theme === 'system') {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				$theme = 'dark';
			} else {
				$theme = 'dark';
			}
		}
	});
	$effect(() => {
		if ($theme === 'dark') {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.classList.add('light');
		}
	});
</script>

{@render children()}
