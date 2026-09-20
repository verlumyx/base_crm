DROP TABLE "app_services" CASCADE;--> statement-breakpoint
DROP TABLE "app_plans" CASCADE;--> statement-breakpoint
DROP TABLE "app_account_renewals" CASCADE;--> statement-breakpoint
DROP TABLE "app_accounts" CASCADE;--> statement-breakpoint
DROP TABLE "app_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "app_sale_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "app_sale_renewals" CASCADE;--> statement-breakpoint
DROP TABLE "app_sales" CASCADE;--> statement-breakpoint
DROP TABLE "app_refunds" CASCADE;--> statement-breakpoint
DROP TABLE "app_manual_transaction_lines" CASCADE;--> statement-breakpoint
DROP TABLE "app_manual_transactions" CASCADE;--> statement-breakpoint
ALTER TABLE "app_bot_settings" ADD COLUMN "system_prompt" text;