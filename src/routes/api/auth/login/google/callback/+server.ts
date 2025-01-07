import { google } from '$lib/server/auth/oauth';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { db } from '$lib/server/database/db';
import { users, type User } from '$lib/server/database/schema';
import { error, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { decodeIdToken, Google, type OAuth2Tokens } from 'arctic';
import { and, eq } from 'drizzle-orm';

interface GoogleClaim {
	sub: string;
	name: string;
	email: string;
	picture: string;
}

export const GET = async (event: RequestEvent): Promise<Response> => {
	if (event.locals.user) redirect(302, '/');

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		error(400, 'Invalid code, state, or stored state');
	}

	if (state !== storedState) {
		error(400, 'Invalid state');
	}

	let tokens: OAuth2Tokens;

	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (err) {
		error(400, 'Invalid code');
	}

	const claims = decodeIdToken(tokens.idToken()) as GoogleClaim;
	const googleId = claims.sub;
	const googleName = claims.name;
	const googleEmail = claims.email;
	const googlePicture = claims.picture;

	const existingUser: User[] = await db.select().from(users).where(eq(users.email, googleEmail));

	if (existingUser.length > 0) {
		if (existingUser[0].googleName === null || existingUser[0].googleId === null) {
			await db.update(users).set({ googleId, googleName }).where(eq(users.email, googleEmail));
		}
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser[0].id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		redirect(302, '/');
	}

	const user: { id: string }[] = await db
		.insert(users)
		.values({
			name: googleName,
			email: googleEmail,
			googleId,
			googleName,
			picture: googlePicture
		})
		.returning({ id: users.id });

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user[0].id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	redirect(302, '/');
};
