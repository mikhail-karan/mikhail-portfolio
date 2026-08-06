CREATE TABLE "event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"path" text NOT NULL,
	"referrer" text,
	"country" text,
	"device" text,
	"ua" text,
	"is_bot" boolean NOT NULL,
	"visitor_day" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salt" (
	"day" date PRIMARY KEY NOT NULL,
	"val" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE INDEX "event_ts_idx" ON "event" USING btree ("ts" DESC NULLS LAST);