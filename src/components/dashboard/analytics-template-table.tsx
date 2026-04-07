'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TemplateStats } from '@/types/analytics';

interface AnalyticsTemplateTableProps {
  data: TemplateStats[];
}

export function AnalyticsTemplateTable({ data }: AnalyticsTemplateTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">템플릿별 통계</CardTitle>
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
        <CardTitle className="text-sm">템플릿별 통계</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium text-muted-foreground">템플릿</th>
                <th className="py-2 text-right font-medium text-muted-foreground">세션 수</th>
                <th className="py-2 text-right font-medium text-muted-foreground">완료 수</th>
                <th className="py-2 text-right font-medium text-muted-foreground">완료율</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.templateId} className="border-b last:border-0">
                  <td className="py-2">{row.templateName}</td>
                  <td className="py-2 text-right">{row.sessionCount}</td>
                  <td className="py-2 text-right">{row.completedCount}</td>
                  <td className="py-2 text-right">
                    <Badge
                      variant={row.completionRate >= 80 ? 'default' : row.completionRate >= 50 ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {row.completionRate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
