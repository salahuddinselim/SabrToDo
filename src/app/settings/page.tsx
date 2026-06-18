'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Check,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, Theme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailDigests, setEmailDigests] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPushNotifications(localStorage.getItem('sabrflow-push') === 'true');
      setEmailDigests(localStorage.getItem('sabrflow-digests') === 'true');
    }
  }, []);

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const togglePush = async () => {
    const nextVal = !pushNotifications;
    setPushNotifications(nextVal);
    localStorage.setItem('sabrflow-push', String(nextVal));
    
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showToast('Push notifications enabled!', 'success');
        } else {
          showToast('Notification permission denied', 'warning');
          setPushNotifications(false);
          localStorage.setItem('sabrflow-push', 'false');
        }
      } catch {
        showToast('Push notifications configured', 'success');
      }
    } else if (!nextVal) {
      showToast('Push notifications disabled', 'info');
    }
  };

  const toggleDigests = () => {
    const nextVal = !emailDigests;
    setEmailDigests(nextVal);
    localStorage.setItem('sabrflow-digests', String(nextVal));
    showToast(nextVal ? 'Daily email digest enabled' : 'Daily email digest disabled', 'info');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: 'easeOut' },
    }),
  };

  const themePresets = [
    {
      id: 'solar',
      name: 'Solar Eclipse',
      primaryColor: '#f97316',
      secondaryColor: '#f59e0b',
      bgColor: '#000000',
      description: 'Stunning premium Orange & Obsidian Black focus',
    },
    {
      id: 'amethyst',
      name: 'Amethyst Obsidian',
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      bgColor: '#090514',
      description: 'Serene deep obsidian with amethyst highlights',
    },
    {
      id: 'emerald',
      name: 'Emerald Midnight',
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      bgColor: '#020c06',
      description: 'Quiet dark forest with mint reflections',
    },
    {
      id: 'ocean',
      name: 'Ocean Flow',
      primaryColor: '#0ea5e9',
      secondaryColor: '#6366f1',
      bgColor: '#030712',
      description: 'Deep marine navy with royal blue flow',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />

      <main className="lg:ml-64 pt-16 min-h-screen relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-display font-extrabold text-white mb-6 tracking-tight">Settings</h1>

            <div className="space-y-6">
              
              {/* Profile Card */}
              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border border-white/[0.05]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle>UserProfile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-bold text-white">
                          {user?.displayName || 'Builder'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-slate-400 border border-white/[0.04] mt-2 font-medium">
                          Google Authenticated
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Theme Settings (Appearance Redesign) */}
              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border border-white/[0.05]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <CardTitle>Design Presets</CardTitle>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Select your focus environment</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {themePresets.map((preset) => {
                        const isSelected = theme === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => setTheme(preset.id as Theme)}
                            className={cn(
                              "relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] select-none",
                              isSelected 
                                ? "glass bg-white/[0.02] border-primary" 
                                : "bg-slate-950/20 border-white/[0.05] hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-xs font-bold text-white">{preset.name}</h3>
                                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                  {preset.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Colors Preview strip */}
                            <div className="flex items-center gap-1.5 mt-4">
                              <span 
                                className="w-3.5 h-3.5 rounded-full inline-block border border-white/10" 
                                style={{ backgroundColor: preset.primaryColor }}
                              />
                              <span 
                                className="w-3.5 h-3.5 rounded-full inline-block border border-white/10" 
                                style={{ backgroundColor: preset.secondaryColor }}
                              />
                              <span 
                                className="w-3.5 h-3.5 rounded-full inline-block border border-white/10" 
                                style={{ backgroundColor: preset.bgColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications */}
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border border-white/[0.05]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle>Notifications</CardTitle>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Control alert loops</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                      <div>
                        <p className="text-xs font-bold text-white">Browser Push Reminders</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Receive immediate screen alerts for task due dates</p>
                      </div>
                      <button
                        onClick={togglePush}
                        className={cn(
                          "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none",
                          pushNotifications ? "bg-primary" : "bg-slate-800"
                        )}
                      >
                        <div 
                          className={cn(
                            "w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200",
                            pushNotifications ? "translate-x-4.5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                      <div>
                        <p className="text-xs font-bold text-white">Daily Summary Digests</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Get a clean summary email of pending checklist tasks</p>
                      </div>
                      <button
                        onClick={toggleDigests}
                        className={cn(
                          "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none",
                          emailDigests ? "bg-primary" : "bg-slate-800"
                        )}
                      >
                        <div 
                          className={cn(
                            "w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200",
                            emailDigests ? "translate-x-4.5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security */}
              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border border-white/[0.05]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <CardTitle>Security</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Your workspace is protected with encrypted authentication tokens and Google OAuth configurations.
                    </p>
                    <div className="glass bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Google OAuth Service</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
