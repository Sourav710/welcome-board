import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useChecklist } from '@/context/ChecklistContext';
import { currentUser, managerUser, adminUser } from '@/data/mockData';
import type { User } from '@/types/onboarding';
import {
  Trophy,
  Sparkles,
  PartyPopper,
  Award,
  GitMerge,
  CalendarCheck,
  Heart,
  MessageSquare,
  MapPin,
  Coffee,
  Users,
  DoorOpen,
  Bath,
  Monitor,
  Send,
} from 'lucide-react';

interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  achieved: boolean;
  accent: string;
}

interface WelcomeNote {
  id: string;
  author: string;
  role: string;
  message: string;
  color: string;
  createdAt: string;
}

const noteColors = [
  'bg-primary/10 border-primary/30',
  'bg-accent border-accent-foreground/10',
  'bg-secondary border-secondary-foreground/10',
  'bg-muted border-border',
];

const seedNotes: WelcomeNote[] = [
  {
    id: 'n1',
    author: 'Gourav Banathia',
    role: 'Engineering Manager',
    message: "Welcome aboard! Excited to have you on the DMS team. Don't hesitate to ping me anytime — my door (and DMs) are always open.",
    color: noteColors[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'n2',
    author: 'Maria Garcia',
    role: 'Business Analyst',
    message: 'So happy to see another BA join us! Coffee on me on your first Friday ☕',
    color: noteColors[1],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    author: 'Priya Patel',
    role: 'Developer',
    message: "If you ever get stuck on the local setup, just shout. We've all been there!",
    color: noteColors[2],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const officeLocations = [
  { id: 'desk', label: 'Your Desk', icon: Monitor, x: 30, y: 35, description: 'Bay 4B, Floor 3 — window seat with a view of the courtyard.' },
  { id: 'team', label: 'Team Pod', icon: Users, x: 45, y: 30, description: 'DMS team sits together in the open collab zone.' },
  { id: 'cafe', label: 'Cafeteria', icon: Coffee, x: 70, y: 55, description: 'Breakfast 8–10 AM, lunch 12–3 PM. Free coffee all day.' },
  { id: 'meet', label: 'Meeting Rooms', icon: DoorOpen, x: 25, y: 65, description: 'Rooms Aspen, Birch, Cedar — bookable via Outlook.' },
  { id: 'rest', label: 'Restrooms', icon: Bath, x: 80, y: 25, description: 'Near the elevator lobby on every floor.' },
  { id: 'lounge', label: 'Lounge', icon: Heart, x: 55, y: 75, description: 'Bean bags, foosball, and a quiet reading nook.' },
];

function fireConfetti(intensity: 'small' | 'medium' | 'large' = 'medium') {
  const counts = { small: 60, medium: 150, large: 300 };
  confetti({
    particleCount: counts[intensity],
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#0078b4', '#f7a800', '#10b981', '#8b5cf6', '#ec4899'],
  });
}

export default function EngagementCulture() {
  const { items } = useChecklist();

  const user = useMemo<User>(() => {
    try {
      const raw = localStorage.getItem('loggedInUser');
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed?.role) return parsed;
      }
    } catch {
      /* ignore */
    }
    const role = localStorage.getItem('loggedInRole');
    if (role === 'admin') return adminUser;
    if (role === 'manager') return managerUser;
    return currentUser;
  }, []);

  const userItems = useMemo(
    () => items.filter((i) => i.userId === user.id),
    [items, user.id],
  );

  const completionPct = useMemo(() => {
    if (!userItems.length) return 0;
    const done = userItems.filter((i) => i.status === 'complete').length;
    return Math.round((done / userItems.length) * 100);
  }, [userItems]);

  const daysSinceStart = useMemo(() => {
    if (!user.startDate) return 0;
    const diff = Date.now() - new Date(user.startDate).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  }, [user.startDate]);

  const milestones: Milestone[] = useMemo(
    () => [
      {
        id: 'm25',
        label: '25% Onboarded',
        description: 'You completed a quarter of your onboarding journey!',
        icon: Sparkles,
        achieved: completionPct >= 25,
        accent: 'text-blue-500',
      },
      {
        id: 'm50',
        label: 'Halfway There',
        description: 'Half of your checklist is done. Momentum looks great!',
        icon: Trophy,
        achieved: completionPct >= 50,
        accent: 'text-amber-500',
      },
      {
        id: 'm100',
        label: 'Fully Onboarded',
        description: 'You crushed every onboarding task. Welcome to the team!',
        icon: PartyPopper,
        achieved: completionPct >= 100,
        accent: 'text-pink-500',
      },
      {
        id: 'mDay30',
        label: 'Day 30 Complete',
        description: 'Survived your first month — the hardest part is behind you.',
        icon: CalendarCheck,
        achieved: daysSinceStart >= 30,
        accent: 'text-emerald-500',
      },
      {
        id: 'mPR',
        label: 'First PR Merged',
        description: 'Your code is now live in the codebase. Legendary moment.',
        icon: GitMerge,
        achieved: daysSinceStart >= 14 && completionPct >= 40,
        accent: 'text-purple-500',
      },
      {
        id: 'mBuddy',
        label: 'Met Your Buddy',
        description: 'First 1:1 with your onboarding buddy is in the books.',
        icon: Heart,
        achieved: daysSinceStart >= 3,
        accent: 'text-rose-500',
      },
    ],
    [completionPct, daysSinceStart],
  );

  const [notes, setNotes] = useState<WelcomeNote[]>(() => {
    try {
      const raw = localStorage.getItem('welcomeWallNotes');
      if (raw) return JSON.parse(raw) as WelcomeNote[];
    } catch {
      /* ignore */
    }
    return seedNotes;
  });

  useEffect(() => {
    localStorage.setItem('welcomeWallNotes', JSON.stringify(notes));
  }, [notes]);

  const [author, setAuthor] = useState(user.role !== 'employee' ? user.name : '');
  const [authorRole, setAuthorRole] = useState(user.employeeRole ?? '');
  const [message, setMessage] = useState('');

  const handlePostNote = () => {
    if (!author.trim() || !message.trim()) return;
    const newNote: WelcomeNote = {
      id: `n${Date.now()}`,
      author: author.trim(),
      role: authorRole.trim() || 'Teammate',
      message: message.trim(),
      color: noteColors[notes.length % noteColors.length],
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setMessage('');
    fireConfetti('small');
  };

  const [activeLocation, setActiveLocation] = useState<string>('desk');
  const activeSpot = officeLocations.find((l) => l.id === activeLocation)!;

  // Celebrate first time a new milestone is reached this session
  useEffect(() => {
    const justAchieved = milestones.filter((m) => m.achieved);
    if (justAchieved.length > 0) {
      const key = `celebrated_${user.id}_${justAchieved.map((m) => m.id).join('_')}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        setTimeout(() => fireConfetti('medium'), 400);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout user={user}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
            Engagement & Culture
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Celebrate wins, hear from your team, and find your way around the office.
          </p>
        </div>

        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="milestones">
              <Trophy className="w-4 h-4 mr-2" aria-hidden="true" /> Milestones
            </TabsTrigger>
            <TabsTrigger value="wall">
              <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" /> Welcome Wall
            </TabsTrigger>
            <TabsTrigger value="tour">
              <MapPin className="w-4 h-4 mr-2" aria-hidden="true" /> Office Tour
            </TabsTrigger>
          </TabsList>

          {/* Milestones */}
          <TabsContent value="milestones" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Your Onboarding Progress</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {completionPct}% complete · Day {daysSinceStart} of your journey
                    </p>
                  </div>
                  <Button onClick={() => fireConfetti('large')} className="gap-2">
                    <PartyPopper className="w-4 h-4" aria-hidden="true" />
                    Celebrate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={completionPct} className="h-3" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((m) => {
                const Icon = m.icon;
                return (
                  <Card
                    key={m.id}
                    className={`relative overflow-hidden transition-all ${
                      m.achieved ? 'border-primary/40 shadow-md hover-scale' : 'opacity-70'
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            m.achieved ? 'bg-primary/10' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${m.achieved ? m.accent : 'text-muted-foreground'}`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{m.label}</h3>
                            {m.achieved ? (
                              <Badge variant="default" className="gap-1">
                                <Award className="w-3 h-3" aria-hidden="true" /> Earned
                              </Badge>
                            ) : (
                              <Badge variant="outline">Locked</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                          {m.achieved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 px-2 text-xs"
                              onClick={() => fireConfetti('small')}
                            >
                              🎉 Celebrate again
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Welcome Wall */}
          <TabsContent value="wall" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" aria-hidden="true" />
                  Leave a welcome note
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share a tip, a warm welcome, or an inside joke for new team members.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Your name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    aria-label="Your name"
                  />
                  <Input
                    placeholder="Your role (e.g. Developer)"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    aria-label="Your role"
                  />
                </div>
                <Textarea
                  placeholder="Write your welcome message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  aria-label="Welcome message"
                />
                <div className="flex justify-end">
                  <Button onClick={handlePostNote} disabled={!author.trim() || !message.trim()} className="gap-2">
                    <Send className="w-4 h-4" aria-hidden="true" /> Post to wall
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className={`${note.color} border-2 transition-transform hover:-rotate-1 hover-scale`}
                >
                  <CardContent className="pt-6">
                    <p className="text-sm text-foreground leading-relaxed">"{note.message}"</p>
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary"
                          aria-hidden="true"
                        >
                          {note.author
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-foreground">{note.author}</div>
                          <div className="text-muted-foreground">{note.role}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Office Tour */}
          <TabsContent value="tour" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  Floor Map — {user.location ?? 'Office'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click any pin to learn more about that area.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Map */}
                  <div className="lg:col-span-2">
                    <div className="relative w-full aspect-[16/10] rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden">
                      {/* Grid background */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
                          backgroundSize: '40px 40px',
                        }}
                        aria-hidden="true"
                      />
                      {/* Zones */}
                      <div className="absolute left-[15%] top-[15%] w-[40%] h-[35%] rounded-md bg-primary/5 border border-primary/20 flex items-end justify-start p-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Workspace</span>
                      </div>
                      <div className="absolute right-[10%] top-[15%] w-[25%] h-[30%] rounded-md bg-amber-500/5 border border-amber-500/20 flex items-end justify-end p-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Quiet zone</span>
                      </div>
                      <div className="absolute right-[10%] bottom-[15%] w-[35%] h-[35%] rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-end justify-end p-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Cafeteria</span>
                      </div>
                      <div className="absolute left-[10%] bottom-[15%] w-[30%] h-[30%] rounded-md bg-purple-500/5 border border-purple-500/20 flex items-end justify-start p-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Meeting rms</span>
                      </div>

                      {/* Pins */}
                      {officeLocations.map((loc) => {
                        const Icon = loc.icon;
                        const isActive = loc.id === activeLocation;
                        return (
                          <button
                            key={loc.id}
                            onClick={() => setActiveLocation(loc.id)}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                              isActive ? 'scale-125 z-10' : 'hover:scale-110'
                            }`}
                            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                            aria-label={loc.label}
                            aria-pressed={isActive}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                isActive
                                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                                  : 'bg-card text-foreground border-2 border-primary/40'
                              }`}
                            >
                              <Icon className="w-5 h-5" aria-hidden="true" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detail panel */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <activeSpot.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                        <h3 className="font-semibold text-foreground">{activeSpot.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{activeSpot.description}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        All locations
                      </h4>
                      {officeLocations.map((loc) => {
                        const Icon = loc.icon;
                        return (
                          <button
                            key={loc.id}
                            onClick={() => setActiveLocation(loc.id)}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              loc.id === activeLocation
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-accent text-foreground'
                            }`}
                          >
                            <Icon className="w-4 h-4" aria-hidden="true" />
                            {loc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
