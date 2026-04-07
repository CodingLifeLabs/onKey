'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { createServiceClient } from '@/lib/supabase/service';
import { format, subMonths, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import type { AnalyticsOverview, SessionStatusDistribution, MonthlyTrend, TemplateStats } from '@/types/analytics';

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { totalSessions: 0, completedRate: 0, avgCompletionMinutes: 0, thisMonthSessions: 0 };
  }

  const supabase = createServiceClient();

  // Total sessions + status counts
  const { data: sessions } = await supabase
    .from('sessions')
    .select('status, created_at, completed_at')
    .eq('owner_id', owner.ownerId);

  const all = sessions ?? [];
  const totalSessions = all.length;
  const completed = all.filter((s) => s.status === 'completed');
  const completedRate = totalSessions > 0 ? Math.round((completed.length / totalSessions) * 100) : 0;

  // Average completion time (minutes)
  const withTimes = completed.filter((s) => s.completed_at && s.created_at);
  const avgCompletionMinutes = withTimes.length > 0
    ? Math.round(
        withTimes.reduce((sum, s) => {
          return sum + differenceInMinutes(new Date(s.completed_at!), new Date(s.created_at!));
        }, 0) / withTimes.length
      )
    : 0;

  // This month
  const monthStart = startOfMonth(new Date()).toISOString();
  const thisMonthSessions = all.filter((s) => new Date(s.created_at!) >= new Date(monthStart)).length;

  return { totalSessions, completedRate, avgCompletionMinutes, thisMonthSessions };
}

export async function getStatusDistribution(): Promise<SessionStatusDistribution> {
  const owner = await getOwnerProfile();
  if (!owner) return { completed: 0, inProgress: 0, pending: 0, expired: 0 };

  const supabase = createServiceClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('status')
    .eq('owner_id', owner.ownerId);

  const all = sessions ?? [];
  return {
    completed: all.filter((s) => s.status === 'completed').length,
    inProgress: all.filter((s) => s.status === 'in_progress').length,
    pending: all.filter((s) => s.status === 'pending').length,
    expired: all.filter((s) => s.status === 'expired').length,
  };
}

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
  const owner = await getOwnerProfile();
  if (!owner) return [];

  const supabase = createServiceClient();
  const sixMonthsAgo = subMonths(new Date(), 5);
  const startDate = startOfMonth(sixMonthsAgo).toISOString();

  const { data: sessions } = await supabase
    .from('sessions')
    .select('status, created_at, completed_at')
    .eq('owner_id', owner.ownerId)
    .gte('created_at', startDate);

  const all = sessions ?? [];
  const result: MonthlyTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const label = format(d, 'yyyy-MM');

    const inMonth = all.filter((s) => {
      const created = new Date(s.created_at!);
      return created >= mStart && created <= mEnd;
    });

    const completedInMonth = all.filter((s) => {
      if (s.status !== 'completed' || !s.completed_at) return false;
      const completed = new Date(s.completed_at);
      return completed >= mStart && completed <= mEnd;
    });

    result.push({
      month: label,
      created: inMonth.length,
      completed: completedInMonth.length,
    });
  }

  return result;
}

export async function getTemplateStats(): Promise<TemplateStats[]> {
  const owner = await getOwnerProfile();
  if (!owner) return [];

  const supabase = createServiceClient();

  // Get all sessions with template info
  const { data: sessions } = await supabase
    .from('sessions')
    .select('template_id, status')
    .eq('owner_id', owner.ownerId);

  if (!sessions || sessions.length === 0) return [];

  // Group by template_id
  const grouped = new Map<string, { total: number; completed: number }>();
  for (const s of sessions) {
    const tid = s.template_id ?? 'no-template';
    const entry = grouped.get(tid) ?? { total: 0, completed: 0 };
    entry.total++;
    if (s.status === 'completed') entry.completed++;
    grouped.set(tid, entry);
  }

  // Get template names
  const templateIds = Array.from(grouped.keys()).filter((id) => id !== 'no-template');
  const templateNames = new Map<string, string>();

  if (templateIds.length > 0) {
    const { data: templates } = await supabase
      .from('templates')
      .select('id, name')
      .in('id', templateIds);

    for (const t of templates ?? []) {
      templateNames.set(t.id, t.name);
    }
  }

  return Array.from(grouped.entries()).map(([templateId, counts]) => ({
    templateId,
    templateName: templateNames.get(templateId) ?? '(템플릿 없음)',
    sessionCount: counts.total,
    completedCount: counts.completed,
    completionRate: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
  })).sort((a, b) => b.sessionCount - a.sessionCount);
}
