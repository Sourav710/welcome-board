import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { projects, locations, managers } from '@/data/mockData';
import type { EmployeeRole } from '@/types/onboarding';
import { Shield, ChevronRight } from 'lucide-react';

const employeeRoles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];

const steps = ['Role', 'Details', 'Manager'];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [setupStep, setSetupStep] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
              <span className="text-primary-foreground text-lg font-bold">O</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Onboard<span className="text-muted-foreground font-normal">Hub</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Enterprise Resource Onboarding</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. SJHA001" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-10" />
            </div>
            <Button type="submit" className="w-full h-10">Log in</Button>
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
                  <Input type="date" defaultValue="2026-02-16" />
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
