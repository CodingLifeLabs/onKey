'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyTrend } from '@/types/analytics';

interface AnalyticsTrendChartProps {
  data: MonthlyTrend[];
}

export function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">월간 트렌드</CardTitle>
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
        <CardTitle className="text-sm">월간 트렌드 (최근 6개월)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              allowDecimals={false}
            />
            <Tooltip />
            <Legend
              formatter={(value: string) => <span className="text-xs">{value}</span>}
            />
            <Bar dataKey="created" name="생성" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="완료" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
