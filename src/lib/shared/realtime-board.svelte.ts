import { io, type Socket } from 'socket.io-client';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Object, Collaborator, TransportObject } from '$lib/types';
import { objectToTransport, throttle, transportToObject } from '$lib/utils';
import { PUBLIC_SOCKET_URL } from '$env/static/public';

const defaultBoard: Board = {
	id: uuidv4(),
	name: 'Untitled',
	visibility: 'private',
	createdAt: new Date(),
	updatedAt: new Date(),
	objects: [],
	backgroundColor: 'transparent',
	grid: 'none'
};

const defaultSelf: Collaborator = {
	id: '',
	name: '',
	picture: '',
	cursor: { x: 0, y: 0 },
	color: '',
	objectsSelectedIds: [],
	objectsSelectedBox: {
		pos: { x: 0, y: 0 },
		width: 0,
		height: 0,
		rotation: 0
	},
	lastActive: new Date()
};

export function createRealtimeBoard(boardId: string) {
	let board = $state({
		...defaultBoard,
		id: boardId,
		loading: true,
		exists: true,

		update(updates: Partial<Board>, emit: boolean = true) {
			Object.assign(this, { ...updates, updatedAt: new Date() });
			if (emit && socket?.connected) {
				socket.emit('update_board', updates);
			}
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

			if (emit && socket?.connected) {
				emitters.updateObjects(newObjects);
			}
		},

		deleteObjects(objectIds: string[], emit: boolean = true) {
			this.objects = this.objects.filter((object: Object) => !objectIds.includes(object.id));
			this.updatedAt = new Date();

			if (emit && socket?.connected) {
				socket.emit('delete_objects', objectIds);
			}
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

			if (emit && socket?.connected) {
				emitters.updateTempObjects(newObjects);
			}
		},

		delete(objectIds: string[], emit: boolean = true) {
			const filtered: Object[] = [...this].filter((object) => !objectIds.includes(object.id));
			Object.assign(this, filtered);

			if (emit && socket?.connected) {
				emitters.deleteTempObjects(objectIds);
			}
		}
	});

	const emitters = {
		updateSelf: throttle((updates: Partial<Collaborator>) => {
			socket?.emit('update_collaborator', updates, collaborators.self.id);
		}, 100),
		updateTempObjects: throttle((newObjects: Object[]) => {
			const transportObjects = newObjects.map((object) => {
				return objectToTransport(object);
			});
			socket?.emit('update_temp_objects', transportObjects);
		}, 500),
		deleteTempObjects: throttle((objectIds: string[]) => {
			socket?.emit('delete_temp_objects', objectIds);
		}, 500),
		updateObjects: throttle((newObjects: Object[]) => {
			const transportObjects = newObjects.map((object) => {
				return objectToTransport(object);
			});
			socket?.emit('update_objects', transportObjects);
		}, 100)
	};

	let collaborators = $state({
		self: defaultSelf,
		others: [] as Collaborator[],

		updateSelf(updates: Partial<Collaborator>, emit: boolean = true) {
			this.self = { ...this.self, ...updates };
			if (emit && socket?.connected) {
				emitters.updateSelf({
					...updates,
					cursor: this.self.cursor,
					objectsSelectedIds: this.self.objectsSelectedIds,
					objectsSelectedBox: this.self.objectsSelectedBox,
					lastActive: new Date()
				});
			}
		},

		updateOther(id: string, updates: Partial<Collaborator>) {
			const index = this.others.findIndex((c) => c.id === id);
			if (index !== -1) {
				this.others[index] = { ...this.others[index], ...updates };
			} else {
				if (id) {
					this.others.push({ id, ...updates } as Collaborator);
				}
			}
		},

		deleteOther(id: string) {
			this.others = this.others.filter((c) => c.id !== id);
		}
	});

	let socket: Socket | null = null;

	if (browser) {
		socket = io(PUBLIC_SOCKET_URL, {
			reconnectionDelayMax: 10000,
			auth: { boardId: board.id },
			withCredentials: true
		});

		socket.on('board_updated', (updates: Partial<Board>) => {
			board.update(updates, false);
		});

		socket.on('objects_updated', (newObjects: TransportObject[]) => {
			const objects = newObjects.map((transportObject) => {
				return transportToObject(transportObject);
			});
			board.updateObjects(objects, false);
		});

		socket.on('objects_deleted', (objectIds: string[]) => {
			board.deleteObjects(objectIds, false);
		});

		socket.on('temp_objects_updated', (newObjects: TransportObject[]) => {
			const objects = newObjects.map((transportObject) => {
				return transportToObject(transportObject);
			});
			tempObjects.update(objects, false);
		});

		socket.on('temp_objects_deleted', (objectIds: string[]) => {
			tempObjects.delete(objectIds, false);
		});

		socket.on('collaborator_updated', (updates: Partial<Collaborator>, id: string) => {
			collaborators.updateOther(id, updates);
		});

		socket.on('user_join', (collaborator: Collaborator) => {
			console.log('hello');
			collaborators.updateOther(collaborator.id, collaborator);
		});

		socket.on('user_leave', (collaboratorId: string) => {
			const leavingCollaborator = collaborators.others.find((collaborator) => {
				return collaborator.id === collaboratorId;
			});
			console.log(`${leavingCollaborator!.name} Left`);
			collaborators.deleteOther(collaboratorId);
		});

		socket.on('connect', () => {
			console.log('Connected to board:', board.id);
		});

		socket.on('connect_init', (self: Collaborator, others: Collaborator[], boardData: Board) => {
			collaborators.updateSelf(self, false);
			collaborators.others = others;
			board.update(boardData, false);
			board.loading = false;
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from board:', board.id);
		});

		socket.on('connect_error', (err) => {
			console.error('Failed to connect to board');
			board.exists = false;
		});
	}
	return { board, collaborators, tempObjects };
}
