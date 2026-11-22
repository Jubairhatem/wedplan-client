const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
  withAuth?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: Record<string, string[]>;
}

class ApiError extends Error {
  status: number;
  data?: ApiResponse;

  constructor(message: string, status: number, data?: ApiResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Robust fetch wrapper for communication with the Express backend
 */
async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  let { token } = options;
  const { withAuth, headers: customHeaders, ...fetchOptions } = options;

  // If auth is requested but token wasn't directly passed, try to fetch it client-side
  if (withAuth && !token && typeof window !== "undefined") {
    try {
      const tokenRes = await fetch("/api/auth/token");
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData.token;
      }
    } catch (e) {
      console.warn("Failed to retrieve auth token for request");
    }
  }

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

export { fetchAPI, ApiError, API_BASE_URL };
export type { ApiResponse, FetchOptions };
