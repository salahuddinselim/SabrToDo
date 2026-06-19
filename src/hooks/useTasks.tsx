'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { Task, TaskFormData } from '@/types';
import { getTasks, createTask, updateTask, deleteTask, reorderTasks } from '@/lib/db';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (data: TaskFormData) => Promise<void>;
  editTask: (id: string, data: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  reorder: (taskIds: string[]) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const visibilityRef = useRef(true);

  const fetchTasks = useCallback(async () => {
    if (!user?.uid) return;

    setError(null);
    try {
      const fetchedTasks = await getTasks(user.uid);
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initial fetch + auth change
  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user?.uid, fetchTasks]);

  // 30s polling — pauses when tab is hidden
  useEffect(() => {
    if (!user?.uid) return;

    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (visibilityRef.current) fetchTasks();
      }, 30000);
    };

    const onVisibility = () => {
      visibilityRef.current = !document.hidden;
      if (document.hidden) {
        if (pollingRef.current) clearInterval(pollingRef.current);
      } else {
        fetchTasks();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', fetchTasks);
    window.addEventListener('online', fetchTasks);
    startPolling();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', fetchTasks);
      window.removeEventListener('online', fetchTasks);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user?.uid, fetchTasks]);

  const addTask = async (data: TaskFormData) => {
    if (!user?.uid) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const optimistic: Task = {
      id: tempId,
      user_id: user.uid,
      title: data.title,
      description: data.description || '',
      due_date: data.due_date || '',
      priority: data.priority,
      status: 'pending',
      notify_before: data.notify_before,
      created_at: now,
      completed_at: '',
      order_index: 0,
    };

    setTasks((prev) => [optimistic, ...prev]);

    try {
      const newTask = await createTask({
        user_id: user.uid,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        priority: data.priority,
        status: 'pending',
        notify_before: data.notify_before,
        completed_at: undefined,
      }, user.csrfToken);
      setTasks((prev) => prev.map((t) => (t.id === tempId ? newTask : t)));
      toast.success('Task created successfully!');
      fetchTasks();
    } catch (err: unknown) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const editTask = async (id: string, data: Partial<Task>) => {
    const prev = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

    try {
      const updatedTask = await updateTask(id, data, user?.csrfToken);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      toast.success('Task updated!');
      fetchTasks();
    } catch (err: unknown) {
      setTasks(prev);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const removeTask = async (id: string) => {
    const prev = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id, user?.csrfToken);
      toast.info('Task deleted');
      fetchTasks();
    } catch (err: unknown) {
      setTasks(prev);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : '';

    const prev = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, completed_at: completedAt } : t
      )
    );

    try {
      const updatedTask = await updateTask(id, {
        status: newStatus,
        completed_at: completedAt || undefined,
      }, user?.csrfToken);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));

      if (newStatus === 'completed') {
        toast.success('Task completed! Great work!');
      }
      fetchTasks();
    } catch (err: unknown) {
      setTasks(prev);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const reorder = async (taskIds: string[]) => {
    const previousTasks = [...tasks];
    setTasks((prev) => {
      const taskMap = new Map(prev.map((t) => [t.id, t]));
      return taskIds.map((id) => taskMap.get(id)!).filter(Boolean);
    });

    try {
      await reorderTasks(user!.uid, taskIds, user?.csrfToken);
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to reorder tasks');
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        editTask,
        removeTask,
        toggleComplete,
        reorder,
        refreshTasks: fetchTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
