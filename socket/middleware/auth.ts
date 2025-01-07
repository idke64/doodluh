import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { validateSessionToken } from '../../src/lib/server/auth/session';
import { db } from '../../src/lib/server/database/db';
import { boards } from '../../src/lib/server/database/schema';
import { eq } from 'drizzle-orm';

export async function authMiddleware(socket: Socket, next: Function) {
	const boardId = socket.handshake.auth.boardId;
	const cookies = socket.handshake.headers.cookie ?? '';
	const token = parse(cookies)['session'];

	try {
		const board = await db.query.boards.findFirst({
			where: eq(boards.id, boardId)
		});
		if (!board) {
			return next(new Error('Board not found'));
		}

		const { user } = await validateSessionToken(token);
		if (board.visibility === 'private' && board.userId !== user?.id) {
			return next(new Error('Board not found'));
		}

		socket.data.user = user;
		socket.data.boardModel = board;
		socket.join(boardId);
		next();
	} catch (err) {
		next(new Error('Board not found'));
	}
}
