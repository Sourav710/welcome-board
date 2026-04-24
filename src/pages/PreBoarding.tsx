import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useAuditLog } from '@/context/AuditLogContext';
import type { User } from '@/types/onboarding';
import {
  Sparkles, PlayCircle, Shirt, Car, CalendarDays, FileText, Upload, Check, X,
  Laptop, Mouse, Headphones, Monitor, Keyboard, ChevronRight, ChevronLeft,
  PartyPopper, MapPin, Clock, Briefcase, ShieldCheck, PenLine, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types & storage helpers
// ─────────────────────────────────────────────────────────────────────────────

type DocKey = 'governmentId' | 'taxForm' | 'bankProof';

interface UploadedDoc {
  name: string;
  size: number;
  uploadedAt: string;
}

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface Equipment {
  laptop: string;
  peripherals: string[];
  notes: string;
}

interface PreBoardingState {
  watchedIntro: boolean;
  acknowledgedAgenda: boolean;
  documents: Partial<Record<DocKey, UploadedDoc>>;
  emergency: EmergencyContact;
  signature: string;
  signedAt?: string;
  equipment: Equipment;
  equipmentTicketId?: string;
  completedSteps: number[];
}

const STORAGE_KEY = 'preboardingState';

const defaultState: PreBoardingState = {
  watchedIntro: false,
  acknowledgedAgenda: false,
  documents: {},
  emergency: { name: '', relation: '', phone: '' },
  signature: '',
  equipment: { laptop: '', peripherals: [], notes: '' },
  completedSteps: [],
};

function loadState(): PreBoardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...(JSON.parse(raw) as PreBoardingState) };
  } catch {
    // ignore corrupted state
  }
  return defaultState;
}

function saveState(state: PreBoardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─────────────────────────────────────────────────────────────────────────────
// Static catalog data
// ─────────────────────────────────────────────────────────────────────────────

const firstDayAgenda = [
  { time: '09:00 AM', activity: 'Reception check-in & ID badge', icon: ShieldCheck },
  { time: '09:30 AM', activity: 'Welcome breakfast with team', icon: PartyPopper },
  { time: '10:30 AM', activity: 'IT setup & laptop handover', icon: Laptop },
  { time: '12:00 PM', activity: 'Lunch with buddy', icon: Briefcase },
  { time: '01:30 PM', activity: 'Manager 1:1 introduction', icon: Building2 },
  { time: '03:00 PM', activity: 'Office tour & seating allocation', icon: MapPin },
  { time: '04:00 PM', activity: 'HR orientation & policy walkthrough', icon: FileText },
];

const laptopOptions = [
  { id: 'mbp-14', label: 'MacBook Pro 14" (M3 Pro, 18GB)', tag: 'Recommended for Devs' },
  { id: 'mbp-16', label: 'MacBook Pro 16" (M3 Max, 36GB)', tag: 'Senior / Heavy workloads' },
  { id: 'mba-13', label: 'MacBook Air 13" (M3, 16GB)', tag: 'Light tasks / BAs' },
  { id: 'dell-xps', label: 'Dell XPS 15 (i9, 32GB, RTX)', tag: 'Windows preferred' },
  { id: 'tp-x1', label: 'Lenovo ThinkPad X1 Carbon', tag: 'Windows ultraportable' },
];

const peripheralOptions = [
  { id: 'mouse', label: 'Wireless mouse', icon: Mouse },
  { id: 'keyboard', label: 'External keyboard', icon: Keyboard },
  { id: 'monitor', label: '27" 4K monitor', icon: Monitor },
  { id: 'headset', label: 'Noise-cancelling headset', icon: Headphones },
  { id: 'dock', label: 'USB-C docking station', icon: Laptop },
];

const documentRequirements: { key: DocKey; label: string; description: string }[] = [
  { key: 'governmentId', label: 'Government ID', description: 'Aadhaar / Passport / Driver\'s License (PDF or image, ≤ 5 MB)' },
  { key: 'taxForm', label: 'Tax form', description: 'W-4 (US) or Form 16 / PAN (India)' },
  { key: 'bankProof', label: 'Bank proof', description: 'Cancelled cheque or bank statement for salary credit' },
];

const stepLabels = ['Welcome', 'Documents', 'Equipment', 'Done'];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function PreBoarding() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [state, setState] = useState<PreBoardingState>(loadState);
  const [step, setStep] = useState(0);
  const [hire, setHire] = useState<{ name: string; startDate?: string }>({ name: 'New Hire' });

  useEffect(() => {
    const raw = localStorage.getItem('loggedInUser');
    if (raw) {
      try {
        const u = JSON.parse(raw) as User;
        setHire({ name: u.name, startDate: u.startDate });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = (patch: Partial<PreBoardingState>) =>
    setState((s) => ({ ...s, ...patch }));

  const markStepDone = (idx: number) => {
    setState((s) => ({
      ...s,
      completedSteps: s.completedSteps.includes(idx) ? s.completedSteps : [...s.completedSteps, idx],
    }));
  };

  const overallProgress = useMemo(() => {
    const total = 3;
    return Math.round((state.completedSteps.filter((i) => i < total).length / total) * 100);
  }, [state.completedSteps]);

  const daysUntilStart = useMemo(() => {
    if (!hire.startDate) return null;
    const ms = new Date(hire.startDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [hire.startDate]);

  const goNext = () => {
    markStepDone(step);
    setStep((s) => Math.min(s + 1, stepLabels.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/30">
      {/* Top bar */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">♚</span>
            </div>
            <span className="text-base font-bold tracking-tight uppercase">
              Check<span className="text-primary">mate</span>
            </span>
            <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Pre-boarding
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Save & exit
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero strip */}
        <div className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Welcome aboard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Hi {hire.name.split(' ')[0]}, let's get you ready for Day 1 🎉
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Finish these three quick steps before your start date so you can hit the ground running.
              </p>
            </div>
            {daysUntilStart !== null && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Starts in</p>
                <p className="text-3xl font-bold text-primary leading-none">{daysUntilStart}</p>
                <p className="text-xs text-muted-foreground mt-0.5">days</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Overall progress</span>
              <span className="font-medium text-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {stepLabels.map((label, idx) => {
            const isDone = state.completedSteps.includes(idx) || step > idx;
            const isActive = step === idx;
            return (
              <button
                key={label}
                onClick={() => setStep(idx)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0',
                  isActive && 'bg-primary text-primary-foreground border-primary',
                  !isActive && isDone && 'bg-success/10 text-success border-success/30',
                  !isActive && !isDone && 'bg-muted text-muted-foreground border-border'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isActive && 'bg-primary-foreground/20',
                    !isActive && isDone && 'bg-success/20',
                    !isActive && !isDone && 'bg-background'
                  )}
                >
                  {isDone && !isActive ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="bg-card border rounded-2xl shadow-sm p-6 md:p-8">
          {step === 0 && <WelcomeStep state={state} update={update} />}
          {step === 1 && <DocumentsStep state={state} update={update} hireName={hire.name} />}
          {step === 2 && (
            <EquipmentStep
              state={state}
              update={update}
              onSubmitTicket={(ticketId) => {
                update({ equipmentTicketId: ticketId });
                addLog({
                  userId: 'preboarding',
                  userName: hire.name,
                  userRole: 'employee',
                  action: 'IT_EQUIPMENT_REQUEST',
                  category: 'access',
                  details: `IT equipment ticket ${ticketId} created during pre-boarding`,
                });
              }}
            />
          )}
          {step === 3 && <DoneStep state={state} hireName={hire.name} onGoToLogin={() => navigate('/login')} />}

          {/* Footer nav */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="outline" size="sm" onClick={goBack} disabled={step === 0} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button size="sm" onClick={goNext} disabled={!canAdvance(step, state)} className="gap-1">
                {step === 2 ? 'Finish pre-boarding' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function canAdvance(step: number, s: PreBoardingState) {
  if (step === 0) return s.watchedIntro && s.acknowledgedAgenda;
  if (step === 1) {
    const docsReady = documentRequirements.every((r) => Boolean(s.documents[r.key]));
    const emergencyReady = s.emergency.name && s.emergency.phone;
    return Boolean(docsReady && emergencyReady && s.signature.trim());
  }
  if (step === 2) return Boolean(s.equipment.laptop);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Welcome
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeStep({
  state, update,
}: { state: PreBoardingState; update: (p: Partial<PreBoardingState>) => void }) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" /> Welcome to the company
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Watch the intro, review what to wear, where to park, and your first-day plan.
        </p>
      </header>

      {/* Intro video */}
      <div>
        <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="Company intro video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => update({ watchedIntro: true })}
          />
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <Checkbox
            checked={state.watchedIntro}
            onCheckedChange={(v) => update({ watchedIntro: Boolean(v) })}
          />
          <span className="text-sm text-foreground">I've watched the welcome video</span>
        </label>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard icon={Shirt} title="Dress code" tone="primary">
          <p className="text-sm text-muted-foreground mb-2">
            Smart-casual on most days. Business formal only for client meetings.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Avoid: shorts, flip-flops, ripped jeans</li>
            <li>Friday: branded company tee encouraged</li>
            <li>First day: smart-casual + comfortable shoes (lots of walking!)</li>
          </ul>
        </InfoCard>

        <InfoCard icon={Car} title="Parking & transport" tone="success">
          <p className="text-sm text-muted-foreground mb-2">
            Free employee parking in basement levels B1–B3. Show your offer letter at security.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Shuttle: every 30 min from Metro Station</li>
            <li>EV charging available on B2</li>
            <li>Bike parking near gate 3</li>
          </ul>
        </InfoCard>
      </div>

      {/* Agenda */}
      <div className="border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Your first-day agenda</h3>
        </div>
        <ul className="divide-y">
          {firstDayAgenda.map(({ time, activity, icon: Icon }) => (
            <li key={time} className="px-4 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {time}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-3 border-t bg-muted/20">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={state.acknowledgedAgenda}
              onCheckedChange={(v) => update({ acknowledgedAgenda: Boolean(v) })}
            />
            <span className="text-sm text-foreground">I've reviewed my Day 1 agenda</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon, title, children, tone,
}: { icon: React.ElementType; title: string; children: React.ReactNode; tone: 'primary' | 'success' }) {
  const ring = tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success';
  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ring)}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Documents
// ─────────────────────────────────────────────────────────────────────────────

function DocumentsStep({
  state, update, hireName,
}: { state: PreBoardingState; update: (p: Partial<PreBoardingState>) => void; hireName: string }) {

  const handleFile = (key: DocKey, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload files smaller than 5 MB.', variant: 'destructive' });
      return;
    }
    update({
      documents: {
        ...state.documents,
        [key]: { name: file.name, size: file.size, uploadedAt: new Date().toISOString() },
      },
    });
    toast({ title: 'Uploaded', description: `${file.name} attached.` });
  };

  const sign = () => {
    if (!state.signature.trim()) return;
    update({ signedAt: new Date().toISOString() });
    toast({ title: 'Signed', description: 'Your e-signature has been recorded.' });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Document collection
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload required documents and provide an emergency contact. All files are encrypted and visible only to HR.
        </p>
      </header>

      {/* Document upload list */}
      <div className="space-y-3">
        {documentRequirements.map(({ key, label, description }) => {
          const doc = state.documents[key];
          return (
            <div key={key} className="border rounded-xl p-4 bg-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
                {doc && (
                  <p className="text-[11px] text-success mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {doc.name} · {(doc.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {doc && (
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      const next = { ...state.documents };
                      delete next[key];
                      update({ documents: next });
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFile(key, e.target.files?.[0] || null)}
                  />
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Upload className="w-3.5 h-3.5" /> {doc ? 'Replace' : 'Upload'}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency contact */}
      <div className="border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Emergency contact</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Full name *</Label>
            <Input
              value={state.emergency.name}
              onChange={(e) => update({ emergency: { ...state.emergency, name: e.target.value } })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label className="text-xs">Relationship *</Label>
            <Select
              value={state.emergency.relation}
              onValueChange={(v) => update({ emergency: { ...state.emergency, relation: v } })}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Phone *</Label>
            <Input
              type="tel"
              value={state.emergency.phone}
              onChange={(e) => update({ emergency: { ...state.emergency, phone: e.target.value } })}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      </div>

      {/* E-signature */}
      <div className="border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary" /> E-signature
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          By typing your full name below, you confirm that the documents and information provided are accurate and authorize the company to process them per the offer letter.
        </p>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs">Type your full legal name *</Label>
            <Input
              value={state.signature}
              onChange={(e) => update({ signature: e.target.value, signedAt: undefined })}
              placeholder={hireName}
              className="font-serif italic text-lg"
            />
          </div>
          <Button onClick={sign} disabled={!state.signature.trim()} className="gap-1.5">
            <PenLine className="w-4 h-4" /> Sign
          </Button>
        </div>
        {state.signedAt && (
          <p className="text-[11px] text-success mt-2 flex items-center gap-1">
            <Check className="w-3 h-3" /> Signed on {format(new Date(state.signedAt), 'PPpp')}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Equipment
// ─────────────────────────────────────────────────────────────────────────────

function EquipmentStep({
  state, update, onSubmitTicket,
}: {
  state: PreBoardingState;
  update: (p: Partial<PreBoardingState>) => void;
  onSubmitTicket: (ticketId: string) => void;
}) {
  const submittedRef = useRef(false);

  const togglePeripheral = (id: string) => {
    const has = state.equipment.peripherals.includes(id);
    update({
      equipment: {
        ...state.equipment,
        peripherals: has
          ? state.equipment.peripherals.filter((p) => p !== id)
          : [...state.equipment.peripherals, id],
      },
    });
  };

  const submitTicket = () => {
    if (!state.equipment.laptop) {
      toast({ title: 'Pick a laptop', description: 'Please choose a laptop before raising the IT ticket.', variant: 'destructive' });
      return;
    }
    if (submittedRef.current && state.equipmentTicketId) {
      toast({ title: 'Already submitted', description: `Ticket ${state.equipmentTicketId} is already open.` });
      return;
    }
    const ticketId = `INC${Math.floor(100000 + Math.random() * 900000)}`;
    submittedRef.current = true;
    onSubmitTicket(ticketId);
    toast({
      title: 'IT ticket created',
      description: `Ticket ${ticketId} sent to ServiceNow. Your equipment will be ready on Day 1.`,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Laptop className="w-5 h-5 text-primary" /> Equipment selection
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your laptop and peripherals. Submitting will auto-create an IT ticket so everything is ready Day 1.
        </p>
      </header>

      {/* Laptops */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Laptop *</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {laptopOptions.map((opt) => {
            const selected = state.equipment.laptop === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update({ equipment: { ...state.equipment, laptop: opt.id } })}
                className={cn(
                  'text-left border rounded-xl p-4 transition-all hover:shadow-md',
                  selected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 text-primary" />
                  </div>
                  {selected && <Check className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm font-semibold text-foreground mt-3">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.tag}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Peripherals */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Peripherals (optional)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {peripheralOptions.map(({ id, label, icon: Icon }) => {
            const selected = state.equipment.peripherals.includes(id);
            return (
              <button
                key={id}
                onClick={() => togglePeripheral(id)}
                className={cn(
                  'flex items-center gap-2 border rounded-lg px-3 py-2.5 text-left transition-colors',
                  selected ? 'border-primary bg-primary/10 text-foreground' : 'bg-card text-muted-foreground hover:border-primary/40'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">{label}</span>
                {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="text-xs">Special requests / notes (optional)</Label>
        <Textarea
          value={state.equipment.notes}
          onChange={(e) => update({ equipment: { ...state.equipment, notes: e.target.value } })}
          placeholder="e.g. Left-handed mouse, ergonomic keyboard, second monitor for design work…"
          rows={3}
        />
      </div>

      {/* Submit ticket */}
      <div className="border rounded-xl p-4 bg-accent/30 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-foreground">Raise IT ticket</p>
          <p className="text-xs text-muted-foreground">
            We'll auto-create a ServiceNow ticket so your gear is ready when you arrive.
          </p>
          {state.equipmentTicketId && (
            <p className="text-[11px] text-success mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ticket {state.equipmentTicketId} created
            </p>
          )}
        </div>
        <Button onClick={submitTicket} disabled={!state.equipment.laptop} className="gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          {state.equipmentTicketId ? 'Resend to IT' : 'Submit IT ticket'}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Done
// ─────────────────────────────────────────────────────────────────────────────

function DoneStep({
  state, hireName, onGoToLogin,
}: { state: PreBoardingState; hireName: string; onGoToLogin: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-4">
        <PartyPopper className="w-10 h-10 text-success" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">You're all set, {hireName.split(' ')[0]}!</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Pre-boarding complete. We'll see you on Day 1 — your laptop, access requests, and welcome plan are already in motion.
      </p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        <SummaryStat label="Documents" value={`${Object.keys(state.documents).length}/${documentRequirements.length}`} />
        <SummaryStat label="Equipment" value={state.equipmentTicketId || 'Pending'} />
        <SummaryStat label="Signed" value={state.signedAt ? '✓ Yes' : '—'} />
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button onClick={onGoToLogin} className="gap-1.5">
          Go to login <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3 bg-muted/20">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 truncate">{value}</p>
    </div>
  );
}
