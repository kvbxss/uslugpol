CREATE SCHEMA IF NOT EXISTS "event_service";
--> statement-breakpoint
CREATE TABLE "event_service"."event_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"event_date" date,
	"location" varchar(255),
	"event_type" varchar(255),
	"guest_count" integer,
	"budget" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
