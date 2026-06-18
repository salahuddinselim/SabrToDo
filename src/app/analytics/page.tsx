'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { cn, isOverdue } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tasks } = useTasks();

  const [hoveredDay, setHoveredDay] = useState<{ dateStr: string; count: number } | null>(null);


  // Basic stats
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
  const overdueTasksCount = tasks.filter(
    (t) => t.status === 'pending' && t.due_date && isOverdue(t.due_date)
  ).length;

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

  // Weekly activity (completions by day for the last 7 days)
  const weeklyActivity = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; dayName: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        dateStr: d.toDateString(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: 0,
      });
    }

    tasks.forEach((t) => {
      if (t.status === 'completed' && t.completed_at) {
        const completedDate = new Date(t.completed_at).toDateString();
        const found = days.find((day) => day.dateStr === completedDate);
        if (found) {
          found.count++;
        }
      }
    });

    return days;
  }, [tasks]);

  const maxWeeklyCount = useMemo(() => {
    const max = Math.max(...weeklyActivity.map((d) => d.count));
    return max > 0 ? max : 5;
  }, [weeklyActivity]);

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

  // Donut chart math
  const donutData = useMemo(() => {
    const { high, medium, low, total } = priorityDistribution;
    const r = 30;
    const circ = 2 * Math.PI * r; // ~188.5
    
    if (total === 0) {
      return { circ, highDash: 0, medDash: 0, lowDash: circ, highOffset: 0, medOffset: 0, lowOffset: 0 };
    }
    
    const highPct = high / total;
    const medPct = medium / total;
    const lowPct = low / total;
    
    const highDash = highPct * circ;
    const medDash = medPct * circ;
    const lowDash = lowPct * circ;
    
    const highOffset = 0;
    const medOffset = -highDash;
    const lowOffset = -(highDash + medDash);
    
    return { circ, highDash, medDash, lowDash, highOffset, medOffset, lowOffset };
  }, [priorityDistribution]);

  // Heatmap for the last 28 days (GitHub-style calendar grid)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; dateLabel: string; count: number }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        dateStr: d.toDateString(),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
      });
    }

    tasks.forEach((t) => {
      if (t.status === 'completed' && t.completed_at) {
        const completedDate = new Date(t.completed_at).toDateString();
        const found = days.find((day) => day.dateStr === completedDate);
        if (found) {
          found.count++;
        }
      }
    });

    return days;
  }, [tasks]);

  // Achievements validation
  const achievements = useMemo(() => {
    return [
      {
        id: 'first_task',
        title: 'Mindful Beginning',
        desc: 'Complete your first task',
        unlocked: completedTasksCount >= 1,
        icon: Sparkles,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      },
      {
        id: 'focused_builder',
        title: 'Focused Builder',
        desc: 'Complete 5 tasks in total',
        unlocked: completedTasksCount >= 5,
        icon: Zap,
        color: 'text-primary bg-primary/10 border-primary/20',
      },
      {
        id: 'steady_momentum',
        title: 'Steady Momentum',
        desc: 'Achieve a 3-day focus streak',
        unlocked: streak >= 3,
        icon: Flame,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      },
      {
        id: 'sabr_mastery',
        title: 'Sabr Mastery',
        desc: 'Achieve a 5-day focus streak',
        unlocked: streak >= 5,
        icon: Award,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
    ];
  }, [completedTasksCount, streak]);

  // Auth Guard
  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />

      <main className="lg:ml-64 pt-16 min-h-screen relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          
          {/* Header row */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
                  <TrendingUp className="text-primary w-8 h-8" />
                  Performance Insights
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Mindful analysis of your focus patterns, task velocity, and habits.
                </p>
              </div>
            </div>
          </div>

          {/* Key metrics panel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-white/[0.05]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{completedTasksCount}</p>
                  <p className="text-xs text-slate-400">Total Completed</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/[0.05]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{streak} days</p>
                  <p className="text-xs text-slate-400">Current Streak</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/[0.05]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{completionRate}%</p>
                  <p className="text-xs text-slate-400">Completion Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/[0.05]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{overdueTasksCount}</p>
                  <p className="text-xs text-slate-400">Overdue Warnings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] mb-6">
            
            {/* Weekly Activity (Bar Chart) */}
            <Card className="border border-white/[0.05]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Weekly Velocity</CardTitle>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Completed tasks (Last 7 days)</span>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="w-full h-56 flex items-end">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Horizontal Grid Lines */}
                    <line x1="40" y1="30" x2="380" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="90" x2="380" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="150" x2="380" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    
                    {/* Y Axis Labels */}
                    <text x="15" y="34" fill="#94a3b8" fontSize="10" textAnchor="middle">{Math.round(maxWeeklyCount)}</text>
                    <text x="15" y="94" fill="#94a3b8" fontSize="10" textAnchor="middle">{Math.round(maxWeeklyCount / 2)}</text>
                    <text x="15" y="154" fill="#94a3b8" fontSize="10" textAnchor="middle">0</text>

                    {/* Bars rendering */}
                    {weeklyActivity.map((day, idx) => {
                      const spacing = (340 / 7);
                      const x = 40 + idx * spacing + spacing / 4;
                      const barWidth = spacing / 2;
                      const barHeight = (day.count / maxWeeklyCount) * 120;
                      const y = 150 - barHeight;
                      
                      return (
                        <g key={day.dateStr} className="group">
                          {/* Glow overlay */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            fill="url(#bar-gradient)"
                            opacity="0.3"
                            filter="url(#bar-glow)"
                          />
                          {/* Core Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            fill="url(#bar-gradient)"
                            className="transition-all duration-300 hover:brightness-125"
                          />
                          {/* Count Value on Hover */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 8}
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            {day.count}
                          </text>
                          {/* X Label */}
                          <text
                            x={x + barWidth / 2}
                            y="172"
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            {day.dayName}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                      <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution (Donut Chart) */}
            <Card className="border border-white/[0.05]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-sm font-semibold">Priority Profile</CardTitle>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Tasks breakdown by priority</span>
              </CardHeader>
              <CardContent className="pt-2 pb-4 flex flex-col items-center">
                {priorityDistribution.total === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                    No priorities recorded.
                  </div>
                ) : (
                  <>
                    <div className="relative w-36 h-36 mt-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background Gray Ring */}
                        <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
                        
                        {/* High priority arc */}
                        {donutData.highDash > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="30"
                            stroke="var(--danger)"
                            strokeWidth="10"
                            strokeDasharray={`${donutData.highDash} ${donutData.circ - donutData.highDash}`}
                            strokeDashoffset={donutData.highOffset}
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        )}

                        {/* Medium priority arc */}
                        {donutData.medDash > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="30"
                            stroke="var(--primary)"
                            strokeWidth="10"
                            strokeDasharray={`${donutData.medDash} ${donutData.circ - donutData.medDash}`}
                            strokeDashoffset={donutData.medOffset}
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        )}

                        {/* Low priority arc */}
                        {donutData.lowDash > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="30"
                            stroke="var(--secondary)"
                            strokeWidth="10"
                            strokeDasharray={`${donutData.lowDash} ${donutData.circ - donutData.lowDash}`}
                            strokeDashoffset={donutData.lowOffset}
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">{priorityDistribution.total}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Total</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="grid grid-cols-3 gap-6 mt-6 w-full text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <span>High</span>
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{priorityDistribution.high}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                          <span>Medium</span>
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{priorityDistribution.medium}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                          <span>Low</span>
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{priorityDistribution.low}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* GitHub style calendar grid (last 28 days) */}
          <Card className="border border-white/[0.05] mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-sm font-semibold">Mindful Completion Consistency</CardTitle>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Completions calendar (Last 4 weeks)</span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-col items-center">
                
                {/* Heatmap Tooltip */}
                <div className="h-6 mb-2 text-xs text-slate-400 text-center font-medium">
                  {hoveredDay ? (
                    <span className="text-white">
                      {hoveredDay.count} task{hoveredDay.count === 1 ? '' : 's'} completed on {hoveredDay.dateStr}
                    </span>
                  ) : (
                    <span>Hover over any tile to see completion details</span>
                  )}
                </div>

                {/* 28 Day Grid */}
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 mt-2">
                  {heatmapData.map((day) => {
                    // Density classes
                    const densityClass = cn(
                      "w-5 h-5 rounded-md border border-white/[0.02] cursor-pointer transition-all duration-150 hover:scale-105",
                      day.count === 0 && "bg-white/[0.02] hover:bg-white/[0.05]",
                      day.count === 1 && "bg-primary/20 hover:bg-primary/30 border-primary/35",
                      day.count === 2 && "bg-primary/45 hover:bg-primary/55 border-primary/60",
                      day.count >= 3 && "bg-primary hover:bg-primary/90 border-primary/80"
                    );

                    return (
                      <div
                        key={day.dateStr}
                        className={densityClass}
                        onMouseEnter={() => setHoveredDay({ dateStr: day.dateLabel, count: day.count })}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>

                {/* Grid color legend */}
                <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500">
                  <span>Less</span>
                  <span className="w-3.5 h-3.5 rounded-sm bg-white/[0.02] border border-white/[0.02] inline-block" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-primary/20 border border-primary/35 inline-block" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-primary/45 border border-primary/60 inline-block" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-primary border border-primary/80 inline-block" />
                  <span>More</span>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Gamified Achievements Checklist */}
          <Card className="border border-white/[0.05]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-sm font-semibold">Mindfulness Milestones</CardTitle>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Unlocked achievements & growth milestones</span>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-200",
                      a.unlocked 
                        ? "glass bg-white/[0.01] border-white/[0.05]" 
                        : "bg-slate-950/[0.08] border-dashed border-white/[0.03] opacity-45"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", a.color)}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                        {a.unlocked && (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/25 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
