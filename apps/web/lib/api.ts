const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getAuthToken(): string | null {
  if (!authToken) authToken = localStorage.getItem('token');
  return authToken;
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

export const auth = {
  login: (email: string, password: string) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  profile: () => api('/auth/profile'),
};

export const users = {
  list: (params?: string) => api(`/users${params || ''}`),
  get: (id: string) => api(`/users/${id}`),
  create: (data: any) => api('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => api(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
};

export const projects = {
  list: (params?: string) => api(`/projects${params || ''}`),
  get: (id: string) => api(`/projects/${id}`),
  create: (data: any) => api('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => api(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  members: (id: string) => api(`/projects/${id}/members`),
  addMember: (id: string, data: any) => api(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(data) }),
  timeline: (id: string) => api(`/projects/${id}/timeline`),
  risks: (id: string) => api(`/projects/${id}/risks`),
  health: (id: string) => api(`/projects/${id}/health`),
};

export const tasks = {
  list: (params?: string) => api(`/tasks${params || ''}`),
  get: (id: string) => api(`/tasks/${id}`),
  create: (data: any) => api('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  transition: (id: string, action: string) => api(`/tasks/${id}/transition`, { method: 'POST', body: JSON.stringify({ action }) }),
  approve: (id: string, decision: string, comment?: string) => api(`/tasks/${id}/approve`, { method: 'POST', body: JSON.stringify({ decision, comment }) }),
};

export const notifications = {
  list: (params?: string) => api(`/notifications${params || ''}`),
  markRead: (id: string) => api(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => api('/notifications/read-all', { method: 'POST' }),
};

export const cab = {
  changeRequests: (params?: string) => api(`/cab/change-requests${params || ''}`),
  createCR: (data: any) => api('/cab/change-requests', { method: 'POST', body: JSON.stringify(data) }),
  meetings: (params?: string) => api(`/cab/meetings${params || ''}`),
  createMeeting: (data: any) => api('/cab/meetings', { method: 'POST', body: JSON.stringify(data) }),
  castVote: (decisionId: string, data: any) => api(`/cab/decisions/${decisionId}/vote`, { method: 'POST', body: JSON.stringify(data) }),
  publishDecision: (data: any) => api('/cab/decisions/publish', { method: 'POST', body: JSON.stringify(data) }),
};

export const comments = {
  list: (parentType: string, parentId: string) => api(`/comments?parentType=${parentType}&parentId=${parentId}`),
  create: (data: any) => api('/comments', { method: 'POST', body: JSON.stringify(data) }),
};

export const backOffice = {
  portfolio: () => api('/back-office/portfolio'),
  compare: (projectIds: string[]) => api('/back-office/portfolio/compare', { method: 'POST', body: JSON.stringify({ projectIds }) }),
  launchReadiness: (projectId: string) => api(`/back-office/portfolio/launch-readiness/${projectId}`),
  auditLog: (params?: string) => api(`/back-office/audit-log${params || ''}`),
};
