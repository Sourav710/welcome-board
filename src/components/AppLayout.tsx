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

function NotificationBell() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${!n.read ? 'bg-primary/5' : ''}`}
              onClick={() => markRead(n.id)}
            >
              <n.icon className={`w-4 h-4 mt-0.5 shrink-0 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-tight ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppLayout({ children, user, onSwitchRole }: AppLayoutProps) {
  const location = useLocation();
  const nav = user.role === 'admin' ? adminNav : user.role === 'manager' ? managerNav : employeeNav;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 py-0 flex items-center justify-between sticky top-0 z-50 h-14" role="banner">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Checkmate Home">
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
          <NotificationBell />
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
