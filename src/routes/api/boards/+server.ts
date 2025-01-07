import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database/db';
import type { Board, Object } from '$lib/types';
import { boards, objects, type BoardModel } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { user } = event.locals;

	if (user == null) {
		throw error(401, 'Unauthorized');
	}

	try {
		const userBoards: BoardModel[] = await db
			.select()
			.from(boards)
			.where(eq(boards.userId, user.id));
		return json(userBoards);
	} catch (err) {
		throw error(500, 'Failed to get boards');
	}
};

export const POST: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { user } = event.locals;

	try {
		const board: Board = await event.request.json();

		await db.transaction(async (tx) => {
			await tx.insert(boards).values({
				id: board.id,
				name: board.name,
				backgroundColor: board.backgroundColor,
				grid: board.grid,
				visibility: board.visibility,
				userId: user?.id || null,
				thumbnail: board.thumbnail ?? null,
				createdAt: board.createdAt,
				updatedAt: board.updatedAt
			});

			if (board.objects.length > 0) {
				await tx.insert(objects).values(
					board.objects.map((obj) => ({
						...obj,
						boardId: board.id
					}))
				);
			}
		});
		return json({ status: 201 });
	} catch (err) {
		error(500, 'Failed to create board');
	}
};
