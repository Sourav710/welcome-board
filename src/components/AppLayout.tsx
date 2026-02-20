import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types/onboarding';

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
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
            Onboard<span className="text-muted-foreground font-normal">Hub</span>
          </Link>
          <nav className="flex gap-1">
            {nav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="text-xs border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Switch Role
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-sm">
              <div className="font-medium leading-none">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
