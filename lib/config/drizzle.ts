import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schemas/index';

config({ path: '.env' }); // or .env.local
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
