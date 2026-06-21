const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // CRITICAL: sends HttpOnly cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    const err = new Error(error?.error?.message || 'Request failed');
    // Attach status code so callers can check it
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  auth: {
    me: () =>
      api.get<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        gmailConnected: boolean;
        currency: string;
        onboardingStep: number;
      }>('/api/auth/me'),
    logout: () => api.post('/api/auth/logout'),
    googleLogin: () => {
      window.location.href = `${BASE_URL}/api/auth/google`;
    },
  },
};
