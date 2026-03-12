import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'auth' | 'checklist' | 'admin' | 'access' | 'system';
  details: string;
  metadata?: Record<string, string>;
}

interface AuditLogContextType {
  logs: AuditLogEntry[];
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

// Seed with some initial audit entries
const seedLogs: AuditLogEntry[] = [
  { id: 'al-1', timestamp: '2026-02-16T09:00:00Z', userId: 'u1', userName: 'Alex Johnson', userRole: 'employee', action: 'LOGIN', category: 'auth', details: 'User logged in successfully' },
  { id: 'al-2', timestamp: '2026-02-16T09:05:00Z', userId: 'u1', userName: 'Alex Johnson', userRole: 'employee', action: 'PROFILE_SETUP', category: 'auth', details: 'Completed profile setup wizard' },
  { id: 'al-3', timestamp: '2026-02-16T10:00:00Z', userId: 'u1', userName: 'Alex Johnson', userRole: 'employee', action: 'ACCESS_REQUEST', category: 'access', details: 'Requested Jira Access — Ticket HELP-1042' },
  { id: 'al-4', timestamp: '2026-02-16T10:05:00Z', userId: 'u1', userName: 'Alex Johnson', userRole: 'employee', action: 'ACCESS_REQUEST', category: 'access', details: 'Requested Confluence Access — Ticket HELP-1043' },
  { id: 'al-5', timestamp: '2026-02-17T09:30:00Z', userId: 'u5', userName: 'Sarah Chen', userRole: 'manager', action: 'STATUS_CHANGE', category: 'checklist', details: 'Approved GitHub Access for Alex Johnson' },
  { id: 'al-6', timestamp: '2026-02-17T14:00:00Z', userId: 'u10', userName: 'Admin User', userRole: 'admin', action: 'TEMPLATE_EDIT', category: 'admin', details: 'Updated due date for "VPN Setup"' },
  { id: 'al-7', timestamp: '2026-02-18T08:00:00Z', userId: 'u5', userName: 'Sarah Chen', userRole: 'manager', action: 'LOGIN', category: 'auth', details: 'Manager logged in successfully' },
  { id: 'al-8', timestamp: '2026-02-18T11:00:00Z', userId: 'u1', userName: 'Alex Johnson', userRole: 'employee', action: 'TASK_COMPLETE', category: 'checklist', details: 'Marked "Team Introduction Meeting" as complete' },
];

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(seedLogs);

  const addLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newEntry, ...prev]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <AuditLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const ctx = useContext(AuditLogContext);
  if (!ctx) throw new Error('useAuditLog must be used within AuditLogProvider');
  return ctx;
}
