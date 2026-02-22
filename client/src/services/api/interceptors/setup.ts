/**
 * Interceptors Setup
 * Configure all request and response interceptors
 */

import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { setupRequestInterceptor } from "./request.interceptor";
import { setupResponseInterceptor, handleResponseError } from "./response.interceptor";

export const setupInterceptors = (instance: AxiosInstance): void => {
  /**
   * Request Interceptor
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => setupRequestInterceptor(config),
    (error: any) => Promise.reject(error)
  );

  /**
   * Response Interceptor
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => setupResponseInterceptor(response),
    (error: any) => handleResponseError(error)
  );
};
