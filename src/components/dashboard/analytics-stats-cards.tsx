'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, FileCheck, BarChart3, TrendingUp } from 'lucide-react';
import type { AnalyticsOverview } from '@/types/analytics';

interface AnalyticsStatsCardsProps {
  data: AnalyticsOverview;
}

export function AnalyticsStatsCards({ data }: AnalyticsStatsCardsProps) {
  const stats = [
    {
      title: '총 세션',
      value: data.totalSessions,
      icon: FileCheck,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: '완료율',
      value: data.completedRate,
      icon: TrendingUp,
      format: (v: number) => `${v}%`,
    },
    {
      title: '평균 소요 시간',
      value: data.avgCompletionMinutes,
      icon: Clock,
      format: (v: number) => v === 0 ? '-' : `${v}분`,
    },
    {
      title: '이번 달 생성',
      value: data.thisMonthSessions,
      icon: BarChart3,
      format: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.title}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.format(stat.value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
