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
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="group relative rounded-2xl bg-card border-2 border-transparent shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Colored gradient halo on hover */}
      <div className={`absolute inset-0 ${m.accentClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
      {/* Top accent bar grows on hover */}
      <div className={`h-2 w-full ${m.accentClass} group-hover:h-3 transition-all duration-300`} />
      {/* Decorative blob */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${m.accentClass} opacity-10 blur-2xl group-hover:opacity-30 group-hover:scale-125 transition-all duration-500`} />

      <div className="relative p-5 flex flex-col items-center text-center">
        {/* Avatar with animated gradient ring */}
        <div className="relative mb-3">
          <div className={`absolute inset-0 ${m.accentClass} rounded-full blur-md opacity-50 group-hover:opacity-80 group-hover:blur-lg transition-all duration-300`} />
          <div className={`relative w-20 h-20 rounded-full p-1 ${m.accentClass} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xl font-bold text-foreground">
              {m.initials}
            </div>
          </div>
        </div>

        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {m.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{m.title}</p>

        <span className={`mt-3 inline-block px-3 py-1 rounded-full ${m.accentClass} text-white text-[11px] font-semibold shadow-sm`}>
          {m.team}
        </span>

        <p className={`text-xs text-muted-foreground mt-3 leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-3'}`}>
          {m.responsibilities}
        </p>

        {/* Stat pills with color */}
        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${m.accentClass} bg-opacity-15 text-[11px] font-semibold text-white shadow-sm`}>
            <Users className="w-3 h-3" />{m.headcount} FTEs
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-[11px] font-semibold text-foreground">
            <MapPin className="w-3 h-3" />{m.location}
          </span>
        </div>

        {/* Expand hint + email — slides up on hover */}
        <div className="mt-4 flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
          <a
            href={`mailto:${m.email}`}
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${m.accentClass} text-white text-[11px] font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all`}
          >
            <Mail className="w-3 h-3" /> Email
          </a>
          <span className="text-[10px] text-muted-foreground italic">
            {expanded ? 'Click to collapse' : 'Click for more'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PodCard({ p }: { p: PodInfo }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="group relative rounded-2xl bg-card border-2 border-transparent shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Colored gradient halo on hover */}
      <div className={`absolute inset-0 ${p.accentClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
      {/* Top accent bar grows on hover */}
      <div className={`h-2 w-full ${p.accentClass} group-hover:h-3 transition-all duration-300`} />
      {/* Decorative blob */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${p.accentClass} opacity-10 blur-2xl group-hover:opacity-30 group-hover:scale-125 transition-all duration-500`} />

      <div className="relative p-5">
        {/* Emoji avatar with animated gradient ring */}
        <div className="relative w-16 h-16 mb-3">
          <div className={`absolute inset-0 ${p.accentClass} rounded-2xl blur-md opacity-50 group-hover:opacity-80 group-hover:blur-lg transition-all duration-300`} />
          <div className={`relative w-16 h-16 rounded-2xl p-1 ${p.accentClass} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <div className="w-full h-full rounded-xl bg-card flex items-center justify-center text-2xl">
              {p.emoji}
            </div>
          </div>
        </div>

        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</h4>

        <span className={`mt-2 inline-block px-3 py-0.5 rounded-full ${p.accentClass} text-white text-[10px] font-semibold shadow-sm`}>
          Led by {p.owner}
        </span>

        <p className={`text-xs text-muted-foreground mt-3 leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-3'}`}>
          {p.focus}
        </p>

        {/* Gradient tech pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {p.tech.map((t) => (
            <span
              key={t}
              className={`text-[10px] px-2.5 py-1 rounded-full ${p.accentClass} text-white font-semibold shadow-sm hover:scale-105 transition-transform`}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 text-[10px] text-muted-foreground italic opacity-70 group-hover:opacity-100 transition-opacity">
          {expanded ? 'Click to collapse' : 'Click for more'}
        </div>
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
