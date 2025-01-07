import { sql, type InferSelectModel } from 'drizzle-orm';
import {
	pgTable,
	timestamp,
	text,
	jsonb,
	boolean,
	uuid,
	varchar,
	integer,
	smallint
} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 256 }).unique().notNull(),
	name: varchar('name', { length: 256 }).notNull(),
	picture: varchar('picture', { length: 256 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	githubId: varchar('github_id', { length: 64 }).unique(),
	googleId: varchar('google_id', { length: 64 }).unique(),
	githubName: varchar('github_name', { length: 256 }),
	googleName: varchar('google_name', { length: 256 })
});

export const userSessions = pgTable('user_session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.references(() => users.id)
		.notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at')
		.notNull()
		.default(sql`NOW() + INTERVAL '1 month'`)
});

export const boards = pgTable('board', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 256 }).notNull(),
	backgroundColor: varchar('background_color', { length: 11 }).notNull().default('transparent'),
	grid: text({ enum: ['dots', 'lines', 'none'] })
		.notNull()
		.default('lines'),
	thumbnail: varchar('thumbnail', { length: 256 }),
	visibility: text({ enum: ['private', 'shared', 'public'] })
		.notNull()
		.default('private'),
	userId: uuid('user_id').references(() => users.id),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const objects = pgTable('object', {
	id: uuid('id').primaryKey(),
	type: text({ enum: ['pencil', 'shapes', 'line', 'text', 'image', 'group'] }).notNull(),
	box: jsonb('box').notNull(),
	start: jsonb('start').notNull(),
	end: jsonb('end').notNull(),
	color: varchar('color', { length: 7 }).notNull(),
	opacity: smallint('opacity').notNull(),
	useContrast: boolean('use_contrast').notNull(),
	thickness: smallint('thickness').notNull(),
	zIndex: smallint('z_index').notNull(),
	style: jsonb('style').notNull(),
	boardId: uuid('board_id')
		.references(() => boards.id)
		.notNull()
});

export type User = InferSelectModel<typeof users>;
export type UserSession = InferSelectModel<typeof userSessions>;
export type BoardModel = InferSelectModel<typeof boards>;
export type ObjectModel = InferSelectModel<typeof objects>;
