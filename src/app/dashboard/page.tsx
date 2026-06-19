'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { Task, TaskFormData } from '@/types';
import { isToday, isUpcoming, isOverdue, cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tasks, addTask, editTask, removeTask, toggleComplete } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [animatingChecks, setAnimatingChecks] = useState<Record<string, boolean>>({});
  const [quickCaptureText, setQuickCaptureText] = useState('');
  const [quickCapturePriority, setQuickCapturePriority] = useState<string>('medium');

  const { toast } = useToast();

  // Time-of-day Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Calm Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Mindfulness Quote
  const mindfulnessQuote = useMemo(() => {
    const quotes = [
      "Patience is not the ability to wait, but how you act while waiting.",
      "Indeed, with hardship comes ease. Keep moving steadily.",
      "The key to productivity is focus, and the key to focus is calm.",
      "Small consistent steps lead to massive long-term progress.",
      "Close open loops, take a deep breath, and focus on one thing.",
      "Sabr is beautiful. Your steady growth is a reflection of it.",
    ];
    const day = new Date().getDate();
    return quotes[day % quotes.length];
  }, []);

  // Task lists
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  const todayTasks = filteredTasks.filter(
    (task) => task.status === 'pending' && task.due_date && isToday(task.due_date)
  );

  const upcomingTasks = filteredTasks.filter(
    (task) => task.status === 'pending' && (!task.due_date || (isUpcoming(task.due_date) && !isToday(task.due_date)))
  );

  const overdueTasks = filteredTasks.filter(
    (task) => task.status === 'pending' && task.due_date && isOverdue(task.due_date)
  );

  const completedTasks = filteredTasks.filter((task) => task.status === 'completed');

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

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const stats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

    const completedThisWeek = tasks.filter(
      (t) => t.status === 'completed' && new Date(t.completed_at!) >= startOfWeek
    ).length;

    const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
    const totalPending = tasks.filter((t) => t.status === 'pending').length;

    return { completedThisWeek, totalCompleted, totalPending };
  }, [tasks]);

  const weekData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - ((today + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const bars = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = tasks.filter(
        (t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at) >= d && new Date(t.completed_at) <= dayEnd
      ).length;

      const maxCount = 10;
      bars.push({
        label: dayNames[d.getDay()],
        count,
        height: Math.min((count / maxCount) * 100, 100),
        isToday: d.getDay() === today,
      });
    }
    return bars;
  }, [tasks]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  if (!user) {
    return null;
  }

  const handleToggleTask = async (id: string) => {
    setAnimatingChecks((prev) => ({ ...prev, [id]: true }));
    await toggleComplete(id);
    setTimeout(() => {
      setAnimatingChecks((prev) => ({ ...prev, [id]: false }));
    }, 300);
  };

  const handleCreateTask = async (data: TaskFormData) => {
    await addTask(data);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (editingTask) {
      await editTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleQuickCapture = async () => {
    const title = quickCaptureText.trim();
    if (!title) return;
    await addTask({ title, description: '', priority: quickCapturePriority as Task['priority'], notify_before: 0 });
    setQuickCaptureText('');
    toast.success('Task added!');
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await removeTask(id);
    }
  };

  const decorations = (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
    </>
  );

  return (
    <>
    <AppLayout decoration={decorations}>
          
          {/* Greeting Row */}
          <div className="flex items-start justify-between mb-4 md:mb-5">
            <div>
              <h1 className="text-[20px] md:text-[24px] font-medium text-primary tracking-[-0.5px]">
                {greeting}, {user?.displayName || 'Builder'}
              </h1>
              <p className="text-[13px] md:text-[13.5px] text-ink-muted mt-1">
                You have <span className="text-accent-blue font-medium">{tasks.filter(t => t.status === 'pending' && t.due_date && isToday(t.due_date)).length} tasks due today</span>
                {' '}&mdash; let&apos;s make them flow.
              </p>
            </div>

            {/* Daily Pulse — hidden on mobile */}
            <div className="hidden md:flex items-center gap-3 bg-surface border border-white/10 rounded-[14px] px-[18px] py-3 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none" stroke="#6c8fff" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionRate / 100)}`}
                  />
                </svg>
                <span className="text-[12px] font-semibold text-accent-blue">{completionRate}%</span>
              </div>
              <div>
                <p className="text-[13px] font-medium text-primary">Daily pulse</p>
                <p className="text-[11px] text-ink-dim">Goal in reach</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 max-[480px]:grid-cols-1 xl:grid-cols-4 gap-[14px] mb-4 md:mb-5">
            {/* Total Tasks */}
            <div className="group bg-surface border border-white/10 rounded-[14px] p-[14px] transition-all duration-150 hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-0.5">
                <div className="w-[30px] h-[30px] rounded-[9px] bg-accent-blue/15 flex items-center justify-center">
                  <ListTodo className="w-[15px] h-[15px] text-accent-blue" />
                </div>
              </div>
              <p className="text-[24px] font-medium text-primary tracking-[-1px] mt-2">{tasks.length}</p>
              <p className="text-[12px] text-ink-dim mt-0.5">Total tasks</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-accent-green" />
                <span className="text-[11px] text-accent-green">{stats.completedThisWeek} completed this week</span>
              </div>
            </div>

            {/* Completed */}
            <div className="group bg-surface border border-white/10 rounded-[14px] p-[14px] transition-all duration-150 hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-0.5">
                <div className="w-[30px] h-[30px] rounded-[9px] bg-accent-green/15 flex items-center justify-center">
                  <CheckCircle2 className="w-[15px] h-[15px] text-accent-green" />
                </div>
              </div>
              <p className="text-[24px] font-medium text-primary tracking-[-1px] mt-2">{stats.totalCompleted}</p>
              <p className="text-[12px] text-ink-dim mt-0.5">Completed</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-accent-green" />
                <span className="text-[11px] text-accent-green">{completionRate}% rate</span>
              </div>
            </div>

            {/* Due Today */}
            <div className="group bg-surface border border-white/10 rounded-[14px] p-[14px] transition-all duration-150 hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-0.5">
                <div className="w-[30px] h-[30px] rounded-[9px] bg-accent-yellow/15 flex items-center justify-center">
                  <Clock className="w-[15px] h-[15px] text-accent-yellow" />
                </div>
              </div>
              <p className="text-[24px] font-medium text-primary tracking-[-1px] mt-2">{todayTasks.length}</p>
              <p className="text-[12px] text-ink-dim mt-0.5">Due today</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-3 h-3 inline-flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
                </span>
                <span className="text-[11px] text-ink-dim">{overdueTasks.length} overdue</span>
              </div>
            </div>

            {/* Overdue */}
            <div className="group bg-surface border border-white/10 rounded-[14px] p-[14px] transition-all duration-150 hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-0.5">
                <div className="w-[30px] h-[30px] rounded-[9px] bg-accent-red/15 flex items-center justify-center">
                  <AlertTriangle className="w-[15px] h-[15px] text-accent-red" />
                </div>
              </div>
              <p className="text-[24px] font-medium text-primary tracking-[-1px] mt-2">{overdueTasks.length}</p>
              <p className="text-[12px] text-ink-dim mt-0.5">Overdue</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-accent-red rotate-180" />
                <span className="text-[11px] text-accent-red">Needs attention</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px] items-start">
            
            {/* Left Column: Task Workspace Panel */}
            <div className="bg-surface border border-white/10 rounded-[18px] overflow-hidden">
              
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-[14px] font-medium text-primary">Task workspace</h2>
                  <span className="text-[11px] text-ink-dim bg-raised rounded-[99px] px-2 py-0.5">
                    {tasks.length} tasks
                  </span>
                </div>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-1.5 bg-accent-blue text-white text-[12px] font-medium rounded-[8px] px-3 py-1.5 transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add task
                </button>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-[6px] px-4 py-2.5 border-b border-white/10 overflow-x-auto">
                {(['all', 'today', 'upcoming', 'high', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      'text-[12px] rounded-[99px] px-3 py-[5px] transition-all duration-150 shrink-0',
                      activeFilter === f
                        ? 'bg-accent-blue/10 border border-accent-blue text-accent-blue'
                        : 'border border-white/10 text-ink-muted hover:text-primary hover:border-white/20'
                    )}
                  >
                    {f === 'all' && 'All'}
                    {f === 'today' && 'Today'}
                    {f === 'upcoming' && 'Upcoming'}
                    {f === 'high' && 'High priority'}
                    {f === 'completed' && 'Completed'}
                  </button>
                ))}
              </div>

              {/* Task List */}
              <div className="p-3">

                {/* Focus Today section */}
                {activeFilter !== 'completed' && activeFilter !== 'upcoming' && (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.07em] text-ink-dim px-2 pb-[5px] pt-2">
                      Focus today
                    </p>
                    {todayTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center mb-2.5">
                          <CheckCircle2 className="w-5 h-5 text-accent-green" />
                        </div>
                        <p className="text-[13.5px] text-ink-muted font-medium">All clear for today</p>
                        <p className="text-[12px] text-ink-dim mt-0.5">Enjoy the peace or create a new task.</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {todayTasks.map((task) => {
                          const isAnimating = animatingChecks[task.id];
                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center gap-3 px-2.5 py-[11px] rounded-[10px] hover:bg-raised transition-colors duration-150 group"
                            >
                              {/* Checkbox */}
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className="relative w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
                              >
                                <div
                                  className={cn(
                                    'absolute inset-0 rounded-full border-2 transition-all duration-150',
                                    task.status === 'completed'
                                      ? 'border-accent-green bg-accent-green'
                                      : 'border-white/20 group-hover:border-accent-blue'
                                  )}
                                />
                                {task.status === 'completed' && (
                                  <motion.svg
                                    initial={isAnimating ? { scale: 0 } : false}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="relative w-2.5 h-2.5 text-white z-10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </motion.svg>
                                )}
                              </button>

                              {/* Content */}
                              <div className="flex-1 min-w-0 flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    'text-[13.5px] transition-colors duration-150',
                                    task.status === 'completed'
                                      ? 'line-through text-ink-dim'
                                      : 'text-primary'
                                  )}
                                >
                                  {task.title}
                                </span>
                                {task.priority && task.status !== 'completed' && (
                                  <span
                                    className={cn(
                                      'text-[10px] font-medium rounded-[5px] px-[7px] py-0.5 shrink-0',
                                      task.priority === 'high' && 'bg-accent-red/15 text-accent-red',
                                      task.priority === 'medium' && 'bg-accent-yellow/15 text-accent-yellow',
                                      task.priority === 'low' && 'bg-accent-green/15 text-accent-green'
                                    )}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>

                              {/* Due date */}
                              {task.due_date && task.status !== 'completed' && (
                                <div className={cn(
                                  'flex items-center gap-1 text-[11px] shrink-0',
                                  isOverdue(task.due_date) ? 'text-accent-red' : 'text-ink-dim'
                                )}>
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {isToday(task.due_date)
                                      ? 'Today'
                                      : isOverdue(task.due_date)
                                      ? `${Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) * -1}d overdue`
                                      : new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </>
                )}

                {/* Upcoming section */}
                {activeFilter !== 'completed' && activeFilter !== 'today' && (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.07em] text-ink-dim px-2 pb-[5px] pt-5">
                      Upcoming
                    </p>
                    {upcomingTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <Calendar className="w-8 h-8 text-ink-dim mb-2" />
                        <p className="text-[13.5px] text-ink-muted">No upcoming tasks scheduled.</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {upcomingTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-2.5 py-[11px] rounded-[10px] hover:bg-raised transition-colors duration-150 group"
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className="relative w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
                            >
                              <div
                                className={cn(
                                  'absolute inset-0 rounded-full border-2 transition-all duration-150',
                                  task.status === 'completed'
                                    ? 'border-accent-green bg-accent-green'
                                    : 'border-white/20 group-hover:border-accent-blue'
                                )}
                              />
                              {task.status === 'completed' && (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className="relative w-2.5 h-2.5 text-white z-10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </motion.svg>
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex items-center gap-2.5">
                              <span
                                className={cn(
                                  'text-[13.5px] transition-colors duration-150',
                                  task.status === 'completed'
                                    ? 'line-through text-ink-dim'
                                    : 'text-primary'
                                )}
                              >
                                {task.title}
                              </span>
                              {task.priority && task.status !== 'completed' && (
                                <span
                                  className={cn(
                                    'text-[10px] font-medium rounded-[5px] px-[7px] py-0.5 shrink-0',
                                    task.priority === 'high' && 'bg-accent-red/15 text-accent-red',
                                    task.priority === 'medium' && 'bg-accent-yellow/15 text-accent-yellow',
                                    task.priority === 'low' && 'bg-accent-green/15 text-accent-green'
                                  )}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </div>

                            {/* Due date */}
                            {task.due_date && task.status !== 'completed' && (
                              <div className={cn(
                                'flex items-center gap-1 text-[11px] shrink-0',
                                isOverdue(task.due_date) ? 'text-accent-red' : 'text-ink-dim'
                              )}>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {isToday(task.due_date)
                                    ? 'Today'
                                    : isOverdue(task.due_date)
                                    ? `${Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) * -1}d overdue`
                                    : new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </>
                )}

                {/* Completed section */}
                {activeFilter === 'completed' && (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.07em] text-ink-dim px-2 pb-[5px] pt-2">
                      Completed
                    </p>
                    {completedTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <CheckCircle2 className="w-8 h-8 text-ink-dim mb-2" />
                        <p className="text-[13.5px] text-ink-muted">No completed tasks yet.</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {completedTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-2.5 py-[11px] rounded-[10px] hover:bg-raised transition-colors duration-150 group"
                          >
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className="relative w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
                            >
                              <div className="absolute inset-0 rounded-full border-2 border-accent-green bg-accent-green" />
                              <svg className="relative w-2.5 h-2.5 text-white z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                            <span className="flex-1 text-[13.5px] line-through text-ink-dim">{task.title}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">

              {/* Card 1 — Quick capture */}
              <div className="bg-surface border border-white/10 rounded-[18px] p-[18px]">
                <p className="text-[10px] uppercase tracking-[0.08em] text-ink-dim mb-2.5">Quick capture</p>
                <textarea
                  rows={2}
                  value={quickCaptureText}
                  onChange={(e) => setQuickCaptureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickCapture();
                    }
                  }}
                  placeholder="What needs to get done?"
                  className="w-full bg-raised border border-white/10 rounded-[9px] px-3 py-2.5 text-[13px] text-primary placeholder:text-ink-dim resize-none outline-none transition-colors duration-150 focus:border-accent-blue"
                />
                <div className="flex items-center gap-2 mt-2.5">
                  <select
                    value={quickCapturePriority}
                    onChange={(e) => setQuickCapturePriority(e.target.value)}
                    className="flex-1 bg-raised border border-white/10 rounded-[9px] px-3 py-2 text-[12px] text-primary outline-none appearance-none cursor-pointer transition-colors duration-150 focus:border-accent-blue"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    onClick={handleQuickCapture}
                    disabled={!quickCaptureText.trim()}
                    className="bg-accent-blue text-white text-[12px] font-medium rounded-[9px] px-4 py-2 transition-all duration-150 hover:opacity-85 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Card 2 — This week */}
              <div className="bg-surface border border-white/10 rounded-[18px] overflow-hidden">
                <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-white/10">
                  <h3 className="text-[14px] font-medium text-primary">This week</h3>
                </div>
                <div className="p-[18px]">
                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="text-[24px] font-medium text-primary tracking-[-1px]">{stats.completedThisWeek}</span>
                    <span className="text-[12px] text-ink-dim">tasks completed</span>
                  </div>
                  <div className="flex items-end justify-between gap-1.5 h-24">
                    {weekData.map((day) => (
                      <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full bg-raised rounded-[5px] overflow-hidden" style={{ height: '100%' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${day.height}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn(
                              'w-full rounded-[5px]',
                              day.isToday ? 'bg-accent-green' : 'bg-accent-blue'
                            )}
                            style={{ alignSelf: 'flex-end' }}
                          />
                        </div>
                        <span className={cn(
                          'text-[9px]',
                          day.isToday ? 'text-accent-blue font-medium' : 'text-ink-dim'
                        )}>
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3 — Serenity quote */}
              <div className="bg-surface border border-white/10 rounded-[18px] p-5">
                <div className="w-7 h-0.5 bg-accent-blue rounded-[2px] mb-3.5" />
                <p className="text-[13.5px] italic text-ink-muted leading-[1.7]">
                  &ldquo;{mindfulnessQuote}&rdquo;
                </p>
                <p className="text-[11px] text-ink-dim mt-2.5">Serenity Pulse</p>
              </div>

            </div>
          </div>

    </AppLayout>

      <TaskFormModal
        isOpen={showTaskForm || editingTask !== null}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        editTask={editingTask}
      />
    </>
  );
}
