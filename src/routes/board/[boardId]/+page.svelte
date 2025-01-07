<script lang="ts">
	import { createRealtimeBoard } from '$lib/shared';
	import App from '../../../App.svelte';
	import { page } from '$app/stores';

	const { board, collaborators, tempObjects } = createRealtimeBoard($page.params.boardId);
</script>

<App {board} {collaborators} {tempObjects} loading={board.loading} />
