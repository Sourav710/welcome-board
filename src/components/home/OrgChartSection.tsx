import { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Search, ZoomIn, ZoomOut, Mail, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { orgChart, OrgNode } from '@/data/companyData';

function LeaderCard({
  node,
  collapsed,
  onToggle,
  highlight,
}: {
  node: OrgNode;
  collapsed: boolean;
  onToggle: () => void;
  highlight: boolean;
}) {
  const reportsCount = node.reports?.length ?? 0;
  return (
    <div
      className={`group inline-block rounded-2xl p-3 bg-white dark:bg-card border-2 shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer min-w-[180px] ${
        highlight ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-transparent'
      }`}
      onClick={onToggle}
      title={node.title}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
          {node.initials}
        </div>
        <div className="text-left min-w-0">
          <div className="text-sm font-bold truncate">{node.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{node.title}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px]">
        <a
          href={`mailto:${node.email}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Mail className="w-3 h-3" />Contact
        </a>
        {reportsCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold">
            <Users className="w-3 h-3" />{reportsCount} {collapsed ? '▸' : '▾'}
          </span>
        )}
      </div>
    </div>
  );
}

function renderNode(
  node: OrgNode,
  collapsedIds: Set<string>,
  toggle: (id: string) => void,
  query: string,
): JSX.Element {
  const collapsed = collapsedIds.has(node.id);
  const matches = query.length > 0 && (node.name.toLowerCase().includes(query) || node.title.toLowerCase().includes(query));
  const card = <LeaderCard node={node} collapsed={collapsed} onToggle={() => toggle(node.id)} highlight={matches} />;

  if (!node.reports || node.reports.length === 0 || collapsed) return card as any;
  return (
    <TreeNode label={card}>
      {node.reports.map((r) => (
        <TreeNode key={r.id} label={renderNode(r, collapsedIds, toggle, query)} />
      ))}
    </TreeNode>
  ) as any;
}

export function OrgChartSection() {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState('');

  const toggle = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section id="org-chart" className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Leadership & Org Chart
        </h2>
        <p className="text-muted-foreground mt-3">Click cards to expand or collapse branches.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
            placeholder="Search leader by name or title..."
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-indigo-950/30 dark:via-card dark:to-pink-950/30 border shadow-xl p-6 overflow-auto">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }} className="inline-block min-w-full">
          <Tree
            lineWidth="2px"
            lineColor="hsl(var(--primary))"
            lineBorderRadius="12px"
            label={renderNode(orgChart, collapsedIds, toggle, query)}
          >
            {!collapsedIds.has(orgChart.id) &&
              orgChart.reports?.map((r) => (
                <TreeNode key={r.id} label={renderNode(r, collapsedIds, toggle, query)} />
              ))}
          </Tree>
        </div>
      </div>
    </section>
  );
}
