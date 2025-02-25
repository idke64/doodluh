import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from '../src/lib/server/database/db.js';
import { objects } from '../src/lib/server/database/schema.js';
import type { Board, Collaborator, TransportObject, Object } from '../src/lib/types/index.js';
import { generateRandomColor, transportToObject } from '../src/lib/utils/index.js';
import { ColumnAliasProxyHandler, eq } from 'drizzle-orm';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { updateBoard } from './db.js';
import { authMiddleware } from './middleware/auth.js';
import { originMiddleware } from './middleware/origin.js';
import { createClient } from 'redis';

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

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect();

async function getCollaborators(boardId: string): Promise<Collaborator[]> {
	const data = await redisClient.get(`board:${boardId}:collaborators`);
	return data ? JSON.parse(data) : [];
}

async function setCollaborators(boardId: string, collaborators: Collaborator[]) {
	await redisClient.set(`board:${boardId}:collaborators`, JSON.stringify(collaborators), {
		EX: 300
	});
}

async function getBoard(boardId: string): Promise<Board | null> {
	const data = await redisClient.get(`board:${boardId}:data`);
	return data ? JSON.parse(data) : null;
}

async function setBoardData(boardId: string, boardData: Board) {
	await redisClient.set(`board:${boardId}:data`, JSON.stringify(boardData));
}

io.use(originMiddleware);
io.use(authMiddleware);

io.on('connection', async (socket) => {
	const boardId = socket.handshake.auth.boardId;
	let user = socket.data.user;
	let boardModel = socket.data.boardModel;

	let currentCollaborators = await getCollaborators(boardId);
	if (currentCollaborators.length === 0) {
		currentCollaborators = [];
		await setCollaborators(boardId, currentCollaborators);
	}

	const usedColors = currentCollaborators.map((c) => c.color);

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
		objectsSelectedIds: [],
		objectsSelectedBox: {
			pos: { x: 0, y: 0 },
			width: 0,
			height: 0,
			rotation: 0
		},
		lastActive: new Date()
	};

	let currentBoard = await getBoard(boardId);
	if (!currentBoard) {
		try {
			const boardObjects = await db
				.select()
				.from(objects)
				.where(eq(objects.boardId, boardId))
				.orderBy(objects.zIndex);
			currentBoard = { ...boardModel, objects: boardObjects };
			await setBoardData(boardId, currentBoard!);
		} catch (err) {
			console.error('Failed to get board objects:', err);
		}
	}

	socket.emit('connect_init', collaborator, currentCollaborators, currentBoard);

	socket.broadcast.to(boardId).emit('user_join', collaborator);

	currentCollaborators.push(collaborator);
	await setCollaborators(boardId, currentCollaborators);

	socket.on('update_board', async (updates: Partial<Board>) => {
		socket.broadcast.to(boardId).emit('board_updated', updates);

		if (currentBoard) {
			currentBoard = { ...currentBoard, ...updates };
			await setBoardData(boardId, currentBoard);
		}
	});

	socket.on('update_collaborator', async (updates: Partial<Collaborator>, id: string) => {
		socket.broadcast.to(boardId).emit('collaborator_updated', updates, id);

		currentCollaborators = await getCollaborators(boardId);
		currentCollaborators = currentCollaborators.map((collaborator: Collaborator) =>
			collaborator.id === id ? { ...collaborator, ...updates } : collaborator
		);
		await setCollaborators(boardId, currentCollaborators);
	});

	socket.on('update_objects', async (transportObjects: TransportObject[]) => {
		socket.broadcast.to(boardId).emit('objects_updated', transportObjects);

		const newObjects: Object[] = transportObjects.map((transportObject) =>
			transportToObject(transportObject)
		);

		if (currentBoard) {
			const updatedObjects = [...currentBoard.objects];
			newObjects.forEach((object) => {
				const index = updatedObjects.findIndex((o) => o.id === object.id);
				if (index !== -1) {
					updatedObjects[index] = object;
				} else {
					updatedObjects.push(object);
				}
			});
			currentBoard.objects = updatedObjects;
			await setBoardData(boardId, currentBoard);
		}
	});

	socket.on('delete_objects', async (objectIds: string[]) => {
		socket.broadcast.to(boardId).emit('objects_deleted', objectIds);

		if (currentBoard) {
			currentBoard.objects = currentBoard.objects.filter(
				(object) => !objectIds.includes(object.id)
			);
			await setBoardData(boardId, currentBoard);
		}
	});

	socket.on('update_temp_objects', (transportObjects: TransportObject[]) => {
		socket.broadcast.to(boardId).emit('temp_objects_updated', transportObjects);
	});

	socket.on('delete_temp_objects', (objectIds: string[]) => {
		socket.broadcast.to(boardId).emit('temp_objects_deleted', objectIds);
	});

	socket.on('disconnect', async () => {
		let collaboratorsAfter = (await getCollaborators(boardId)).filter(
			(collaborator: Collaborator) => collaborator.id !== socket.id
		);
		await setCollaborators(boardId, collaboratorsAfter);
		socket.broadcast.to(boardId).emit('user_leave', socket.id);

		if (collaboratorsAfter.length === 0 && currentBoard) {
			await updateBoard(currentBoard);
			await redisClient.del(`board:${boardId}:collaborators`);
			await redisClient.del(`board:${boardId}:data`);
		}
	});

	socket.on('error', (error) => {
		console.error('Socket error:', error);
	});
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export { server, io };
