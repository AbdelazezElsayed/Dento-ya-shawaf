/**
 * Doctors Endpoints
 * All doctor-related API calls
 */

import { apiGet, apiPatch } from "../client";
import { API_ENDPOINTS } from "../config";
import { PaginationParams, FilterParams } from "../types/api.types";

export const doctorsEndpoints = {
  /**
   * Get all doctors with filtering
   */
  list: async (params?: PaginationParams & FilterParams) => {
    return apiGet(API_ENDPOINTS.DOCTORS.LIST, { params });
  },

  /**
   * Get doctor by ID
   */
  getById: async (id: string) => {
    return apiGet(API_ENDPOINTS.DOCTORS.GET_BY_ID(id));
  },

  /**
   * Get doctor schedule
   */
  getSchedule: async (id: string, date?: string) => {
    return apiGet(API_ENDPOINTS.DOCTORS.GET_SCHEDULE(id), {
      params: { date },
    });
  },

  /**
   * Get doctor reviews
   */
  getReviews: async (id: string, params?: PaginationParams) => {
    return apiGet(API_ENDPOINTS.DOCTORS.GET_REVIEWS(id), { params });
  },

  /**
   * Update doctor availability
   */
  updateAvailability: async (id: string, data: any) => {
    return apiPatch(API_ENDPOINTS.DOCTORS.UPDATE_AVAILABILITY(id), data);
  },
};
