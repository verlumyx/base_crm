import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzleDashboardRepository } from './repositories/drizzle-dashboard.repository';
import { DashboardMetricsService } from './services/dashboard-metrics.service';
import { DashboardRevenueService } from './services/dashboard-revenue.service';

export function createDashboardContainer(db: DbExecutor) {
  const repository = new DrizzleDashboardRepository(db);

  return {
    metricsService: new DashboardMetricsService(repository),
    revenueService: new DashboardRevenueService(repository),
  };
}
