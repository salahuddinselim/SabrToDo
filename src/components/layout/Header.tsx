'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  HelpCircle,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn, formatRelativeTime, sanitize } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const title = pageTitles[pathname] || 'SabrFlow';

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return <Clock className="w-4 h-4 text-accent-yellow" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-accent-red" />;
      case 'completed':
        return <Check className="w-4 h-4 text-accent-green" />;
      default:
        return <Bell className="w-4 h-4 text-accent-blue" />;
    }
  };

  return (
    <header className="relative z-20 bg-surface border-b border-white/10 shrink-0">
      <div className="flex items-center justify-between h-14 px-4 md:px-5 lg:px-7">
        {/* Page title */}
        <h1 className="text-[16px] font-medium text-primary">{title}</h1>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search — hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9 pr-3 py-1.5 text-[13px] bg-raised border-0 rounded-[9px] placeholder:text-placeholder"
            />
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-[34px] h-[34px] md:w-auto md:h-auto md:min-tap flex items-center justify-center rounded-[9px] bg-raised text-placeholder hover:text-primary transition-colors"
            >
              <Bell className="w-[17px] h-[17px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-blue ring-2 ring-surface" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 glass-strong rounded-xl shadow-2xl shadow-accent-blue/20 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-[14px] font-medium text-primary">Notifications</h3>
                    {notifications.length > 0 && (
                      <button className="text-[12px] text-placeholder hover:text-primary transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-placeholder mx-auto mb-2" />
                        <p className="text-placeholder text-[13.5px]">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'flex items-start gap-3 p-4 hover:bg-bg-hover cursor-pointer transition-colors',
                            !notification.is_read && 'bg-accent-blue/5'
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] text-primary font-medium">
                              {sanitize(notification.title)}
                            </p>
                            {notification.message && (
                              <p className="text-[12px] text-placeholder mt-0.5">
                                {sanitize(notification.message)}
                              </p>
                            )}
                            <p className="text-[12px] text-placeholder mt-1">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-accent-blue shrink-0 mt-2" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help icon */}
          <button className="w-[34px] h-[34px] md:w-auto md:h-auto md:min-tap flex items-center justify-center rounded-[9px] bg-raised text-placeholder hover:text-primary transition-colors">
            <HelpCircle className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
