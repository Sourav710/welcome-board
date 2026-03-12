import { createContext, useContext, useState, ReactNode } from 'react';
import { notes as initialNotes } from '@/data/mockData';
import type { Note } from '@/types/onboarding';

interface NotesContextType {
  notes: Note[];
  addNote: (note: Note) => void;
  getNotesForItem: (checklistItemId: string) => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const addNote = (note: Note) => setNotes((prev) => [...prev, note]);
  const getNotesForItem = (checklistItemId: string) =>
    notes.filter((n) => n.checklistItemId === checklistItemId);

  return (
    <NotesContext.Provider value={{ notes, addNote, getNotesForItem }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
