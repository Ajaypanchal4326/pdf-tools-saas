export type ApiErrorShape = {
  message: string;
  code: string;
  details?: unknown;
  status?: number;
};

export class ApiError extends Error {
  public readonly status?: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly retriable: boolean;

  constructor({ message, code, details, status }: ApiErrorShape, retriable = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.retriable = retriable;
  }
}

type ResponseType = "json" | "blob" | "text";

type ApiRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit | null;
  timeoutMs?: number;
  retries?: number;
  responseType?: ResponseType;
};

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const sleep = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const resolveApiUrl = (path: string) => {
  const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const parseErrorResponse = async (response: Response): Promise<ApiErrorShape> => {
  const fallback: ApiErrorShape = {
    status: response.status,
    code: "API_ERROR",
    message: "Request failed",
  };

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = await response.json();
      return {
        status: response.status,
        code: payload?.code ?? fallback.code,
        message: payload?.message ?? fallback.message,
        details: payload?.details,
      };
    } catch {
      return fallback;
    }
  }

  try {
    const text = await response.text();
    return {
      ...fallback,
      message: text || fallback.message,
    };
  } catch {
    return fallback;
  }
};

const isRetriableError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.retriable) return true;
    return Boolean(error.status && RETRYABLE_STATUS_CODES.has(error.status));
  }

  if (error instanceof TypeError) {
    return true;
  }

  return false;
};

const parseResponse = async <T>(response: Response, responseType: ResponseType): Promise<T> => {
  if (responseType === "blob") {
    return (await response.blob()) as T;
  }

  if (responseType === "text") {
    return (await response.text()) as T;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const apiRequest = async <T = unknown>({
  path,
  method = "GET",
  headers,
  body = null,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = DEFAULT_RETRIES,
  responseType = "json",
}: ApiRequestOptions): Promise<T> => {
  const url = resolveApiUrl(path);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorShape = await parseErrorResponse(response);
        throw new ApiError(errorShape, RETRYABLE_STATUS_CODES.has(response.status));
      }

      return await parseResponse<T>(response, responseType);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        const timeoutError = new ApiError(
          {
            status: 408,
            code: "REQUEST_TIMEOUT",
            message: "Request timed out. Please try again.",
          },
          true
        );

        if (attempt === retries) {
          throw timeoutError;
        }
      } else if (attempt === retries || !isRetriableError(error)) {
        if (error instanceof ApiError) {
          throw error;
        }

        throw new ApiError(
          {
            code: "NETWORK_ERROR",
            message: "Network request failed. Please check your connection and try again.",
            details: error,
          },
          true
        );
      }

      const backoff = RETRY_BASE_DELAY_MS * 2 ** attempt;
      await sleep(backoff);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw new ApiError({
    code: "REQUEST_FAILED",
    message: "Request failed after retry attempts.",
  });
};

export const api = {
  convertImageToPdf: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiRequest<Blob>({
      path: "/api/convert/image-to-pdf",
      method: "POST",
      body: formData,
      responseType: "blob",
    });
  },
  mergePdf: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiRequest<Blob>({
      path: "/api/convert/merge-pdf",
      method: "POST",
      body: formData,
      responseType: "blob",
    });
  },
};
