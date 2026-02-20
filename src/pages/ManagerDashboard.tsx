import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { managerUser, teamMembers, allChecklistItems, notes as mockNotes } from '@/data/mockData';
import type { User, ChecklistItem, ChecklistSection } from '@/types/onboarding';
import { Users, AlertTriangle } from 'lucide-react';

const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access',
  Day1: 'Day 1',
  Week1: 'Week 1',
  Week2Plus: 'Week 2+',
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'summary' | 'checklist' | 'notes'>('summary');

  const filteredMembers = teamMembers.filter((m) => {
    if (filterProject !== 'all' && m.project !== filterProject) return false;
    if (filterRole !== 'all' && m.employeeRole !== filterRole) return false;
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
    return {
      total: items.length,
      completed,
      progress: items.length ? Math.round((completed / items.length) * 100) : 0,
      overdue,
      accessGranted,
      accessTotal: accessItems.length,
    };
  };

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

  return (
    <AppLayout user={managerUser}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Team Onboarding</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {filteredMembers.length} team members
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
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
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
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
                      isSelected ? 'bg-muted' : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedUserId(member.id)}
                  >
                    <div className="col-span-3 font-medium text-foreground">{member.name}</div>
                    <div className="col-span-2 text-xs text-muted-foreground">{member.employeeRole}</div>
                    <div className="col-span-1 text-xs text-muted-foreground">{member.startDate?.slice(5)}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Progress value={stats.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{stats.progress}%</span>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className={stats.accessGranted === stats.accessTotal ? 'text-success' : 'text-warning'}>
                        {stats.accessGranted}/{stats.accessTotal}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {stats.overdue > 0 && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
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
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="bg-card border rounded-lg p-8 text-center text-sm text-muted-foreground">
                Select a team member to view details
              </div>
            ) : (
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-foreground">{selectedUser.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.employeeRole} • {selectedUser.project}</p>
                </div>
                {/* Tabs */}
                <div className="flex border-b">
                  {(['summary', 'checklist', 'notes'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs py-2 capitalize transition-colors ${
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

function SummaryTab({ stats, sectionStats }: { stats: ReturnType<typeof Object>; sectionStats: Record<string, { completed: number; total: number }> }) {
  const s = stats as { total: number; completed: number; progress: number; overdue: number; accessGranted: number; accessTotal: number };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="40"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${s.progress * 2.51} ${251 - s.progress * 2.51}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-foreground">{s.progress}%</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        {Object.entries(sectionStats).map(([section, data]) => (
          <div key={section} className="flex items-center justify-between">
            <span className="text-muted-foreground">{sectionLabels[section as ChecklistSection]}</span>
            <span className="text-foreground font-medium">{data.completed}/{data.total}</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Access granted</span>
          <span className="text-foreground font-medium">{s.accessGranted}/{s.accessTotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Overdue items</span>
          <span className={`font-medium ${s.overdue > 0 ? 'text-destructive' : 'text-foreground'}`}>{s.overdue}</span>
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
                className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-muted/50 px-1 rounded"
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
        <div key={note.id} className="p-2 bg-muted/50 rounded">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs font-medium text-foreground">{note.authorName}</span>
            <span className="text-xs text-muted-foreground">• {new Date(note.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-foreground">{note.text}</p>
        </div>
      ))}
    </div>
  );
}
