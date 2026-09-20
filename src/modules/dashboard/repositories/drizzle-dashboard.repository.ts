import { and, asc, count, countDistinct, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { transactions, type TransactionType } from '@/modules/transaction/models/transaction.model';
import type { DashboardRepository, MonthlyTotals } from './dashboard.repository';

export class DrizzleDashboardRepository implements DashboardRepository {
  constructor(private readonly db: DbExecutor) {}

  async sumTransactions(companyId: string, type: TransactionType, from: string, to: string): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.companyId, companyId),
          eq(transactions.type, type),
          gte(transactions.date, from),
          lte(transactions.date, to),
          isNull(transactions.deletedAt),
        ),
      );
    return Number(row.total);
  }

  async monthlyTotals(companyId: string, from: string): Promise<MonthlyTotals[]> {
    const key = sql<string>`to_char(${transactions.date}, 'YYYY-MM')`;
    const rows = await this.db
      .select({
        key,
        income: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'income'), 0)`,
        expense: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'expense'), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.companyId, companyId), gte(transactions.date, from), isNull(transactions.deletedAt)))
      .groupBy(key);
    return rows.map((r) => ({ key: r.key, income: Number(r.income), expense: Number(r.expense) }));
  }

}
