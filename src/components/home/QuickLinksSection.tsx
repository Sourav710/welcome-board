import { quickLinks } from '@/data/companyData';

export function QuickLinksSection() {
  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Quick Links & Resources
        </h2>
        <p className="text-muted-foreground mt-3">Everything you need, one tap away.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            title={link.title}
            className="group relative rounded-2xl overflow-hidden p-6 text-center bg-white dark:bg-card border shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-3xl shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                {link.emoji}
              </div>
              <div className="text-sm font-semibold group-hover:text-white transition-colors">{link.title}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
