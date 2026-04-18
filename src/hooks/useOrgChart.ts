import { useEffect, useState } from 'react';
import type { OrgNode } from '@/data/companyData';

const STORAGE_KEY = 'orgChartOverride';
const EVENT = 'orgChart:updated';

function validate(node: any): node is OrgNode {
  if (!node || typeof node !== 'object') return false;
  const required = ['id', 'name', 'title', 'department', 'email', 'initials'];
  for (const k of required) if (typeof node[k] !== 'string') return false;
  if (node.reports != null) {
    if (!Array.isArray(node.reports)) return false;
    for (const r of node.reports) if (!validate(r)) return false;
  }
  return true;
}

export function useOrgChart() {
  const [data, setData] = useState<OrgNode | null>(null);
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
          const parsed = JSON.parse(override);
          if (validate(parsed)) {
            if (!cancelled) setData(parsed);
            return;
          }
        }
        const res = await fetch('/orgChart.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!validate(json)) throw new Error('Invalid org chart shape');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load org chart');
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

export function saveOrgChartOverride(node: OrgNode) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(node));
  window.dispatchEvent(new Event(EVENT));
}

export function clearOrgChartOverride() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function validateOrgChart(node: any): node is OrgNode {
  return validate(node);
}
