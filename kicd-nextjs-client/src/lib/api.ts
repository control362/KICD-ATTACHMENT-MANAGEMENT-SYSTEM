import { API_BASE_URL } from "./config";
import { getToken, clearSession } from "./auth";

export class ApiError extends Error {
  status: number;
  fieldErrors: any;
  error: any;
  isNetworkError?: boolean;

  constructor(status: number, body: any) {
    let msg = body?.message || "Something went wrong. Please try again.";

    // Parse Spring Boot validation errors
    if (status === 400 && body?.errors && Array.isArray(body.errors)) {
      const messages = body.errors.map((e: any) => e.defaultMessage).filter(Boolean);
      if (messages.length > 0) {
        msg = "Validation Error: " + messages.join(", ");
      }
    }

    super(msg);
    this.status = status;
    this.fieldErrors = body?.fieldErrors || null;
    this.error = body?.error || null;
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  auth?: boolean;
}

async function request<T = any>(path: string, { method = "GET", body, auth = true, ...customConfig }: RequestOptions = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // If customConfig has headers, we merge them but we need to delete Content-Type if it's explicitly set for FormData
  const finalHeaders = { ...headers, ...customConfig.headers } as Record<string, string>;
  if (isFormData) {
    for (const key in finalHeaders) {
      if (key.toLowerCase() === "content-type") {
        delete finalHeaders[key];
      }
    }
  }

  const config: RequestInit = {
    method,
    headers: finalHeaders,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...customConfig,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, config);
  } catch (networkErr) {
    const err = new ApiError(0, { message: "Can't reach the server. Check your connection and try again." });
    err.isNetworkError = true;
    throw err;
  }

  if (response.status === 204) return null as any;

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // ignore
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      if (typeof window !== "undefined") {
        clearSession();
        window.location.href = "/login";
      }
    }
    throw new ApiError(response.status, data);
  }

  return data;
}

export const api = {
  get: <T = any>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, { ...opts, method: "POST", body }),
  put: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = any>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "DELETE" }),
};
