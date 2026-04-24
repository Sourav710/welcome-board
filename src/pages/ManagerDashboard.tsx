import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { StatsCard } from '@/components/StatsCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { managerUser, adminUser, teamMembers, allChecklistItems, notes as mockNotes } from '@/data/mockData';
import type { User, ChecklistItem, ChecklistSection } from '@/types/onboarding';
import { Users, AlertTriangle, TrendingUp, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access',
  Day1: 'Day 1',
  Week1: 'Week 1',
  Week2Plus: 'Week 2+',
  Training: 'Training',
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const currentLoggedUser = useMemo<User>(() => {
    try {
      const raw = localStorage.getItem('loggedInUser');
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed && parsed.role) return parsed;
      }
    } catch {
      // ignore malformed localStorage
    }
    const role = localStorage.getItem('loggedInRole');
    return role === 'admin' ? adminUser : managerUser;
  }, []);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'checklist' | 'notes'>('summary');

  const filteredMembers = teamMembers.filter((m) => {
    if (filterProject !== 'all' && m.project !== filterProject) return false;
    if (filterRole !== 'all' && m.employeeRole !== filterRole) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedUser = teamMembers.find((m) => m.id === selectedUserId);
  const selectedItems = allChecklistItems.filter((i) => i.userId === selectedUserId);

  const getUserStats = (userId: string) => {
    const items = allChecklistItems.filter((i) => i.userId === userId);
    const completed = items.filter((i) => i.status === 'complete').length;
    const overdue = items.filter((i) => i.status !== 'complete' && new Date(i.dueDate) < new Date()).length;
    const accessItems = items.filter((i) => i.type === 'access');
    const accessGranted = accessItems.filter((i) => i.status === 'complete').length;
    return { total: items.length, completed, progress: items.length ? Math.round((completed / items.length) * 100) : 0, overdue, accessGranted, accessTotal: accessItems.length };
  };

  // Aggregate stats
  const totalOverdue = filteredMembers.reduce((sum, m) => sum + getUserStats(m.id).overdue, 0);
  const avgProgress = filteredMembers.length ? Math.round(filteredMembers.reduce((sum, m) => sum + getUserStats(m.id).progress, 0) / filteredMembers.length) : 0;

  const sectionStats = useMemo(() => {
    if (!selectedUserId) return {};
    const stats: Record<string, { completed: number; total: number }> = {};
    for (const section of ['Access', 'Day1', 'Week1', 'Week2Plus'] as ChecklistSection[]) {
      const items = selectedItems.filter((i) => i.section === section);
      stats[section] = { completed: items.filter((i) => i.status === 'complete').length, total: items.length };
    }
    return stats;
  }, [selectedUserId, selectedItems]);

  const selectedNotes = mockNotes.filter((n) => selectedItems.some((i) => i.id === n.checklistItemId));

  const exportData = filteredMembers.map((m) => {
    const s = getUserStats(m.id);
    return { name: m.name, role: m.employeeRole || '', project: m.project || '', progress: `${s.progress}%`, overdue: s.overdue, access: `${s.accessGranted}/${s.accessTotal}` };
  });

  return (
    <AppLayout user={managerUser}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Onboarding</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Monitor and manage your team's onboarding progress</p>
          </div>
          <ExportButtons data={exportData} filename="team-onboarding" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard title="Team Members" value={filteredMembers.length} icon={Users} subtitle="new hires" />
          <StatsCard title="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} subtitle="completion rate" />
          <StatsCard title="Overdue Items" value={totalOverdue} icon={AlertTriangle} subtitle="across team" trend={totalOverdue > 0 ? { value: 'needs attention', positive: false } : undefined} />
          <StatsCard title="Avg Days" value="8" icon={Clock} subtitle="to onboard" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search employees..." className="h-8 text-xs pl-8" />
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="All Projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Project Phoenix">Project Phoenix</SelectItem>
              <SelectItem value="Project Atlas">Project Atlas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Developer">Developer</SelectItem>
              <SelectItem value="BA">Business Analyst</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: team table */}
          <div className="lg:col-span-3">
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-1">Start</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-2">Access</div>
                <div className="col-span-1">Overdue</div>
                <div className="col-span-1"></div>
              </div>
              {filteredMembers.map((member) => {
                const stats = getUserStats(member.id);
                const isSelected = selectedUserId === member.id;
                return (
                  <div
                    key={member.id}
                    className={`grid grid-cols-12 px-4 py-3 text-sm border-b last:border-b-0 items-center cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedUserId(member.id)}
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">{member.employeeRole}</div>
                    <div className="col-span-1 text-xs text-muted-foreground">{member.startDate?.slice(5)}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Progress value={stats.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{stats.progress}%</span>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className={stats.accessGranted === stats.accessTotal ? 'text-success font-medium' : 'text-warning font-medium'}>
                        {stats.accessGranted}/{stats.accessTotal}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {stats.overdue > 0 && (
                        <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                          <AlertTriangle className="w-3 h-3" /> {stats.overdue}
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={(e) => { e.stopPropagation(); setSelectedUserId(member.id); }}>
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No team members match your filters.</div>
              )}
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="bg-card border rounded-xl p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a team member to view details</p>
              </div>
            ) : (
              <div className="bg-card border rounded-xl overflow-hidden sticky top-20">
                <div className="p-4 border-b bg-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedUser.employeeRole} · {selectedUser.project}</p>
                    </div>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex border-b">
                  {(['summary', 'checklist', 'notes'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs py-2.5 capitalize transition-colors ${
                        activeTab === tab ? 'border-b-2 border-primary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {activeTab === 'summary' && (
                    <SummaryTab stats={getUserStats(selectedUser.id)} sectionStats={sectionStats} />
                  )}
                  {activeTab === 'checklist' && (
                    <ChecklistTab items={selectedItems} onViewItem={(id) => navigate(`/item/${id}`)} />
                  )}
                  {activeTab === 'notes' && (
                    <NotesTab notes={selectedNotes} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryTab({ stats, sectionStats }: { stats: { total: number; completed: number; progress: number; overdue: number; accessGranted: number; accessTotal: number }; sectionStats: Record<string, { completed: number; total: number }> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <ProgressRing value={stats.progress} size={100} strokeWidth={8} label="complete" />
      </div>
      <div className="space-y-2 text-xs">
        {Object.entries(sectionStats).map(([section, data]) => (
          <div key={section} className="flex items-center justify-between">
            <span className="text-muted-foreground">{sectionLabels[section as ChecklistSection]}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${data.total ? (data.completed / data.total) * 100 : 0}%` }} />
              </div>
              <span className="text-foreground font-medium w-8 text-right">{data.completed}/{data.total}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Access granted</span>
          <span className={`font-medium ${stats.accessGranted === stats.accessTotal ? 'text-success' : 'text-warning'}`}>{stats.accessGranted}/{stats.accessTotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Overdue items</span>
          <span className={`font-medium ${stats.overdue > 0 ? 'text-destructive' : 'text-foreground'}`}>{stats.overdue}</span>
        </div>
      </div>
    </div>
  );
}

function ChecklistTab({ items, onViewItem }: { items: ChecklistItem[]; onViewItem: (id: string) => void }) {
  const sections = ['Access', 'Day1', 'Week1', 'Week2Plus'] as ChecklistSection[];
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {sections.map((section) => {
        const sectionItems = items.filter((i) => i.section === section);
        if (sectionItems.length === 0) return null;
        return (
          <div key={section}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{sectionLabels[section]}</h4>
            {sectionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-accent/50 px-2 rounded-md"
                onClick={() => onViewItem(item.id)}
              >
                <span className="text-xs text-foreground truncate flex-1">{item.title}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function NotesTab({ notes }: { notes: typeof mockNotes }) {
  if (notes.length === 0) return <p className="text-xs text-muted-foreground">No notes yet.</p>;
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {notes.map((note) => (
        <div key={note.id} className="p-2.5 bg-accent/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-medium text-foreground">{note.authorName}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${note.authorRole === 'manager' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {note.authorRole}
            </span>
            <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-foreground">{note.text}</p>
        </div>
      ))}
    </div>
  );
}
