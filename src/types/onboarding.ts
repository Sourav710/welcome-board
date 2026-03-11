export type UserRole = 'employee' | 'manager' | 'admin';
export type EmployeeRole = 'BA' | 'Developer' | 'QA' | 'Manager' | 'Other';
export type ChecklistSection = 'Access' | 'Day1' | 'Week1' | 'Week2Plus' | 'Training';
export type ChecklistItemType = 'access' | 'activity' | 'training';
export type ItemStatus = 'not_started' | 'in_progress' | 'pending' | 'complete' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeRole?: EmployeeRole;
  project?: string;
  location?: string;
  managerId?: string;
  startDate?: string;
  profileComplete: boolean;
}

export interface ChecklistTemplate {
  id: string;
  role: EmployeeRole;
  section: ChecklistSection;
  title: string;
  description: string;
  type: ChecklistItemType;
  mandatory: boolean;
  defaultOwner: string;
  defaultLinkUrl?: string;
  targetDay: number;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  templateId: string;
  section: ChecklistSection;
  title: string;
  description: string;
  owner: string;
  linkUrl?: string;
  status: ItemStatus;
  type: ChecklistItemType;
  mandatory: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequest {
  id: string;
  checklistItemId: string;
  externalTicketId: string;
  systemName: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  checklistItemId: string;
  authorId: string;
  authorRole: 'employee' | 'manager';
  authorName: string;
  text: string;
  createdAt: string;
}
