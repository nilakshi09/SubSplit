const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function getToken(): string | null {
  return localStorage.getItem('subsplit_token');
}
export function setToken(token: string): void {
  localStorage.setItem('subsplit_token', token);
}
export function removeToken(): void {
  localStorage.removeItem('subsplit_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error?.error?.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
  auth: {
    me: () => api.get<{
      id: string; email: string; name: string;
      avatarUrl: string | null; gmailConnected: boolean;
      currency: string; onboardingStep: number;
    }>('/api/auth/me'),
    logout: () => api.post('/api/auth/logout'),
    googleLogin: () => {
      window.location.href = `${BASE_URL}/api/auth/google`;
    },
  },
};
