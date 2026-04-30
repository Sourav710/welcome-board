import { useState } from 'react';
import { Sparkles, Heart, Users, Target, Lightbulb } from 'lucide-react';
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
        {/* Card 1: Strategic Goals */}
        <div
          onMouseEnter={() => setHovered('goals')}
          onMouseLeave={() => setHovered(null)}
          className="group relative rounded-3xl p-6 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Strategic Goals</h3>
            <div className="space-y-3">
              {[
                {
                  icon: Users,
                  title: 'Community Collaboration',
                  desc: 'Foster knowledge sharing and networking among testing professionals worldwide for collective growth.',
                  color: 'from-blue-500 to-cyan-500',
                  bg: 'bg-blue-500/5 border-blue-500/15',
                },
                {
                  icon: Lightbulb,
                  title: 'Innovation Leadership',
                  desc: 'Drive innovation in testing methodologies and best practices across the industry to stay ahead.',
                  color: 'from-cyan-500 to-teal-500',
                  bg: 'bg-cyan-500/5 border-cyan-500/15',
                },
              ].map((g) => (
                <div key={g.title} className={`flex items-start gap-3 p-3 rounded-xl border ${g.bg} hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.color} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                    <g.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{g.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Card 3: In-House Tools */}
        <div className="group relative rounded-3xl p-6 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">In-House Tools</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'One-I', desc: 'Inventory Management Platform' },
                { name: 'Automac', desc: 'Touchless Automation' },
                { name: 'Test Framework', desc: 'Reusable test automation' },
                { name: 'Data Framework', desc: 'Automated data creation' },
                { name: 'Doc Library', desc: 'Standardised document library' },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-start gap-2 p-2 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 hover:scale-[1.02] transition-all cursor-pointer border border-orange-500/10"
                >
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">{tool.name}</div>
                    <div className="text-muted-foreground text-[11px]">{tool.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
