<script lang="ts">
	import App from '../App.svelte';
	import { board, collaborators, tempObjects } from '$lib/shared';
</script>

<App {board} {collaborators} {tempObjects} />
