import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { projects, locations, managers } from '@/data/mockData';
import type { EmployeeRole } from '@/types/onboarding';

const employeeRoles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSetup(true);
  };

  const handleSetupComplete = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-sm">
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              Onboard<span className="text-muted-foreground font-normal">Hub</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter your user ID" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>
            <Button type="submit" className="w-full">Log in</Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4 hover:underline cursor-pointer">
            Need help logging in?
          </p>
        </div>
      </div>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up your profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetupComplete} className="space-y-4">
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
              <Label>Manager</Label>
              <Select defaultValue={managers[0].id}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {managers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" defaultValue="2026-02-16" />
            </div>
            <Button type="submit" className="w-full">Complete Setup</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
