// Data Service — abstraction layer over mock data / MongoDB
// When MongoDB is configured, swap mock calls for mongoApi calls.

import { mongoApi, COLLECTIONS } from '@/lib/mongodb';
import {
  currentUser,
  managerUser,
  adminUser,
  teamMembers,
  templates,
  checklistItems,
  allChecklistItems,
  accessRequests,
  notes as mockNotes,
  projects,
  locations,
  managers,
} from '@/data/mockData';
import type {
  User,
  ChecklistTemplate,
  ChecklistItem,
  AccessRequest,
  Note,
} from '@/types/onboarding';

const isMongoEnabled = () => mongoApi.isConfigured();

// ── Users ──────────────────────────────────────────────
export async function getUser(id: string): Promise<User | null> {
  if (!useMongo()) {
    return [currentUser, managerUser, adminUser, ...teamMembers].find((u) => u.id === id) ?? null;
  }
  const res = await mongoApi.findOne<User>(COLLECTIONS.users, { id });
  return res.document;
}

export async function getAllTeamMembers(): Promise<User[]> {
  if (!useMongo()) return teamMembers;
  const res = await mongoApi.find<User>(COLLECTIONS.users, { role: 'employee' });
  return res.documents;
}

// ── Templates ──────────────────────────────────────────
export async function getTemplates(): Promise<ChecklistTemplate[]> {
  if (!useMongo()) return templates;
  const res = await mongoApi.find<ChecklistTemplate>(COLLECTIONS.checklistTemplates);
  return res.documents;
}

export async function upsertTemplate(template: ChecklistTemplate): Promise<void> {
  if (!useMongo()) return; // no-op in mock mode
  await mongoApi.updateOne(
    COLLECTIONS.checklistTemplates,
    { id: template.id },
    { $set: template }
  );
}

// ── Checklist Items ────────────────────────────────────
export async function getChecklistItemsForUser(userId: string): Promise<ChecklistItem[]> {
  if (!useMongo()) return allChecklistItems.filter((i) => i.userId === userId);
  const res = await mongoApi.find<ChecklistItem>(COLLECTIONS.checklistItems, { userId });
  return res.documents;
}

export async function getChecklistItem(id: string): Promise<ChecklistItem | null> {
  if (!useMongo()) return checklistItems.find((i) => i.id === id) ?? null;
  const res = await mongoApi.findOne<ChecklistItem>(COLLECTIONS.checklistItems, { id });
  return res.document;
}

export async function updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<void> {
  if (!useMongo()) return; // handled by context in mock mode
  await mongoApi.updateOne(COLLECTIONS.checklistItems, { id }, { $set: updates });
}

export async function createChecklistItem(item: ChecklistItem): Promise<void> {
  if (!useMongo()) return;
  await mongoApi.insertOne(COLLECTIONS.checklistItems, item);
}

// ── Access Requests ────────────────────────────────────
export async function getAccessRequests(checklistItemId?: string): Promise<AccessRequest[]> {
  if (!useMongo()) {
    return checklistItemId
      ? accessRequests.filter((r) => r.checklistItemId === checklistItemId)
      : accessRequests;
  }
  const filter = checklistItemId ? { checklistItemId } : {};
  const res = await mongoApi.find<AccessRequest>(COLLECTIONS.accessRequests, filter);
  return res.documents;
}

// ── Notes ──────────────────────────────────────────────
export async function getNotesForItem(checklistItemId: string): Promise<Note[]> {
  if (!useMongo()) return mockNotes.filter((n) => n.checklistItemId === checklistItemId);
  const res = await mongoApi.find<Note>(COLLECTIONS.notes, { checklistItemId }, { createdAt: 1 });
  return res.documents;
}

export async function addNote(note: Note): Promise<void> {
  if (!useMongo()) return; // handled by context in mock mode
  await mongoApi.insertOne(COLLECTIONS.notes, note);
}

// ── Static data helpers (always mock for now) ──────────
export function getProjects() { return projects; }
export function getLocations() { return locations; }
export function getManagers() { return managers; }
