CREATE TABLE "app_appointments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"code" varchar(12) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "app_appointments" ADD CONSTRAINT "app_appointments_company_id_app_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."app_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_appointments" ADD CONSTRAINT "app_appointments_client_id_app_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_appointments" ADD CONSTRAINT "app_appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "app_appointments_company_id_code_unique" ON "app_appointments" USING btree ("company_id","code");--> statement-breakpoint
CREATE INDEX "app_appointments_company_id_idx" ON "app_appointments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "app_appointments_company_id_start_time_idx" ON "app_appointments" USING btree ("company_id","start_time");--> statement-breakpoint
CREATE INDEX "app_appointments_status_idx" ON "app_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_appointments_client_id_idx" ON "app_appointments" USING btree ("client_id");