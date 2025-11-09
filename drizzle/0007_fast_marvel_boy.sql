CREATE TABLE "contactRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" varchar(50),
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companyRequest" ADD COLUMN "companyId" uuid;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD COLUMN "requestType" varchar(50) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD COLUMN "entityType" varchar(20) DEFAULT 'company' NOT NULL;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD COLUMN "potentialDuplicateId" uuid;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD COLUMN "submittedData" jsonb;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD CONSTRAINT "companyRequest_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_name_idx" ON "company" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contact_name_company_idx" ON "contact" USING btree ("name","companyId");--> statement-breakpoint
CREATE INDEX "contact_email_idx" ON "contact" USING btree ("email");--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_email_unique" UNIQUE("email");