export interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  initials: string;
  reports?: OrgNode[];
}

export const orgChart: OrgNode = {
  id: 'ceo',
  name: 'David Wichmann',
  title: 'Chief Executive Officer',
  department: 'Executive Office',
  email: 'david.wichmann@optum.com',
  initials: 'DW',
  reports: [
    {
      id: 'p1',
      name: 'Amar Desai',
      title: 'President, Optum Health',
      department: 'Optum Health',
      email: 'amar.desai@optum.com',
      initials: 'AD',
      reports: [
        { id: 'p1a', name: 'Linda Park', title: 'VP Healthcare Operations', department: 'Optum Health', email: 'linda.park@optum.com', initials: 'LP' },
        { id: 'p1b', name: 'Marcus Lee', title: 'VP Care Delivery', department: 'Optum Health', email: 'marcus.lee@optum.com', initials: 'ML' },
      ],
    },
    {
      id: 'p2',
      name: 'Roger Connor',
      title: 'President, Optum Insight',
      department: 'Optum Insight',
      email: 'roger.connor@optum.com',
      initials: 'RC',
      reports: [
        { id: 'p2a', name: 'Gourav Banathia', title: 'VP Technology Services', department: 'Optum Insight', email: 'gourav.banatia@optum.com', initials: 'GB' },
        { id: 'p2b', name: 'Aisha Khan', title: 'VP Analytics & Data', department: 'Optum Insight', email: 'aisha.khan@optum.com', initials: 'AK' },
      ],
    },
    {
      id: 'p3',
      name: 'John Prince',
      title: 'President, Optum Rx',
      department: 'Optum Rx',
      email: 'john.prince@optum.com',
      initials: 'JP',
      reports: [
        { id: 'p3a', name: 'Sara Ito', title: 'VP Pharmacy Operations', department: 'Optum Rx', email: 'sara.ito@optum.com', initials: 'SI' },
        { id: 'p3b', name: 'Daniel Cruz', title: 'VP Clinical Programs', department: 'Optum Rx', email: 'daniel.cruz@optum.com', initials: 'DC' },
      ],
    },
  ],
};

export interface DepartmentInfo {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  head: string;
  email: string;
  phone: string;
  teams: string;
  office: string;
  contacts: { label: string; email: string }[];
}

export const departments: DepartmentInfo[] = [
  {
    id: 'hr',
    name: 'HR Department',
    emoji: '🏢',
    gradient: 'from-emerald-500 to-teal-600',
    head: 'Sarah Johnson',
    email: 'hr@optum.com',
    phone: '+91-11-4567-8900',
    teams: '@hr-support',
    office: 'Building A, Floor 3',
    contacts: [
      { label: 'Recruitment', email: 'recruiter@optum.com' },
      { label: 'Benefits', email: 'benefits@optum.com' },
      { label: 'Payroll', email: 'payroll@optum.com' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    emoji: '💰',
    gradient: 'from-blue-500 to-indigo-600',
    head: 'Michael Chen',
    email: 'finance@optum.com',
    phone: '+91-11-4567-8910',
    teams: '@finance-team',
    office: 'Building B, Floor 5',
    contacts: [
      { label: 'Accounts Payable', email: 'ap@optum.com' },
      { label: 'Travel & Expense', email: 'tne@optum.com' },
      { label: 'Procurement', email: 'procurement@optum.com' },
    ],
  },
  {
    id: 'it',
    name: 'IT Operations',
    emoji: '🔧',
    gradient: 'from-purple-500 to-fuchsia-600',
    head: 'Rajesh Kumar',
    email: 'itsupport@optum.com',
    phone: '+91-11-IT-HELP (24/7)',
    teams: '@it-helpdesk',
    office: 'Building C, Floor 2',
    contacts: [
      { label: 'VPN Access', email: 'vpn@optum.com' },
      { label: 'Jira/Confluence', email: 'devtools@optum.com' },
      { label: 'Hardware', email: 'hardware@optum.com' },
    ],
  },
  {
    id: 'assets',
    name: 'Asset Allocation',
    emoji: '📦',
    gradient: 'from-orange-500 to-amber-600',
    head: 'Priya Sharma',
    email: 'assets@optum.com',
    phone: '+91-11-4567-8920',
    teams: '@asset-mgmt',
    office: 'Building A, Floor 1',
    contacts: [
      { label: 'Laptops', email: 'laptops@optum.com' },
      { label: 'Accessories', email: 'accessories@optum.com' },
      { label: 'Returns', email: 'returns@optum.com' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    emoji: '📊',
    gradient: 'from-teal-500 to-cyan-600',
    head: 'Dr. Anand Rao',
    email: 'analytics@optum.com',
    phone: '+91-11-4567-8930',
    teams: '@analytics-hub',
    office: 'Building D, Floor 4',
    contacts: [
      { label: 'Data Science', email: 'datascience@optum.com' },
      { label: 'BI Reports', email: 'bi@optum.com' },
      { label: 'Insights', email: 'insights@optum.com' },
    ],
  },
  {
    id: 'health',
    name: 'Healthcare Services',
    emoji: '🏥',
    gradient: 'from-rose-500 to-red-600',
    head: 'Dr. Emily Wong',
    email: 'healthservices@optum.com',
    phone: '+91-11-4567-8940',
    teams: '@health-services',
    office: 'Building E, Floor 6',
    contacts: [
      { label: 'Clinical Ops', email: 'clinical@optum.com' },
      { label: 'Patient Care', email: 'patientcare@optum.com' },
      { label: 'Quality', email: 'quality@optum.com' },
    ],
  },
];

export const quickLinks = [
  { emoji: '📚', title: 'Employee Handbook', url: 'https://uhg.edcast.com/home', color: 'from-blue-400 to-blue-600' },
  { emoji: '🎓', title: 'Training Portal', url: 'https://uhg.edcast.com/home', color: 'from-purple-400 to-purple-600' },
  { emoji: '💼', title: 'Benefits & Payroll', url: '#', color: 'from-emerald-400 to-emerald-600' },
  { emoji: '🏥', title: 'Health Insurance', url: '#', color: 'from-rose-400 to-rose-600' },
  { emoji: '🌐', title: 'Internal Wiki', url: '#', color: 'from-cyan-400 to-cyan-600' },
  { emoji: '🎫', title: 'Submit IT Ticket', url: 'https://servicenow.optum.com', color: 'from-orange-400 to-orange-600' },
  { emoji: '📅', title: 'Book Meeting Rooms', url: '#', color: 'from-fuchsia-400 to-fuchsia-600' },
  { emoji: '🍕', title: 'Cafeteria Menu', url: '#', color: 'from-amber-400 to-amber-600' },
];

export const emergencyContacts = [
  { emoji: '🚨', label: 'Security', ext: 'ext-911' },
  { emoji: '🏥', label: 'Medical', ext: 'ext-1234' },
  { emoji: '🔧', label: 'Facilities', ext: 'ext-5678' },
  { emoji: '💻', label: 'IT Help', ext: 'ext-4321' },
];

export const businessUnits = [
  {
    id: 'health',
    name: 'Optum Health',
    color: 'from-blue-500 to-indigo-600',
    pillBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    departments: ['Care Delivery', 'Healthcare Ops', 'Patient Services', 'Wellness'],
  },
  {
    id: 'insight',
    name: 'Optum Insight',
    color: 'from-emerald-500 to-teal-600',
    pillBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    departments: ['Tech Services', 'Analytics & Data', 'Consulting', 'Cloud Engineering'],
  },
  {
    id: 'rx',
    name: 'Optum Rx',
    color: 'from-orange-500 to-amber-600',
    pillBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
    departments: ['Pharmacy Ops', 'Clinical Programs', 'Specialty Rx', 'Mail Order'],
  },
];
