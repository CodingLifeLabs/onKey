'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionStatusDistribution } from '@/types/analytics';

interface AnalyticsStatusChartProps {
  data: SessionStatusDistribution;
}

const COLORS: Record<string, string> = {
  completed: '#22c55e',
  inProgress: '#3b82f6',
  pending: '#f59e0b',
  expired: '#94a3b8',
};

const LABELS: Record<string, string> = {
  completed: '완료',
  inProgress: '진행 중',
  pending: '대기',
  expired: '만료',
};

export function AnalyticsStatusChart({ data }: AnalyticsStatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name: LABELS[name] ?? name, value, fill: COLORS[name] ?? '#94a3b8' }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">세션 상태 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">세션 상태 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}개`, '세션']}
            />
            <Legend
              formatter={(value: string) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
