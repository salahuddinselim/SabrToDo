'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  decoration?: ReactNode;
}

export function AppLayout({ children, maxWidth = 'max-w-6xl', decoration }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[56px] md:ml-[220px]">
        <Header />
        <main className="flex-1 relative overflow-y-auto">
          {decoration && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {decoration}
            </div>
          )}
          <div className={`${maxWidth} mx-auto px-4 sm:px-5 lg:px-7 pt-4 md:pt-5 pb-6 pb-safe relative z-10`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
