ALTER TABLE "exchangeRate" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "exchangeRate" CASCADE;--> statement-breakpoint
ALTER TABLE "deal" DROP CONSTRAINT "deal_exchangeRateId_exchangeRate_id_fk";
--> statement-breakpoint
ALTER TABLE "deal" DROP COLUMN "exchangeRateId";