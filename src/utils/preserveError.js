/**
 * Helper function to preserve error information from axios errors
 * This is important for server actions where error details might be hidden in production
 * 
 * @param {Error} error - The original axios error
 * @param {string} defaultMessage - Default error message if original message is not available
 * @returns {Error} - New error with preserved information
 */
export function preserveError(error, defaultMessage) {
  const originalMessage = error.response?.data?.message || error.message || defaultMessage;
  const newError = new Error(originalMessage);

  // Preserve original error properties
  newError.response = error.response;
  newError.status = error.response?.status;
  newError.originalMessage = originalMessage;
  newError.isAxiosError = error.isAxiosError;
  // Preserve optional redirect target if caller sets it
  if (error.redirectTo) {
    newError.redirectTo = error.redirectTo;
  } else if (error?.response?.data?.redirectTo) {
    // fallback if backend returns redirect target in payload
    newError.redirectTo = error.response.data.redirectTo;
  }

  return newError;
}
