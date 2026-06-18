'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
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
  const { showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
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

  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user?.uid, fetchTasks]);

  const addTask = async (data: TaskFormData) => {
    if (!user?.uid) return;

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
      setTasks((prev) => [newTask, ...prev]);
      showToast('Task created successfully!', 'success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const editTask = async (id: string, data: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(id, data, user?.csrfToken);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      showToast('Task updated!', 'success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteTask(id, user?.csrfToken);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      showToast('Task deleted', 'info');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    try {
      const updatedTask = await updateTask(id, {
        status: newStatus,
        completed_at: completedAt || undefined,
      }, user?.csrfToken);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));

      if (newStatus === 'completed') {
        showToast('Task completed! Great work!', 'success');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
      showToast('Failed to reorder tasks', 'error');
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
