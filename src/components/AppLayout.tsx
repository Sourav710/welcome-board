import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types/onboarding';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bell, HelpCircle, LogOut, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const sampleNotifications = [
  { id: '1', icon: ShieldAlert, title: 'VPN Access pending approval', time: '2 hours ago', read: false },
  { id: '2', icon: CheckCircle2, title: 'Jira Access granted', time: '1 day ago', read: false },
  { id: '3', icon: Clock, title: 'HR Orientation due tomorrow', time: '1 day ago', read: true },
  { id: '4', icon: CheckCircle2, title: 'Confluence Access granted', time: '2 days ago', read: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  onSwitchRole?: () => void;
}

const employeeNav = [
  { label: 'My Onboarding', path: '/dashboard' },
  { label: 'My Requests', path: '/requests' },
  { label: 'Help Center', path: '/help' },
];

const managerNav = [
  { label: 'Team Onboarding', path: '/manager' },
  { label: 'My Onboarding', path: '/dashboard' },
];

const adminNav = [
  { label: 'Team Onboarding', path: '/manager' },
  { label: 'Admin Templates', path: '/admin' },
];

export function AppLayout({ children, user, onSwitchRole }: AppLayoutProps) {
  const location = useLocation();
  const nav = user.role === 'admin' ? adminNav : user.role === 'manager' ? managerNav : employeeNav;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 py-0 flex items-center justify-between sticky top-0 z-50 h-14">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">♚</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground uppercase">
              Check<span className="text-primary font-bold">mate</span>
            </span>
          </Link>
          <nav className="flex gap-0.5">
            {nav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
          </Button>
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="text-xs border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Switch Role
            </button>
          )}
          <div className="h-6 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-sm hidden md:block">
              <div className="font-medium leading-none text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
