ALTER TABLE "user" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;