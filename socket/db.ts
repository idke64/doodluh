import { db } from '../src/lib/server/database/db';
import { boards, objects } from '../src/lib/server/database/schema';
import { eq, inArray } from 'drizzle-orm';
import type { Board } from '../src/lib/types';

export async function setBoard(board: Board) {
	try {
		await db.transaction(async (tx) => {
			const existingObjects = await tx.query.objects.findMany({
				where: eq(objects.boardId, board.id)
			});

			const existingIds = new Set(existingObjects.map((obj) => obj.id));
			const newIds = new Set(board.objects.map((obj) => obj.id));

			const objectsToAdd = board.objects.filter((obj) => !existingIds.has(obj.id));
			const objectsToDelete = existingObjects.filter((obj) => !newIds.has(obj.id));
			const objectsToUpdate = board.objects.filter((obj) => existingIds.has(obj.id));

			await Promise.all([
				tx
					.update(boards)
					.set({
						name: board.name,
						backgroundColor: board.backgroundColor,
						grid: board.grid,
						visibility: board.visibility,
						thumbnail: board.thumbnail ?? null
					})
					.where(eq(boards.id, board.id)),

				objectsToAdd.length > 0 &&
					tx.insert(objects).values(
						objectsToAdd.map((obj) => ({
							...obj,
							boardId: board.id
						}))
					),

				objectsToDelete.length > 0 &&
					tx.delete(objects).where(
						inArray(
							objects.id,
							objectsToDelete.map((obj) => obj.id)
						)
					),

				...objectsToUpdate.map((obj) => tx.update(objects).set(obj).where(eq(objects.id, obj.id)))
			]);
		});
	} catch (err) {
		console.error('Failed to set board:', err);
	}
}
