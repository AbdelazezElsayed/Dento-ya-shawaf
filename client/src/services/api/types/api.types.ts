/**
 * API Type Definitions
 * Shared types for API requests and responses
 */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
  isNetworkError?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortParams {
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: any;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  cancelToken?: any;
}
