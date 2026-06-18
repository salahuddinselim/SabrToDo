import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SabrFlow - Task Management by SabrWare',
  description: 'Calm productivity, mindful completion. A serene workspace where tasks flow naturally.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full bg-background text-white`}>
      <body className="min-h-screen h-full antialiased bg-background text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
