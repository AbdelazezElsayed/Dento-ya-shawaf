/**
 * Appointments Endpoints
 * All appointment-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "../client";
import { API_ENDPOINTS } from "../config";
import { PaginationParams } from "../types/api.types";

export const appointmentsEndpoints = {
  /**
   * Get all appointments with filtering
   */
  list: async (params?: PaginationParams & { status?: string; doctorId?: string }) => {
    return apiGet(API_ENDPOINTS.APPOINTMENTS.LIST, { params });
  },

  /**
   * Get appointment by ID
   */
  getById: async (id: string) => {
    return apiGet(API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(id));
  },

  /**
   * Create new appointment
   */
  create: async (data: {
    doctorId: string;
    clinicId: string;
    appointmentDate: string;
    timeSlot: string;
    notes?: string;
  }) => {
    return apiPost(API_ENDPOINTS.APPOINTMENTS.CREATE, data);
  },

  /**
   * Update appointment
   */
  update: async (id: string, data: any) => {
    return apiPatch(API_ENDPOINTS.APPOINTMENTS.UPDATE(id), data);
  },

  /**
   * Cancel appointment
   */
  cancel: async (id: string, reason?: string) => {
    return apiPost(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), { reason });
  },

  /**
   * Reschedule appointment
   */
  reschedule: async (id: string, data: { newDate: string; newTimeSlot: string }) => {
    return apiPost(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(id), data);
  },

  /**
   * Get available appointment slots
   */
  getAvailable: async (params: { doctorId: string; clinicId?: string; date?: string }) => {
    return apiGet(API_ENDPOINTS.APPOINTMENTS.GET_AVAILABLE, { params });
  },
};
