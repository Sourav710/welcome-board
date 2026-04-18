import { useState, useMemo } from 'react';
import { Mail, MapPin, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOrgChart, type ManagerInfo, type PodInfo } from '@/hooks/useOrgChart';

function LeaderHero({ leader }: { leader: ReturnType<typeof useOrgChart>['data'] extends infer T ? T extends { leader: infer L } ? L : never : never }) {
  return (
    <div className="flex justify-center mb-10">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 dark:from-primary dark:to-blue-900 text-primary-foreground p-6 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-8 bottom-0 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full ring-4 ring-orange-400 bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
            {leader.initials}
          </div>
          <h3 className="text-xl font-bold">{leader.name}</h3>
          <p className="text-sm text-primary-foreground/80 mt-1">{leader.title}</p>
          <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs italic font-medium">
            {leader.department}
          </span>
          {leader.bio && (
            <p className="text-xs text-primary-foreground/75 mt-4 leading-relaxed">{leader.bio}</p>
          )}
          <a
            href={`mailto:${leader.email}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          >
            <Mail className="w-3.5 h-3.5" /> {leader.email}
          </a>
        </div>
      </div>
    </div>
  );
}

function HeadcountBar({ hc }: { hc: { total: number; locations: { name: string; count: number }[] } }) {
  return (
    <div className="rounded-2xl bg-card border shadow-md px-6 py-5 mb-10">
      <div className="flex flex-wrap items-center justify-around gap-6">
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest text-orange-500 uppercase">Total HC</div>
          <div className="text-3xl font-extrabold text-orange-500 mt-1">{hc.total}</div>
        </div>
        <div className="hidden md:block w-px h-12 bg-border" />
        {hc.locations.map((loc) => (
          <div key={loc.name} className="text-center">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{loc.name}</div>
            <div className="mt-1">
              <span className="text-2xl font-extrabold text-foreground">{loc.count}</span>
              <span className="text-xs text-muted-foreground ml-1 font-medium">FTEs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManagerCard({ m }: { m: ManagerInfo }) {
  return (
    <div className="group relative rounded-2xl bg-card border shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
      <div className={`h-1.5 w-full ${m.accentClass}`} />
      <div className="p-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center text-xl font-bold text-foreground shadow-md mb-3">
          {m.initials}
        </div>
        <h4 className="text-base font-bold text-foreground">{m.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{m.title}</p>
        <Badge variant="secondary" className="mt-3 text-[11px]">{m.team}</Badge>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">
          {m.responsibilities}
        </p>
        <div className="flex items-center gap-3 mt-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{m.headcount} FTEs</span>
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>
        </div>
        <a
          href={`mailto:${m.email}`}
          className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
        >
          <Mail className="w-3 h-3" /> Contact
        </a>
      </div>
    </div>
  );
}

function PodCard({ p }: { p: PodInfo }) {
  return (
    <div className="rounded-2xl bg-card border shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 p-5">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mb-3">
        {p.emoji}
      </div>
      <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">Led by {p.owner}</p>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{p.focus}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {p.tech.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OrgChartSection() {
  const { data, loading, error } = useOrgChart();
  const [query, setQuery] = useState('');

  const filteredManagers = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.managers;
    return data.managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <section id="org-chart" className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Leadership & Org Chart
        </h2>
        <p className="text-muted-foreground mt-3">
          Meet the team driving Business Enablement & Testing across the globe.
        </p>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground">Loading org chart…</div>}
      {error && !data && (
        <div className="text-center py-12 text-destructive">Failed to load org chart: {error}</div>
      )}

      {data && (
        <>
          <LeaderHero leader={data.leader} />
          <HeadcountBar hc={data.headcount} />

          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h3 className="text-xl font-bold text-foreground">Managers & Teams</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, team, role..."
                className="pl-9 rounded-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {filteredManagers.map((m) => (
              <ManagerCard key={m.id} m={m} />
            ))}
            {filteredManagers.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                No managers match "{query}".
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-6">Teams & PODs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.pods.map((p) => (
              <PodCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
