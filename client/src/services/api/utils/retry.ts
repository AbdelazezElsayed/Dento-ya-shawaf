/**
 * Retry Utility
 * Handle API request retries with exponential backoff
 */

import API_CONFIG from "../config";

export interface RetryConfig {
  attempts?: number;
  delay?: number;
  backoff?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const {
    attempts = API_CONFIG.RETRY_ATTEMPTS,
    delay = API_CONFIG.RETRY_DELAY,
    backoff = 2,
    onRetry,
  } = config;

  let lastError: any;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        
        onRetry?.(attempt, error);

        if (import.meta.env.DEV) {
          console.debug(
            `[Retry] Attempt ${attempt}/${attempts} failed. Retrying in ${waitTime}ms...`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};
