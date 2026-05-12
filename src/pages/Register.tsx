import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { projects, locations, managers, currentUser } from '@/data/mockData';
import { useAuditLog } from '@/context/AuditLogContext';
import { toast } from '@/hooks/use-toast';
import type { EmployeeRole, User } from '@/types/onboarding';
import {
  CalendarIcon, Sparkles, Users, Rocket, ArrowLeft, ArrowRight,
  Check, Loader2, Search, User as UserIcon, Briefcase, MapPin, UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const employeeRoles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];
const projectOptions = ['DMS', 'Global Health', 'Rx Platform', ...projects.filter(p => !['DMS'].includes(p)), 'Other'];
const locationOptions = ['Delhi', 'Bangalore', 'Mumbai', 'Pune', 'Remote', ...locations.filter(l => !['Remote'].includes(l))];

const STEP_LABELS = ['Basic Info', 'Role & Project', 'Manager', 'Review'];

const testimonials = [
  { quote: 'Joined 2,500+ new hires this year', icon: Users },
  { quote: 'Onboarding completed 60% faster', icon: Rocket },
  { quote: 'Trusted by enterprise teams worldwide', icon: Sparkles },
];

interface FormState {
  fullName: string;
  email: string;
  corporateId: string;
  password: string;
  confirmPassword: string;
  employeeRole: EmployeeRole | '';
  project: string;
  location: string;
  startDate: Date | undefined;
  managerSearch: string;
  managerId: string;
  managerName: string;
  agreeTos: boolean;
}

const INITIAL: FormState = {
  fullName: '', email: '', corporateId: '', password: '', confirmPassword: '',
  employeeRole: '', project: '', location: '', startDate: undefined,
  managerSearch: '', managerId: '', managerName: '', agreeTos: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(t);
  }, []);

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const filteredManagers = useMemo(() => {
    const q = form.managerSearch.trim().toLowerCase();
    if (!q) return managers;
    return managers.filter((m) => m.name.toLowerCase().includes(q));
  }, [form.managerSearch]);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@optum\.com$/i.test(form.email.trim())) e.email = 'Must be a valid @optum.com email';
      if (!form.corporateId.trim()) e.corporateId = 'Corporate ID is required';
      else if (!/^[A-Z]{2,5}\d{3,5}$/i.test(form.corporateId.trim())) e.corporateId = 'Format: e.g. SJHA001';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'At least 8 characters';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 1) {
      if (!form.employeeRole) e.employeeRole = 'Select a role';
      if (!form.project) e.project = 'Select a project';
      if (!form.location) e.location = 'Select a location';
      if (!form.startDate) e.startDate = 'Pick a start date';
    }
    if (s === 2) {
      if (!form.managerId) e.managerId = 'Please select a manager';
    }
    if (s === 3) {
      if (!form.agreeTos) e.agreeTos = 'You must agree to continue';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, 3)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    const newUser: User = {
      id: `u-new-${Date.now()}`,
      name: form.fullName.trim(),
      email: form.email.trim(),
      role: 'employee',
      employeeRole: form.employeeRole as EmployeeRole,
      project: form.project,
      location: form.location,
      managerId: form.managerId,
      startDate: form.startDate ? format(form.startDate, 'yyyy-MM-dd') : currentUser.startDate,
      profileComplete: true,
    };

    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    localStorage.setItem('loggedInRole', 'employee');
    addLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: 'employee',
      action: 'PROFILE_CREATED',
      category: 'auth',
      details: `New user registered (${form.corporateId.toUpperCase()}, role: ${form.employeeRole}, project: ${form.project})`,
    });

    setSubmitting(false);
    setSuccess(true);
    toast({
      title: `Welcome aboard, ${newUser.name.split(' ')[0]}! 🎉`,
      description: 'Your onboarding checklist has been generated.',
    });
    setTimeout(() => navigate('/home'), 1600);
  };

  const ActiveTestimonialIcon = testimonials[testimonialIdx].icon;
  const progressPct = ((step + 1) / 4) * 100;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* LEFT — vibrant gradient panel */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, hsl(150 70% 45%) 0%, hsl(190 80% 50%) 50%, hsl(220 90% 56%) 100%)' }}
          aria-hidden="true"
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md rotate-12 border border-white/20" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/login" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
              <span className="text-3xl">♚</span>
            </div>
            <span className="text-xl font-bold tracking-wide uppercase">
              Check<span className="text-yellow-200">mate</span>
            </span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Start Your<br />Onboarding Journey
            </h2>
            <p className="text-white/85 text-lg">
              A few quick steps to set up your profile, team, and personalized checklist — and you'll be ready to go.
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

      {/* RIGHT — wizard card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-xl">
          <div className="lg:hidden text-center mb-6">
            <Link to="/login" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center">
                <span className="text-primary-foreground text-2xl">♚</span>
              </div>
            </Link>
            <h1 className="text-xl font-bold uppercase tracking-wide mt-2">
              Check<span className="text-primary">mate</span>
            </h1>
          </div>

          <div className="bg-card border rounded-2xl p-7 shadow-xl">
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Create Your Profile</h2>
                <span className="text-sm text-muted-foreground">Step {step + 1} of 4</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <div className="hidden sm:flex justify-between mt-2 text-xs text-muted-foreground">
                {STEP_LABELS.map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      'transition-colors',
                      i === step && 'text-primary font-semibold',
                      i < step && 'text-foreground'
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {success ? (
              <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(150 70% 45%), hsl(170 75% 42%))' }}
                >
                  <Check className="w-10 h-10" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold">
                  Welcome aboard, {form.fullName.split(' ')[0]}! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Your account is ready. Redirecting you to your homepage…
                </p>
                <Loader2 className="w-5 h-5 mx-auto animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Step 1: Basic Info */}
                {step === 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <UserIcon className="w-4 h-4" /> Basic Information
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="e.g. Sourav Sharma" />
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Corporate Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="firstname.lastname@optum.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="corporateId">Corporate ID *</Label>
                      <Input id="corporateId" value={form.corporateId} onChange={(e) => update('corporateId', e.target.value.toUpperCase())} placeholder="e.g. SJHA001" />
                      {errors.corporateId && <p className="text-xs text-destructive">{errors.corporateId}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="password">Create Password *</Label>
                        <Input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Re-enter password" />
                        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Role & Project */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Briefcase className="w-4 h-4" /> Role & Project Details
                    </div>
                    <div className="space-y-1.5">
                      <Label>Employee Role *</Label>
                      <Select value={form.employeeRole} onValueChange={(v) => update('employeeRole', v as EmployeeRole)}>
                        <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                        <SelectContent>
                          {employeeRoles.map((r) => (
                            <SelectItem key={r} value={r}>{r === 'BA' ? 'Business Analyst (BA)' : r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.employeeRole && <p className="text-xs text-destructive">{errors.employeeRole}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Project / Team *</Label>
                      <Select value={form.project} onValueChange={(v) => update('project', v)}>
                        <SelectTrigger><SelectValue placeholder="Select your project" /></SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(projectOptions)).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.project && <p className="text-xs text-destructive">{errors.project}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location *</Label>
                      <Select value={form.location} onValueChange={(v) => update('location', v)}>
                        <SelectTrigger><SelectValue placeholder="Select your location" /></SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(locationOptions)).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.startDate && 'text-muted-foreground')}>
                            <CalendarIcon className="w-4 h-4" />
                            {form.startDate ? format(form.startDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.startDate} onSelect={(d) => update('startDate', d)} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3: Manager */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <UserCheck className="w-4 h-4" /> Manager Assignment
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="managerSearch">Search Manager by name</Label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="managerSearch"
                          value={form.managerSearch}
                          onChange={(e) => update('managerSearch', e.target.value)}
                          placeholder="Type a manager name…"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
                      {filteredManagers.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground text-center">No managers found.</div>
                      )}
                      {filteredManagers.map((m) => {
                        const selected = form.managerId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => { update('managerId', m.id); update('managerName', m.name); }}
                            className={cn(
                              'w-full text-left p-3 flex items-center gap-3 hover:bg-accent transition-colors',
                              selected && 'bg-primary/10'
                            )}
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
                              {m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground truncate">DMS · {m.name.toLowerCase().replace(/\s/g, '.')}@optum.com</p>
                            </div>
                            {selected && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                    {errors.managerId && <p className="text-xs text-destructive">{errors.managerId}</p>}
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Check className="w-4 h-4" /> Review & Submit
                    </div>
                    <div className="space-y-3">
                      <ReviewCard title="Basic Information" rows={[
                        ['Full Name', form.fullName],
                        ['Email', form.email],
                        ['Corporate ID', form.corporateId],
                      ]} />
                      <ReviewCard title="Role & Project" rows={[
                        ['Role', form.employeeRole as string],
                        ['Project', form.project],
                        ['Location', form.location],
                        ['Start Date', form.startDate ? format(form.startDate, 'PPP') : '—'],
                      ]} />
                      <ReviewCard title="Manager" rows={[['Manager', form.managerName]]} />
                    </div>
                    <label className="flex items-start gap-2 text-sm cursor-pointer pt-2">
                      <Checkbox
                        checked={form.agreeTos}
                        onCheckedChange={(v) => update('agreeTos', !!v)}
                        className="mt-0.5"
                      />
                      <span className="text-muted-foreground">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.agreeTos && <p className="text-xs text-destructive">{errors.agreeTos}</p>}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t">
                  {step > 0 ? (
                    <Button type="button" variant="ghost" onClick={back} disabled={submitting}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                  ) : (
                    <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={next} className="min-w-28">
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="min-w-40 text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                      style={{ background: 'linear-gradient(135deg, hsl(150 70% 45%), hsl(170 75% 42%))' }}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                      ) : (
                        <>Create Account <Sparkles className="w-4 h-4" /></>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="border rounded-lg p-3 bg-muted/30">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <dl className="grid grid-cols-3 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground col-span-1">{k}</dt>
            <dd className="font-medium col-span-2 truncate">{v || <span className="text-muted-foreground italic">—</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
