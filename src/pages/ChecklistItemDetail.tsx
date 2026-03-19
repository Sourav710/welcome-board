import { useState } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { currentUser, accessRequests } from '@/data/mockData';
import { useAuditLog } from '@/context/AuditLogContext';
import { useChecklist } from '@/context/ChecklistContext';
import { useNotes } from '@/context/NotesContext';
import type { Note, ItemStatus, AccessRequest } from '@/types/onboarding';
import { ArrowLeft, ExternalLink, Clock, AlertCircle, CheckCircle2, Timer, Ticket, Plus, Play, Ban, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusSteps: { key: ItemStatus; label: string }[] = [
  { key: 'not_started', label: 'Not Started' },
  { key: 'pending', label: 'Submitted' },
  { key: 'in_progress', label: 'In Review' },
  { key: 'complete', label: 'Approved' },
];

function getLoggedInUser() {
  try {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) return JSON.parse(stored);
  } catch {}
  return currentUser;
}

export default function ChecklistItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const { items, updateItem } = useChecklist();
  const item = items.find((i) => i.id === id);
  const activeUser = getLoggedInUser();

  // Initialize local requests and sync their status with the checklist item status
  const [localRequests, setLocalRequests] = useState<AccessRequest[]>(() => {
    const reqs = accessRequests.filter((r) => r.checklistItemId === id);
    if (item) {
      return reqs.map((r) => ({ ...r, status: item.status === 'rejected' ? 'pending' : item.status }));
    }
    return reqs;
  });

  const { addNote: addNoteToCtx, getNotesForItem } = useNotes();
  const itemNotes = getNotesForItem(id || '');
  const [newNote, setNewNote] = useState('');

  const status = item?.status || 'not_started';
  const setStatus = (newStatus: ItemStatus) => {
    if (id) {
      updateItem(id, { status: newStatus, updatedAt: new Date().toISOString() });
      // Sync related tickets with the new status
      setLocalRequests((prev) =>
        prev.map((req) => ({
          ...req,
          status: newStatus === 'rejected' ? 'pending' : newStatus,
          updatedAt: new Date().toISOString(),
        }))
      );
    }
  };

  // Ticket capture dialog
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [ticketSystem, setTicketSystem] = useState('');

  if (!item) {
    return (
      <AppLayout user={activeUser}>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground">Item not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const sectionLabel = item.section === 'Week2Plus' ? 'Week 2+' : item.section === 'Day1' ? 'Day 1' : item.section;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === status);
  const daysUntilDue = Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / 86400000);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      checklistItemId: id!,
      authorId: activeUser.id,
      authorRole: activeUser.role,
      authorName: activeUser.name,
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    addNoteToCtx(note);
    setNewNote('');
    addLog({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      action: 'NOTE_ADDED',
      category: 'checklist',
      details: `Added note on "${item.title}"`,
    });
  };

  const openServiceNow = () => {
    // Build pre-populated URL with employee details
    const params = new URLSearchParams({
      employee_name: encodeURIComponent(activeUser.name),
      employee_id: encodeURIComponent(activeUser.id),
      employee_email: encodeURIComponent(activeUser.email),
      request_type: encodeURIComponent(item.title),
      project: encodeURIComponent(activeUser.project || ''),
      manager: encodeURIComponent(activeUser.managerId || ''),
    });
    const url = item.linkUrl
      ? `${item.linkUrl}?${params.toString()}`
      : `https://servicenow.company.com/request?${params.toString()}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus('pending');

    addLog({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      action: 'ACCESS_REQUEST',
      category: 'access',
      details: `Opened access request form for "${item.title}"`,
    });

    // Show ticket capture dialog after a brief delay
    setTimeout(() => setShowTicketDialog(true), 1000);
  };

  const captureTicket = () => {
    if (!ticketId.trim()) return;
    const newReq: AccessRequest = {
      id: `ar-${Date.now()}`,
      checklistItemId: id!,
      externalTicketId: ticketId.trim().toUpperCase(),
      systemName: ticketSystem || item.title.split(' ')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalRequests((prev) => [...prev, newReq]);
    setShowTicketDialog(false);
    setTicketId('');
    setTicketSystem('');

    addLog({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      action: 'TICKET_CAPTURED',
      category: 'access',
      details: `Captured ticket ${newReq.externalTicketId} for "${item.title}"`,
    });
  };

  return (
    <AppLayout user={activeUser}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <button onClick={() => navigate('/dashboard')} className="hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> My Onboarding
          </button>
          <span className="text-border" aria-hidden="true">/</span>
          <span>{sectionLabel}</span>
          <span className="text-border" aria-hidden="true">/</span>
          <span className="text-foreground font-medium">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Item details card */}
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{item.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { label: 'Owner', value: item.owner },
                  { label: 'Due Date', value: item.dueDate },
                  { label: 'Type', value: item.type, capitalize: true },
                  { label: 'Mandatory', value: item.mandatory ? 'Yes' : 'No' },
                ].map((f) => (
                  <div key={f.label} className="bg-accent/30 rounded-lg p-3">
                    <span className="text-muted-foreground text-xs block">{f.label}</span>
                    <span className={`text-foreground font-medium ${f.capitalize ? 'capitalize' : ''}`}>{f.value}</span>
                  </div>
                ))}
              </div>
              {item.linkUrl && (
                <div className="mt-4 bg-accent/30 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs block mb-1">Service URL</span>
                  <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {item.linkUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-5">Status Timeline</h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                        i <= currentStepIndex
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted text-muted-foreground border-border'
                      }`} aria-label={`Step ${i + 1}: ${step.label} - ${i <= currentStepIndex ? 'completed' : 'pending'}`}>
                        {i < currentStepIndex ? (
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        ) : i === currentStepIndex ? (
                          <Clock className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`text-xs mt-1.5 text-center ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] rounded-full ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets Timeline */}
            {(item.type === 'access' || item.section === 'Week1') && localRequests.length > 0 && (
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" aria-hidden="true" />
                  Related Tickets Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
                  <div className="space-y-4">
                    {localRequests
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((req) => (
                        <div key={req.id} className="relative pl-10">
                          <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 ${
                            req.status === 'complete' ? 'bg-success border-success' :
                            req.status === 'in_progress' ? 'bg-primary border-primary' :
                            req.status === 'pending' ? 'bg-warning border-warning' :
                            'bg-muted border-border'
                          }`} aria-hidden="true" />
                          <div className="bg-accent/30 border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-mono font-semibold text-foreground">{req.externalTicketId}</span>
                              <StatusBadge status={req.status} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{req.systemName}</span>
                              <span>Created {format(new Date(req.createdAt), 'MMM d, yyyy h:mm a')}</span>
                              <span>Updated {format(new Date(req.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity notes */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Activity Notes</h3>
              <div className="space-y-3 mb-4">
                {itemNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                {itemNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-accent/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{note.authorName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${note.authorRole === 'manager' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {note.authorRole}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="text-sm min-h-[60px]" />
                <Button variant="outline" size="sm" className="shrink-0 self-end" onClick={addNote}>Add Note</Button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Update Status card */}
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Change the status when you receive confirmation or encounter a blocker.
              </p>
              <Select
                value={status}
                onValueChange={(val: ItemStatus) => {
                  setStatus(val);
                  addLog({
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userRole: currentUser.role,
                    action: 'STATUS_CHANGE',
                    category: 'checklist',
                    details: `Changed "${item.title}" status to ${val}`,
                  });
                }}
              >
                <SelectTrigger className="w-full mb-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="pending">Submitted / Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Completed</SelectItem>
                  <SelectItem value="rejected">Blocked / Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={status === 'complete'}
                  onClick={() => {
                    setStatus('complete');
                    addLog({
                      userId: currentUser.id,
                      userName: currentUser.name,
                      userRole: currentUser.role,
                      action: 'STATUS_CHANGE',
                      category: 'checklist',
                      details: `Marked "${item.title}" as complete`,
                    });
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={status === 'rejected'}
                  onClick={() => {
                    setStatus('rejected');
                    addLog({
                      userId: currentUser.id,
                      userName: currentUser.name,
                      userRole: currentUser.role,
                      action: 'STATUS_CHANGE',
                      category: 'checklist',
                      details: `Marked "${item.title}" as blocked`,
                    });
                  }}
                >
                  <Ban className="w-3.5 h-3.5" aria-hidden="true" /> Mark Blocked
                </Button>
              </div>
            </div>

            {/* SLA card */}
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">SLA Tracker</h3>
              </div>
              <div className={`text-center py-4 rounded-lg ${daysUntilDue < 0 ? 'bg-destructive/10' : daysUntilDue <= 2 ? 'bg-warning/10' : 'bg-success/10'}`}>
                <p className={`text-3xl font-bold ${daysUntilDue < 0 ? 'text-destructive' : daysUntilDue <= 2 ? 'text-warning' : 'text-success'}`}>
                  {Math.abs(daysUntilDue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{daysUntilDue < 0 ? 'days overdue' : 'days remaining'}</p>
              </div>
            </div>

            {/* Access request card */}
            {(item.type === 'access' || item.section === 'Week1' || item.section === 'Training' || item.section === 'Day1') && (
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">Raise access request.</p>
                </div>

                {/* Request Access opens in new tab */}
                <Button
                  variant="default"
                  className="w-full mb-3 gap-2"
                  onClick={openServiceNow}
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" /> Request Access
                </Button>

                {/* Manual ticket entry */}
                <Button
                  variant="outline"
                  className="w-full mb-4 gap-2 text-xs"
                  onClick={() => setShowTicketDialog(true)}
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Enter Ticket ID Manually
                </Button>

                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Related Tickets</h4>
                {localRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tickets yet. Click "Request Access" to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {localRequests.map((req) => (
                      <div key={req.id} className="p-3 border rounded-lg bg-accent/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-foreground">{req.externalTicketId}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {req.systemName} · Updated {new Date(req.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Capture Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" aria-hidden="true" />
              Capture Ticket ID
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter the ticket ID from ServiceNow or Jira to track this request.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-id">Ticket ID *</Label>
              <Input
                id="ticket-id"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. HELP-1046, JIRA-2345"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-system">System Name</Label>
              <Input
                id="ticket-system"
                value={ticketSystem}
                onChange={(e) => setTicketSystem(e.target.value)}
                placeholder="e.g. ServiceNow, Jira"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>Cancel</Button>
            <Button onClick={captureTicket} disabled={!ticketId.trim()}>Save Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
