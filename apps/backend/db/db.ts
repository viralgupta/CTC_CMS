import postgres from 'postgres';
import { Config } from 'sst/node/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// for query purposes
const queryClient = postgres(Config.DB_URL);

const db = drizzle(queryClient, { schema });

export default db;