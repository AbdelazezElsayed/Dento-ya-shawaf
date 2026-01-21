/**
 * Clinics Endpoints
 * All clinic-related API calls
 */

import { apiGet } from "../client";
import { API_ENDPOINTS } from "../config";

export const clinicsEndpoints = {
    /**
     * Get all clinics
     */
    list: async () => {
        return apiGet(API_ENDPOINTS.CLINICS.LIST);
    },

    /**
     * Get clinic by ID
     */
    getById: async (id: string) => {
        return apiGet(API_ENDPOINTS.CLINICS.GET_BY_ID(id));
    },

    /**
     * Get clinic services
     */
    getServices: async (id: string) => {
        return apiGet(API_ENDPOINTS.CLINICS.GET_SERVICES(id));
    },

    /**
     * Get clinic equipment
     */
    getEquipment: async (id: string) => {
        return apiGet(API_ENDPOINTS.CLINICS.GET_EQUIPMENT(id));
    },
};
