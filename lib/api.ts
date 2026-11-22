const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
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

async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
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
        data.message || "Something went wrong",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.", 0);
  }
}

export { fetchAPI, ApiError, API_BASE_URL };
export type { ApiResponse, FetchOptions };
