
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";


const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

/*
 * Sometimes you might want to run raw SQL queries instead of using the ORM.
 * import { sql } from './db';
 * const result = await sql`SELECT * FROM files WHERE user_id = ${userId}`;
 */
export { sql };