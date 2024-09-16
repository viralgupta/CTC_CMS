import postgres from 'postgres';
import { Config } from 'sst/node/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
// import { migrate } from 'drizzle-orm/postgres-js/migrator';

// for migrations
// const migrationClient = postgres(Config.DB_URL, { max: 1 });
// migrate(drizzle(migrationClient), ...)

// for query purposes
const queryClient = postgres(Config.DB_URL);

const db = drizzle(queryClient, { schema });

export default db;