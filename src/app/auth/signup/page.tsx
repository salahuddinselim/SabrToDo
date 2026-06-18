'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Chrome, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { signInGoogle, loading, user } = useAuth();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-slate-400 mt-2">Start your productivity journey with SabrFlow</p>
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
            Sign up with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">Secure & simple</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              'One-click sign in with your Google account',
              'Your data is encrypted and protected',
              'Free forever for personal use',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-slate-400">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
