import { db } from '$lib/server/database/db';
import { users, userSessions } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { User, UserSession } from '$lib/server/database/schema';
import type { RequestEvent } from '@sveltejs/kit';

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const createSession = async (token: string, userId: string): Promise<UserSession> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: UserSession = {
		id: sessionId,
		userId: userId,
		createdAt: new Date(),
		updatedAt: new Date(),
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	const s = await db.insert(userSessions).values(session);
	return session;
};

export const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ user: users, session: userSessions })
		.from(userSessions)
		.innerJoin(users, eq(userSessions.userId, users.id))
		.where(eq(userSessions.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(userSessions).where(eq(userSessions.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(userSessions)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(userSessions.id, session.id));
	}
	return { session, user };
};

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(userSessions).where(eq(userSessions.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		domain: process.env.NODE_ENV === 'production' ? process.env.PARENT_DOMAIN : undefined
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		domain: process.env.NODE_ENV === 'production' ? process.env.PARENT_DOMAIN : undefined
	});
}

export type SessionValidationResult =
	| { session: UserSession; user: User }
	| { session: null; user: null };
