import { useEffect, useState } from 'react';

export interface LeaderInfo {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  initials: string;
  bio?: string;
}

export interface LocationHC {
  name: string;
  count: number;
}

export interface HeadcountInfo {
  total: number;
  locations: LocationHC[];
}

export interface ManagerInfo {
  id: string;
  name: string;
  title: string;
  team: string;
  email: string;
  initials: string;
  accentClass: string;
  responsibilities: string;
  headcount: number;
  location: string;
}

export interface PodInfo {
  id: string;
  name: string;
  emoji: string;
  owner: string;
  accentClass: string;
  focus: string;
  tech: string[];
}

export interface OrgChartData {
  leader: LeaderInfo;
  headcount: HeadcountInfo;
  managers: ManagerInfo[];
  pods: PodInfo[];
}

const STORAGE_KEY = 'orgChartOverride';
const EVENT = 'orgChart:updated';

function isStr(v: unknown): v is string {
  return typeof v === 'string';
}

function validate(d: unknown): d is OrgChartData {
  const obj = d as Record<string, unknown> | null;
  if (!obj || typeof obj !== 'object') return false;
  const leader = obj.leader as Record<string, unknown> | undefined;
  const headcount = obj.headcount as Record<string, unknown> | undefined;
  if (!leader || !isStr(leader.name) || !isStr(leader.initials)) return false;
  if (!headcount || typeof headcount.total !== 'number' || !Array.isArray(headcount.locations)) return false;
  if (!Array.isArray(obj.managers)) return false;
  for (const m of obj.managers as Array<Record<string, unknown>>) {
    if (!isStr(m.id) || !isStr(m.name) || !isStr(m.team) || !isStr(m.initials)) return false;
  }
  if (!Array.isArray(obj.pods)) return false;
  return true;
}



  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const override = localStorage.getItem(STORAGE_KEY);
        if (override) {
          try {
            const parsed = JSON.parse(override);
            if (validate(parsed)) {
              if (!cancelled) setData(parsed);
              return;
            }
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        const res = await fetch('/orgChart.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!validate(json)) throw new Error('Invalid org chart shape');
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load org chart';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const onUpdate = () => load();
    window.addEventListener(EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT, onUpdate);
    };
  }, []);

  return { data, loading, error };
}

export function saveOrgChartOverride(data: OrgChartData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

export function clearOrgChartOverride() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function validateOrgChart(d: any): d is OrgChartData {
  return validate(d);
}
