<script lang="ts">
	import { createRealtimeBoard } from '$lib/shared';
	import { App } from '$lib/components';
	import { page } from '$app/state';
	import { ErrorPage } from '$lib/components';

	const { board, collaborators, tempObjects } = createRealtimeBoard(page.params.boardId);
</script>

{#if board.exists}
	<App {board} {collaborators} {tempObjects} loading={board.loading} />
{:else}
	<ErrorPage errorMsg="Board not found" status={404} />
{/if}
