import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/ThemeToggle';
import { projects, locations, managers, adminUser, currentUser, managerUser, teamMembers } from '@/data/mockData';
import { useAuditLog } from '@/context/AuditLogContext';
import type { EmployeeRole, UserRole } from '@/types/onboarding';
import { Shield, ChevronRight, CalendarIcon, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const employeeRoles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];

const steps = ['Role', 'Details', 'Manager'];

const validCredentials = [
  // Employee login
  { userId: 'SJHA001', password: 'password123', role: 'employee' as UserRole, user: currentUser },
  { userId: 'SJHA002', password: 'password123', role: 'employee' as UserRole, user: teamMembers[1] },
  { userId: 'SJHA003', password: 'password123', role: 'employee' as UserRole, user: teamMembers[2] },
  { userId: 'SJHA004', password: 'password123', role: 'employee' as UserRole, user: teamMembers[3] },
  // Manager login
  { userId: 'MGR001', password: 'manager123', role: 'manager' as UserRole, user: managerUser },
  // Admin login
  { userId: 'ADMIN', password: 'admin123', role: 'admin' as UserRole, user: adminUser },
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout

export default function LoginPage() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [showSetup, setShowSetup] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [setupStep, setSetupStep] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2026-02-16'));

  // Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockCountdown(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        setLoginError('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isLocked) {
      setLoginError(`Account locked. Try again in ${lockCountdown}s.`);
      return;
    }

    const validUser = validCredentials.find(
      (cred) => cred.userId.toLowerCase() === userId.toLowerCase() && cred.password === password
    );

    if (!validUser) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      addLog({
        userId: userId || 'unknown',
        userName: userId || 'Unknown',
        userRole: 'unknown',
        action: 'LOGIN_FAILED',
        category: 'auth',
        details: `Failed login attempt ${attempts}/${MAX_ATTEMPTS} for user ID "${userId}"`,
      });

      if (attempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(lockTime);
        setLockCountdown(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setLoginError(`Account locked after ${MAX_ATTEMPTS} failed attempts. Try again in 60s.`);
      } else {
        setLoginError(`Invalid credentials. ${MAX_ATTEMPTS - attempts} attempts remaining.`);
      }
      return;
    }

    // Successful login
    setFailedAttempts(0);
    localStorage.setItem('loggedInUser', JSON.stringify(validUser.user));
    localStorage.setItem('loggedInRole', validUser.role);
    addLog({
      userId: validUser.user.id,
      userName: validUser.user.name,
      userRole: validUser.role,
      action: 'LOGIN',
      category: 'auth',
      details: `${validUser.user.name} logged in as ${validUser.role}`,
    });

    if (validUser.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (validUser.role === 'manager') {
      navigate('/manager');
      return;
    }
    if (validUser.user.profileComplete) {
      navigate('/dashboard');
      return;
    }
    setShowSetup(true);
    setSetupStep(0);
  };

  const handleSetupComplete = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const nextStep = () => setSetupStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setSetupStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
              <span className="text-primary-foreground text-2xl">♚</span>
            </div>
            <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
              Check<span className="text-primary">mate</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Checkmate Onboarding Chaos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. SJHA001, ADMIN, MGR001" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-10" />
            </div>
            {loginError && (
              <div className={`text-sm text-center p-2.5 rounded-lg ${isLocked ? 'bg-destructive/10 text-destructive' : 'text-destructive'}`}>
                {isLocked && <Lock className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                {loginError}
              </div>
            )}
            <Button type="submit" className="w-full h-10" disabled={isLocked}>
              {isLocked ? `Locked (${lockCountdown}s)` : 'Log in'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <Button variant="outline" className="w-full h-10 gap-2 text-muted-foreground" disabled>
            <Shield className="w-4 h-4" /> SSO Login (Coming Soon)
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4 hover:underline cursor-pointer">
            Need help logging in?
          </p>
        </div>
      </div>

      {/* Setup Wizard */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up your profile</DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  i <= setupStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${i <= setupStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSetupComplete} className="space-y-4">
            {setupStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Employee Role</Label>
                  <Select defaultValue="Developer">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employeeRoles.map((r) => (
                        <SelectItem key={r} value={r}>{r === 'BA' ? 'Business Analyst' : r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" className="w-full" onClick={nextStep}>Continue</Button>
              </div>
            )}

            {setupStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Project</Label>
                  <Select defaultValue={projects[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Select defaultValue={locations[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>Back</Button>
                  <Button type="button" className="flex-1" onClick={nextStep}>Continue</Button>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Manager</Label>
                  <Select defaultValue={managers[0].id}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {managers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>Back</Button>
                  <Button type="submit" className="flex-1">Complete Setup</Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
