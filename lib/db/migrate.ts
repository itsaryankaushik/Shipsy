import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
const envPath = path.join(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded environment from .env file\n");
} else {
  console.error("❌ Error: .env file not found!");
  console.error("\n📝 To fix this:");
  console.error("  1. Copy sample.env to .env:");
  console.error("     PowerShell: Copy-Item sample.env .env");
  console.error("     Bash: cp sample.env .env");
  console.error("\n  2. Edit .env and add your DATABASE_URL from Neon");
  console.error("\n  3. Run the migration again: bun run db:migrate\n");
  process.exit(1);
}

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in .env file!");
  console.error("\n📝 Add your DATABASE_URL to .env file");
  console.error("   Get it from: Neon Dashboard → Connection String\n");
  process.exit(1);
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