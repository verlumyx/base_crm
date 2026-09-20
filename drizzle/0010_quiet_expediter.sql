UPDATE app_transactions SET category = 'supplies' WHERE category = 'streaming_account';
UPDATE app_transactions SET category = 'subscription' WHERE category = 'streaming_account_renewal';

ALTER TABLE "app_transactions" DROP CONSTRAINT "app_transactions_category_check";--> statement-breakpoint
ALTER TABLE "app_transactions" ADD CONSTRAINT "app_transactions_category_check" CHECK ("app_transactions"."category" in ('sale', 'renewal', 'partner_contribution', 'other_income', 'supplies', 'subscription', 'petty_cash', 'salary', 'commission', 'utilities', 'tools', 'marketing', 'refund', 'other_expense'));