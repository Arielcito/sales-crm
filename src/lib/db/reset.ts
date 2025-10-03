import "dotenv/config";
import { db } from "./index";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  console.log("🗑️  Resetting database...\n");

  try {
    await db.execute(sql`
      TRUNCATE TABLE 
        "dealHistory",
        "deal",
        "contact",
        "company",
        "session",
        "account",
        "user",
        "team",
        "dealStage",
        "exchangeRate",
        "verification"
      RESTART IDENTITY CASCADE;
    `);

    console.log("✅ Database reset successfully!\n");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log("👋 Reset script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

