/**
 * API Service
 * Central export point for all API services
 */

// Client
export { apiClient, apiGet, apiPost, apiPatch, apiPut, apiDelete, handleApiError } from "./client";

// Config
export { default as API_CONFIG, API_ENDPOINTS } from "./config";

// Types
export type { ApiResponse, ApiError, PaginationParams, PaginatedResponse, SortParams, FilterParams, RequestConfig } from "./types/api.types";

// Endpoints
export {
  authEndpoints,
  appointmentsEndpoints,
  doctorsEndpoints,
  clinicsEndpoints,
  ratingsEndpoints,
} from "./endpoints";

// Utils
export { retryWithBackoff } from "./utils/retry";
export { apiCache } from "./utils/cache";
