import { db } from '$lib/server/database/db';
import { boards, objects, type ObjectModel } from '$lib/server/database/schema';
import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import type { Object } from '$lib/types';
import { eq, inArray } from 'drizzle-orm';

export const GET: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;

	if (boardId == null) error(500, 'Failed to get board');

	try {
		const fetchedObjects: ObjectModel[] = await db
			.select()
			.from(objects)
			.where(eq(objects.boardId, boardId))
			.orderBy(objects.zIndex);

		return json(fetchedObjects);
	} catch (err) {
		error(404, 'Failed to get board objects');
	}
};

export const POST: RequestHandler = async (event: RequestEvent): Promise<Response> => {
	const { boardId } = event.params;
	const { user } = event.locals;

	if (boardId == null) error(500, 'Failed to get board');

	try {
		const newObjects: Object[] = await event.request.json();

		await db.transaction(async (tx) => {
			const [board, existingObjects] = await Promise.all([
				await tx.query.boards.findFirst({
					where: eq(boards.id, boardId)
				}),
				await tx.select().from(objects).where(eq(objects.boardId, boardId))
			]);

			if (board == null) error(404, 'Board not found');

			if (board.visibility !== 'public' && board.userId !== user.id) {
				error(403, 'Unauthorized');
			}

			const existingIds = new Set(existingObjects.map((obj) => obj.id));
			const newIds = new Set(newObjects.map((obj: Object) => obj.id));

			const objectsToAdd = newObjects.filter((obj: Object) => !existingIds.has(obj.id));
			const objectsToDelete = existingObjects.filter((obj) => !newIds.has(obj.id));
			const objectsToUpdate = newObjects.filter((obj: Object) => existingIds.has(obj.id));

			await Promise.all([
				objectsToAdd.length > 0 &&
					tx.insert(objects).values(objectsToAdd.map((obj: Object) => ({ ...obj, boardId }))),
				objectsToDelete.length > 0 &&
					tx.delete(objects).where(
						inArray(
							objects.id,
							objectsToDelete.map((obj) => obj.id)
						)
					),
				objectsToUpdate.length > 0 &&
					objectsToUpdate.map((obj: Object) => {
						tx.update(objects).set(obj).where(eq(objects.id, obj.id));
					})
			]);
		});

		return json({ status: 202 });
	} catch (err) {
		error(500, 'Failed to update board objects');
	}
};
