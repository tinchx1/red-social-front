/**
 * Utility to detect and handle "blocked from community" errors
 * Works in both production and development environments
 * 
 * @param {Error} error - The error object from axios/server action
 * @returns {{ isBlocked: boolean, message: string }} - Object with detection result and user-friendly message
 */
export function isCommunityBlockError(error) {
  // Collect all possible message sources (in order of reliability)
  // Check message FIRST, as it's more reliable than status in some cases
  const messages = [
    error?.originalMessage, // Preserved by preserveError in server actions
    error?.response?.data?.message, // Direct from axios response
    error?.message, // Error message (most common source)
    String(error?.response?.data || ''), // Stringified response data
    error?.toString() // String representation
  ].filter(Boolean); // Remove undefined/null/empty values

  // Check all messages for blocked keywords (case insensitive)
  const blockedKeywords = [
    'you are blocked from this community',
    'blocked from this community',
    'cannot share posts from community where you are blocked',
    'blocked'
  ];

  for (const msg of messages) {
    if (!msg) continue;
    const msgLower = String(msg).toLowerCase();
    for (const keyword of blockedKeywords) {
      if (msgLower.includes(keyword)) {
        return {
          isBlocked: true,
          message: 'Has sido bloqueado de esta comunidad. No puedes realizar esta acción en esta comunidad.'
        };
      }
    }
  }

  // Check status code as secondary check (most reliable in production when message is hidden)
  const status = error?.response?.status || error?.status;
  const is403 = status === 403;

  // If status is 403 and we have response object or preserved info (from server action),
  // This handles cases where Next.js hides the message in production
  // For community-related endpoints (posts, comments, reactions, shares),
  // a 403 almost always means blocked from community
  if (is403) {
    const hasResponse = error?.response && error.response.status === 403;
    const hasPreservedInfo = error?.originalMessage !== undefined || error?.isAxiosError !== undefined;
    const hasStatus = error?.status === 403;

    // If we have 403 status and it's from our server action (has preserved info or response),
    // treat it as blocked (in context of community operations, 403 = blocked)
    if (hasResponse || hasPreservedInfo || hasStatus) {
      return {
        isBlocked: true,
        message: 'Has sido bloqueado de esta comunidad. No puedes realizar esta acción en esta comunidad.'
      };
    }
  }

  return { isBlocked: false, message: null };
}

/**
 * Get a custom error message for blocked community actions
 * 
 * @param {string} action - The action being performed (e.g., 'crear publicaciones', 'comentar')
 * @returns {string} - Custom error message
 */
export function getBlockedCommunityMessage(action) {
  return `Has sido bloqueado de esta comunidad. No puedes ${action} en esta comunidad.`;
}

