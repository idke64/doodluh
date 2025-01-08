import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';
import pg from 'pg';
import * as dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

try {
	migrate(db, { migrationsFolder: './src/lib/server/database/migrations' });
	console.log('Migration complete');
} catch (error) {
	console.error('Migration failed:', error);
}
