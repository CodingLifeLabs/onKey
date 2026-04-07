export interface AnalyticsOverview {
  totalSessions: number;
  completedRate: number;
  avgCompletionMinutes: number;
  thisMonthSessions: number;
}

export interface SessionStatusDistribution {
  completed: number;
  inProgress: number;
  pending: number;
  expired: number;
}

export interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}

export interface TemplateStats {
  templateId: string;
  templateName: string;
  sessionCount: number;
  completedCount: number;
  completionRate: number;
}
