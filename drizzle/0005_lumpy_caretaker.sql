CREATE TABLE "companyRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requestedBy" uuid NOT NULL,
	"companyName" text NOT NULL,
	"email" text,
	"phone" varchar(50),
	"website" text,
	"industry" varchar(100),
	"notes" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewedBy" uuid,
	"reviewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "assignedTeamId" uuid;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "isGlobal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dealStage" ADD COLUMN "companyOwnerId" uuid;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD CONSTRAINT "companyRequest_requestedBy_user_id_fk" FOREIGN KEY ("requestedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companyRequest" ADD CONSTRAINT "companyRequest_reviewedBy_user_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_assignedTeamId_team_id_fk" FOREIGN KEY ("assignedTeamId") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealStage" ADD CONSTRAINT "dealStage_companyOwnerId_user_id_fk" FOREIGN KEY ("companyOwnerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;