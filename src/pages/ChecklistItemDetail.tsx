import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { currentUser, checklistItems, accessRequests, notes as mockNotes } from '@/data/mockData';
import type { Note, ItemStatus } from '@/types/onboarding';
import { ArrowLeft, ExternalLink, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const statusSteps: { key: ItemStatus; label: string }[] = [
  { key: 'not_started', label: 'Not Started' },
  { key: 'pending', label: 'Request Submitted' },
  { key: 'in_progress', label: 'Pending Approval' },
  { key: 'complete', label: 'Approved' },
];

export default function ChecklistItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = checklistItems.find((i) => i.id === id);
  const relatedRequests = accessRequests.filter((r) => r.checklistItemId === id);
  const [itemNotes, setItemNotes] = useState<Note[]>(mockNotes.filter((n) => n.checklistItemId === id));
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState<ItemStatus>(item?.status || 'not_started');

  if (!item) {
    return (
      <AppLayout user={currentUser}>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground">Item not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const sectionLabel = item.section === 'Week2Plus' ? 'Week 2+' : item.section === 'Day1' ? 'Day 1' : item.section;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === status);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      checklistItemId: id!,
      authorId: currentUser.id,
      authorRole: 'employee',
      authorName: currentUser.name,
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setItemNotes((prev) => [...prev, note]);
    setNewNote('');
  };

  const requestAccess = () => {
    setStatus('pending');
  };

  return (
    <AppLayout user={currentUser}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            My Onboarding
          </button>
          <span>/</span>
          <span>{sectionLabel}</span>
          <span>/</span>
          <span className="text-foreground">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Item details card */}
            <div className="bg-card border rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{item.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Owner</span>
                  <span className="text-foreground font-medium">{item.owner}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Due Date</span>
                  <span className="text-foreground font-medium">{item.dueDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Type</span>
                  <span className="text-foreground font-medium capitalize">{item.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Mandatory</span>
                  <span className="text-foreground font-medium">{item.mandatory ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-card border rounded-lg p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Status Timeline</h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                          i <= currentStepIndex
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {i < currentStepIndex ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : i === currentStepIndex ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`text-xs mt-1 text-center ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity notes */}
            <div className="bg-card border rounded-lg p-5">
              <h3 className="text-sm font-medium text-foreground mb-3">Activity Notes</h3>
              <div className="space-y-3 mb-4">
                {itemNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                {itemNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{note.authorName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${note.authorRole === 'manager' ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'}`}>
                        {note.authorRole}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="text-sm min-h-[60px]"
                />
                <Button variant="outline" size="sm" className="shrink-0 self-end" onClick={addNote}>
                  Add Note
                </Button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Access request card */}
            {item.type === 'access' && (
              <div className="bg-card border rounded-lg p-5">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">Raise access request in the external system.</p>
                </div>
                {item.linkUrl && (
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => {
                      window.open(item.linkUrl, '_blank');
                      requestAccess();
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Access Request Form
                  </Button>
                )}
                {!item.linkUrl && status === 'not_started' && (
                  <Button variant="outline" className="w-full mb-4" onClick={requestAccess}>
                    Submit Request
                  </Button>
                )}

                {/* Related tickets */}
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Related Tickets</h4>
                {relatedRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tickets yet.</p>
                ) : (
                  <div className="space-y-2">
                    {relatedRequests.map((req) => (
                      <div key={req.id} className="p-2 border rounded-md bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-foreground">{req.externalTicketId}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {req.systemName} • Updated {new Date(req.updatedAt).toLocaleDateString()}
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
    </AppLayout>
  );
}
