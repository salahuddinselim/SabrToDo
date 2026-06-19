'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const sectionLabels: Record<string, string> = {
  '/dashboard': 'Main',
  '/analytics': 'Main',
  '/settings': 'Account',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-full flex flex-col bg-surface border-r border-white/10',
        'w-[56px] md:w-[220px]'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center justify-center md:justify-start md:gap-3 px-0 md:px-5 pt-5 pb-4">
        <div className="w-8 h-8 rounded-[9px] bg-accent-blue flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="hidden md:block min-w-0">
          <p className="text-[15px] font-medium text-primary leading-tight">SabrFlow</p>
          <p className="text-[10px] text-placeholder leading-tight">by SabrWare</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center md:items-stretch px-0 md:px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const label = sectionLabels[item.href];

          return (
            <div key={item.href} className="flex flex-col w-full">
              {label && (
                <p className="hidden md:block px-[9px] pt-3 pb-1 text-[10px] font-medium text-placeholder uppercase tracking-[0.08em]">
                  {label}
                </p>
              )}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center justify-center md:justify-start md:gap-3 px-0 md:px-[9px] py-[12px] rounded-[10px] transition-all duration-150 relative min-tap',
                  active
                    ? 'bg-accent-blue/10 text-accent-blue font-medium'
                    : 'text-placeholder hover:text-primary hover:bg-bg-hover'
                )}
              >
                {active && (
                  <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-blue rounded-r-full" />
                )}
                <Icon className="w-[17px] h-[17px] shrink-0" />
                <span className="hidden md:block text-[13.5px]">{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex flex-col items-center md:items-stretch px-0 md:px-3 py-3 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center justify-center md:justify-start md:gap-3 px-0 md:px-[9px] py-[10px] rounded-[10px] hover:bg-bg-hover transition-colors min-tap"
        >
          {user?.photoURL && !avatarError ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-accent-blue/20"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="hidden md:block min-w-0">
            <p className="text-[13.5px] font-medium text-primary truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-placeholder truncate">Member</p>
          </div>
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center justify-center md:justify-start md:gap-3 px-0 md:px-[9px] py-[10px] rounded-[10px] text-placeholder hover:text-accent-red hover:bg-bg-hover transition-colors min-tap mt-1"
          title="Sign out"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          <span className="hidden md:block text-[13px]">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
