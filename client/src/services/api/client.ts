/**
 * Axios API Client
 * Configured with interceptors, error handling, and defaults
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import API_CONFIG from "./config";
import { setupInterceptors } from "./interceptors/setup";
import { ApiError, ApiResponse } from "./types/api.types";

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
  });

  // Setup request and response interceptors
  setupInterceptors(instance);

  return instance;
};

/**
 * API Client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function to make GET requests
 */
export const apiGet = async <T = any>(
  url: string,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Helper function to make POST requests
 */
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Helper function to make PATCH requests
 */
export const apiPatch = async <T = any>(
  url: string,
  data?: any,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Helper function to make PUT requests
 */
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Helper function to make DELETE requests
 */
export const apiDelete = async <T = any>(
  url: string,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Unified error handler
 */
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      message: axiosError.message,
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data,
      isNetworkError: !axiosError.response,
    };
  }

  return {
    message: "Unknown error occurred",
    status: 500,
    isNetworkError: true,
  };
};

export default apiClient;
