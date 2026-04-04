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
  data: any;
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
  return request<PendingUser[]>('/api/auth/pending-users');
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
  return request<Notification[]>('/api/auth/notifications');
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await request(`/api/auth/notifications/${id}/read`, { method: 'PATCH' });
};

// Connection Logs
export const getConnectionLogs = async (limit = 100): Promise<ConnectionLog[]> => {
  return request<ConnectionLog[]>(`/api/logs/connection?limit=${limit}`);
};

// Services Status (health checks)
export const getServicesStatus = async (): Promise<Record<string, { status: string; lastCheck: string }>> => {
  const services = ['auth', 'btp', 'logistique', 'assurance', 'communication', 'rh', 'voyage', 'immigration'];
  const status = {};
  
  for (const service of services) {
    try {
      const res = await fetch(`${buildServiceBase(3002 + services.indexOf(service) + 1)}/health`, {
        headers: buildHeaders(false),
      });
      status[service] = { status: res.ok ? 'OK' : 'DOWN', lastCheck: new Date().toISOString() };
    } catch {
      status[service] = { status: 'DOWN', lastCheck: new Date().toISOString() };
    }
  }
  
  return status;
};

