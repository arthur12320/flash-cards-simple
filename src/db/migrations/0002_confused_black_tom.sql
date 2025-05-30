ALTER TABLE "cards" ADD COLUMN "last_reviewed" timestamp;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "next_review" timestamp;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "difficulty" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "review_count" integer DEFAULT 0 NOT NULL;