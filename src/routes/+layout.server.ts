import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/database/db';
import { boards, objects, type BoardModel, type ObjectModel } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	const user = locals.user;

	// const response = await fetch('/api/boards');

	// if (!response.ok) {
	// 	error(500);
	// }

	// const boards = await response.json();

	return { user };
};
