import { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin } from 'lucide-react';
import { departments } from '@/data/companyData';

export function DepartmentTabsSection({ compact = false }: { compact?: boolean } = {}) {
  const [active, setActive] = useState(departments[0].id);
  const dept = departments.find((d) => d.id === active)!;

  return (
    <section className={compact ? 'px-2 pb-2' : 'relative py-20 px-6 max-w-7xl mx-auto'}>
      {!compact && (
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
            Department Contacts
          </h2>
          <p className="text-muted-foreground mt-3">Reach the right team in one click.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 ${
              active === d.id
                ? `bg-gradient-to-r ${d.gradient} text-white shadow-lg`
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <span className="mr-1">{d.emoji}</span>{d.name}
          </button>
        ))}
      </div>

      <div
        key={dept.id}
        className="rounded-3xl overflow-hidden border bg-card shadow-2xl animate-fade-in"
      >
        <div className={`bg-gradient-to-r ${dept.gradient} text-white p-6`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{dept.emoji}</span>
            <div>
              <h3 className="text-2xl font-bold">{dept.name}</h3>
              <p className="text-white/85 text-sm">Department Head: {dept.head}</p>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href={`mailto:${dept.email}`} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent transition-colors group">
            <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="text-sm font-medium truncate">{dept.email}</div>
            </div>
          </a>
          <a href={`tel:${dept.phone}`} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent transition-colors group">
            <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="text-sm font-medium">{dept.phone}</div>
            </div>
          </a>
          <div className="flex items-center gap-3 p-3 rounded-xl border">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-xs text-muted-foreground">Teams</div>
              <div className="text-sm font-medium">{dept.teams}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border">
            <MapPin className="w-5 h-5 text-rose-600" />
            <div>
              <div className="text-xs text-muted-foreground">Office</div>
              <div className="text-sm font-medium">{dept.office}</div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <h4 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wide">Key Contacts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dept.contacts.map((c) => (
              <a
                key={c.label}
                href={`mailto:${c.email}`}
                className={`block p-3 rounded-xl bg-gradient-to-br ${dept.gradient} bg-opacity-10 text-white hover:scale-105 transition-transform shadow-md`}
              >
                <div className="text-xs opacity-90">{c.label}</div>
                <div className="text-sm font-semibold truncate">{c.email}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
