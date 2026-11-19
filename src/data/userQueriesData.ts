import { apiFetch } from '../services/apiClient.ts';
// GDSL 2026 - User Queries & Inquiries Data Store

export interface UserQuery {
  id: string;
  name: string;
  email: string;
  institution: string;
  topic: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'UNREAD' | 'READ' | 'RESOLVED';
  adminNotes?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  repliedAt?: string;
}


const STORAGE_KEY = 'gdsl_user_queries_v1';

export function getUserQueries(): UserQuery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load user queries from localStorage:', err);
  }

  // Only this visitor's own submitted queries are kept in the browser.
  return [];
}

export function saveUserQuery(
  queryInput: Omit<UserQuery, 'id' | 'submittedAt' | 'status'> & Partial<UserQuery>
): UserQuery {
  const current = getUserQueries();
  const nextNum = 1000 + current.length + 1;
  const newQuery: UserQuery = {
    id: queryInput.id || `GDSL-QRY-${nextNum}`,
    name: queryInput.name.trim(),
    email: queryInput.email.trim(),
    institution: (queryInput.institution || '').trim(),
    topic: queryInput.topic || 'Team Registration Assistance',
    subject: queryInput.subject.trim(),
    message: queryInput.message.trim(),
    submittedAt: queryInput.submittedAt || new Date().toISOString(),
    status: queryInput.status || 'UNREAD',
    adminNotes: queryInput.adminNotes || '',
    priority: queryInput.priority || 'NORMAL',
  };

  const updated = [newQuery, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save user query in localStorage:', err);
  }

  // Also push to server API asynchronously in background
  try {
    apiFetch('/api/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuery),
    }).catch(() => {
      // Background non-blocking
    });
  } catch {
    // Non-blocking
  }

  return newQuery;
}

export function updateQueryStatus(
  id: string,
  newStatus: UserQuery['status'],
  notes?: string
): UserQuery[] {
  const current = getUserQueries();
  const updated = current.map((q) => {
    if (q.id === id) {
      return {
        ...q,
        status: newStatus,
        ...(notes !== undefined ? { adminNotes: notes } : {}),
      };
    }
    return q;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to update user query in localStorage:', err);
  }

  // Sync to server API in background
  try {
    apiFetch(`/api/queries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, adminNotes: notes }),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return updated;
}

export function updateQueryNotes(id: string, notes: string): UserQuery[] {
  const current = getUserQueries();
  const updated = current.map((q) => (q.id === id ? { ...q, adminNotes: notes } : q));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to update notes in localStorage:', err);
  }

  try {
    apiFetch(`/api/queries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes }),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return updated;
}

export function deleteUserQuery(id: string): UserQuery[] {
  const current = getUserQueries();
  const updated = current.filter((q) => q.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete query from localStorage:', err);
  }

  try {
    apiFetch(`/api/queries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return updated;
}

export function getUnreadQueriesCount(): number {
  const queries = getUserQueries();
  return queries.filter((q) => q.status === 'UNREAD').length;
}
