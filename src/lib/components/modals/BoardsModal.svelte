<script lang="ts">
	import Fa from 'svelte-fa';
	import fuzzysort from 'fuzzysort';
	import { scale } from 'svelte/transition';
	import { Input } from '$lib/components';
	import {
		faList,
		faMagnifyingGlass,
		faPlus,
		faTableCells
	} from '@fortawesome/free-solid-svg-icons';
	import { Dropdown } from '$lib/components';
	// import { boards } from '$lib/shared';
	import type { Board } from '$lib/types';

	let layout: string = $state('grid');
	let searchQuery: string = $state('');
	let visibility: string = $state('All');
	let sortBy: string = $state('Alphabetical');

	let filteredBoards: Board[] = $state([]);

	// $effect(() => {
	// 	const results = fuzzysort.go(searchQuery, $boards, {
	// 		key: 'name',
	// 		all: true
	// 	});
	// 	filteredBoards = results.map((result) => result.obj);
	// });
</script>

<div
	class="pointer-events-auto w-[min(1000px,95%)] translate-y-2 rounded bg-bg-2 p-8"
	transition:scale={{ duration: 300, start: 0.95 }}
>
	<div class="flex flex-col gap-y-6">
		<h4>Boards</h4>
		<div class="flex w-full flex-col gap-y-4">
			<Input
				className="w-full"
				icon={faMagnifyingGlass}
				placeholder="Search"
				bind:value={searchQuery}
			/>
			<div class="flex items-center justify-between gap-y-4 max-md:flex-col max-md:items-start">
				<div class="flex items-center gap-4">
					<div class="flex gap-x-2">
						<button
							class={layout === 'grid' ? 'btn-icon-active' : 'btn-icon'}
							onclick={() => (layout = 'grid')}
						>
							<Fa icon={faTableCells} />
						</button>
						<button
							class={layout === 'list' ? 'btn-icon-active' : 'btn-icon'}
							onclick={() => (layout = 'list')}
						>
							<Fa icon={faList} />
						</button>
					</div>
					<div class="h-7 w-[1px] bg-border max-md:hidden"></div>
					<div class="flex gap-x-4">
						<Dropdown
							options={['Alphabetical', 'Date Created', 'Last Modified']}
							label="Sort By"
							bind:value={sortBy}
						/>
						<Dropdown
							options={['All', 'Public', 'Private']}
							label="Visibility"
							bind:value={visibility}
						/>
					</div>
				</div>
				<button class="btn-primary gap-x-1.5 px-3">Create <Fa icon={faPlus} /></button>
			</div>
		</div>
		<div
			class="grid h-[512px] w-full grid-cols-4 gap-4 overflow-y-auto max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
		>
			{#if layout === 'grid'}
				{#each filteredBoards as board}
					<button
						class="{board.id === '5'
							? 'border-border'
							: 'border-transparent hover:border-border'} self-start rounded border-2 p-3 duration-200 hover:border-border"
					>
						<div class="flex flex-col gap-y-2">
							<div class="aspect-video w-full overflow-hidden rounded-sm">
								<div class="h-full w-full bg-cyan-400"></div>
							</div>
							<h5 class="text-start">{board.name}</h5>
						</div>
					</button>
				{/each}
			{:else}
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as key}
					<div class="rounded border-2 bg-bg-3 p-4">
						<div class="flex h-full flex-col">
							<h4 class="text- truncate">Board {key}</h4>
							<p class="line-clamp-2 text-text-3">Description</p>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
