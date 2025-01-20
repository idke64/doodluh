<script lang="ts">
	import { camelToTitleCase } from '$lib/utils';

	let { board, handleNavigate, selectedBoardId } = $props();
</script>

<button
	class="{board.id === selectedBoardId
		? 'border-border'
		: 'border-transparent hover:border-border'} self-start rounded border-2 p-3 duration-200 hover:border-border"
	onclick={() => handleNavigate(board.id)}
>
	<div class="flex flex-col gap-y-2">
		<div class="aspect-video w-full overflow-hidden rounded-sm">
			<div class="h-full w-full bg-palette-cyan"></div>
		</div>
		<div class="gap-y-1">
			<h6 class="line-clamp-1 text-start">{board.name}</h6>
			<div class="flex flex-col gap-y-0.5 text-start">
				<span class="line-clamp-2 text-xs text-text-3">
					Visibility: {camelToTitleCase(board.visibility)}
				</span>
				<span class="line-clamp-2 text-xs text-text-3"
					>Last modified:
					{new Date(board.updatedAt).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})}
				</span>
			</div>
		</div>
	</div>
</button>
