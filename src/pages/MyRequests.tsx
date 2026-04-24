import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { currentUser, accessRequests } from '@/data/mockData';
import { useChecklist } from '@/context/ChecklistContext';
import {
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Copy,
  Check,
  CalendarClock,
  User as UserIcon,
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CircleDashed,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import type { ChecklistItem, ItemStatus } from '@/types/onboarding';

function getLoggedInUser() {
  try {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return currentUser;
}

type StatusFilter = 'all' | ItemStatus;
type SortKey = 'title' | 'status' | 'dueDate';
type ViewMode = 'list' | 'grid';

const statusFilters: { key: StatusFilter; label: string; icon: typeof CheckCircle2 }[] = [
  { key: 'all', label: 'All', icon: CircleDashed },
  { key: 'not_started', label: 'Not Started', icon: CircleDashed },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'pending', label: 'Pending', icon: AlertTriangle },
  { key: 'complete', label: 'Complete', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
];

export default function MyRequests() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { items } = useChecklist();
  const activeUser = getLoggedInUser();

  const userItems = items.filter((i) => i.userId === activeUser.id);
  const accessItems = userItems.filter(
    (i) => i.type === 'access' || i.type === 'activity' || i.type === 'training',
  );

  const requests = useMemo(
    () =>
      accessItems.map((item) => ({
        item,
        tickets: accessRequests.filter((r) => r.checklistItemId === item.id),
      })),
    [accessItems],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length };
    for (const { item } of requests) c[item.status] = (c[item.status] ?? 0) + 1;
    return c;
  }, [requests]);

  const filtered = useMemo(() => {
    let list = requests.filter((r) =>
      r.item.title.toLowerCase().includes(search.toLowerCase()),
    );
    if (statusFilter !== 'all') list = list.filter((r) => r.item.status === statusFilter);
    list = [...list].sort((a, b) => {
      const av = (a.item[sortKey] ?? '') as string;
      const bv = (b.item[sortKey] ?? '') as string;
      const cmp = String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [requests, search, statusFilter, sortKey, sortAsc]);

  const selected = selectedId ? requests.find((r) => r.item.id === selectedId) : null;

  const copyTicket = (id: string, ticket: string) => {
    navigator.clipboard.writeText(ticket).then(() => {
      setCopiedId(id);
      toast({ title: 'Copied', description: `Ticket ${ticket} copied to clipboard` });
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((s) => !s);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const isOverdue = (item: ChecklistItem) =>
    item.status !== 'complete' &&
    item.dueDate &&
    new Date(item.dueDate).getTime() < Date.now();

  return (
    <AppLayout user={activeUser}>
      <div className="max-w-6xl mx-auto px-6 py-6 animate-fade-in">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track all your access and service requests
            </p>
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border">
            <Button
              size="sm"
              variant={view === 'list' ? 'default' : 'ghost'}
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" /> List
            </Button>
            <Button
              size="sm"
              variant={view === 'grid' ? 'default' : 'ghost'}
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </Button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
          {statusFilters.map(({ key, label, icon: Icon }) => {
            const active = statusFilter === key;
            const count = counts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`group rounded-xl border px-3 py-2.5 text-left transition-all hover-scale ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card hover:border-primary/40'
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-lg font-semibold leading-none">{count}</span>
                </div>
                <div
                  className={`text-[11px] mt-1.5 font-medium ${
                    active ? 'text-primary-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="h-8 text-xs pl-8"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-muted-foreground mr-1">Sort:</span>
            {(['title', 'status', 'dueDate'] as SortKey[]).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={sortKey === k ? 'secondary' : 'ghost'}
                className="h-7 text-xs px-2 gap-1 capitalize"
                onClick={() => toggleSort(k)}
              >
                {k === 'dueDate' ? 'Due' : k}
                {sortKey === k && (
                  <ArrowUpDown
                    className={`w-3 h-3 transition-transform ${sortAsc ? '' : 'rotate-180'}`}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl px-4 py-12 text-center text-sm text-muted-foreground animate-fade-in">
            No requests match your filters.
          </div>
        ) : view === 'list' ? (
          <div className="bg-card border rounded-xl overflow-hidden animate-fade-in">
            <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
              <div className="col-span-3">Request</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Ticket</div>
              <div className="col-span-1"></div>
            </div>
            {filtered.map(({ item, tickets }) => {
              const overdue = isOverdue(item);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 px-4 py-3 text-sm border-b last:border-b-0 items-center hover:bg-accent/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="col-span-3 font-medium text-foreground flex items-center gap-2">
                    {item.title}
                    {overdue && (
                      <Badge
                        variant="outline"
                        className="border-destructive/40 text-destructive text-[10px] px-1.5 py-0 h-4"
                      >
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">{item.owner}</div>
                  <div
                    className={`col-span-2 text-xs ${
                      overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {item.dueDate}
                  </div>
                  <div className="col-span-2 text-xs">
                    {tickets.length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTicket(item.id, tickets[0].externalTicketId);
                        }}
                        className="font-mono text-foreground inline-flex items-center gap-1 hover:text-primary transition-colors"
                        title="Copy ticket ID"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                        {tickets[0].externalTicketId}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            {filtered.map(({ item, tickets }) => {
              const overdue = isOverdue(item);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="text-left bg-card border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all hover-scale"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-sm text-foreground line-clamp-2">
                      {item.title}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3 h-3" /> {item.owner}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        overdue ? 'text-destructive font-medium' : ''
                      }`}
                    >
                      <CalendarClock className="w-3 h-3" /> {item.dueDate}
                      {overdue && <span className="ml-1">(Overdue)</span>}
                    </div>
                    {tickets.length > 0 && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <Ticket className="w-3 h-3" /> {tickets[0].externalTicketId}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Detail side panel */}
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            {selected && (
              <>
                <SheetHeader>
                  <div className="flex items-center justify-between gap-2">
                    <SheetTitle className="text-base pr-6">{selected.item.title}</SheetTitle>
                    <StatusBadge status={selected.item.status} />
                  </div>
                  <SheetDescription className="text-xs">
                    {selected.item.description || 'No description provided.'}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                        Owner
                      </div>
                      <div className="text-xs font-medium flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3" /> {selected.item.owner}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                        Due Date
                      </div>
                      <div
                        className={`text-xs font-medium flex items-center gap-1.5 ${
                          isOverdue(selected.item) ? 'text-destructive' : ''
                        }`}
                      >
                        <CalendarClock className="w-3 h-3" /> {selected.item.dueDate}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">
                      Linked Tickets
                    </div>
                    {selected.tickets.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">
                        No external tickets raised yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selected.tickets.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                          >
                            <div>
                              <div className="font-mono text-xs">{t.externalTicketId}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {t.systemName}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2 gap-1"
                              onClick={() => copyTicket(selected.item.id, t.externalTicketId)}
                            >
                              {copiedId === selected.item.id ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 gap-1.5"
                      onClick={() => navigate(`/item/${selected.item.id}`)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Details
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedId(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
