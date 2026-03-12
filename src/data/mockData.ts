import { User, ChecklistTemplate, ChecklistItem, AccessRequest, Note, ItemStatus } from '@/types/onboarding';

export const currentUser: User = {
  id: 'u1',
  name: 'Sourav',
  email: 'souarv_402@optum.com',
  role: 'employee',
  employeeRole: 'BA',
  project: 'DMS',
  location: 'Noida',
  managerId: 'u5',
  startDate: '2026-03-12',
  profileComplete: true,
};

export const managerUser: User = {
  id: 'u5',
  name: 'Gourav Banathia',
  email: 'Gourav.banatia@optum.com',
  role: 'manager',
  employeeRole: 'Manager',
  project: 'DMS',
  location: 'Noida',
  profileComplete: true,
};

export const adminUser: User = {
  id: 'u10',
  name: 'Admin User',
  email: 'admin@company.com',
  role: 'admin',
  employeeRole: 'Manager',
  project: 'All Projects',
  location: 'New York',
  profileComplete: true,
};


export const teamMembers: User[] = [
  currentUser,
  { id: 'u2', name: 'Maria Garcia', email: 'maria@company.com', role: 'employee', employeeRole: 'BA', project: 'Project Phoenix', location: 'Chicago', managerId: 'u5', startDate: '2026-02-10', profileComplete: true },
  { id: 'u3', name: 'James Wilson', email: 'james@company.com', role: 'employee', employeeRole: 'QA', project: 'Project Atlas', location: 'New York', managerId: 'u5', startDate: '2026-02-18', profileComplete: true },
  { id: 'u4', name: 'Priya Patel', email: 'priya@company.com', role: 'employee', employeeRole: 'Developer', project: 'Project Atlas', location: 'Remote', managerId: 'u5', startDate: '2026-02-20', profileComplete: true },
];

export const templates: ChecklistTemplate[] = [
  // Access
  { id: 't1', role: 'Developer', section: 'Access', title: 'Jira Access', description: 'Request access to Jira project boards', type: 'access', mandatory: true, defaultOwner: 'IT Help Desk', defaultLinkUrl: 'https://helpdesk.company.com/jira', targetDay: 1 },
  { id: 't2', role: 'Developer', section: 'Access', title: 'Confluence Access', description: 'Request access to Confluence knowledge base', type: 'access', mandatory: true, defaultOwner: 'IT Help Desk', defaultLinkUrl: 'https://helpdesk.company.com/confluence', targetDay: 1 },
  { id: 't3', role: 'Developer', section: 'Access', title: 'GitHub Repository Access', description: 'Request access to project repositories', type: 'access', mandatory: true, defaultOwner: 'Tech Lead', defaultLinkUrl: 'https://helpdesk.company.com/github', targetDay: 1 },
  { id: 't4', role: 'Developer', section: 'Access', title: 'VPN Setup', description: 'Configure and test VPN connection', type: 'access', mandatory: true, defaultOwner: 'IT Help Desk', defaultLinkUrl: 'https://helpdesk.company.com/vpn', targetDay: 1 },
  { id: 't5', role: 'Developer', section: 'Access', title: 'AWS Console Access', description: 'Request AWS console access for dev environment', type: 'access', mandatory: false, defaultOwner: 'Cloud Team', defaultLinkUrl: 'https://helpdesk.company.com/aws', targetDay: 3 },
  // Day 1
  { id: 't6', role: 'Developer', section: 'Day1', title: 'Team Introduction Meeting', description: 'Attend the team introduction and welcome session', type: 'activity', mandatory: true, defaultOwner: 'Manager', targetDay: 1 },
  { id: 't7', role: 'Developer', section: 'Day1', title: 'Laptop & Workstation Setup', description: 'Set up development machine with required software', type: 'activity', mandatory: true, defaultOwner: 'Employee', targetDay: 1 },
  { id: 't8', role: 'Developer', section: 'Day1', title: 'HR Orientation Session', description: 'Complete HR orientation and compliance training', type: 'training', mandatory: true, defaultOwner: 'HR', defaultLinkUrl: 'https://training.company.com/orientation', targetDay: 1 },
  { id: 't9', role: 'Developer', section: 'Day1', title: 'Security Awareness Training', description: 'Complete mandatory security awareness module', type: 'training', mandatory: true, defaultOwner: 'Employee', defaultLinkUrl: 'https://training.company.com/security', targetDay: 1 },
  // Week 1
  { id: 't10', role: 'Developer', section: 'Week1', title: 'Codebase Walkthrough', description: 'Review project architecture and codebase with tech lead', type: 'activity', mandatory: true, defaultOwner: 'Tech Lead', targetDay: 3 },
  { id: 't11', role: 'Developer', section: 'Week1', title: 'Development Environment Setup', description: 'Clone repos, set up local dev environment, run tests', type: 'activity', mandatory: true, defaultOwner: 'Employee', targetDay: 3 },
  { id: 't12', role: 'Developer', section: 'Week1', title: 'CI/CD Pipeline Training', description: 'Learn the CI/CD pipeline and deployment process', type: 'training', mandatory: true, defaultOwner: 'DevOps', defaultLinkUrl: 'https://wiki.company.com/cicd', targetDay: 5 },
  // Week 2+
  { id: 't13', role: 'Developer', section: 'Week2Plus', title: 'First Code Review', description: 'Submit first PR and complete code review process', type: 'activity', mandatory: true, defaultOwner: 'Employee', targetDay: 10 },
  { id: 't14', role: 'Developer', section: 'Week2Plus', title: 'Agile/Scrum Training', description: 'Complete agile methodology training module', type: 'training', mandatory: false, defaultOwner: 'Employee', defaultLinkUrl: 'https://training.company.com/agile', targetDay: 14 },
  // Training
  { id: 't15', role: 'Developer', section: 'Training', title: 'Security Compliance Training', description: 'Complete mandatory security compliance certification', type: 'training', mandatory: true, defaultOwner: 'Employee', defaultLinkUrl: 'https://training.company.com/security-compliance', targetDay: 5 },
  { id: 't16', role: 'Developer', section: 'Training', title: 'Code Standards & Best Practices', description: 'Learn the team coding standards and best practices', type: 'training', mandatory: true, defaultOwner: 'Employee', defaultLinkUrl: 'https://training.company.com/code-standards', targetDay: 7 },
  { id: 't17', role: 'Developer', section: 'Training', title: 'Cloud Infrastructure Basics', description: 'Introduction to cloud infrastructure used in the project', type: 'training', mandatory: false, defaultOwner: 'Employee', defaultLinkUrl: 'https://training.company.com/cloud-infra', targetDay: 10 },
];

function dueDate(startDate: string, targetDay: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + targetDay);
  return d.toISOString().split('T')[0];
}

const statuses: ItemStatus[] = ['not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'];

export const checklistItems: ChecklistItem[] = templates.map((t, i) => ({
  id: `ci${i + 1}`,
  userId: 'u1',
  templateId: t.id,
  section: t.section,
  title: t.title,
  description: t.description,
  owner: t.defaultOwner,
  linkUrl: t.defaultLinkUrl,
  status: statuses[i],
  type: t.type,
  mandatory: t.mandatory,
  dueDate: dueDate(currentUser.startDate || '2026-03-12', t.targetDay),
  createdAt: '2026-02-16T09:00:00Z',
  updatedAt: '2026-02-18T14:00:00Z',
}));

// Generate items for other team members
function generateItemsForUser(userId: string, startDate: string): ChecklistItem[] {
  const userStatuses: Record<string, ItemStatus[]> = {
    u2: ['complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'in_progress', 'complete', 'not_started', 'not_started', 'complete', 'in_progress', 'not_started'],
    u3: ['complete', 'pending', 'not_started', 'complete', 'not_started', 'complete', 'in_progress', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'],
    u4: ['not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'],
  };
  return templates.map((t, i) => ({
    id: `${userId}-ci${i + 1}`,
    userId,
    templateId: t.id,
    section: t.section,
    title: t.title,
    description: t.description,
    owner: t.defaultOwner,
    linkUrl: t.defaultLinkUrl,
    status: (userStatuses[userId] || statuses)[i],
    type: t.type,
    mandatory: t.mandatory,
    dueDate: dueDate(startDate, t.targetDay),
    createdAt: startDate + 'T09:00:00Z',
    updatedAt: startDate + 'T09:00:00Z',
  }));
}

export const allChecklistItems: ChecklistItem[] = [
  ...checklistItems,
  ...generateItemsForUser('u2', '2026-02-10'),
  ...generateItemsForUser('u3', '2026-02-18'),
  ...generateItemsForUser('u4', '2026-02-20'),
];

export const accessRequests: AccessRequest[] = [
  { id: 'ar1', checklistItemId: 'ci1', externalTicketId: 'HELP-1042', systemName: 'Jira', status: 'complete', createdAt: '2026-02-16T10:00:00Z', updatedAt: '2026-02-17T08:00:00Z' },
  { id: 'ar2', checklistItemId: 'ci2', externalTicketId: 'HELP-1043', systemName: 'Confluence', status: 'complete', createdAt: '2026-02-16T10:05:00Z', updatedAt: '2026-02-17T09:00:00Z' },
  { id: 'ar3', checklistItemId: 'ci3', externalTicketId: 'HELP-1044', systemName: 'GitHub', status: 'pending', createdAt: '2026-02-16T10:10:00Z', updatedAt: '2026-02-18T11:00:00Z' },
  { id: 'ar4', checklistItemId: 'ci4', externalTicketId: 'HELP-1045', systemName: 'VPN', status: 'in_progress', createdAt: '2026-02-17T09:00:00Z', updatedAt: '2026-02-18T14:00:00Z' },
];

export const notes: Note[] = [
  { id: 'n1', checklistItemId: 'ci3', authorId: 'u1', authorRole: 'employee', authorName: 'Alex Johnson', text: 'Submitted GitHub access request via help desk portal.', createdAt: '2026-02-16T10:15:00Z' },
  { id: 'n2', checklistItemId: 'ci3', authorId: 'u5', authorRole: 'manager', authorName: 'Gourav Banathia', text: 'Approved. Waiting for IT to provision.', createdAt: '2026-02-17T09:30:00Z' },
  { id: 'n3', checklistItemId: 'ci4', authorId: 'u1', authorRole: 'employee', authorName: 'Alex Johnson', text: 'VPN client installed. Awaiting credentials.', createdAt: '2026-02-17T11:00:00Z' },
];

export const projects = ['DMS', 'Project Atlas', 'Project Titan', 'Project Nova'];
export const locations = ['Noida', 'Gurugram', 'Hyderabad', 'Remote', 'Banagalore'];
export const managers = [
  { id: 'u5', name: 'Gourav Banathia' },
  { id: 'u6', name: 'Aastha Sharma' },
  { id: 'u7', name: 'Deepankur Khanna' },
];
