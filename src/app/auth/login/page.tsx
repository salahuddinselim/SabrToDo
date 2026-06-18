'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signInGoogle, loading, user } = useAuth();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const container = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.35, ease: 'easeOut' },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative"
      >
        <motion.div variants={item}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        </motion.div>

        <motion.div variants={item} className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            <Logo size="lg" className="mx-auto mb-4 shadow-lg shadow-primary/20 rounded-2xl" />
            <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
            <p className="text-slate-300 mt-2">Sign in to continue your workflow</p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={signInGoogle}
            loading={loading}
            className="w-full"
            size="lg"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
