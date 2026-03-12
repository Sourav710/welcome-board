// MongoDB Atlas Data API Configuration
// Update these values when your Data API is ready

const MONGODB_CONFIG = {
  dataApiUrl: '', // e.g. https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1
  apiKey: '',     // Atlas Data API key
  dataSource: 'Cluster11',
  database: 'onboarding_hub',
};

// Collection names matching current mock schema
export const COLLECTIONS = {
  users: 'users',
  checklistTemplates: 'checklist_templates',
  checklistItems: 'checklist_items',
  accessRequests: 'access_requests',
  notes: 'notes',
  auditLogs: 'audit_logs',
} as const;

const isConfigured = () =>
  Boolean(MONGODB_CONFIG.dataApiUrl && MONGODB_CONFIG.apiKey);

async function dataApiRequest<T>(
  action: 'findOne' | 'find' | 'insertOne' | 'insertMany' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany',
  collection: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  if (!isConfigured()) {
    throw new Error('MongoDB Data API not configured');
  }

  const res = await fetch(`${MONGODB_CONFIG.dataApiUrl}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': MONGODB_CONFIG.apiKey,
    },
    body: JSON.stringify({
      dataSource: MONGODB_CONFIG.dataSource,
      database: MONGODB_CONFIG.database,
      collection,
      ...body,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`MongoDB API error: ${res.status} - ${error}`);
  }

  return res.json();
}

// Generic CRUD helpers
export const mongoApi = {
  isConfigured,

  findOne: <T>(collection: string, filter: Record<string, unknown>) =>
    dataApiRequest<{ document: T }>('findOne', collection, { filter }),

  find: <T>(collection: string, filter: Record<string, unknown> = {}, sort?: Record<string, number>) =>
    dataApiRequest<{ documents: T[] }>('find', collection, { filter, ...(sort && { sort }) }),

  insertOne: <T>(collection: string, document: T) =>
    dataApiRequest<{ insertedId: string }>('insertOne', collection, { document }),

  insertMany: <T>(collection: string, documents: T[]) =>
    dataApiRequest<{ insertedIds: string[] }>('insertMany', collection, { documents }),

  updateOne: (collection: string, filter: Record<string, unknown>, update: Record<string, unknown>) =>
    dataApiRequest<{ matchedCount: number; modifiedCount: number }>('updateOne', collection, { filter, update }),

  deleteOne: (collection: string, filter: Record<string, unknown>) =>
    dataApiRequest<{ deletedCount: number }>('deleteOne', collection, { filter }),
};
