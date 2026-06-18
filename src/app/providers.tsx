'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/hooks/useToast';
import { TasksProvider } from '@/hooks/useTasks';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <TasksProvider>{children}</TasksProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
