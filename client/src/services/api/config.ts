/**
 * API Configuration
 * Central configuration for API client
 */

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    VERIFY_2FA: "/auth/verify-2fa",
  },

  // Users
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    GET_BY_ID: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    LIST: "/users",
  },

  // Appointments
  APPOINTMENTS: {
    CREATE: "/appointments",
    LIST: "/appointments",
    GET_BY_ID: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
    GET_AVAILABLE: "/appointments/available",
  },

  // Doctors
  DOCTORS: {
    LIST: "/doctors",
    GET_BY_ID: (id: string) => `/doctors/${id}`,
    GET_SCHEDULE: (id: string) => `/doctors/${id}/schedule`,
    GET_REVIEWS: (id: string) => `/doctors/${id}/reviews`,
    UPDATE_AVAILABILITY: (id: string) => `/doctors/${id}/availability`,
  },

  // Clinics
  CLINICS: {
    LIST: "/clinics",
    GET_BY_ID: (id: string) => `/clinics/${id}`,
    GET_SERVICES: (id: string) => `/clinics/${id}/services`,
    GET_EQUIPMENT: (id: string) => `/clinics/${id}/equipment`,
  },

  // Medical Records
  MEDICAL_RECORDS: {
    CREATE: "/medical-records",
    LIST: "/medical-records",
    GET_BY_ID: (id: string) => `/medical-records/${id}`,
    UPDATE: (id: string) => `/medical-records/${id}`,
    DELETE: (id: string) => `/medical-records/${id}`,
    DOWNLOAD: (id: string) => `/medical-records/${id}/download`,
  },

  // Medications
  MEDICATIONS: {
    CREATE: "/medications",
    LIST: "/medications",
    GET_BY_ID: (id: string) => `/medications/${id}`,
    UPDATE: (id: string) => `/medications/${id}`,
    DELETE: (id: string) => `/medications/${id}`,
  },

  // Payments
  PAYMENTS: {
    CREATE: "/payments",
    LIST: "/payments",
    GET_BY_ID: (id: string) => `/payments/${id}`,
    PROCESS: (id: string) => `/payments/${id}/process`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
    GET_METHODS: "/payments/methods",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: "/notifications/clear",
  },

  // Reviews & Ratings
  REVIEWS: {
    CREATE: "/reviews",
    LIST: "/reviews",
    GET_BY_ID: (id: string) => `/reviews/${id}`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    GET_DOCTOR_REVIEWS: (doctorId: string) => `/reviews/doctor/${doctorId}`,
  },

  // Support & Tickets
  SUPPORT: {
    CREATE_TICKET: "/support/tickets",
    LIST_TICKETS: "/support/tickets",
    GET_TICKET: (id: string) => `/support/tickets/${id}`,
    UPDATE_TICKET: (id: string) => `/support/tickets/${id}`,
    ADD_REPLY: (id: string) => `/support/tickets/${id}/reply`,
  },

  // Financial
  FINANCIAL: {
    GET_DASHBOARD: "/financial/dashboard",
    GET_EXPENSES: "/financial/expenses",
    GET_INVOICES: "/financial/invoices",
    EXPORT_REPORT: "/financial/reports/export",
  },

  // Search
  SEARCH: {
    DOCTORS: "/search/doctors",
    CLINICS: "/search/clinics",
    ARTICLES: "/search/articles",
    HISTORY: "/search/history",
  },
};

export default API_CONFIG;
