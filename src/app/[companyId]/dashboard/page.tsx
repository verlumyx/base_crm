import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/db/client';
import { todayIsoDate } from '@/lib/format';
import { PageShell } from '@/components/page-shell';
import { requireCompanyAccess } from '@/modules/shared/auth/require-company-access';
import { createDashboardContainer } from '@/modules/dashboard/container';
import { MONTH_LONG_LABELS, shiftMonth } from '@/modules/dashboard/domain/months';
import { DashboardStats } from '@/modules/dashboard/ui/components/DashboardStats';
import { DashboardRevenueChart } from '@/modules/dashboard/ui/components/DashboardRevenueChart';
import { CardSkeleton, StatsSkeleton } from '@/modules/dashboard/ui/components/DashboardSkeletons';

export const metadata: Metadata = { title: 'Resumen' };

type Props = { params: Promise<{ companyId: string }> };
type BlockProps = { companyId: string; today: string };

/**
 * Resumen. No role permission (the menu entry is always visible); company access is re-checked here because
 * pages render in parallel with the layout. Each block streams independently behind its own Suspense boundary.
 */
export default async function DashboardPage({ params }: Props) {
  const { companyId } = await params;
  await requireCompanyAccess(companyId);

  const today = todayIsoDate();
  const { month, year } = shiftMonth(today, 0);

  return (
    <PageShell
      title="Resumen"
      subtitle={`Tu negocio de un vistazo · ${MONTH_LONG_LABELS[month - 1]} ${year}`}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
        <Suspense fallback={<StatsSkeleton />}>
          <MetricsBlock companyId={companyId} today={today} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Suspense fallback={<CardSkeleton className="h-[300px]" />}>
          <RevenueBlock companyId={companyId} today={today} />
        </Suspense>
      </div>
    </PageShell>
  );
}

async function MetricsBlock({ companyId, today }: BlockProps) {
  const metrics = await createDashboardContainer(db).metricsService.execute(companyId, today);
  return <DashboardStats metrics={metrics} />;
}

async function RevenueBlock({ companyId, today }: BlockProps) {
  const data = await createDashboardContainer(db).revenueService.execute(companyId, today);
  return <DashboardRevenueChart data={data} />;
}
