import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Board, Collaborator, Object } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';

const defaultBoard: Board = {
	id: 'local',
	name: 'Untitled Board',
	visibility: 'private',
	createdAt: new Date(),
	updatedAt: new Date(),
	objects: [],
	backgroundColor: 'transparent',
	grid: 'lines'
};

const defaultSelf: Collaborator = {
	id: '',
	name: '',
	picture: '',
	cursor: { x: 0, y: 0 },
	color: '',
	objectsSelected: [],
	objectsSelectedBox: {
		pos: { x: 0, y: 0 },
		width: 0,
		height: 0,
		rotation: 0
	},
	lastActive: new Date()
};

export function createLocalBoard() {
	let board = $state({
		...(browser
			? JSON.parse(localStorage.getItem('board') || JSON.stringify(defaultBoard))
			: defaultBoard),
		loading: true,

		update(updates: Partial<Board>, emit: boolean = true) {
			Object.assign(this, { ...updates, updatedAt: new Date() });
		},

		updateObjects(newObjects: Object[], emit: boolean = true) {
			const updatedObjects = [...this.objects];
			newObjects.forEach((obj) => {
				const index = updatedObjects.findIndex((o) => o.id === obj.id);
				if (index !== -1) {
					updatedObjects[index] = obj;
				} else {
					updatedObjects.push(obj);
				}
			});
			this.objects = updatedObjects;
			this.updatedAt = new Date();
		},

		deleteObjects(objectIds: string[], emit: boolean = true) {
			this.objects = this.objects.filter((object: Object) => !objectIds.includes(object.id));
			this.updatedAt = new Date();
		},

		clear() {
			this.update({ objects: [] });
		}
	});

	let tempObjects = $state({
		...([] as Object[]),
		update(newObjects: Object[], emit: boolean = true) {
			const updatedObjects: Object[] = [...this];
			newObjects.forEach((object) => {
				const index = updatedObjects.findIndex((o) => o.id === object.id);
				if (index !== -1) {
					updatedObjects[index] = object;
				} else {
					updatedObjects.push(object);
				}
			});
			Object.assign(this, updatedObjects);
		},

		delete(objectIds: string[], emit: boolean = true) {
			const filtered: Object[] = [...this].filter((object) => !objectIds.includes(object.id));
			Object.assign(this, filtered);
		}
	});

	let collaborators = $state({
		self: defaultSelf,
		others: [] as Collaborator[],

		updateSelf(updates: Partial<Collaborator>) {
			this.self = { ...this.self, ...updates };
		},

		updateOther(id: string, updates: Partial<Collaborator>) {
			const index = this.others.findIndex((c) => c.id === id);
			if (index !== -1) {
				this.others[index] = { ...this.others[index], ...updates };
			} else {
				this.others.push({ id, ...updates } as Collaborator);
			}
		},

		deleteOther(id: string) {
			this.others = this.others.filter((c) => c.id !== id);
		}
	});
	$effect.root(() => {
		$effect(() => {
			if (browser) {
				board.loading = false;
				localStorage.setItem('board', JSON.stringify(board));
			}
		});
	});

	return { localBoard: board, localCollaborators: collaborators, localTempObjects: tempObjects };
}

export const { localBoard, localCollaborators, localTempObjects } = createLocalBoard();
