ALTER TABLE "core"."leads"
ADD COLUMN "channel" varchar(20) NOT NULL DEFAULT 'form';
--> statement-breakpoint
ALTER TABLE "core"."leads"
ADD COLUMN "source" jsonb;
