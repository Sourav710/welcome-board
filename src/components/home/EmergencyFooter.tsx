import { emergencyContacts } from '@/data/companyData';

export function EmergencyFooter() {
  return (
    <div className="sticky bottom-0 z-40 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-2xl border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
        <span className="font-bold uppercase tracking-wide text-xs hidden sm:inline">⚠ Emergency:</span>
        {emergencyContacts.map((c) => (
          <a
            key={c.label}
            href="#"
            className="inline-flex items-center gap-1.5 hover:bg-white/15 px-2 py-1 rounded-md transition-colors"
          >
            <span>{c.emoji}</span>
            <span className="font-semibold">{c.label}:</span>
            <span className="font-mono">{c.ext}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
