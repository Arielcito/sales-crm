CREATE TABLE "exchangeRate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"usdToArs" numeric(10, 2) NOT NULL,
	"source" varchar(100) DEFAULT 'manual' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal" ADD COLUMN "exchangeRateId" uuid;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonatedBy" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banReason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banExpires" timestamp;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_exchangeRateId_exchangeRate_id_fk" FOREIGN KEY ("exchangeRateId") REFERENCES "public"."exchangeRate"("id") ON DELETE set null ON UPDATE no action;