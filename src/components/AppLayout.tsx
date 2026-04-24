import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types/onboarding';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  onSwitchRole?: () => void;
}

const employeeNav = [
  { label: 'Home', path: '/home' },
  { label: 'My Onboarding', path: '/dashboard' },
  { label: 'My Requests', path: '/requests' },
  { label: 'Engagement', path: '/engagement' },
  { label: 'Help Center', path: '/help' },
];

const managerNav = [
  { label: 'Home', path: '/home' },
  { label: 'Team Onboarding', path: '/manager' },
  { label: 'My Onboarding', path: '/dashboard' },
  { label: 'Engagement', path: '/engagement' },
];

const adminNav = [
  { label: 'Home', path: '/home' },
  { label: 'Team Onboarding', path: '/manager' },
  { label: 'Admin Templates', path: '/admin' },
  { label: 'Engagement', path: '/engagement' },
];

export function AppLayout({ children, user, onSwitchRole }: AppLayoutProps) {
  const location = useLocation();
  const nav = user.role === 'admin' ? adminNav : user.role === 'manager' ? managerNav : employeeNav;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 py-0 flex items-center justify-between sticky top-0 z-50 h-14" role="banner">
        <div className="flex items-center gap-8">
          <Link to="/home" className="flex items-center gap-2" aria-label="Checkmate Home">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold" aria-hidden="true">♚</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground uppercase">
              Check<span className="text-primary font-bold">mate</span>
            </span>
          </Link>
          <nav className="flex gap-0.5" aria-label="Main navigation">
            {nav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/help" aria-label="Help Center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="text-xs border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Switch user role"
            >
              Switch Role
            </button>
          )}
          <div className="h-6 w-px bg-border mx-1" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary" aria-hidden="true">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-sm hidden md:block">
              <div className="font-medium leading-none text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
          <Link to="/login" aria-label="Log out">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1" role="main">{children}</main>
    </div>
  );
}
