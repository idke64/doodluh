import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database/db';
import { boards, objects } from '$lib/server/database/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { Board, Object } from '$lib/types';

export const GET: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;
	const { user } = event.locals;

	if (!boardId) error(500, 'Failed to get board');

	try {
		const result = await db.transaction(async (tx) => {
			const board = await tx.query.boards.findFirst({ where: eq(boards.id, boardId) });

			if (!board) {
				error(404, 'Board not found');
			}

			if (board.visibility === 'private' && board.userId != user?.id) {
				error(403, 'Unauthorized');
			}

			const boardObjects = await tx
				.select()
				.from(objects)
				.where(eq(objects.boardId, boardId))
				.orderBy(objects.zIndex);

			return {
				...board,
				objects: boardObjects
			};
		});
		return json(result);
	} catch (err) {
		console.log(err);
		error(404, 'Failed to get board');
	}
};

export const PATCH: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;
	const { user } = event.locals;

	if (!boardId) error(500, 'Failed to set board');

	try {
		const changes = await event.request.json();

		await db.transaction(async (tx) => {
			const [board, existingObjects] = await Promise.all([
				await tx.query.boards.findFirst({
					where: eq(boards.id, boardId)
				}),
				await tx.query.objects.findMany({
					where: eq(objects.boardId, boardId)
				})
			]);

			if (!board) error(404, 'Board not found');

			if (board.visibility !== 'public' && board.userId !== user.id) {
				error(403, 'Unauthorized');
			}

			const existingIds = new Set(existingObjects.map((obj) => obj.id));
			const newIds = new Set(changes.objects.map((obj: Object) => obj.id));

			const objectsToAdd = changes.objects.filter((obj: Object) => !existingIds.has(obj.id));
			const objectsToDelete = existingObjects.filter((obj) => !newIds.has(obj.id));
			const objectsToUpdate = changes.objects.filter((obj: Object) => existingIds.has(obj.id));

			await Promise.all([
				tx
					.update(boards)
					.set({
						...(changes.name && { name: changes.name }),
						...(changes.backgroundColor && { backgroundColor: changes.backgroundColor }),
						...(changes.grid && { grid: changes.grid }),
						...(changes.visibility && { visibility: changes.visibility }),
						...(changes.thumbnail !== undefined && { thumbnail: changes.thumbnail ?? null }),
						updatedAt: new Date()
					})
					.where(eq(boards.id, boardId)),
				objectsToAdd.length > 0 &&
					tx.insert(objects).values(objectsToAdd.map((obj: Object) => ({ ...obj, boardId }))),
				objectsToDelete.length > 0 &&
					tx.delete(objects).where(
						inArray(
							objects.id,
							objectsToDelete.map((obj) => obj.id)
						)
					),
				...objectsToUpdate.map((obj: Object) => {
					tx.update(objects).set(obj).where(eq(objects.id, obj.id));
				})
			]);
		});

		return json({ status: 202 });
	} catch (err) {
		error(500, 'Failed to set board');
	}
};
