export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pulse_auth_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('pulse_auth_token', token);
  } else {
    localStorage.removeItem('pulse_auth_token');
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      if (data.message === 'Validation failed' && data.details) {
        // Extract the first validation error message from the details object
        const firstField = Object.keys(data.details)[0];
        if (firstField && Array.isArray(data.details[firstField]) && data.details[firstField].length > 0) {
          errorMsg = data.details[firstField][0];
        } else {
          errorMsg = data.message;
        }
      } else {
        errorMsg = data.message || errorMsg;
      }
    } catch {
      // Ignored
    }
    
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    throw err;
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export function apiGet<T>(path: string) {
  return apiFetch<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: any) {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: any) {
  return apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: 'DELETE' });
}
