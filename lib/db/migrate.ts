import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env" });

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

// Main migration function
async function runMigration() {
  console.log("🔄 Starting database migration...");

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const db = drizzle(sql);

    console.log("📂 Running migrations from ./drizzle folder");
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
runMigration();