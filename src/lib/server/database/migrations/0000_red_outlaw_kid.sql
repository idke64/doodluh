CREATE TABLE "board" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"background_color" varchar(11) DEFAULT 'transparent' NOT NULL,
	"grid" text DEFAULT 'lines' NOT NULL,
	"thumbnail" varchar(256),
	"visibility" text DEFAULT 'private' NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"box" jsonb NOT NULL,
	"start" jsonb NOT NULL,
	"end" jsonb NOT NULL,
	"color" varchar(7) NOT NULL,
	"opacity" smallint NOT NULL,
	"use_contrast" boolean NOT NULL,
	"thickness" smallint NOT NULL,
	"z_index" smallint NOT NULL,
	"style" jsonb NOT NULL,
	"board_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '1 month' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"picture" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"github_id" varchar(64),
	"google_id" varchar(64),
	"github_name" varchar(256),
	"google_name" varchar(256),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "board" ADD CONSTRAINT "board_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object" ADD CONSTRAINT "object_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;