/**
 * Shared hook utilities and types for data fetching
 */

import { ApiError } from '@/lib/api-client';

// Re-export ApiError for convenience
export { ApiError };

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Type guard to check if an error is an ApiError.
 * Useful for conditional error handling based on error type.
 *
 * @example
 * if (isApiError(error)) {
 *   console.log(error.statusCode, error.code);
 * }
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract a human-readable message from any error type.
 * Handles ApiError, Error, string errors, and unknown values.
 *
 * @example
 * const message = getErrorMessage(error);
 * toast.error(message);
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // Include error code if available for more context
    return error.code
      ? `${error.message} (${error.code})`
      : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

