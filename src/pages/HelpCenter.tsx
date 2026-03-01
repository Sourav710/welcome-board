import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { currentUser } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, MessageCircle, FileText, ExternalLink, ChevronRight } from 'lucide-react';

const faqs = [
  { q: 'How do I request access to a system?', a: 'Navigate to your onboarding checklist, find the access item, and click "Request". This will open the external request form.' },
  { q: 'What if my access request is rejected?', a: 'Contact your manager or the IT Help Desk to understand the reason. You can re-submit the request after resolving any issues.' },
  { q: 'How do I mark a task as complete?', a: 'Click the "Mark Done" button next to the task in your checklist. Your manager will be notified of the update.' },
  { q: 'Who do I contact for onboarding issues?', a: 'Reach out to your assigned manager or email helpdesk@company.com for technical issues.' },
  { q: 'Can I change my assigned role or project?', a: 'Contact your manager or an admin to update your profile details.' },
];

const resources = [
  { title: 'Employee Handbook', desc: 'Company policies and guidelines', icon: BookOpen, url: '#' },
  { title: 'IT Support Portal', desc: 'Submit tickets and track requests', icon: ExternalLink, url: '#' },
  { title: 'Training Catalog', desc: 'Browse available training modules', icon: FileText, url: '#' },
  { title: 'Slack Community', desc: 'Connect with your team', icon: MessageCircle, url: '#' },
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout user={currentUser}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Find answers, resources, and support</p>
          <div className="relative max-w-md mx-auto mt-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for help..." className="pl-9 h-10" />
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {resources.map((r) => (
            <a key={r.title} href={r.url} className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:shadow-md hover:bg-accent/30 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="bg-card border rounded-xl overflow-hidden">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found.</div>
          )}
          {filtered.map((faq, i) => (
            <div key={i} className="border-b last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-accent/30 border rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-foreground">Still need help?</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Our support team is here for you</p>
          <a href="mailto:helpdesk@company.com" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <MessageCircle className="w-4 h-4" /> helpdesk@company.com
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
