ALTER TABLE "user" ADD COLUMN "easy_interval" integer DEFAULT 2880 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "medium_interval" integer DEFAULT 1440 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hard_interval" integer DEFAULT 5 NOT NULL;