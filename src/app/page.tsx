import Link from 'next/link';
import { ArrowRight, CheckCircle, Bell, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold gradient-text">SabrFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl gradient-bg text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-slate-300">Now with real-time notifications</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Where patience meets{' '}
              <span className="gradient-text">productivity</span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              SabrFlow is a serene workspace that helps you manage tasks with calm focus.
              No clutter, no noise—just flow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl glass text-slate-300 font-semibold text-lg hover:bg-slate-800/50 transition-all"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Trusted by 10,000+ productive people
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
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
                  className="glass rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to find your flow?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of users who have transformed their productivity with SabrFlow.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-slate-300">SabrFlow by SabrWare</span>
              </div>
              <p className="text-sm text-slate-500">
                © 2024 SabrWare. Built with patience and passion.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
