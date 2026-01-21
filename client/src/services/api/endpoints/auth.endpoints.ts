/**
 * Authentication Endpoints
 * All auth-related API calls
 */

import { apiPost, apiGet } from "../client";
import { API_ENDPOINTS } from "../config";

export const authEndpoints = {
  /**
   * User login
   */
  login: async (credentials: { email: string; password: string }) => {
    return apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  /**
   * User logout
   */
  logout: async () => {
    return apiPost(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * User registration
   */
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiPost(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string) => {
    return apiPost(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  /**
   * Verify 2FA code
   */
  verify2FA: async (code: string) => {
    return apiPost(API_ENDPOINTS.AUTH.VERIFY_2FA, { code });
  },
};
