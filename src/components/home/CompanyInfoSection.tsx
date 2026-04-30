import { useState } from 'react';
import { Sparkles, Heart, Users, Building2 } from 'lucide-react';
import { businessUnits } from '@/data/companyData';

export function CompanyInfoSection() {
  const [activeUnit, setActiveUnit] = useState(businessUnits[0].id);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          About TIE
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Get to know who we are, what drives us, and where you fit in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Overview */}
        <div
          onMouseEnter={() => setHovered('overview')}
          onMouseLeave={() => setHovered(null)}
          className="group relative rounded-3xl p-6 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Company Overview</h3>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 italic mb-3">
              "Empowering Health Through Innovation"
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-blue-500/10"><div className="font-bold text-base">2011</div><div className="text-muted-foreground">Founded</div></div>
              <div className="p-2 rounded-lg bg-blue-500/10"><div className="font-bold text-base">300K+</div><div className="text-muted-foreground">Employees</div></div>
              <div className="p-2 rounded-lg bg-blue-500/10"><div className="font-bold text-base">150+</div><div className="text-muted-foreground">Locations</div></div>
            </div>
            {hovered === 'overview' && (
              <div className="mt-4 text-xs text-muted-foreground animate-fade-in">
                Optum is a leading information and technology-enabled health services business dedicated to helping make the health system work better for everyone.
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Vision & Culture */}
        <div className="group relative rounded-3xl p-6 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Vision & Culture</h3>
            <div className="space-y-2">
              {[
                { icon: Sparkles, label: 'Innovation', color: 'text-amber-500 bg-amber-500/10' },
                { icon: Heart, label: 'Integrity', color: 'text-rose-500 bg-rose-500/10' },
                { icon: Users, label: 'Collaboration', color: 'text-emerald-500 bg-emerald-500/10' },
              ].map((v) => (
                <div key={v.label} className={`flex items-center gap-3 p-2 rounded-xl ${v.color} hover:scale-105 transition-transform cursor-pointer`}>
                  <v.icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Business Units */}
        <div className="group relative rounded-3xl p-6 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Business Units</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {businessUnits.map((bu) => (
                <button
                  key={bu.id}
                  onClick={() => setActiveUnit(bu.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${bu.pillBg} ${activeUnit === bu.id ? 'ring-2 ring-offset-1 ring-offset-background scale-105' : 'opacity-70 hover:opacity-100'}`}
                >
                  {bu.name}
                </button>
              ))}
            </div>
            <div className="text-xs space-y-1 animate-fade-in" key={activeUnit}>
              {businessUnits.find((b) => b.id === activeUnit)?.departments.map((d) => (
                <div key={d} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-current" />{d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
