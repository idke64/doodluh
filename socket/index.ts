import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from '../src/lib/server/database/db.js';
import { objects } from '../src/lib/server/database/schema.js';
import type { Board, Collaborator, TransportObject, Object } from '../src/lib/types/index.js';
import { generateRandomColor, transportToObject } from '../src/lib/utils/index.js';
import { eq } from 'drizzle-orm';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { setBoard } from './db.js';
import { authMiddleware } from './middleware/auth.js';
import { originMiddleware } from './middleware/origin.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.APP_URL,
		methods: ['GET', 'POST'],
		credentials: true
	},
	pingTimeout: 60000,
	pingInterval: 25000
});

let activeCollaborators: Map<string, Collaborator[]> = new Map();
let activeBoards: Map<string, Board> = new Map();

io.use(originMiddleware);
io.use(authMiddleware);

io.on('connection', async (socket) => {
	const boardId = socket.handshake.auth.boardId;
	let user = socket.data.user;
	let boardModel = socket.data.boardModel;

	if (!activeCollaborators.has(boardId)) {
		activeCollaborators.set(boardId, []);
	}

	const usedColors = activeCollaborators.get(boardId)!.map((c) => c.color);

	const collaborator = {
		id: socket.id,
		name:
			user?.name ??
			uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: ' ',
				style: 'capital'
			}),
		picture: user?.picture ?? '',
		userId: user?.id,
		cursor: { x: 0, y: 0 },
		color: generateRandomColor(usedColors),
		objectsSelected: [],
		objectsSelectedBox: {
			pos: { x: 0, y: 0 },
			width: 0,
			height: 0,
			rotation: 0
		},
		lastActive: new Date()
	};

	if (!activeBoards.has(boardId)) {
		try {
			const boardObjects = await db
				.select()
				.from(objects)
				.where(eq(objects.boardId, boardId))
				.orderBy(objects.zIndex);
			activeBoards.set(boardId, { ...boardModel, objects: boardObjects });
		} catch (err) {
			console.error('Failed to get board objects:', err);
		}
	}

	socket.emit(
		'connect_init',
		collaborator,
		activeCollaborators.get(boardId),
		activeBoards.get(boardId)
	);

	socket.broadcast.to(boardId).emit('user_join', collaborator);

	activeCollaborators.get(boardId)!.push(collaborator);

	console.log('Client connected:', socket.id);

	socket.on('update_board', (updates: Partial<Board>) => {
		socket.broadcast.to(boardId).emit('board_updated', updates);

		const currBoard = activeBoards.get(boardId)!;
		activeBoards.set(boardId, { ...currBoard, ...updates });
	});

	socket.on('update_collaborator', (updates: Partial<Collaborator>, id: string) => {
		socket.broadcast.to(boardId).emit('collaborator_updated', updates, id);
	});

	socket.on('update_objects', async (transportObjects: TransportObject[]) => {
		socket.broadcast.to(boardId).emit('objects_updated', transportObjects);

		const newObjects: Object[] = transportObjects.map((transportObject) => {
			return transportToObject(transportObject);
		});

		const currBoard = activeBoards.get(boardId)!;
		const updatedObjects = [...currBoard.objects];

		newObjects.forEach((object) => {
			const index = updatedObjects.findIndex((o) => o.id === object.id);
			if (index !== -1) {
				updatedObjects[index] = object;
			} else {
				updatedObjects.push(object);
			}
		});

		activeBoards.set(boardId, {
			...currBoard,
			objects: updatedObjects
		});
	});

	socket.on('delete_objects', (objectIds: string[]) => {
		socket.broadcast.to(boardId).emit('objects_deleted', objectIds);

		const currBoard = activeBoards.get(boardId)!;

		activeBoards.set(boardId, {
			...currBoard,
			objects: currBoard.objects.filter((object) => !objectIds.includes(object.id))
		});
	});

	socket.on('update_temp_objects', (transportObjects: TransportObject[]) => {
		socket.broadcast.to(boardId).emit('temp_objects_updated', transportObjects);
	});

	socket.on('delete_temp_objects', (objectIds: string[]) => {
		socket.broadcast.to(boardId).emit('temp_objects_deleted', objectIds);
	});

	socket.on('disconnect', async () => {
		console.log('Client disconnected:', socket.id);
		activeCollaborators.set(
			boardId,
			(activeCollaborators.get(boardId) || []).filter((c) => c.id !== socket.id)
		);
		socket.broadcast.to(boardId).emit('user_leave', socket.id);

		if (activeCollaborators.get(boardId)!.length === 0) {
			activeCollaborators.delete(boardId);

			const board = activeBoards.get(boardId)!;

			await setBoard(board);

			activeBoards.delete(boardId);
		}
	});

	socket.on('error', (error) => {
		console.error('Socket error:', error);
	});
});

app.use(cors());
app.use(express.json());

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export { server, io };
