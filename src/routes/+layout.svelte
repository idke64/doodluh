<script lang="ts">
	import { ThemeProvider } from '$lib/components/';
	import '../app.css';
	import { setContext } from 'svelte';
	let { children, data } = $props();

	setContext('user', data.user);
</script>

<ThemeProvider>
	{@render children()}
</ThemeProvider>
