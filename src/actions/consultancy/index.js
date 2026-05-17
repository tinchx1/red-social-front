import { clientApi } from '@/lib/api';

/**
 * Create a consultancy request
 * @param {Object} payload
 * @param {string} payload.firstName
 * @param {string} payload.lastName
 * @param {string} payload.email
 * @param {string} payload.phone
 * @param {string} payload.industry
 * @param {string} payload.company
 * @param {string} payload.consultationType
 * @param {string} payload.message
 * @param {boolean} payload.contactByPhone
 * @returns {Promise<any>}
 */
export async function createConsultancy(payload) {
  try {
    const res = await clientApi.post('/consultancy', payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}


