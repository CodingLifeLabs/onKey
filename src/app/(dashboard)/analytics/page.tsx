import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getAnalyticsOverview, getStatusDistribution, getMonthlyTrend, getTemplateStats } from '@/app/actions/get-analytics';
import { AnalyticsStatsCards } from '@/components/dashboard/analytics-stats-cards';
import { AnalyticsStatusChart } from '@/components/dashboard/analytics-status-chart';
import { AnalyticsTrendChart } from '@/components/dashboard/analytics-trend-chart';
import { AnalyticsTemplateTable } from '@/components/dashboard/analytics-template-table';

export default async function AnalyticsPage() {
  const [overview, statusDist, monthlyTrend, templateStats] = await Promise.all([
    getAnalyticsOverview(),
    getStatusDistribution(),
    getMonthlyTrend(),
    getTemplateStats(),
  ]);

  return (
    <>
      <DashboardHeader title="분석" description="세션 통계 및 인사이트" />
      <div className="p-6 space-y-6 max-w-5xl">
        {/* 핵심 지표 카드 */}
        <AnalyticsStatsCards data={overview} />

        {/* 차트 2개 나란히 */}
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsStatusChart data={statusDist} />
          <AnalyticsTrendChart data={monthlyTrend} />
        </div>

        {/* 템플릿별 통계 */}
        <AnalyticsTemplateTable data={templateStats} />
      </div>
    </>
  );
}
