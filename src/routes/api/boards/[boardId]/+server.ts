import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database/db';
import { boards, type BoardModel } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;
	const { user } = event.locals;

	if (boardId == null) error(500, 'Failed to get board');

	try {
		const board: BoardModel | undefined = await db.query.boards.findFirst({
			where: eq(boards.id, boardId)
		});

		if (board == null) error(404, 'Board not found');

		if (board.visibility !== 'public' && board.userId !== user.id) {
			error(403, 'Unauthorized');
		}

		return json(board);
	} catch (err) {
		error(404, 'Failed to get board');
	}
};

export const PATCH: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;
	const { user } = event.locals;

	if (!boardId) error(500, 'Failed to set board');

	try {
		const changes = await event.request.json();

		const board = await db.query.boards.findFirst({ where: eq(boards.id, boardId) });

		if (!board) error(404, 'Board not found');

		if (board.visibility !== 'public' && board.userId !== user.id) {
			error(403, 'Unauthorized');
		}

		await db
			.update(boards)
			.set({
				...(changes.name && { name: changes.name }),
				...(changes.backgroundColor && { backgroundColor: changes.backgroundColor }),
				...(changes.grid && { grid: changes.grid }),
				...(changes.visibility && { visibility: changes.visibility }),
				...(changes.thumbnail !== undefined && { thumbnail: changes.thumbnail ?? null }),
				updatedAt: new Date()
			})
			.where(eq(boards.id, boardId));

		return json({ status: 202 });
	} catch (err) {
		error(500, 'Failed to set board');
	}
};
