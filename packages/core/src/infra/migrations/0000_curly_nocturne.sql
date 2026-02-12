CREATE SCHEMA IF NOT EXISTS "core";

--> statement-breakpoint
CREATE TABLE "core"."lead_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
