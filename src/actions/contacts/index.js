import api from '@/lib/api';

/**
 * Get user contacts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Contacts data with pagination info
 */
export async function getContacts(page = 1, limit = 10) {
  try {
    const response = await api.get(`/contacts?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Get contact suggestions with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Contact suggestions data with pagination info
 */
export async function getContactSuggestions(page = 1, limit = 10) {
  try {
    const response = await api.get(`/contacts/discover?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact suggestions:', error);
    throw error;
  }
}

/**
 * Send contact request
 * @param {string} receiverId - ID of the user to send request to
 * @param {string} message - Custom message for the request
 * @returns {Promise<Object>} Response from the API
 */
export async function sendContactRequest(receiverId, message) {
  try {
    const response = await api.post(`/contacts/requests/${receiverId}`, {
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending contact request:', error);
    throw error;
  }
}

/**
 * Get contact requests received by the current user
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Contact requests data with pagination info
 */
export async function getContactRequests(page = 1, limit = 10) {
  try {
    const response = await api.get(`/contacts/requests/received?status=pending&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    throw error;
  }
}

/**
 * Accept a contact request
 * @param {string} requestId - ID of the request to accept
 * @returns {Promise<Object>} Response from the API
 */
export async function acceptContactRequest(requestId) {
  try {
    const response = await api.patch(`/contacts/requests/${requestId}`, {
      status: 'accepted'
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting contact request:', error);
    throw error;
  }
}

/**
 * Reject a contact request
 * @param {string} requestId - ID of the request to reject
 * @returns {Promise<Object>} Response from the API
 */
export async function rejectContactRequest(requestId) {
  try {
    const response = await api.patch(`/contacts/requests/${requestId}`, {
      status: 'rejected'
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting contact request:', error);
    throw error;
  }
}

/**
 * Delete a contact
 * @param {string} contactId - ID of the contact to delete
 * @returns {Promise<Object>} Response from the API
 */
export async function deleteContact(contactId) {
  try {
    const response = await api.delete(`/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Get contact status with a specific user
 * @param {string} userId - ID of the user to check status with
 * @returns {Promise<Object>} Contact status data
 */
export async function getContactStatus(userId) {
  try {
    const response = await api.get(`/contacts/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact status:', error);
    throw error;
  }
}

/**
 * Cancel a contact request
 * @param {string} requestId - ID of the request to cancel
 * @returns {Promise<Object>} Response from the API
 */
export async function cancelContactRequest(requestId) {
  try {
    const response = await api.delete(`/contacts/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling contact request:', error);
    throw error;
  }
}