import { triggerGlobalVerificationLock } from "@/components/dashboard/DashboardProvider";

export const API_BASE_URL = "";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, options: { status: number; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.details = options.details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: "json" | "blob";
  isFormData?: boolean;
  credentials?: RequestCredentials;
  skipVerificationLock?: boolean;
}

const normalizePath = (path: string) => {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
};

const parseJsonSafely = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
    }
  }
  return null;
};

type JsonRecord = Record<string, unknown> | null;

const forceLogoutOnAuthFailure = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("akaro_is_logged_out", "true");
  } catch (error) {
  }

  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login?expired=true");
  }
};

export async function httpRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const url = `${API_BASE_URL}${normalizePath(path)}`;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers,
    credentials: options.credentials ?? "include",
    mode: API_BASE_URL ? "cors" : "same-origin",
    signal: options.signal || controller.signal,
  };

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      requestInit.body = options.body;
    } else {
      requestInit.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, requestInit);
    clearTimeout(timeoutId);

    if (options.responseType === "blob") {
      if (!response.ok) {
        if (!options.skipVerificationLock && (response.status === 401 || response.status === 403)) {
          triggerGlobalVerificationLock(true);
        }

        const errorPayload = await parseJsonSafely(response);
        const messageCandidate = (errorPayload as JsonRecord)?.message;
        const fallback = `Request failed with status ${response.status}`;
        const message =
          typeof messageCandidate === "string"
            ? messageCandidate
            : Array.isArray(messageCandidate)
              ? messageCandidate.join(", ")
              : fallback;
        throw new ApiError(message, {
          status: response.status,
          details: errorPayload,
        });
      }
      return (await response.blob()) as T;
    }

    const payload = await parseJsonSafely(response);

    if (!options.skipVerificationLock && 
        (response.status === 401 || response.status === 403) && 
        !url.includes("fetch_profile") && 
        !url.includes("resend_verification") &&
        !url.includes("profile_picture")) {
      triggerGlobalVerificationLock(true);
    }

    if (!response.ok) {
      const errorPayload = payload as JsonRecord;
      const messageCandidate = errorPayload?.message;
      const fallback =
        response.status === 401
          ? "Authentication failed"
          : `Request failed with status ${response.status}`;
      const message =
        typeof messageCandidate === "string"
          ? messageCandidate
          : Array.isArray(messageCandidate)
            ? messageCandidate.join(", ")
            : fallback;

      throw new ApiError(message, {
        status: response.status,
        details: payload,
      });
    }

    return (payload as T) ?? ({} as T);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError("Request timed out", { status: 408 });
    }
    throw error;
  }
}
