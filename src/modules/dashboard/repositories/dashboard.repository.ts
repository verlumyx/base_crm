import type { TransactionType } from '@/modules/transaction/models/transaction.model';

export type MonthlyTotals = { key: string; income: number; expense: number };

/** Read-only aggregates across the ledger, inventory and sales of one company. */
export interface DashboardRepository {
  sumTransactions(companyId: string, type: TransactionType, from: string, to: string): Promise<number>;
  monthlyTotals(companyId: string, from: string): Promise<MonthlyTotals[]>;
}
