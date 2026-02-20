import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { templates as mockTemplates } from '@/data/mockData';
import type { ChecklistTemplate, EmployeeRole, ChecklistSection } from '@/types/onboarding';
import { Save, Plus, Trash2 } from 'lucide-react';

const adminUser = {
  id: 'u-admin',
  name: 'Admin User',
  email: 'admin@company.com',
  role: 'admin' as const,
  profileComplete: true,
};

const roles: EmployeeRole[] = ['BA', 'Developer', 'QA', 'Manager', 'Other'];
const sections: ChecklistSection[] = ['Access', 'Day1', 'Week1', 'Week2Plus'];
const sectionLabels: Record<ChecklistSection, string> = {
  Access: 'Access & Applications',
  Day1: 'Day 1 Activities',
  Week1: 'Week 1 Activities',
  Week2Plus: 'Week 2+ Activities',
};

export default function AdminTemplates() {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('Developer');
  const [items, setItems] = useState<ChecklistTemplate[]>(mockTemplates);
  const [activeNav, setActiveNav] = useState<'templates' | 'activities' | 'integrations'>('templates');

  const roleItems = items.filter((i) => i.role === selectedRole);

  const updateItem = (id: string, field: keyof ChecklistTemplate, value: any) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addItem = (section: ChecklistSection) => {
    const newItem: ChecklistTemplate = {
      id: `t-new-${Date.now()}`,
      role: selectedRole,
      section,
      title: 'New Item',
      description: '',
      type: 'activity',
      mandatory: false,
      defaultOwner: 'Employee',
      targetDay: 1,
    };
    setItems((prev) => [...prev, newItem]);
  };

  return (
    <AppLayout user={adminUser}>
      <div className="flex h-[calc(100vh-53px)]">
        {/* Sidebar */}
        <div className="w-56 border-r bg-muted/30 p-4 space-y-1">
          {[
            { key: 'templates' as const, label: 'Role Templates' },
            { key: 'activities' as const, label: 'Activities Library' },
            { key: 'integrations' as const, label: 'Access Integrations' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeNav === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-foreground">Role Templates</h1>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="mb-6">
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as EmployeeRole)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r === 'BA' ? 'Business Analyst' : r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sections.map((section) => {
              const sectionItems = roleItems.filter((i) => i.section === section);
              return (
                <div key={section} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium text-foreground">{sectionLabels[section]}</h2>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => addItem(section)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Item
                    </Button>
                  </div>
                  <div className="bg-card border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                      <div className="col-span-3">Title</div>
                      <div className="col-span-3">Description</div>
                      <div className="col-span-1">Type</div>
                      <div className="col-span-1">Mandatory</div>
                      <div className="col-span-2">Owner</div>
                      <div className="col-span-1">Day</div>
                      <div className="col-span-1"></div>
                    </div>
                    {sectionItems.length === 0 && (
                      <div className="px-3 py-4 text-xs text-muted-foreground text-center">No items in this section.</div>
                    )}
                    {sectionItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-b last:border-b-0 items-center">
                        <div className="col-span-3">
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Select value={item.type} onValueChange={(v) => updateItem(item.id, 'type', v)}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="access">Access</SelectItem>
                              <SelectItem value="activity">Activity</SelectItem>
                              <SelectItem value="training">Training</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Switch
                            checked={item.mandatory}
                            onCheckedChange={(v) => updateItem(item.id, 'mandatory', v)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={item.defaultOwner}
                            onChange={(e) => updateItem(item.id, 'defaultOwner', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={item.targetDay}
                            onChange={(e) => updateItem(item.id, 'targetDay', parseInt(e.target.value) || 1)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
