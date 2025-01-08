import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database/db';
import type { Board } from '$lib/types';
import { boards, objects, type BoardModel } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { user } = event.locals;

	if (user == null) {
		throw error(401, 'Unauthorized');
	}

	try {
		const fetchedBoards: BoardModel[] = await db
			.select()
			.from(boards)
			.where(eq(boards.userId, user.id));
		return json(fetchedBoards);
	} catch (err) {
		throw error(500, 'Failed to get boards');
	}
};

export const POST: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { user } = event.locals;

	try {
		const newBoard: BoardModel = await event.request.json();

		console.log(newBoard);

		await db.insert(boards).values({
			id: newBoard.id,
			name: newBoard.name,
			backgroundColor: newBoard.backgroundColor,
			grid: newBoard.grid,
			visibility: user != null ? 'public' : newBoard.visibility,
			userId: user?.id || null,
			thumbnail: newBoard.thumbnail ?? null,
			createdAt: new Date(newBoard.createdAt),
			updatedAt: new Date(newBoard.updatedAt)
		});

		return json({ status: 201 });
	} catch (err) {
		console.log(err);

		error(500, 'Failed to create board');
	}
};
