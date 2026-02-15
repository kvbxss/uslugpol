CREATE SCHEMA IF NOT EXISTS "car_service";
--> statement-breakpoint
CREATE TABLE "car_service"."transport_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"vehicle_type" varchar(100),
	"passengers" integer,
	"distance_km" integer,
	"pickup_location" varchar(255),
	"created_at" timestamp DEFAULT now()
);
