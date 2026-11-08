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

export const SEED_USER_QUERIES: UserQuery[] = [
  {
    id: 'GDSL-QRY-1001',
    name: 'Dr. Vikram Sethi',
    email: 'vikram.sethi@iitd.ac.in',
    institution: 'IIT Delhi Aero Robotics',
    topic: 'Technical Scrutineering & Cage Specs',
    subject: 'Cage Outer Ring Carbon Fiber Reinforcement & VTX Power Limits',
    message:
      'Greetings Secretariat, our Class 20 striker drone utilizes a 0.8mm woven carbon-fiber inner truss to reinforce the polycarbonate outer cage. Can the technical scrutineering team confirm if this will pass the sphere weight ceiling (under 110g)? Also, are VTX power outputs restricted to 25mW or 200mW inside the indoor flight netting?',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    priority: 'HIGH',
  },
  {
    id: 'GDSL-QRY-1002',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@rvce.edu.in',
    institution: 'RV College of Engineering, Bengaluru',
    topic: 'Outstation Accommodation & Transit',
    subject: 'Outstation Contingent Hostel Accommodations for 6-Member Crew',
    message:
      'Hello GDSL Organizers, our team "RV Aero Strikers" has registered for Class 20. We have 6 crew members (4 pilots + 2 ground pit crew) travelling from Bengaluru. Could you share details regarding on-campus hostel allotment, check-in dates prior to scrutineering, and shuttle transit from IGI Airport/New Delhi Railway Station?',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    priority: 'NORMAL',
  },
  {
    id: 'GDSL-QRY-1003',
    name: 'Prof. Raghavendra Kulkarni',
    email: 'raghav.k@pilani.bits-pilani.ac.in',
    institution: 'BITS Pilani Mechatronics Society',
    topic: 'Team Registration Assistance',
    subject: 'Institutional Purchase Order & GST Invoice for Class 40 Registration Fee',
    message:
      'Respected Committee, our institute\'s student affairs division is disbursing the registration fee of ₹3,000 for team "BITS Skypulse". We require an official Proforma Invoice with Galgotias University GSTIN and HSN code for our finance office to process the direct NEFT transfer. Please advise.',
    submittedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'READ',
    adminNotes: 'Proforma invoice draft sent to University Finance desk. Awaiting NEFT confirmation.',
    priority: 'HIGH',
  },
  {
    id: 'GDSL-QRY-1004',
    name: 'Kabir Malhotra',
    email: 'kabir.malhotra@redbullwings.in',
    institution: 'Red Bull Campus Clutch Partners',
    topic: 'Corporate Sponsorship & Arena Stalls',
    subject: 'Arena Floor Brand Activation & Flight Sim Booth Partnership',
    message:
      'We would like to explore setting up an official energy drink pit stop station and 4-pod FPV drone simulator setup right beside the main GDSL flight cage during the finals on March 15. Please connect us with the corporate partnerships team.',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'RESOLVED',
    adminNotes: 'Forwarded to Prof. Dean Partnerships. MoU agreed for 4 simulator pods in Zone B.',
    priority: 'NORMAL',
  },
];

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

  // Fallback to seed data and initialize localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USER_QUERIES));
  } catch {
    // Ignore storage quota errors
  }
  return [...SEED_USER_QUERIES];
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
    fetch('/api/queries', {
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
    fetch(`/api/queries/${encodeURIComponent(id)}`, {
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
    fetch(`/api/queries/${encodeURIComponent(id)}`, {
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
    fetch(`/api/queries/${encodeURIComponent(id)}`, {
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
