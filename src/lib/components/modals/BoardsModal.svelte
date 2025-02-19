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
	import { boards, currModal } from '$lib/shared';
	import type { BoardModel, User } from '$lib/server/database/schema';
	import { v4 as uuidv4 } from 'uuid';
	import { getContext } from 'svelte';
	import BoardCard from '../ui/BoardCard.svelte';

	let { board } = $props();

	let layout: 'grid' | 'list' = $state('grid');
	let searchQuery: string = $state('');
	let visibility: 'All' | 'Public' | 'Private' = $state('All');
	let sortBy: 'Alphabetical' | 'Date Created' | 'Last Modified' = $state('Alphabetical');

	let filteredBoards: BoardModel[] = $state([]);

	$effect(() => {
		const visibilityFiltered = boards.items.filter((board) => {
			if (visibility === 'All') return true;
			return board.visibility === visibility.toLowerCase();
		});
		const results = fuzzysort.go(searchQuery, visibilityFiltered, {
			key: 'name',
			all: true
		});

		let sorted = results.map((result) => result.obj);

		sorted.sort((a, b) => {
			if (sortBy === 'Alphabetical') {
				return a.name.localeCompare(b.name);
			} else if (sortBy === 'Date Created') {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			} else if (sortBy === 'Last Modified') {
				return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
			}
			return 0;
		});

		filteredBoards = sorted;
	});

	const user: User = getContext('user');

	async function handleCreate() {
		const id = uuidv4();
		await boards.add({
			id,
			name: 'Untitled Board',
			backgroundColor: 'transparent',
			grid: 'lines',
			visibility: 'private',
			userId: user?.id || null,
			thumbnail: null,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		handleNavigate(id);
	}

	function handleNavigate(id: string) {
		currModal.value = null;
		window.location.href = `/board/${id}`;
	}
</script>

<div
	onwheel={(e) => e.stopPropagation()}
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
							disabled={true}
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
				<button class="btn-primary gap-x-1.5 px-3" onclick={handleCreate}>
					Create <Fa icon={faPlus} />
				</button>
			</div>
		</div>
		<div
			class="grid h-[512px] w-full grid-cols-4 gap-4 overflow-y-auto max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
		>
			{#if layout === 'grid'}
				{#each filteredBoards as filteredBoard}
					<BoardCard board={filteredBoard} {handleNavigate} selectedBoardId={board.id} />
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
