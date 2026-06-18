'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/hooks/useToast';
import { TasksProvider } from '@/hooks/useTasks';
import { ThemeProvider } from '@/hooks/useTheme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <TasksProvider>{children}</TasksProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
