import { Search, ListChecks, Users, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from '@/types/onboarding';

interface Props {
  user: User;
  progress: number;
}

export function HeroSection({ user, progress }: Props) {
  const roleLabel = user.employeeRole === 'BA' ? 'Business Analyst' : user.employeeRole || 'Team Member';

  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-[gradient-shift_15s_ease_infinite] bg-[length:200%_200%]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-transparent to-orange-400/30" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/20 backdrop-blur-sm animate-[float_8s_ease-in-out_infinite]"
            style={{
              width: `${10 + (i % 5) * 8}px`,
              height: `${10 + (i % 5) * 8}px`,
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
        <div className="text-center text-white space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Welcome back, <span className="font-semibold">{user.name}!</span>
            <span className="opacity-80">({roleLabel})</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-pink-100 to-orange-100 bg-clip-text text-transparent">
            Your Onboarding,<br />Reimagined.
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            Everything you need to get started at Optum — people, policies, tools, and progress in one place.
          </p>

          {progress > 0 && progress < 100 && (
            <div className="max-w-md mx-auto bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Onboarding Progress</span>
                <span className="font-bold">{progress}% Complete 🎯</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <Input
              placeholder="Find departments, contacts, policies..."
              className="h-14 pl-12 pr-4 bg-white/15 backdrop-blur-md border-white/25 text-white placeholder:text-white/60 rounded-2xl text-base focus-visible:ring-white/50"
            />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full bg-white text-indigo-700 hover:bg-white/90 hover:scale-105 transition-transform shadow-lg">
              <Link to="/dashboard"><ListChecks className="w-4 h-4" />My Onboarding</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white/20 hover:scale-105 transition-transform">
              <a href="#org-chart"><Users className="w-4 h-4" />Team Directory</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white/20 hover:scale-105 transition-transform">
              <Link to="/help"><HelpCircle className="w-4 h-4" />Help Center</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
