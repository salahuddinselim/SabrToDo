'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown,
  Search,
  Plus,
  Flame,
  ListTodo,
  Hourglass,
  TrendingUp,
  Sparkles,
  Info,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { QuickAddTask } from '@/components/tasks/QuickAddTask';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
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

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleCreateTask = async (data: TaskFormData) => {
    await addTask(data);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (editingTask) {
      await editTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await removeTask(id);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />

      <main className="lg:ml-64 pt-16 min-h-screen relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 relative z-10">
          
          {/* Top Dashboard Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2rem] p-6 sm:p-8 mb-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary to-secondary opacity-15 rounded-full blur-2xl pointer-events-none" />

            <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Serene Focus Activated</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                  {greeting}, {user?.displayName || 'Builder'}
                </h1>
                <p className="max-w-2xl text-sm text-slate-300">
                  Welcome back to your quiet space. You have <span className="font-semibold text-primary">{stats.totalPending} open loops</span> to focus on today.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="glass bg-white/[0.04] border border-white/[0.06] rounded-3xl p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Completion Rate</p>
                    <p className="mt-3 text-3xl font-bold text-primary">{completionRate}%</p>
                    <p className="mt-2 text-xs text-slate-500">Goal progress today</p>
                  </div>
                  <div className="glass bg-white/[0.04] border border-white/[0.06] rounded-3xl p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Today</p>
                    <p className="mt-3 text-3xl font-bold text-white">{todayTasks.length}</p>
                    <p className="mt-2 text-xs text-slate-500">pending tasks</p>
                  </div>
                  <div className="glass bg-white/[0.04] border border-white/[0.06] rounded-3xl p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Upcoming</p>
                    <p className="mt-3 text-3xl font-bold text-secondary">{upcomingTasks.length}</p>
                    <p className="mt-2 text-xs text-slate-500">tasks ahead</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[1.75rem] bg-white/[0.04] border border-white/[0.06] p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-[0.24em]">Quick glance</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">Task pulse</h2>
                    </div>
                    <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/40 border border-white/[0.06] p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em]">Overdue</p>
                      <p className="mt-3 text-2xl font-semibold text-rose-300">{overdueTasks.length}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/40 border border-white/[0.06] p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em]">Completed</p>
                      <p className="mt-3 text-2xl font-semibold text-secondary">{stats.totalCompleted}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 glass rounded-3xl bg-slate-950/40 border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Quick Add Task</p>
                      <p className="text-xs text-slate-500">Capture a new idea instantly.</p>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <QuickAddTask compact />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Main Dashboard Layout */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
            
            {/* Left Column: Tasks Board */}
            <div className="space-y-6">
              
              {/* Task space filters & Search */}
              <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-primary" />
                  Task Workspace
                </h2>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs bg-slate-950/20 border-white/10"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="pl-3 pr-8 py-2 rounded-xl bg-slate-950/40 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none cursor-pointer"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Overdue Alert Banner if exists */}
              {overdueTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border border-danger/25 bg-danger/5 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-danger animate-pulse" />
                        <CardTitle className="text-danger/90 text-sm font-bold">Action Required: Overdue</CardTitle>
                      </div>
                      <span className="text-xs text-danger/70">{overdueTasks.length} task{overdueTasks.length === 1 ? '' : 's'} past deadline</span>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <AnimatePresence mode="popLayout">
                        {overdueTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onToggleComplete={toggleComplete} onEdit={setEditingTask} onDelete={handleDeleteTask} />
                        ))}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Today Section */}
              <Card className="border border-white/[0.05]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Focus Today</CardTitle>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{todayTasks.length} pending</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {todayTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">All clear for today!</p>
                      <p className="text-xs text-slate-500 mt-1">Enjoy the peace or create a new task.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {todayTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onToggleComplete={toggleComplete} onEdit={setEditingTask} onDelete={handleDeleteTask} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Section */}
              <Card className="border border-white/[0.05]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Hourglass className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <CardTitle>Upcoming Buffer</CardTitle>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{upcomingTasks.length} pending</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {upcomingTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm">No upcoming tasks scheduled.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {upcomingTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onToggleComplete={toggleComplete} onEdit={setEditingTask} onDelete={handleDeleteTask} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks section */}
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/[0.03] transition-all border border-white/[0.05] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">Completed Archive</span>
                      <p className="text-xs text-slate-500">{completedTasks.length} task{completedTasks.length === 1 ? '' : 's'} archived</p>
                    </div>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', showCompleted && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-2">
                        {completedTasks.length === 0 ? (
                          <div className="glass rounded-2xl p-5 text-center text-slate-500">
                            No completed tasks yet.
                          </div>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {completedTasks.map((task) => (
                              <TaskCard key={task.id} task={task} onToggleComplete={toggleComplete} onEdit={setEditingTask} onDelete={handleDeleteTask} />
                            ))}
                          </AnimatePresence>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Right Column: Serenity Pulse & Actions */}
            <div className="space-y-6">
              
              {/* Serenity Pulse Widget */}
              <Card className="relative overflow-hidden border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <CardTitle className="text-sm font-semibold">Serenity Pulse</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mindfulness Quote display */}
                  <div className="bg-slate-950/45 rounded-2xl p-4 border border-white/[0.03] relative">
                    <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{mindfulnessQuote}&rdquo;</p>
                  </div>

                  {/* Circular or linear progress meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 text-slate-400">
                      <span>Daily Completion Goal</span>
                      <span className="font-medium text-white">{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>Completions this week:</span>
                    </div>
                    <span className="text-xs font-bold text-white">{stats.completedThisWeek} tasks</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action shortcuts */}
              <Card className="border border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setShowTaskForm(true)} className="w-full text-xs py-2 flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Full Details Task
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/analytics')}
                    variant="secondary"
                    className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Performance Analytics
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </Button>

                  <Button
                    onClick={() => router.push('/settings')}
                    variant="secondary"
                    className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-4 h-4 text-secondary" />
                    Configure Theme Presets
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterPriority('all');
                    }}
                    className="w-full text-xs py-2 text-slate-400 hover:text-white"
                  >
                    Reset Active Filters
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>

      <TaskFormModal
        isOpen={showTaskForm || editingTask !== null}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        editTask={editingTask}
      />
    </div>
  );
}
