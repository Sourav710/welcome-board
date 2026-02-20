import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { currentUser, managerUser, checklistItems } from '@/data/mockData';
import type { ChecklistItem, ChecklistSection, User } from '@/types/onboarding';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle2 } from 'lucide-react';

const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access & Applications Checklist',
  Day1: 'Day 1 Activities',
  Week1: 'Week 1 Activities',
  Week2Plus: 'Week 2+ Activities',
};

const sectionOrder: ChecklistSection[] = ['Access', 'Day1', 'Week1', 'Week2Plus'];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>(checklistItems);
  const [activeUser, setActiveUser] = useState<User>(currentUser);

  const completedCount = items.filter((i) => i.status === 'complete').length;
  const progress = Math.round((completedCount / items.length) * 100);

  const toggleRole = () => {
    setActiveUser((prev) => (prev.role === 'employee' ? managerUser : currentUser));
  };

  const markDone = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'complete' as const } : i)));
  };

  const todaysPriorities = items
    .filter((i) => i.status !== 'complete' && i.status !== 'rejected')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <AppLayout user={activeUser} onSwitchRole={toggleRole}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">My Onboarding Checklist</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Role: <span className="text-foreground font-medium">{currentUser.employeeRole}</span></span>
            <span>•</span>
            <span>Project: <span className="text-foreground font-medium">{currentUser.project}</span></span>
            <span>•</span>
            <span>Start Date: <span className="text-foreground font-medium">{currentUser.startDate}</span></span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">{progress}% Complete</span>
          </div>
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
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-4 sticky top-6">
              <h3 className="font-medium text-sm text-foreground mb-3">Today's Priorities</h3>
              <div className="space-y-2">
                {todaysPriorities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                  </div>
                ))}
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border rounded-lg">
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="font-medium text-sm text-foreground">{title}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {completed}/{items.length} complete
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t">
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
              <div className="col-span-4">Activity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Due By</div>
              <div className="col-span-2">Action</div>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 px-4 py-2.5 text-sm border-b last:border-b-0 items-center hover:bg-muted/20 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2">
                  {item.status === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />}
                  <span className={`text-foreground ${item.status === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </span>
                  {item.mandatory && <span className="text-xs text-destructive">*</span>}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={item.status} />
                </div>
                <div className="col-span-2 text-muted-foreground text-xs">{item.owner}</div>
                <div className="col-span-2 text-muted-foreground text-xs">{item.dueDate}</div>
                <div className="col-span-2">
                  {item.type === 'access' && item.status !== 'complete' ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onViewItem(item.id)}>
                      <ExternalLink className="w-3 h-3 mr-1" /> Request
                    </Button>
                  ) : item.status !== 'complete' ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onMarkDone(item.id)}>
                      Mark Done
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
