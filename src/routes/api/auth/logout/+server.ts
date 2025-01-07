import { invalidate } from '$app/navigation';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth/session';
import { json, redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent): Promise<Response> => {
	if (!event.locals.user) return json({ status: 400, message: 'Not logged in' });

	await invalidateSession(event.locals.session.id);

	deleteSessionTokenCookie(event);

	return redirect(302, '/');
};
