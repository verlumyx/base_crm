/** JSON-safe shapes rendered by the dashboard blocks. */
export type DashboardMetricsDto = {
  incomeMonth: number;
  expenseMonth: number;
  netProfit: number;
  profitMarginPct: number;
  incomeTrendPct: number | null;
  profitTrendPct: number | null;
};

export type DashboardRevenuePointDto = { month: string; income: number; expense: number; profit: number };
