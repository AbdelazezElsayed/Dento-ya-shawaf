/**
 * API Endpoints Export
 * Central export point for all API endpoints
 */

export * from "./auth.endpoints";
export * from "./appointments.endpoints";
export * from "./doctors.endpoints";
export * from "./ratings.endpoints";

// Import all endpoints for easier access
export { authEndpoints } from "./auth.endpoints";
export { appointmentsEndpoints } from "./appointments.endpoints";
export { doctorsEndpoints } from "./doctors.endpoints";
export { clinicsEndpoints } from "./clinics.endpoints";
export { ratingsEndpoints } from "./ratings.endpoints";
