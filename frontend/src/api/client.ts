const BASE_URL = 'http://localhost:8080/api';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({ message: response.statusText }));

  if (!response.ok) {
    // Preserve the shape callers expect for error handling: error.response.data.message
    const err = new Error((data as { message?: string }).message ?? response.statusText) as Error & {
      response: { data: unknown; status: number };
    };
    err.response = { data, status: response.status };
    throw err;
  }

  return data as T;
}

const client = {
  get: <T>(path: string): Promise<T> => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T = void>(path: string): Promise<T> => apiFetch<T>(path, { method: 'DELETE' }),
};

export default client;
