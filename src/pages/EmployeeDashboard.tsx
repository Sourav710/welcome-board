import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { currentUser, managerUser } from '@/data/mockData';
import { useChecklist } from '@/context/ChecklistContext';
import type { ChecklistItem, ChecklistSection, User } from '@/types/onboarding';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle2, ShieldAlert, Clock, ListChecks, AlertTriangle } from 'lucide-react';

const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access & Applications',
  Day1: 'Day 1 Activities',
  Week1: 'Secure Request',
  Week2Plus: 'Week 2+ Activities',
  Training: 'Trainings & Learning',
};

const sectionOrder: ChecklistSection[] = ['Access', 'Week1', 'Day1', 'Training'];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { items: allItems, updateItem } = useChecklist();

  const getLoggedInUser = (): User => {
    try {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) return JSON.parse(stored);
    } catch {}
    return currentUser;
  };

  const [activeUser, setActiveUser] = useState<User>(getLoggedInUser);

  const markDone = (id: string) => {
    updateItem(id, { status: 'complete' });
  };

  const completedCount = items.filter((i) => i.status === 'complete').length;
  const progress = Math.round((completedCount / items.length) * 100);
  const pendingAccess = items.filter((i) => i.type === 'access' && i.status !== 'complete').length;
  const overdueItems = items.filter((i) => i.status !== 'complete' && new Date(i.dueDate) < new Date()).length;

  const toggleRole = () => {
    setActiveUser((prev) => (prev.role === 'employee' ? managerUser : currentUser));
  };


  const todaysPriorities = items
    .filter((i) => i.status !== 'complete' && i.status !== 'rejected')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <AppLayout user={activeUser} onSwitchRole={activeUser.role === 'manager' ? toggleRole : undefined}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Hero Header */}
        <div className="bg-card border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <ProgressRing value={progress} label="complete" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {activeUser.name.split(' ')[0]}!</h1>
                <p className="text-sm text-muted-foreground mt-1">Your onboarding checklist is {progress}% complete</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="bg-accent px-2 py-0.5 rounded-full">{activeUser.employeeRole}</span>
                  <span>{activeUser.project}</span>
                  <span>Started {activeUser.startDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard title="Total Tasks" value={items.length} icon={ListChecks} subtitle={`${completedCount} completed`} />
          <StatsCard title="Pending Access" value={pendingAccess} icon={ShieldAlert} subtitle="awaiting approval" />
          <StatsCard title="Overdue" value={overdueItems} icon={AlertTriangle} subtitle="need attention" trend={overdueItems > 0 ? { value: `${overdueItems} items`, positive: false } : undefined} />
          <StatsCard title="Days Active" value={Math.max(1, Math.floor((Date.now() - new Date(activeUser.startDate || '').getTime()) / 86400000))} icon={Clock} subtitle="since start" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-3">
            {sectionOrder.map((section) => {
              const sectionItems = items.filter((i) => i.section === section);
              if (sectionItems.length === 0) return null;
              return (
                <SectionAccordion
                  key={section}
                  title={sectionLabels[section]}
                  items={sectionItems}
                  onMarkDone={markDone}
                  onViewItem={(id) => navigate(`/item/${id}`)}
                />
              );
            })}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border rounded-xl p-4 sticky top-20">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Today's Priorities
              </h3>
              <div className="space-y-2">
                {todaysPriorities.map((item) => {
                  const isOverdue = new Date(item.dueDate) < new Date();
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isOverdue ? 'bg-destructive' : 'bg-primary'}`} />
                      <div>
                        <p className="text-xs font-medium text-foreground leading-tight">{item.title}</p>
                        <p className={`text-xs mt-0.5 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {isOverdue ? 'Overdue' : `Due: ${item.dueDate}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">Quick Contacts</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">SC</div>
                  <div>
                    <p className="font-medium text-foreground">Gourav Banathia</p>
                    <p className="text-muted-foreground">Manager</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">IT</div>
                  <div>
                    <p className="font-medium text-foreground">IT Help Desk</p>
                    <p className="text-muted-foreground">helpdesk@company.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SectionAccordion({
  title,
  items,
  onMarkDone,
  onViewItem,
}: {
  title: string;
  items: ChecklistItem[];
  onMarkDone: (id: string) => void;
  onViewItem: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const completed = items.filter((i) => i.status === 'complete').length;
  const sectionProgress = Math.round((completed / items.length) * 100);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border rounded-xl overflow-hidden">
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="font-semibold text-sm text-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sectionProgress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-medium w-16 text-right">
              {completed}/{items.length}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t">
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
              <div className="col-span-4">Activity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Due By</div>
              <div className="col-span-2">Action</div>
            </div>
            {items.map((item) => {
              const isOverdue = item.status !== 'complete' && new Date(item.dueDate) < new Date();
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 px-4 py-2.5 text-sm border-b last:border-b-0 items-center hover:bg-accent/30 transition-colors cursor-pointer ${
                    isOverdue ? 'bg-destructive/5' : ''
                  }`}
                  onClick={() => onViewItem(item.id)}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    {item.status === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />}
                    <span className={`text-foreground ${item.status === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </span>
                    {item.mandatory && <span className="text-xs text-destructive font-bold">*</span>}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs">{item.owner}</div>
                  <div className={`col-span-2 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {item.dueDate}
                    {isOverdue && <span className="ml-1">⚠</span>}
                  </div>
                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    {item.status === 'complete' ? (
                      <span className="text-xs text-success font-medium">✓ Done</span>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onViewItem(item.id)}>
                        <ExternalLink className="w-3 h-3" /> Request Access
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
