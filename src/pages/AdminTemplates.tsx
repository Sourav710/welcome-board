import { useState } from 'react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { teamMembers } from '@/data/mockData';
import { useChecklist } from '@/context/ChecklistContext';
import { useAuditLog } from '@/context/AuditLogContext';
import type { ChecklistItem, ChecklistSection, ChecklistItemType } from '@/types/onboarding';
import { Plus, Trash2, LayoutTemplate, Library, Plug, CalendarIcon, Users, Pencil, ExternalLink, Check, X, ScrollText, Search, Download, Network } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OrgChartAdminPanel } from '@/components/admin/OrgChartAdminPanel';

const adminUser = {
  id: 'u-admin',
  name: 'Admin User',
  email: 'admin@company.com',
  role: 'admin' as const,
  profileComplete: true,
};

const sections: ChecklistSection[] = ['Access', 'Day1', 'Week1', 'Training'];
const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access & Applications',
  Day1: 'Day 1 Activities',
  Week1: 'Secure Request',
  Week2Plus: 'Week 2+ Activities',
  Training: 'Trainings & Learning',
};

const ownerOptions = ['Employee', 'Manager', 'IT Help Desk', 'Tech Lead', 'HR', 'DevOps', 'Cloud Team'];
const typeOptions: { value: ChecklistItemType; label: string }[] = [
  { value: 'access', label: 'Access' },
  { value: 'activity', label: 'Activity' },
  { value: 'training', label: 'Training' },
];

const navItems = [
  { key: 'activities' as const, label: 'Manage Activities', icon: Library },
  { key: 'templates' as const, label: 'Role Templates', icon: LayoutTemplate },
  { key: 'orgchart' as const, label: 'Org Chart', icon: Network },
  { key: 'audit' as const, label: 'Audit Logs', icon: ScrollText },
  { key: 'integrations' as const, label: 'Integrations', icon: Plug },
];

interface NewActivity {
  title: string;
  description: string;
  section: ChecklistSection;
  type: ChecklistItemType;
  owner: string;
  dueDate: Date | undefined;
  mandatory: boolean;
  linkUrl: string;
}

const emptyActivity: NewActivity = {
  title: '',
  description: '',
  section: 'Day1',
  type: 'activity',
  owner: 'Employee',
  dueDate: undefined,
  mandatory: false,
  linkUrl: '',
};

export default function AdminTemplates() {
  const { items, addItem, removeItem, updateItem } = useChecklist();
  const { logs, addLog } = useAuditLog();
  const [activeNav, setActiveNav] = useState<'activities' | 'templates' | 'orgchart' | 'audit' | 'integrations'>('activities');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newActivity, setNewActivity] = useState<NewActivity>({ ...emptyActivity });
  const [filterSection, setFilterSection] = useState<ChecklistSection | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>();
  const [editLinkUrl, setEditLinkUrl] = useState('');

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditDueDate(item.dueDate ? new Date(item.dueDate) : undefined);
    setEditLinkUrl(item.linkUrl || '');
  };

  const saveEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    updateItem(id, {
      dueDate: editDueDate ? format(editDueDate, 'yyyy-MM-dd') : undefined,
      linkUrl: editLinkUrl || undefined,
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
    toast({ title: 'Activity updated' });
    addLog({
      userId: 'u10', userName: 'Admin User', userRole: 'admin',
      action: 'TEMPLATE_EDIT', category: 'admin',
      details: `Updated "${item?.title || id}" — due date & link URL`,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const filteredItems = filterSection === 'all' ? items : items.filter((i) => i.section === filterSection);

  const handleAdd = () => {
    if (!newActivity.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter an activity title.', variant: 'destructive' });
      return;
    }
    if (!newActivity.dueDate) {
      toast({ title: 'Due date required', description: 'Please select a due date.', variant: 'destructive' });
      return;
    }

    const newItem: ChecklistItem = {
      id: `ci-admin-${Date.now()}`,
      userId: 'all',
      templateId: '',
      section: newActivity.section,
      title: newActivity.title,
      description: newActivity.description,
      owner: newActivity.owner,
      linkUrl: newActivity.linkUrl || undefined,
      status: 'not_started',
      type: newActivity.type,
      mandatory: newActivity.mandatory,
      dueDate: format(newActivity.dueDate, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(newItem);
    setNewActivity({ ...emptyActivity });
    setShowAddDialog(false);
    toast({
      title: 'Activity added',
      description: `"${newItem.title}" has been added for all users.`,
    });
  };

  const deleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    removeItem(id);
    toast({ title: 'Activity removed' });
    addLog({
      userId: 'u10', userName: 'Admin User', userRole: 'admin',
      action: 'TEMPLATE_DELETE', category: 'admin',
      details: `Deleted activity "${item?.title || id}"`,
    });
  };

  return (
    <AppLayout user={adminUser}>
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <div className="w-56 border-r bg-muted/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Admin Console</p>
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                activeNav === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <div className="border-t my-3" />
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground mb-2">Total Activities</p>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground mb-2">Team Members</p>
            <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl">
            {activeNav === 'audit' ? (
              <AuditLogPanel logs={logs} />
            ) : activeNav === 'orgchart' ? (
              <OrgChartAdminPanel />
            ) : activeNav === 'templates' ? (
              <RoleTemplatesPanel items={items} />
            ) : activeNav === 'integrations' ? (
              <IntegrationsPanel />
            ) : (
            <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Activities</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Add and manage onboarding activities for all employees</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Activity
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground font-medium">Filter by section:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={filterSection === 'all' ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setFilterSection('all')}
                >
                  All
                </Button>
                {sections.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={filterSection === s ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setFilterSection(s)}
                  >
                    {sectionLabels[s]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                <div className="col-span-3">Activity</div>
                <div className="col-span-2">Section</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Owner</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Link URL</div>
                <div className="col-span-1"></div>
              </div>
              {filteredItems.length === 0 && (
                <div className="px-4 py-8 text-sm text-muted-foreground text-center">No activities found. Click "Add Activity" to create one.</div>
              )}
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id;
                return (
                <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b last:border-b-0 items-center hover:bg-accent/30 transition-colors">
                  <div className="col-span-3">
                    <p className="font-medium text-foreground text-xs leading-tight">{item.title}</p>
                    {item.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-foreground">
                      {sectionLabels[item.section]}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-muted-foreground">{item.owner}</span>
                  </div>
                  <div className="col-span-2">
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn('w-full h-7 justify-start text-left text-xs font-normal', !editDueDate && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {editDueDate ? format(editDueDate, 'MMM d, yyyy') : 'Pick date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={editDueDate} onSelect={setEditDueDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-xs text-muted-foreground">{item.dueDate}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {isEditing ? (
                      <Input
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-7 text-xs"
                      />
                    ) : (
                      item.linkUrl ? (
                        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.linkUrl.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end gap-0.5">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary hover:text-primary" onClick={() => saveEdit(item.id)}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={cancelEdit}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={() => startEditing(item)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Assigned To info */}
            <div className="mt-4 p-4 bg-accent/30 border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Assigned to all employees</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5 bg-card border rounded-full px-2.5 py-1">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary">
                      {m.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-xs text-foreground">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Complete Security Training"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the activity..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Section *</Label>
                <Select value={newActivity.section} onValueChange={(v) => setNewActivity((p) => ({ ...p, section: v as ChecklistSection }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s} value={s}>{sectionLabels[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={newActivity.type} onValueChange={(v) => setNewActivity((p) => ({ ...p, type: v as ChecklistItemType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Owner *</Label>
                <Select value={newActivity.owner} onValueChange={(v) => setNewActivity((p) => ({ ...p, owner: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !newActivity.dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newActivity.dueDate ? format(newActivity.dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newActivity.dueDate}
                      onSelect={(d) => setNewActivity((p) => ({ ...p, dueDate: d }))}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Link URL (optional)</Label>
              <Input
                value={newActivity.linkUrl}
                onChange={(e) => setNewActivity((p) => ({ ...p, linkUrl: e.target.value }))}
                placeholder="https://training.company.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newActivity.mandatory}
                onCheckedChange={(v) => setNewActivity((p) => ({ ...p, mandatory: v }))}
              />
              <Label className="text-sm">Mandatory activity</Label>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" /> Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// Audit Log Panel Component
function AuditLogPanel({ logs }: { logs: import('@/context/AuditLogContext').AuditLogEntry[] }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'auth', 'checklist', 'admin', 'access', 'system'] as const;
  const categoryColors: Record<string, string> = {
    auth: 'bg-info/15 text-info',
    checklist: 'bg-success/15 text-success',
    admin: 'bg-warning/15 text-warning',
    access: 'bg-primary/15 text-primary',
    system: 'bg-muted text-muted-foreground',
  };

  const filtered = logs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (search && !log.details.toLowerCase().includes(search.toLowerCase()) && !log.userName.toLowerCase().includes(search.toLowerCase()) && !log.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportLogs = () => {
    const csv = [
      'Timestamp,User,Role,Action,Category,Details',
      ...filtered.map((l) => `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.category}","${l.details}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all actions across the platform</p>
        </div>
        <Button variant="outline" onClick={exportLogs} className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="h-8 text-xs pl-8" />
        </div>
        <div className="flex gap-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? 'default' : 'outline'}
              className="h-7 text-xs capitalize"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">User</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-4">Details</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">No audit logs match your filters.</div>
        )}
        {filtered.map((log) => (
          <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs border-b last:border-b-0 items-center hover:bg-accent/30 transition-colors">
            <div className="col-span-2 text-muted-foreground font-mono">
              {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
            </div>
            <div className="col-span-2 font-medium text-foreground">{log.userName}</div>
            <div className="col-span-1">
              <span className="capitalize text-muted-foreground">{log.userRole}</span>
            </div>
            <div className="col-span-2">
              <span className="font-mono text-foreground">{log.action}</span>
            </div>
            <div className="col-span-1">
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${categoryColors[log.category] || ''}`}>
                {log.category}
              </span>
            </div>
            <div className="col-span-4 text-muted-foreground truncate">{log.details}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{filtered.length} entries shown</p>
    </>
  );
}

// Role Templates Panel — overview of activities grouped by section/owner role
function RoleTemplatesPanel({ items }: { items: ChecklistItem[] }) {
  const grouped = sections.reduce((acc, section) => {
    acc[section] = items.filter((i) => i.section === section);
    return acc;
  }, {} as Record<ChecklistSection, ChecklistItem[]>);

  const totalMandatory = items.filter((i) => i.mandatory).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-primary" />
          Role Templates
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Onboarding template breakdown by section and assigned role.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Activities</p>
          <p className="text-2xl font-bold text-foreground">{items.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Mandatory</p>
          <p className="text-2xl font-bold text-warning">{totalMandatory}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Sections</p>
          <p className="text-2xl font-bold text-primary">{Object.keys(grouped).filter(k => grouped[k as ChecklistSection].length > 0).length}</p>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="space-y-4">
        {sections.map((section) => {
          const sectionItems = grouped[section];
          if (sectionItems.length === 0) return null;
          const ownerCounts = sectionItems.reduce((acc, item) => {
            acc[item.owner] = (acc[item.owner] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return (
            <div key={section} className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{sectionLabels[section]}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{sectionItems.length} activities</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(ownerCounts).map(([owner, count]) => (
                    <span key={owner} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {owner}: {count}
                    </span>
                  ))}
                </div>
              </div>
              <div className="divide-y">
                {sectionItems.map((item) => (
                  <div key={item.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.mandatory && <span className="text-[10px] bg-warning/15 text-warning px-1.5 py-0.5 rounded font-medium shrink-0">REQ</span>}
                      <span className="text-sm text-foreground truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                      <span className="text-xs text-muted-foreground">{item.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Integrations Panel
function IntegrationsPanel() {
  const integrations = [
    { name: 'ServiceNow', description: 'IT service management & access requests', status: 'connected', category: 'Access' },
    { name: 'Jira', description: 'Issue tracking & project workflow', status: 'connected', category: 'Workflow' },
    { name: 'Okta SSO', description: 'Single sign-on & identity provider', status: 'connected', category: 'Auth' },
    { name: 'Workday', description: 'HR data sync for new hires', status: 'available', category: 'HR' },
    { name: 'Slack', description: 'Team notifications & onboarding alerts', status: 'available', category: 'Comms' },
    { name: 'MongoDB Atlas', description: 'Persistent data store (Data API)', status: 'available', category: 'Data' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Plug className="w-6 h-6 text-primary" />
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          External systems connected to the onboarding platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((int) => (
          <div key={int.name} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plug className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{int.name}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{int.category}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                int.status === 'connected' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {int.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{int.description}</p>
            <Button
              variant={int.status === 'connected' ? 'outline' : 'default'}
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => toast({ title: int.status === 'connected' ? `${int.name} settings` : `Connect ${int.name}`, description: 'Integration management is a prototype preview.' })}
            >
              {int.status === 'connected' ? 'Configure' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
