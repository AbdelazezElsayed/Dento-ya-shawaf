/**
 * Response Interceptor
 * Handles response transformation, error handling, token refresh
 */

import { AxiosResponse, AxiosError } from "axios";

export const setupResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Log response in development
  if (import.meta.env.DEV) {
    console.debug(`[API Response] ${response.status} ${response.config.url}`, {
      data: response.data,
    });
  }

  // Transform response if needed
  if (response.data && typeof response.data === "object") {
    // Add timestamp
    (response.data as any).responseTime = new Date().toISOString();
  }

  return response;
};

/**
 * Handle API errors with specific error codes
 */
export const handleResponseError = async (error: AxiosError): Promise<never> => {
  const status = error.response?.status;
  const message = (error.response?.data as any)?.message || error.message;

  // Handle specific error codes
  switch (status) {
    case 401:
      // Unauthorized - refresh token or redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      break;

    case 403:
      // Forbidden
      console.error("Access forbidden:", message);
      break;

    case 404:
      // Not found
      console.error("Resource not found:", message);
      break;

    case 429:
      // Rate limited
      console.warn("Rate limited. Please try again later.");
      break;

    case 500:
    case 502:
    case 503:
      // Server errors
      console.error("Server error:", message);
      break;

    default:
      console.error("API Error:", message);
  }

  // Log error in development
  if (import.meta.env.DEV) {
    console.error(`[API Error] ${status} ${error.config?.url}`, {
      message,
      data: error.response?.data,
    });
  }

  return Promise.reject(error);
};
