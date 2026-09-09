const rawBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api-v1";
const API_BASE = rawBase.endsWith("/api-v1") ? rawBase : `${rawBase.replace(/\/$/, "")}/api-v1`;

function getToken(): string | null {
  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem("coflow_token");
    if (fromStorage) return fromStorage;
    const match = document.cookie.match(/(?:^|;\s*)coflow_token=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export function fetchData<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function postData<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function putData<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteData<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
