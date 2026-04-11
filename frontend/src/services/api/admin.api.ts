import { buildServiceBase } from '@/lib/runtime-api';

// Types
export type User = {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  departement: string;
  poste?: string;
  role: string;
  actif: number;
  hidden: number;
  date_creation: string;
  dernier_login?: string;
};

export type PendingUser = {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  poste?: string;
  departement: string;
  password_hash: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: number;
  notes?: string;
};

export type Notification = {
  id: number;
  type: string;
  recipient_id?: number;
  sender_id?: number;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: number;
  created_at: string;
};

export type ConnectionLog = {
  id: number;
  user_id?: number;
  email: string;
  departement: string;
  success: number;
  created_at: string;
};

export type Department = {
  id: number;
  code: string;
  nom: string;
  description?: string;
  created_at: string;
};

export type Announcement = {
  id: number;
  target_department: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  sender_nom?: string;
  sender_prenom?: string;
};

export type InternalMessage = {
  id: number;
  subject: string;
  message: string;
  status: string;
  target_department?: string;
  created_at: string;
  sender_nom?: string;
  sender_prenom?: string;
  recipient_nom?: string;
  recipient_prenom?: string;
};

export type DocumentTransfer = {
  id: number;
  recipient_department: string;
  title: string;
  document_type: string;
  reference_code?: string;
  notes?: string;
  status: string;
  created_at: string;
  sender_nom?: string;
  sender_prenom?: string;
};

const AUTH_API_BASE = buildServiceBase(3002);

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${AUTH_API_BASE}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(init.body !== undefined),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = 'Service Auth indisponible - Contactez votre administrateur système';

    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      message = `Erreur ${response.status} - Service temporairement indisponible`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    return await request<User[]>('/api/auth/users');
  } catch (error) {
    console.error('Erreur users:', error);
    return [];
  }
};

export const hideUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  return request(`/api/auth/users/${id}/hide`, {
    method: 'PATCH',
    body: JSON.stringify({ hidden: 1 }),
  });
};

export const showUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  return request(`/api/auth/users/${id}/hide`, {
    method: 'PATCH',
    body: JSON.stringify({ hidden: 0 }),
  });
};

// Pending Users
export const getPendingUsers = async (): Promise<PendingUser[]> => {
  const response = await request<{ success: boolean; users: PendingUser[] }>('/api/auth/pending-users');
  return response.users || [];
};

export const approvePendingUser = async (id: number): Promise<{ success: boolean; user: User }> => {
  return request(`/api/auth/users/${id}/approve`, { method: 'PATCH' });
};

export const rejectPendingUser = async (id: number, reason?: string): Promise<{ success: boolean }> => {
  return request(`/api/auth/users/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await request<{ success: boolean; notifications: Notification[] }>('/api/auth/notifications');
  return response.notifications || [];
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await request(`/api/auth/notifications/${id}/read`, { method: 'PATCH' });
};

// Connection Logs
export const getConnectionLogs = async (limit = 100): Promise<ConnectionLog[]> => {
  return request<ConnectionLog[]>(`/api/logs/connection?limit=${limit}`);
};

export const getMonitoringOverview = async (): Promise<Record<string, number>> => {
  return request<Record<string, number>>('/api/auth/monitoring/overview');
};

export const getDepartments = async (): Promise<Department[]> => {
  return request<Department[]>('/api/auth/departments');
};

export const sendDepartmentNotification = async (payload: {
  title: string;
  message: string;
  department?: string;
  recipientId?: number;
}): Promise<{ success: boolean; delivered: number; department?: string }> => {
  return request('/api/auth/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getAnnouncements = async (department?: string): Promise<Announcement[]> => {
  const suffix = department ? `?department=${encodeURIComponent(department)}` : '';
  return request<Announcement[]>(`/api/auth/announcements${suffix}`);
};

export const createAnnouncement = async (payload: {
  title: string;
  message: string;
  targetDepartment?: string;
  priority?: string;
}): Promise<{ success: boolean; id: number; message: string }> => {
  return request('/api/auth/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getInternalMessages = async (): Promise<InternalMessage[]> => {
  return request<InternalMessage[]>('/api/auth/internal-messages');
};

export const createInternalMessage = async (payload: {
  subject: string;
  message: string;
  recipientId?: number;
  targetDepartment?: string;
}): Promise<{ success: boolean; id: number; message: string }> => {
  return request('/api/auth/internal-messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getDocumentTransfers = async (): Promise<DocumentTransfer[]> => {
  return request<DocumentTransfer[]>('/api/auth/document-transfers');
};

export const createDocumentTransfer = async (payload: {
  recipientDepartment: string;
  title: string;
  documentType?: string;
  referenceCode?: string;
  notes?: string;
}): Promise<{ success: boolean; id: number; message: string }> => {
  return request('/api/auth/document-transfers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Services Status (health checks)
export const getServicesStatus = async (): Promise<Record<string, { status: string; lastCheck: string }>> => {
  const services: Record<string, number> = {
    auth: 3002,
    btp: 3003,
    assurances: 3004,
    communication: 3005,
    rh: 3006,
    logistique: 3008,
    voyage: 3009,
  };
  const status: Record<string, { status: string; lastCheck: string }> = {};

  for (const [service, port] of Object.entries(services)) {
    try {
      const res = await fetch(`${buildServiceBase(port)}/health`, {
        headers: buildHeaders(false),
      });
      status[service] = { status: res.ok ? 'OK' : 'DOWN', lastCheck: new Date().toISOString() };
    } catch {
      status[service] = { status: 'DOWN', lastCheck: new Date().toISOString() };
    }
  }
  
  return status;
};
