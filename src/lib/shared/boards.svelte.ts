import { browser } from '$app/environment';
import type { BoardModel, User } from '$lib/server/database/schema';
import { localBoard } from './local-board.svelte';

let local = true;

export let boards = $state({
	items: [] as BoardModel[],
	async add(boardModel: BoardModel) {
		this.items.push(boardModel);

		if (!local) {
			await fetch('/api/boards', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(boardModel)
			});
		}
	},
	updateBoard(boardId: string, updates: Partial<BoardModel>) {
		const updatedBoards = this.items.map((boardModel) => {
			if (boardModel.id === boardId) {
				return { ...boardModel, ...updates };
			}
			return boardModel;
		});
		this.items = updatedBoards;
	},
	delete(boardModelId: string) {
		const updatedBoards = this.items.filter((boardModel) => boardModel.id !== boardModelId);
		this.items = updatedBoards;
	},
	async init() {
		if (browser) {
			if (local) {
				this.items = JSON.parse(localStorage.getItem('boards') || '[]');
			} else {
				const boardModels = await fetch('/api/boards');
				const json = await boardModels.json();
				this.items = json;
			}
		}
	},
	setLocal(value: boolean) {
		local = value;
	}
});

$effect.root(() => {
	$effect(() => {
		if (browser && local) {
			localStorage.setItem('boards', JSON.stringify(boards.items));
		}
	});
});
