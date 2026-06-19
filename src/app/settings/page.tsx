'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Bell,
  Shield,
  Check,
  Monitor,
  Laptop,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { playAlarm, isAlarmEnabled, setAlarmEnabled } from '@/lib/alarm';
import { getSettings, updateSettings, createOrUpdateUser } from '@/lib/db';
import { useTheme } from '@/hooks/useTheme';

type Section = 'profile' | 'themes' | 'notifications' | 'security';

const SETTINGS_KEY = 'todo-app-settings';

const themes = [
  { id: 'ocean', name: 'Ocean Midnight', desc: 'Calm deep-sea focus', swatches: ['#0d0f14', '#6c8fff', '#3ecf8e'] },
  { id: 'solar', name: 'Solar Eclipse', desc: 'Warm intense energy', swatches: ['#1a0a00', '#fbbf24', '#f87171'] },
  { id: 'amethyst', name: 'Amethyst Obsidian', desc: 'Creative deep flow', swatches: ['#0a0514', '#a78bfa', '#c084fc'] },
  { id: 'emerald', name: 'Emerald Midnight', desc: 'Balanced natural calm', swatches: ['#021a0f', '#3ecf8e', '#6ee7b7'] },
];

interface SavedSettings {
  displayName: string;
  dailyGoal: number;
  selectedTheme: string;
  notifStates: Record<string, boolean>;
  secStates: Record<string, boolean>;
}

const defaultSettings: SavedSettings = {
  displayName: '',
  dailyGoal: 5,
  selectedTheme: 'ocean',
  notifStates: { push: true, alarm: true, digest: false, overdue: true, goal: true, report: false },
  secStates: { timeout: true, login: true, audit: false },
};

function loadSettings(): SavedSettings {
  if (typeof window === 'undefined') return { ...defaultSettings };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}

function saveSettings(s: SavedSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

const notifSettings = [
  { id: 'push', label: 'Push alerts', desc: 'Receive real-time browser notifications for task updates' },
  { id: 'alarm', label: 'Alarm sound', desc: 'Play an audible alarm for high-priority and overdue tasks' },
  { id: 'digest', label: 'Daily digest', desc: 'Get a summary of your tasks and progress every morning' },
  { id: 'overdue', label: 'Overdue reminders', desc: 'Gentle nudges when tasks are past their due date' },
  { id: 'goal', label: 'Goal celebration', desc: 'A little boost when you hit your daily completion target' },
  { id: 'report', label: 'Weekly report', desc: 'Receive a detailed report every Monday morning' },
];

const securitySettings = [
  { id: 'timeout', label: 'Session timeout', desc: 'Automatically sign out after 30 minutes of inactivity' },
  { id: 'login', label: 'Login notifications', desc: 'Get notified when a new device signs into your account' },
  { id: 'audit', label: 'Audit log', desc: 'Keep a record of all account activity and changes' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { themeId, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [displayName, setDisplayName] = useState('');
  const [dailyGoal, setDailyGoal] = useState(5);
  const [selectedTheme, setSelectedTheme] = useState(themeId);
  const [notifStates, setNotifStates] = useState<Record<string, boolean>>(defaultSettings.notifStates);
  const [secStates, setSecStates] = useState<Record<string, boolean>>(defaultSettings.secStates);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Sync selectedTheme to ThemeProvider when it changes locally
  useEffect(() => {
    if (settingsLoaded && selectedTheme !== themeId) {
      setTheme(selectedTheme);
    }
  }, [selectedTheme, settingsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch settings from server on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await getSettings(user.csrfToken);
        setDailyGoal(s.daily_goal);
        setSelectedTheme(s.selected_theme || themeId);
        setNotifStates(s.notif_states);
        setSecStates(s.sec_states);
      } catch {
        // fallback to cached localStorage
        const cached = loadSettings();
        setDailyGoal(cached.dailyGoal);
        setSelectedTheme(cached.selectedTheme || themeId);
        setNotifStates(cached.notifStates);
        setSecStates(cached.secStates);
      }
      setSettingsLoaded(true);
    })();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hydrate displayName from user
  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  // Persist to localStorage as cache
  const cacheLocally = useCallback(() => {
    saveSettings({ displayName, dailyGoal, selectedTheme, notifStates, secStates });
  }, [displayName, dailyGoal, selectedTheme, notifStates, secStates]);

  useEffect(() => {
    if (settingsLoaded) cacheLocally();
  }, [cacheLocally, settingsLoaded]);

  // Sync non-theme state to server
  const syncToServer = useCallback(async (overrides?: {
    dailyGoal?: number;
    notifStates?: Record<string, boolean>;
    secStates?: Record<string, boolean>;
  }) => {
    if (!user) return;
    try {
      await updateSettings({
        daily_goal: overrides?.dailyGoal ?? dailyGoal,
        selected_theme: selectedTheme,
        notif_states: overrides?.notifStates ?? notifStates,
        sec_states: overrides?.secStates ?? secStates,
      }, user.csrfToken);
    } catch {
      // silently fail — local state is already updated
    }
  }, [user, dailyGoal, selectedTheme, notifStates, secStates]);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setNotifStates((prev) => ({ ...prev, push: true }));
      })
    );
  }, []);

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const toggleNotif = async (id: string) => {
    const next = !notifStates[id];
    const newNotifStates = { ...notifStates, [id]: next };
    setNotifStates(newNotifStates);

    if (id === 'push') {
      if (next) {
        const sub = await subscribeToPush();
        if (sub && sub.endpoint) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub }),
          });
          toast.success('Push notifications enabled');
        } else {
          const reverted = { ...newNotifStates, push: false };
          setNotifStates(reverted);
          await syncToServer({ notifStates: reverted });
          toast.warning('Push permission denied');
        }
      } else {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing?.endpoint) {
          await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(existing.endpoint)}`, { method: 'DELETE' });
        }
        await unsubscribeFromPush();
        await syncToServer({ notifStates: newNotifStates });
        toast.info('Push notifications disabled');
      }
      return;
    }

    if (id === 'alarm') {
      setAlarmEnabled(next);
      if (next) playAlarm();
      await syncToServer({ notifStates: newNotifStates });
      toast.success(next ? 'Alarm sound enabled' : 'Alarm sound disabled');
      return;
    }

    await syncToServer({ notifStates: newNotifStates });
    toast.success('Notification preference updated');
  };

  const toggleSec = async (id: string) => {
    const next = !secStates[id];
    const newSecStates = { ...secStates, [id]: next };
    setSecStates(newSecStates);
    await syncToServer({ secStates: newSecStates });
    toast.success('Security setting updated');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await Promise.all([
        syncToServer(),
        createOrUpdateUser(user.uid, user.email || '', displayName || user.displayName || undefined, user.csrfToken),
      ]);
      cacheLocally();
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save to server');
    }
  };

  const handleDeleteAll = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    toast.info('Feature coming soon — delete individually for now');
    setConfirmDelete(false);
  };

  const navItems: { id: Section; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        'w-[38px] h-[22px] rounded-[11px] p-[3px] transition-colors duration-200 shrink-0 outline-none',
        checked ? 'bg-accent-blue' : 'bg-raised'
      )}
    >
      <div
        className={cn(
          'w-[14px] h-[14px] bg-white rounded-full transition-transform duration-200',
          checked ? 'translate-x-[18px]' : 'translate-x-0'
        )}
      />
    </button>
  );

  return (
    <AppLayout
      decoration={
        <>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-accent-purple/5 rounded-full blur-3xl" />
        </>
      }
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">

        {/* Side Nav */}
        <nav className="md:w-[210px] shrink-0 md:sticky md:top-[82px] md:self-start">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex items-center gap-[9px] px-3 py-[9px] rounded-[10px] text-[13px] transition-all duration-150 shrink-0',
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue font-medium'
                      : 'text-ink-muted hover:text-primary hover:bg-bg-hover'
                  )}
                >
                  <Icon className="w-[17px] h-[17px] shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">

          {/* Profile Panel */}
          {activeSection === 'profile' && (
            <div className="flex flex-col gap-4">
              {/* Profile Card */}
              <div className="bg-surface border border-white/10 rounded-[14px] md:rounded-[18px] overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 md:px-5 pt-4 pb-3.5 border-b border-white/10">
                  <div className="w-[30px] h-[30px] rounded-[8px] bg-accent-blue/15 flex items-center justify-center">
                    <User className="w-[15px] h-[15px] text-accent-blue" />
                  </div>
                  <h2 className="text-[14px] font-medium text-primary">Profile</h2>
                </div>
                <div className="p-3.5 md:p-5 space-y-4 md:space-y-5">
                  {/* Avatar row */}
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
                      <span className="text-white font-medium text-lg">
                        {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'B'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-primary truncate">
                        {user?.displayName || 'Builder'}
                      </p>
                      <p className="text-[12px] text-ink-dim truncate">{user?.email}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                        <span className="text-[11px] text-accent-green font-medium">Google connected</span>
                      </div>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] text-ink-dim block mb-1">Display name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-raised border border-white/10 rounded-[9px] px-3 py-2 text-[13px] text-primary outline-none transition-colors duration-150 focus:border-accent-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-ink-dim block mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-raised/50 border border-white/10 rounded-[9px] px-3 py-2 text-[13px] text-ink-dim outline-none opacity-45 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-ink-dim block mb-1">Daily goal</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                        className="w-24 bg-raised border border-white/10 rounded-[9px] px-3 py-2 text-[13px] text-primary outline-none transition-colors duration-150 focus:border-accent-blue"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 bg-accent-blue text-white text-[13px] font-medium rounded-[9px] px-4 py-2 transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
                  >
                    <Check className="w-4 h-4" />
                    Save changes
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-surface border border-white/10 rounded-[14px] md:rounded-[18px] overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 md:px-5 pt-4 pb-3.5 border-b border-white/10">
                  <div className="w-[30px] h-[30px] rounded-[8px] bg-accent-red/15 flex items-center justify-center">
                    <Trash2 className="w-[15px] h-[15px] text-accent-red" />
                  </div>
                  <h2 className="text-[14px] font-medium text-accent-red">Danger zone</h2>
                </div>
                <div className="p-3.5 md:p-5">
                  <div className="border border-accent-red/25 rounded-[14px] p-4 bg-accent-red/5">
                    <p className="text-[13px] font-medium text-accent-red">Delete all tasks</p>
                    <p className="text-[12px] text-ink-dim mt-1">
                      Permanently remove every task from your workspace. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAll}
                      className={cn(
                        'mt-3 text-[12px] font-medium rounded-[9px] px-4 py-2 transition-all duration-150 active:scale-[0.97]',
                        confirmDelete
                          ? 'bg-accent-red text-white'
                          : 'border border-accent-red/40 text-accent-red hover:bg-accent-red/10'
                      )}
                    >
                      {confirmDelete ? 'Click to confirm' : 'Delete all tasks'}
                    </button>
                    {confirmDelete && (
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="ml-2 text-[12px] text-ink-dim hover:text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Themes Panel */}
          {activeSection === 'themes' && (
            <div className="bg-surface border border-white/10 rounded-[14px] md:rounded-[18px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 md:px-5 pt-4 pb-3.5 border-b border-white/10">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-accent-purple/15 flex items-center justify-center">
                  <Palette className="w-[15px] h-[15px] text-accent-purple" />
                </div>
                <h2 className="text-[14px] font-medium text-primary">Theme presets</h2>
              </div>
              <div className="p-3.5 md:p-5">
                <div className="grid grid-cols-2 gap-2.5">
                  {themes.map((theme) => {
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={cn(
                          'relative rounded-[10px] p-3.5 border-2 transition-all duration-150 text-left',
                          isSelected
                            ? 'border-accent-blue'
                            : 'border-transparent'
                        )}
                        style={{ background: theme.swatches[0] }}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-accent-blue">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mb-2">
                          {theme.swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-[18px] h-[18px] rounded-[4px] border border-white/10"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                        <p className="text-[12px] font-medium text-white">{theme.name}</p>
                        <p className="text-[10px] text-white/60 mt-0.5">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {activeSection === 'notifications' && (
            <div className="bg-surface border border-white/10 rounded-[14px] md:rounded-[18px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 md:px-5 pt-4 pb-3.5 border-b border-white/10">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-accent-yellow/15 flex items-center justify-center">
                  <Bell className="w-[15px] h-[15px] text-accent-yellow" />
                </div>
                <h2 className="text-[14px] font-medium text-primary">Notifications</h2>
              </div>
              <div className="p-3.5 md:p-5 space-y-0">
                {notifSettings.map((setting, i) => (
                  <div
                    key={setting.id}
                    className={cn(
                      'flex items-center justify-between py-3.5',
                      i < notifSettings.length - 1 && 'border-b border-white/10'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[13px] text-primary">{setting.label}</p>
                      <p className="text-[11px] text-ink-dim mt-0.5">{setting.desc}</p>
                    </div>
                    <Switch
                      checked={notifStates[setting.id]}
                      onChange={() => toggleNotif(setting.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Panel */}
          {activeSection === 'security' && (
            <div className="bg-surface border border-white/10 rounded-[14px] md:rounded-[18px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 md:px-5 pt-4 pb-3.5 border-b border-white/10">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-accent-green/15 flex items-center justify-center">
                  <Shield className="w-[15px] h-[15px] text-accent-green" />
                </div>
                <h2 className="text-[14px] font-medium text-primary">Security</h2>
              </div>
              <div className="p-3.5 md:p-5 space-y-4 md:space-y-5">
                {/* Status bar */}
                <div className="bg-accent-green/5 border border-accent-green/15 rounded-[12px] p-4">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-[17px] h-[17px] text-accent-green shrink-0" />
                    <p className="text-[13px] text-accent-green font-medium">Workspace is secure</p>
                  </div>
                  <p className="text-[11px] text-ink-dim mt-1.5">Google OAuth active &middot; Session tokens encrypted</p>
                </div>

                {/* Toggles */}
                {securitySettings.map((setting, i) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[13px] text-primary">{setting.label}</p>
                      <p className="text-[11px] text-ink-dim mt-0.5">{setting.desc}</p>
                    </div>
                    <Switch
                      checked={secStates[setting.id]}
                      onChange={() => toggleSec(setting.id)}
                    />
                  </div>
                ))}

                {/* Active sessions */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[12px] text-ink-dim mb-3">Active sessions</p>
                  <div className="flex items-center gap-3 p-3.5 bg-raised rounded-[10px]">
                    <Laptop className="w-[17px] h-[17px] text-ink-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-primary">Chrome &mdash; Dhaka, BD</p>
                      <p className="text-[11px] text-ink-dim mt-0.5">Just now</p>
                    </div>
                    <span className="text-[11px] font-medium text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>

                <button
                  onClick={async () => { await syncToServer(); toast.success('Settings saved'); }}
                  className="flex items-center gap-1.5 bg-accent-blue text-white text-[13px] font-medium rounded-[9px] px-4 py-2 transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
                >
                  <Check className="w-4 h-4" />
                  Save changes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
