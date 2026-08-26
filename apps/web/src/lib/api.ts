/** Minimal API client for the documented /api/v1 contract. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(`/api/v1${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as unknown as T;
  const data = (await res.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string; details?: unknown };
  };
  if (!res.ok) {
    throw new ApiError(
      data.error?.message ?? 'Request failed',
      res.status,
      data.error?.code,
      data.error?.details,
    );
  }
  return data as T;
}

export const apiGet = <T>(path: string) => api<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const apiPut = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' });