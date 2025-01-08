<script lang="ts">
	import type { Board } from '$lib/types';
	import { camelToTitleCase } from '$lib/utils';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let { board, loading } = $props<{ board: Board; loading: boolean }>();
</script>

{#if !loading}
	<div class="flex flex-col gap-y-3">
		<div class="flex h-full w-full items-center gap-x-1">
			<div class="aspect-square h-8 min-w-8 overflow-hidden rounded-sm">
				{#if board?.thumbnail}
					<img src={board.thumbnail} alt="thumbnail" class="h-full w-full" />
				{:else}
					<div class="h-full w-full bg-bg-3"></div>
				{/if}
			</div>
			<div class="flex w-full flex-col">
				<input
					type="text"
					value={board.name}
					onblur={(e) => board.update({ name: e.currentTarget.value })}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.currentTarget.blur();
							board.update({ name: e.currentTarget.value });
						}
					}}
					class="rounded-sm border-2 border-transparent bg-transparent px-1 text-sm font-medium text-text-2 outline-none transition-all duration-150 hover:border-border focus:max-w-full focus:border-border"
					required
				/>
				<span class="ml-[6px] text-[10px] text-text-3">{camelToTitleCase(board.visibility)}</span>
			</div>
		</div>
		{#if board.id !== 'local'}
			<a class="btn-secondary gap-x-2 self-start px-2 text-sm" href="/">
				<Fa icon={faArrowLeft} /> Local board
			</a>
		{/if}
	</div>
{/if}
