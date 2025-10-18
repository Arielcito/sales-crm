CREATE TABLE "organizationBranding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid,
	"name" text DEFAULT 'SalPip' NOT NULL,
	"logoUrl" text,
	"primaryColor" varchar(50) DEFAULT '220 90% 56%' NOT NULL,
	"secondaryColor" varchar(50) DEFAULT '215 25% 27%' NOT NULL,
	"accentColor" varchar(50) DEFAULT '142 71% 45%' NOT NULL,
	"sidebarColor" varchar(50) DEFAULT '215 25% 27%' NOT NULL,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizationBranding" ADD CONSTRAINT "organizationBranding_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;