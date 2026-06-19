'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  TrendingUp,
  Flame,
  Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tasks } = useTasks();

  // Basic stats
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  const completionRate = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasksCount / totalTasks) * 100);
  }, [totalTasks, completedTasksCount]);

  // Streak Calculator
  const streak = useMemo(() => {
    const completedDates = tasks
      .filter((t) => t.status === 'completed' && t.completed_at)
      .map((t) => new Date(t.completed_at!).toDateString());
      
    const uniqueDates = Array.from(new Set(completedDates))
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime()); // newest first

    if (uniqueDates.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(today);
    
    // Check if user completed something today or yesterday
    const firstCompleted = new Date(uniqueDates[0]);
    firstCompleted.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - firstCompleted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return 0; // Streak broken
    }

    if (diffDays === 1) {
      checkDate.setDate(checkDate.getDate() - 1); // start checking from yesterday
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const compDate = uniqueDates[i];
      compDate.setHours(0, 0, 0, 0);
      
      if (compDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (compDate.getTime() > checkDate.getTime()) {
        continue;
      } else {
        break;
      }
    }

    return currentStreak;
  }, [tasks]);

  // Priority distribution stats
  const priorityDistribution = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    tasks.forEach((t) => {
      if (t.priority === 'high') high++;
      else if (t.priority === 'medium') medium++;
      else low++;
    });
    const total = high + medium + low;
    return { high, medium, low, total };
  }, [tasks]);

  // Computed analytics data
  const avgTasksPerDay = useMemo(() => {
    if (tasks.length === 0) return '0';
    const today = new Date();
    const firstTask = tasks.reduce((earliest, t) => {
      const d = t.created_at ? new Date(t.created_at) : today;
      return d < earliest ? d : earliest;
    }, today);
    const daysSince = Math.max(Math.ceil((today.getTime() - firstTask.getTime()) / (1000 * 60 * 60 * 24)), 1);
    return (tasks.length / daysSince).toFixed(1);
  }, [tasks]);

  const weeklyChart = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - ((today.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    return dayNames.map((label, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const created = tasks.filter(
        (t) => t.created_at && new Date(t.created_at) >= d && new Date(t.created_at) <= dayEnd
      ).length;

      const completed = tasks.filter(
        (t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at) >= d && new Date(t.completed_at) <= dayEnd
      ).length;

      return { label, created, completed };
    });
  }, [tasks]);

  const maxChartValue = useMemo(() => {
    const max = Math.max(...weeklyChart.flatMap((d) => [d.created, d.completed]));
    return max > 0 ? max : 5;
  }, [weeklyChart]);

  const dayOfWeekCompletion = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    tasks.forEach((t) => {
      if (t.status === 'completed' && t.completed_at) {
        const day = new Date(t.completed_at).getDay();
        const idx = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
        counts[idx]++;
      }
    });
    const maxIdx = counts.indexOf(Math.max(...counts));
    return { counts, bestDay: dayNames[maxIdx], bestCount: Math.max(...counts) };
  }, [tasks]);

  // Auth Guard
  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <AppLayout
      decoration={
        <>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-accent-purple/5 rounded-full blur-3xl" />
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Section 1 — KPI Cards */}
        <div className="grid grid-cols-2 max-[480px]:grid-cols-1 lg:grid-cols-3 gap-[14px]">
          {/* Completion Rate */}
          <div className="bg-surface border border-white/10 rounded-[14px] p-[18px] transition-all duration-150 hover:-translate-y-0.5">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-accent-blue/15 flex items-center justify-center mb-0.5">
              <TrendingUp className="w-[17px] h-[17px] text-accent-blue" />
            </div>
            <p className="text-[28px] font-medium text-primary tracking-[-1px] mt-3">{completionRate}%</p>
            <p className="text-[12px] text-ink-dim mt-0.5">Completion rate</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-accent-green" />
              <span className="text-[11px] text-accent-green">+12% vs last week</span>
            </div>
          </div>

          {/* Day Streak */}
          <div className="bg-surface border border-white/10 rounded-[14px] p-[18px] transition-all duration-150 hover:-translate-y-0.5">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-accent-green/15 flex items-center justify-center mb-0.5">
              <Flame className="w-[17px] h-[17px] text-accent-green" />
            </div>
            <p className="text-[28px] font-medium text-primary tracking-[-1px] mt-3">{streak}</p>
            <p className="text-[12px] text-ink-dim mt-0.5">Day streak</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-accent-green" />
              <span className="text-[11px] text-accent-green">Personal best</span>
            </div>
          </div>

          {/* Avg Tasks / Day */}
          <div className="bg-surface border border-white/10 rounded-[14px] p-[18px] transition-all duration-150 hover:-translate-y-0.5">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-accent-yellow/15 flex items-center justify-center mb-0.5">
              <Clock className="w-[17px] h-[17px] text-accent-yellow" />
            </div>
            <p className="text-[28px] font-medium text-primary tracking-[-1px] mt-3">{avgTasksPerDay}</p>
            <p className="text-[12px] text-ink-dim mt-0.5">Avg tasks / day</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-accent-green" />
              <span className="text-[11px] text-accent-green">Above average</span>
            </div>
          </div>
        </div>

        {/* Section 2 — Activity Chart */}
        <div className="bg-surface border border-white/10 rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-medium text-primary">Task activity &mdash; last 7 days</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-blue/70" />
                <span className="text-[11px] text-ink-dim">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[11px] text-ink-dim">Completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2.5 h-[140px]">
            {weeklyChart.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-raised rounded-[6px] overflow-hidden relative" style={{ height: '100%' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.created / maxChartValue) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 w-1/2 bg-accent-blue/70 rounded-[6px] transition-opacity duration-150 hover:opacity-75"
                    style={{ height: `${(day.created / maxChartValue) * 100}%` }}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / maxChartValue) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className="absolute bottom-0 right-0 w-1/2 bg-accent-green rounded-[6px] transition-opacity duration-150 hover:opacity-75"
                    style={{ height: `${(day.completed / maxChartValue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-dim">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Two equal columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Priority Breakdown */}
          <div className="bg-surface border border-white/10 rounded-[18px] p-5">
            <h3 className="text-[14px] font-medium text-primary mb-4">Priority breakdown</h3>
            <div className="space-y-3">
              {/* High */}
              <div className="flex items-center gap-3">
                <span className="w-[52px] text-[12px] font-medium text-accent-red shrink-0">High</span>
                <div className="flex-1 bg-raised h-[6px] rounded-[3px] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priorityDistribution.total > 0 ? (priorityDistribution.high / priorityDistribution.total) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-accent-red rounded-[3px]"
                  />
                </div>
                <span className="text-[12px] text-ink-dim w-8 text-right">
                  {priorityDistribution.total > 0 ? Math.round((priorityDistribution.high / priorityDistribution.total) * 100) : 0}%
                </span>
              </div>
              {/* Medium */}
              <div className="flex items-center gap-3">
                <span className="w-[52px] text-[12px] font-medium text-accent-yellow shrink-0">Medium</span>
                <div className="flex-1 bg-raised h-[6px] rounded-[3px] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priorityDistribution.total > 0 ? (priorityDistribution.medium / priorityDistribution.total) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-accent-yellow rounded-[3px]"
                  />
                </div>
                <span className="text-[12px] text-ink-dim w-8 text-right">
                  {priorityDistribution.total > 0 ? Math.round((priorityDistribution.medium / priorityDistribution.total) * 100) : 0}%
                </span>
              </div>
              {/* Low */}
              <div className="flex items-center gap-3">
                <span className="w-[52px] text-[12px] font-medium text-accent-green shrink-0">Low</span>
                <div className="flex-1 bg-raised h-[6px] rounded-[3px] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priorityDistribution.total > 0 ? (priorityDistribution.low / priorityDistribution.total) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-accent-green rounded-[3px]"
                  />
                </div>
                <span className="text-[12px] text-ink-dim w-8 text-right">
                  {priorityDistribution.total > 0 ? Math.round((priorityDistribution.low / priorityDistribution.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-[0.07em] text-ink-dim mb-2">Top insight</p>
              <p className="text-[13px] text-ink-muted leading-[1.6]">
                {priorityDistribution.high > priorityDistribution.medium
                  ? 'High-priority tasks dominate your workload. Consider breaking them into smaller subtasks.'
                  : 'Your workload is balanced. Keep maintaining steady progress across all priorities.'}
              </p>
            </div>
          </div>

          {/* Completion by Day */}
          <div className="bg-surface border border-white/10 rounded-[18px] p-5">
            <h3 className="text-[14px] font-medium text-primary mb-4">Completion by day</h3>
            <div className="space-y-3">
              {dayOfWeekCompletion.counts.map((count, i) => {
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const maxCount = Math.max(...dayOfWeekCompletion.counts, 1);
                return (
                  <div key={dayNames[i]} className="flex items-center gap-3">
                    <span className={cn(
                      'w-[52px] text-[12px] font-medium shrink-0',
                      dayOfWeekCompletion.bestDay === dayNames[i] ? 'text-accent-green' : 'text-ink-dim'
                    )}>
                      {dayNames[i]}
                    </span>
                    <div className="flex-1 bg-raised h-[6px] rounded-[3px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCount) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-[3px]',
                          dayOfWeekCompletion.bestDay === dayNames[i] ? 'bg-accent-green' : 'bg-accent-blue'
                        )}
                      />
                    </div>
                    <span className="text-[12px] text-ink-dim w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-[0.07em] text-ink-dim mb-2">Best day</p>
              <p className="text-[20px] font-medium text-accent-green tracking-[-0.5px]">{dayOfWeekCompletion.bestDay}</p>
              <p className="text-[12px] text-ink-dim mt-1">{dayOfWeekCompletion.bestCount} tasks completed</p>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
