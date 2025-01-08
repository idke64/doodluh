<script lang="ts">
	import { ThemeProvider } from '$lib/components/';
	import '../app.css';
	import { setContext } from 'svelte';
	import { boards } from '$lib/shared';

	let { children, data } = $props();

	const { user } = data;

	setContext('user', user);

	boards.setLocal(!user);

	boards.init();
</script>

<ThemeProvider>
	{@render children()}
</ThemeProvider>
