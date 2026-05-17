"use server"
import { serverApi } from '@/lib/api';

/**
 * Fetch search suggestions from the API
 * @param {string} query - Search query
 * @returns {Promise<{data: Array, summary: {total: number}}>}
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 1) {
    return { data: [], summary: { total: 0 } };
  }
  try {
    const response = await serverApi.get(`/search/suggestions?q=${encodeURIComponent(query.trim())}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return { data: [], summary: { total: 0 } };
  }
};

export const getSearchResults = async (query) => {
  if (!query || query.trim().length < 1) {
    return { data: [], summary: { total: 0 } };
  }
  try {
    const response = await serverApi.get(`/search?q=${encodeURIComponent(query.trim())}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return { data: [], summary: { total: 0 } };
  }
};
