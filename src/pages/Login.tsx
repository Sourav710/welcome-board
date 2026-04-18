import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/ThemeToggle';
import { projects, locations, managers, adminUser, currentUser, managerUser, teamMembers } from '@/data/mockData';
import { useAuditLog } from '@/context/AuditLogContext';
import { toast } from '@/hooks/use-toast';
import type { EmployeeRole, UserRole, User } from '@/types/onboarding';
import { Shield, ChevronRight, CalendarIcon, Lock, Sparkles, Users, Rocket, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const employeeRoles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];
const steps = ['Role', 'Details', 'Manager'];

const validCredentials = [
  { userId: 'SJHA001', password: 'password123', role: 'employee' as UserRole, user: currentUser },
  { userId: 'SJHA002', password: 'password123', role: 'employee' as UserRole, user: teamMembers[1] },
  { userId: 'SJHA003', password: 'password123', role: 'employee' as UserRole, user: teamMembers[2] },
  { userId: 'SJHA004', password: 'password123', role: 'employee' as UserRole, user: teamMembers[3] },
  { userId: 'MGR001', password: 'manager123', role: 'manager' as UserRole, user: managerUser },
  { userId: 'ADMIN', password: 'admin123', role: 'admin' as UserRole, user: adminUser },
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

const testimonials = [
  { quote: 'Joined 2,500+ new hires this year', icon: Users },
  { quote: 'Onboarding completed 60% faster', icon: Rocket },
  { quote: 'Trusted by enterprise teams worldwide', icon: Sparkles },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [showSetup, setShowSetup] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [setupStep, setSetupStep] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2026-02-16'));
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(t);
  }, []);

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

    if (validUser.role === 'admin') return navigate('/admin');
    if (validUser.role === 'manager') return navigate('/manager');
    if (validUser.user.profileComplete) return navigate('/home');
    setIsRegistration(false);
    setShowSetup(true);
    setSetupStep(0);
  };

  const handleSimulatedSSO = () => {
    if (isLocked) return;
    const ssoUser = currentUser;
    localStorage.setItem('loggedInUser', JSON.stringify(ssoUser));
    localStorage.setItem('loggedInRole', 'employee');
    addLog({
      userId: ssoUser.id,
      userName: ssoUser.name,
      userRole: 'employee',
      action: 'LOGIN',
      category: 'auth',
      details: `${ssoUser.name} logged in via simulated SSO`,
    });
    toast({ title: 'SSO sign-in successful', description: 'Welcome back via Corporate SSO (simulated).' });
    navigate('/home');
  };

  const handleStartRegistration = () => {
    setIsRegistration(true);
    setSetupStep(0);
    setShowSetup(true);
  };

  const handleSetupComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistration) {
      const newUser: User = {
        ...currentUser,
        id: `u-new-${Date.now()}`,
        name: 'New Hire',
        email: 'newhire@optum.com',
        profileComplete: true,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : currentUser.startDate,
      };
      localStorage.setItem('loggedInUser', JSON.stringify(newUser));
      localStorage.setItem('loggedInRole', 'employee');
      addLog({
        userId: newUser.id,
        userName: newUser.name,
        userRole: 'employee',
        action: 'PROFILE_CREATED',
        category: 'auth',
        details: `New profile created via registration flow`,
      });
      toast({ title: 'Profile created', description: 'Welcome to Checkmate!' });
    }
    navigate('/home');
  };

  const nextStep = () => setSetupStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setSetupStep((s) => Math.max(s - 1, 0));

  const ActiveTestimonialIcon = testimonials[testimonialIdx].icon;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* LEFT — vibrant gradient panel */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(220 90% 56%) 0%, hsl(265 85% 60%) 50%, hsl(20 95% 60%) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md rotate-12 border border-white/20" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl transition-transform hover:scale-110 hover:rotate-6">
              <span className="text-3xl">♚</span>
            </div>
            <span className="text-xl font-bold tracking-wide uppercase">
              Check<span className="text-orange-200">mate</span>
            </span>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Welcome to Your<br />Onboarding Journey
            </h2>
            <p className="text-white/80 text-lg">
              A modern workspace to get you ramped up faster — checklists, access, and team context, all in one place.
            </p>

            <div
              key={testimonialIdx}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <ActiveTestimonialIcon className="w-5 h-5" />
              </div>
              <p className="font-medium">{testimonials[testimonialIdx].quote}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === testimonialIdx ? 'w-8 bg-white' : 'w-2 bg-white/40'
                )}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — login card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-3">
              <span className="text-primary-foreground text-2xl">♚</span>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              Check<span className="text-primary">mate</span>
            </h1>
          </div>

          <div className="bg-card border rounded-2xl p-7 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Sign In to Your Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Access your onboarding workspace</p>
            </div>

            {/* Primary: SSO */}
            <Button
              type="button"
              onClick={handleSimulatedSSO}
              disabled={isLocked}
              className="w-full h-12 text-base font-semibold text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              style={{
                background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(245 85% 60%))',
              }}
            >
              <Shield className="w-5 h-5" />
              Sign in with Company SSO
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Use your corporate credentials (simulated)
            </p>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
            </div>

            {/* Standard login */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="userId">Corporate ID</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. SJHA001, ADMIN, MGR001" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-10" />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                  Remember me
                </label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className={`text-sm text-center p-2.5 rounded-lg ${isLocked ? 'bg-destructive/10 text-destructive' : 'text-destructive'}`}>
                  {isLocked && <Lock className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                  {loginError}
                </div>
              )}

              <Button type="submit" variant="outline" className="w-full h-10" disabled={isLocked}>
                {isLocked ? `Locked (${lockCountdown}s)` : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
            </div>

            {/* Registration */}
            <Button
              type="button"
              onClick={handleStartRegistration}
              className="w-full h-12 text-base font-semibold text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              style={{
                background: 'linear-gradient(135deg, hsl(150 70% 45%), hsl(170 75% 42%))',
              }}
            >
              <UserPlus className="w-5 h-5" />
              First time here? Create Your Profile
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4 hover:underline cursor-pointer">
              Need help logging in?
            </p>
          </div>
        </div>
      </div>

      {/* Setup Wizard (also used for registration) */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRegistration ? 'Create Your Profile' : 'Set up your profile'}</DialogTitle>
          </DialogHeader>

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
                  <Button type="submit" className="flex-1">
                    {isRegistration ? 'Create Profile & Continue' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
