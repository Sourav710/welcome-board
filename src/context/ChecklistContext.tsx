import { createContext, useContext, useState, ReactNode } from 'react';
import { allChecklistItems as initialItems } from '@/data/mockData';
import type { ChecklistItem } from '@/types/onboarding';

interface ChecklistContextType {
  items: ChecklistItem[];
  setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  addItem: (item: ChecklistItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ChecklistItem>) => void;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const addItem = (item: ChecklistItem) => setItems((prev) => [...prev, item]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: string, updates: Partial<ChecklistItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

  return (
    <ChecklistContext.Provider value={{ items, setItems, addItem, removeItem, updateItem }}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('useChecklist must be used within ChecklistProvider');
  return ctx;
}
