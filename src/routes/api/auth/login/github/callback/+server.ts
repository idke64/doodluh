import {
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { github } from '$lib/server/auth/oauth';
import { error, redirect } from '@sveltejs/kit';

import { json, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { users, type User } from '$lib/server/database/schema';
import { db } from '$lib/server/database/db';
import { and, eq } from 'drizzle-orm';

interface GitHubEmail {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
}

export const GET = async (event: RequestEvent): Promise<Response> => {
	if (event.locals.user) redirect(302, '/');

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (code === null || state === null || storedState === null) {
		error(400, 'Invalid code, state, or stored state');
	}
	if (state !== storedState) {
		error(400, 'Invalid state');
	}

	let tokens: OAuth2Tokens;
	let accessToken: string;
	try {
		tokens = await github.validateAuthorizationCode(code);
		accessToken = tokens.accessToken();
	} catch (err) {
		error(400, 'Invalid code');
	}

	const githubUserResponse: Response = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const githubEmailResponse: Response = await fetch('https://api.github.com/user/emails', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const githubUser = await githubUserResponse.json();
	const githubEmail = await githubEmailResponse.json();

	const githubId = githubUser.id;
	const githubName = githubUser.login;
	const githubPrimaryEmail = githubEmail.find((email: GitHubEmail) => email.primary)?.email;
	const githubAvatar = githubUser.avatar_url;

	const existingUser: User[] = await db
		.select()
		.from(users)
		.where(eq(users.email, githubPrimaryEmail));

	if (existingUser.length > 0) {
		if (existingUser[0].githubName === null || existingUser[0].githubId === null) {
			await db
				.update(users)
				.set({ githubId, githubName })
				.where(eq(users.email, githubPrimaryEmail));
		}
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser[0].id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		redirect(302, '/');
	}

	const user: { id: string }[] = await db
		.insert(users)
		.values({
			name: githubName,
			email: githubPrimaryEmail,
			githubId,
			githubName,
			picture: githubAvatar
		})
		.returning({ id: users.id });

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user[0].id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	redirect(302, '/');
};
