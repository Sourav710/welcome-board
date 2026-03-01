import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { currentUser, checklistItems, accessRequests } from '@/data/mockData';
import { ExternalLink, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MyRequests() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const accessItems = checklistItems.filter((i) => i.type === 'access');
  const requests = accessItems.map((item) => {
    const tickets = accessRequests.filter((r) => r.checklistItemId === item.id);
    return { item, tickets };
  });

  const filtered = requests.filter((r) =>
    r.item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout user={currentUser}>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all your access and service requests</p>
        </div>

        <div className="relative max-w-xs mb-4">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests..." className="h-8 text-xs pl-8" />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
            <div className="col-span-3">Request</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Ticket</div>
            <div className="col-span-1"></div>
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No requests found.</div>
          )}
          {filtered.map(({ item, tickets }) => (
            <div
              key={item.id}
              className="grid grid-cols-12 px-4 py-3 text-sm border-b last:border-b-0 items-center hover:bg-accent/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="col-span-3 font-medium text-foreground">{item.title}</div>
              <div className="col-span-2"><StatusBadge status={item.status} /></div>
              <div className="col-span-2 text-xs text-muted-foreground">{item.owner}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{item.dueDate}</div>
              <div className="col-span-2 text-xs">
                {tickets.length > 0 ? (
                  <span className="font-mono text-foreground">{tickets[0].externalTicketId}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="col-span-1">
                <Button size="sm" variant="ghost" className="h-6 text-xs px-2 gap-1">
                  <ExternalLink className="w-3 h-3" /> View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
