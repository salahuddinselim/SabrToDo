import Link from 'next/link';
import { ArrowRight, CheckCircle, Bell, Shield, Zap, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="rounded-xl shadow-lg shadow-accent-blue/20" />
              <span className="text-xl font-display font-bold gradient-text">SabrFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-accent-blue/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
              <Sparkles className="w-4 h-4 text-accent-purple" />
              <span className="text-sm text-primary">A calm, modern workspace for focus</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-primary mb-6 leading-tight animate-slide-up">
              Build momentum without{' '}
              <span className="gradient-text">productivity</span>
              <br className="hidden sm:block" /> burnout.
            </h1>

            <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
              Plan work with clarity, execute with discipline, and keep your week visible in one place.
              SabrFlow is designed for consistent, low-friction progress.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg hover:shadow-xl hover:shadow-accent-blue/25 transition-all"
              >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl glass text-primary font-semibold text-lg hover:bg-bg-hover transition-all"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-6 text-sm text-placeholder">
              Used by focused builders, students, and small teams
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: CheckCircle,
                  title: 'Smart Task Management',
                  description: 'Create, organize, and complete tasks with intuitive controls',
                },
                {
                  icon: Bell,
                  title: 'Timely Notifications',
                  description: 'Never miss a deadline with smart reminders',
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'Your data is protected with Firebase authentication',
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Built on Next.js for blazing performance',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass rounded-3xl p-6 hover:shadow-xl hover:shadow-accent-blue/25 transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-placeholder text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ready to find your flow?
            </h2>
            <p className="text-secondary mb-8">
              Build better execution habits with a workspace that stays clean as your workload grows.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg hover:shadow-xl hover:shadow-accent-blue/25 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo size="sm" className="w-8 h-8 rounded-lg shadow-md" />
                <span className="font-semibold text-primary">SabrFlow by SabrWare</span>
              </div>
              <p className="text-sm text-placeholder">
                © 2026 SabrWare. Built with patience and precision.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
