'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  ChevronDown,
  Check,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn, formatRelativeTime } from '@/lib/utils';

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
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
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
                    className="absolute right-0 mt-2 w-80 glass-strong rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
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
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
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
                    className="absolute right-0 mt-2 w-56 glass-strong rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-700/50">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-2">
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
  );
}
