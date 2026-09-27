let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// Routes where a 401 means "wrong credentials", not "token expired"
const NO_REFRESH = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];

let refreshPromise: Promise<boolean> | null = null;

function send(path: string, options: RequestOptions): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(path, {
    ...options,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (!res.ok) return false;
        const data = (await res.json()) as { access_token: string };
        setAccessToken(data.access_token);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function errorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return `Request failed (${res.status})`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options);

  if (res.status === 401 && !NO_REFRESH.includes(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await send(path, options);
    } else {
      setAccessToken(null);
    }
  }

  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}