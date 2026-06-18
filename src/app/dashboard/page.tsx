'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronDown,
  Search,
  Plus,
  Sparkles,
  ListTodo,
  Hourglass,
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

  const stats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const completedThisWeek = tasks.filter(
      (t) => t.status === 'completed' && new Date(t.completed_at!) >= startOfWeek
    ).length;

    const completedThisMonth = tasks.filter(
      (t) => t.status === 'completed' && new Date(t.completed_at!) >= startOfMonth
    ).length;

    const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
    const totalPending = tasks.filter((t) => t.status === 'pending').length;

    return { completedThisWeek, completedThisMonth, totalCompleted, totalPending };
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
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h1 className="text-2xl font-bold text-white">
                      Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
                    </h1>
                  </div>
                  <p className="text-sm text-slate-400">Here&apos;s your productivity overview.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 py-2 text-sm"
                    />
                  </div>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <Button size="sm" onClick={() => setShowTaskForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Task
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: 'Due Today',
                    value: todayTasks.length + overdueTasks.length,
                    icon: Clock,
                    gradient: 'from-amber-500 to-orange-500',
                    shadow: 'shadow-amber-500/20',
                  },
                  {
                    label: 'Completed',
                    value: stats.totalCompleted,
                    icon: CheckCircle2,
                    gradient: 'from-emerald-500 to-green-500',
                    shadow: 'shadow-emerald-500/20',
                  },
                  {
                    label: 'Pending',
                    value: stats.totalPending,
                    icon: Hourglass,
                    gradient: 'from-blue-500 to-indigo-500',
                    shadow: 'shadow-blue-500/20',
                  },
                  {
                    label: 'This Week',
                    value: stats.completedThisWeek,
                    icon: TrendingUp,
                    gradient: 'from-purple-500 to-pink-500',
                    shadow: 'shadow-purple-500/20',
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className={cn(
                      'glass rounded-xl p-4 transition-all duration-200',
                      'hover:shadow-lg hover:shadow-primary/5'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                          stat.gradient,
                          stat.shadow
                        )}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-xs text-slate-400">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mb-6">
            <QuickAddTask />
          </div>

          {overdueTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-l-4 border-l-red-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-xl" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-400" />
                    </div>
                    <CardTitle className="text-red-400">Overdue</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400">{overdueTasks.length} tasks past due</span>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {overdueTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={toggleComplete}
                        onEdit={setEditingTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <ListTodo className="w-4 h-4 text-amber-400" />
                    </div>
                    <CardTitle>Today</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400">{todayTasks.length} tasks</span>
                </CardHeader>
                <CardContent>
                  {todayTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">All clear today!</p>
                      <p className="text-xs text-slate-500 mt-1">Enjoy your free time.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {todayTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={toggleComplete}
                            onEdit={setEditingTask}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <CardTitle>Upcoming</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400">{upcomingTasks.length} tasks</span>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Nothing upcoming</p>
                      <p className="text-xs text-slate-500 mt-1">Add some tasks to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {upcomingTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={toggleComplete}
                            onEdit={setEditingTask}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between p-4 glass rounded-xl hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-white">
                    Completed Tasks
                  </span>
                  <p className="text-xs text-slate-500">{completedTasks.length} tasks</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-slate-400 transition-transform duration-200',
                  showCompleted && 'rotate-180'
                )}
              />
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
                  <div className="pt-3 space-y-2">
                    {completedTasks.length === 0 ? (
                      <div className="glass rounded-xl p-6 text-center">
                        <p className="text-sm text-slate-400">No completed tasks yet</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {completedTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={toggleComplete}
                            onEdit={setEditingTask}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
