import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { DepartmentTabsSection } from '@/components/home/DepartmentTabsSection';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { currentUser, managerUser } from '@/data/mockData';
import { quickLinks } from '@/data/companyData';
import { useChecklist } from '@/context/ChecklistContext';
import type { ChecklistItem, ChecklistSection, User } from '@/types/onboarding';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle2, ShieldAlert, Clock, ListChecks, AlertTriangle, Users, Sparkles, PanelLeftOpen, Building2 } from 'lucide-react';

const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access & Applications',
  Day1: 'Day 1 Activities',
  Week1: 'Secure Request',
  Week2Plus: 'Week 2+ Activities',
  Training: 'Trainings & Learning',
};

const sectionThemes: Record<ChecklistSection, { gradient: string; emoji: string }> = {
  Access: { gradient: 'from-indigo-500 to-purple-600', emoji: '🔐' },
  Day1: { gradient: 'from-emerald-400 to-teal-500', emoji: '🚀' },
  Week1: { gradient: 'from-amber-400 to-orange-500', emoji: '🛡️' },
  Week2Plus: { gradient: 'from-sky-400 to-blue-500', emoji: '📈' },
  Training: { gradient: 'from-pink-500 to-fuchsia-500', emoji: '🎓' },
};

const sectionOrder: ChecklistSection[] = ['Access', 'Week1', 'Day1', 'Training'];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { items: allItems, updateItem } = useChecklist();

  const getLoggedInUser = (): User => {
    try {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore malformed stored user
    }
    return currentUser;
  };

  const [activeUser, setActiveUser] = useState<User>(getLoggedInUser);
  const items = allItems.filter((i) => i.userId === activeUser.id);

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
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const [showAllPriorities, setShowAllPriorities] = useState(false);
  const visiblePriorities = showAllPriorities ? todaysPriorities : todaysPriorities.slice(0, 3);

  // Motivational message based on progress
  const motivation =
    progress === 100 ? "🎉 Amazing! You've completed your onboarding!" :
    progress >= 75 ? "🚀 You're almost there — keep going!" :
    progress >= 40 ? "💪 Great momentum — you're on a roll!" :
    progress > 0 ? "✨ Nice start! Every step counts." :
    "👋 Welcome aboard — let's get started!";

  return (
    <AppLayout user={activeUser} onSwitchRole={activeUser.role === 'manager' ? toggleRole : undefined}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Vibrant Hero Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 mb-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-fade-in">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/20 animate-[float_8s_ease-in-out_infinite]"
                style={{
                  width: `${8 + (i % 4) * 6}px`,
                  height: `${8 + (i % 4) * 6}px`,
                  left: `${(i * 47) % 100}%`,
                  top: `${(i * 31) % 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 opacity-30 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-30 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-pulse" />
                <div className="relative bg-white/15 backdrop-blur-md rounded-full p-2 border border-white/30">
                  <ProgressRing value={progress} label="complete" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-pink-100 to-orange-100 bg-clip-text text-transparent">
                  Welcome, {activeUser.name.split(' ')[0]}!
                </h1>
                <p className="text-sm md:text-base text-white/90 mt-1 font-medium">{motivation}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full font-medium">👨🏻‍💻 {activeUser.employeeRole}</span>
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full font-medium">📁 {activeUser.project}</span>
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full font-medium">📅 {activeUser.startDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colorful Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard title="Total Tasks" value={items.length} icon={ListChecks} subtitle={`${completedCount} completed`} gradient="from-indigo-500 to-purple-600" />
          <StatsCard title="Pending Access" value={pendingAccess} icon={ShieldAlert} subtitle="awaiting approval" gradient="from-amber-400 to-orange-500" />
          <StatsCard title="Overdue" value={overdueItems} icon={AlertTriangle} subtitle="need attention" gradient="from-rose-500 to-red-600" trend={overdueItems > 0 ? { value: `${overdueItems} items`, positive: false } : undefined} />
          <StatsCard title="Days Active" value={Math.max(1, Math.floor((Date.now() - new Date(activeUser.startDate || '').getTime()) / 86400000))} icon={Clock} subtitle="since start" gradient="from-emerald-400 to-teal-500" />
        </div>

        {/* Main checklist sections — full width */}
        <div className="space-y-3">
          {sectionOrder.map((section) => {
            const sectionItems = items.filter((i) => i.section === section);
            if (sectionItems.length === 0) return null;
            return (
              <SectionAccordion
                key={section}
                title={sectionLabels[section]}
                items={sectionItems}
                theme={sectionThemes[section]}
                onMarkDone={markDone}
                onViewItem={(id) => navigate(`/item/${id}`)}
              />
            );
          })}
        </div>

        {/* Floating left navigation drawer (auto-closes on outside click / Esc) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              aria-label="Open quick navigation"
              className="fixed left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-110 transition-transform"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="pb-3 border-b">
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quick Navigation</h2>
                <p className="text-xs text-muted-foreground">Priorities, contacts & resources</p>
              </div>

              {/* Today's Priorities */}
              <div className="relative overflow-hidden bg-card border rounded-xl p-4">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 opacity-20 blur-2xl" />
                <h3 className="relative font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md">
                    <Clock className="w-4 h-4 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent font-bold">Today's Priorities</span>
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow">{todaysPriorities.length}</span>
                </h3>
                <div className="relative space-y-2">
                  {visiblePriorities.map((item) => {
                    const isOverdue = new Date(item.dueDate) < new Date();
                    return (
                      <div
                        key={item.id}
                        className={`group/p flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                          isOverdue
                            ? 'bg-gradient-to-r from-rose-500/10 to-red-500/5 border-rose-500/30'
                            : 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-border'
                        }`}
                        onClick={() => navigate(`/item/${item.id}`)}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-tight">{item.title}</p>
                          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-rose-500 font-medium' : 'text-muted-foreground'}`}>
                            {isOverdue ? '⚠️ Overdue' : `📅 Due: ${item.dueDate}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {todaysPriorities.length > 3 && (
                  <button
                    onClick={() => setShowAllPriorities((v) => !v)}
                    className="relative mt-3 w-full text-xs font-semibold text-center py-1.5 rounded-lg bg-gradient-to-r from-orange-400/10 to-pink-500/10 hover:from-orange-400/20 hover:to-pink-500/20 text-orange-600 dark:text-orange-300 transition-colors"
                  >
                    {showAllPriorities ? 'Show less' : `Show more (${todaysPriorities.length - 3})`}
                  </button>
                )}
              </div>

              {/* Quick Contacts */}
              <div className="relative overflow-hidden bg-card border rounded-xl p-4">
                <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-20 blur-2xl" />
                <h3 className="relative font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                    <Users className="w-4 h-4 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold">Quick Contacts</span>
                </h3>
                <div className="relative space-y-2 text-xs">
                  <a
                    href={`mailto:gourav.banathia@optum.com?subject=${encodeURIComponent(`Onboarding support for ${activeUser.name}`)}&body=${encodeURIComponent(`Hi Gourav,%0D%0A%0D%0AI need assistance with my onboarding tasks.%0D%0A%0D%0AThanks,%0D%0A${activeUser.name}`)}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group/c"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md group-hover/c:scale-110 transition-transform">GB</div>
                    <div>
                      <p className="font-semibold text-foreground">Gourav Banathia</p>
                      <p className="text-muted-foreground">Manager</p>
                    </div>
                  </a>
                  <a
                    href={`mailto:helpdesk@company.com?subject=${encodeURIComponent(`IT support request from ${activeUser.name}`)}&body=${encodeURIComponent(`Hello IT Help Desk,%0D%0A%0D%0AI need assistance with the following:%0D%0A%0D%0A[Describe your issue]%0D%0A%0D%0AThanks,%0D%0A${activeUser.name}`)}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group/c"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md group-hover/c:scale-110 transition-transform">IT</div>
                    <div>
                      <p className="font-semibold text-foreground">IT Help Desk</p>
                      <p className="text-muted-foreground">helpdesk@company.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="relative overflow-hidden bg-card border rounded-xl p-4">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-20 blur-2xl" />
                <h3 className="relative font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent font-bold">Quick Links</span>
                </h3>
                <div className="relative grid grid-cols-3 gap-2">
                  {quickLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      title={link.title}
                      className="group/q relative rounded-xl overflow-hidden p-2 text-center bg-card border hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover/q:opacity-100 transition-opacity`} />
                      <div className="relative">
                        <div className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-lg shadow-md mb-1 group-hover/q:scale-110 transition-transform`}>
                          {link.emoji}
                        </div>
                        <div className="text-[10px] font-semibold leading-tight text-foreground group-hover/q:text-white transition-colors line-clamp-2">{link.title}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Department Contacts */}
              <div className="relative overflow-hidden bg-card border rounded-xl p-4">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 opacity-20 blur-2xl" />
                <h3 className="relative font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center shadow-md">
                    <Building2 className="w-4 h-4 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent font-bold">Department Contacts</span>
                </h3>
                <div className="relative -mx-4 -mb-4">
                  <DepartmentTabsSection compact />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}

function SectionAccordion({
  title,
  items,
  theme,
  onMarkDone,
  onViewItem,
}: {
  title: string;
  items: ChecklistItem[];
  theme: { gradient: string; emoji: string };
  onMarkDone: (id: string) => void;
  onViewItem: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const completed = items.filter((i) => i.status === 'complete').length;
  const sectionProgress = Math.round((completed / items.length) * 100);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="group/sec relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Top accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
        {/* Decorative blob */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10 blur-3xl group-hover/sec:opacity-20 transition-opacity duration-500`} />

        <CollapsibleTrigger className="relative w-full px-4 py-3.5 flex items-center justify-between hover:bg-accent/30 transition-colors">
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg shadow-md group-hover/sec:scale-110 group-hover/sec:rotate-6 transition-transform duration-300`}>
              {theme.emoji}
            </span>
            <div className="text-left">
              <span className={`font-bold text-sm bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>{title}</span>
              <p className="text-xs text-muted-foreground">{completed} of {items.length} complete</p>
            </div>
            {open ? <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" /> : <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-700`} style={{ width: `${sectionProgress}%` }} />
            </div>
            <span className={`text-xs font-bold w-12 text-right bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              {sectionProgress}%
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t relative">
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 border-b uppercase tracking-wider">
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
                  className={`grid grid-cols-12 px-4 py-3 text-sm border-b last:border-b-0 items-center hover:bg-accent/40 transition-all cursor-pointer hover:translate-x-1 ${
                    isOverdue ? 'bg-rose-500/5' : ''
                  }`}
                  onClick={() => onViewItem(item.id)}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    {item.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                    <span className={`${item.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {item.title}
                    </span>
                    {item.mandatory && <span className="text-xs text-destructive font-bold">*</span>}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs">{item.owner}</div>
                  <div className={`col-span-2 text-xs ${isOverdue ? 'text-rose-500 font-semibold' : 'text-muted-foreground'}`}>
                    {item.dueDate}
                    {isOverdue && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    {item.status === 'complete' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-bold bg-success/10 px-2 py-1 rounded-full">✓ Done</span>
                    ) : (
                      <Button
                        size="sm"
                        className={`h-7 text-xs gap-1 bg-gradient-to-r ${theme.gradient} text-white border-0 hover:opacity-90 hover:scale-105 transition-all shadow-md`}
                        onClick={() => onViewItem(item.id)}
                      >
                        <ExternalLink className="w-3 h-3" /> Request
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
