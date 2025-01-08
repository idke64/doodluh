import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema.js';
import pg from 'pg';
import * as dotenv from 'dotenv';
var Pool = pg.Pool;
dotenv.config();
var pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
export var db = drizzle(pool, { schema: schema });
try {
    migrate(db, { migrationsFolder: './src/lib/server/database/migrations' });
    console.log('Migration complete');
}
catch (error) {
    console.error('Migration failed:', error);
}
//# sourceMappingURL=db.js.map