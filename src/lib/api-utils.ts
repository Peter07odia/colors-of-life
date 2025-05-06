/**
 * API utilities for standardized error handling and request management
 */

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export class ApiRequestError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetch with timeout and standardized error handling
 * @param url URL to fetch
 * @param options Fetch options with optional timeout
 * @returns Promise with response data
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = 8000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      const message = errorData.message || `API Error (${response.status})`;
      throw new ApiRequestError(message, response.status, errorData);
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse JSON response
    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new ApiRequestError('Invalid JSON response', 500);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle aborted requests (timeout)
    if (error.name === 'AbortError') {
      throw new ApiRequestError('Request timeout', 408);
    }
    
    // Re-throw ApiRequestError or wrap other errors
    if (error instanceof ApiRequestError) {
      throw error;
    }
    
    throw new ApiRequestError(
      error.message || 'Network error',
      0
    );
  }
}

/**
 * Standardized GET request with error handling
 */
export async function apiGet<T>(url: string, options?: ApiRequestOptions): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
}

/**
 * Standardized POST request with error handling
 */
export async function apiPost<T>(
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Standardized PUT request with error handling
 */
export async function apiPut<T>(
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Standardized DELETE request with error handling
 */
export async function apiDelete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
  return fetchWithTimeout<T>(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
} 