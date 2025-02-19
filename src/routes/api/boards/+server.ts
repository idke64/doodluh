import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database/db';
import { boards, type BoardModel } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import { generateRandomSeed } from '$lib/utils';

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

	if (user == null) {
		throw error(401, 'Unauthorized');
	}

	try {
		const newBoard: BoardModel = await event.request.json();

		const randomSeed = generateRandomSeed();
		let identicon = `https://api.dicebear.com/9.x/icons/svg?seed=${randomSeed}&scale=50`;

		await db.insert(boards).values({
			id: newBoard.id,
			name: newBoard.name,
			backgroundColor: newBoard.backgroundColor,
			grid: newBoard.grid,
			visibility: user != null ? 'public' : newBoard.visibility,
			userId: user?.id || null,
			thumbnail: newBoard.thumbnail ?? identicon,
			createdAt: new Date(newBoard.createdAt),
			updatedAt: new Date(newBoard.updatedAt)
		});

		return json({ status: 201 });
	} catch (err) {
		error(500, 'Failed to create board');
	}
};
