'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  ChevronDown,
  Check,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useTasks } from '@/hooks/useTasks';
import { cn, formatRelativeTime } from '@/lib/utils';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { TaskFormData } from '@/types';

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { addTask } = useTasks();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      showToast('Logged out successfully', 'success');
    } catch {
      showToast('Failed to logout', 'error');
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('Notifications cleared', 'info');
  };

  const handleCreateTask = async (data: TaskFormData) => {
    await addTask(data);
    showToast('Task created!', 'success');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-cyan-100/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3 text-slate-100">
              <Logo size="sm" className="rounded-xl shadow-lg shadow-primary/20" />
              <span className="text-xl font-display font-bold gradient-text hidden sm:block">
                SabrFlow
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowTaskForm(true)}
                className="hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Task
              </Button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-cyan-100/10">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={cn(
                                'flex items-start gap-3 p-4 hover:bg-slate-700/30 cursor-pointer transition-colors',
                                !notification.is_read && 'bg-slate-800/30'
                              )}
                            >
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {notification.message}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                  {formatRelativeTime(notification.created_at)}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-cyan-100/10">
                        <div className="flex items-center gap-3 mb-2">
                          {user?.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white truncate">
                              {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/settings"
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
                          onClick={() => setShowProfile(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
      />
    </>
  );
}
