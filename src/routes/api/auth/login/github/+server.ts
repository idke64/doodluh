import { generateState } from 'arctic';
import { github } from '$lib/server/auth/oauth';

import { redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent): Promise<Response> => {
	if (event.locals.user) redirect(302, '/');

	const state = generateState();
	const scopes = ['user:email'];
	const url = github.createAuthorizationURL(state, scopes);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	redirect(302, url.toString());
};
