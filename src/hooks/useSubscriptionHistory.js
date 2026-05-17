import { useState, useEffect, useCallback } from 'react';
import { clientApi } from '@/lib/api';

/**
 * Hook to fetch subscription payment history with pagination
 * @param {number} initialPage - Initial page number (default: 1)
 * @returns {Object} { data, loading, error, refetch, nextPage, prevPage, currentPage, totalPages }
 */
export function useSubscriptionHistory(initialPage = 1) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchHistory = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);

      const response = await clientApi.get(`/subscriptions/me/history?page=${page}&limit=3`);
      setData(response.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching subscription history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const nextPage = () => {
    if (data && currentPage < data.pagination.pages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchHistory(newPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchHistory(newPage);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [fetchHistory, currentPage]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchHistory(currentPage),
    nextPage,
    prevPage,
    currentPage,
    totalPages: data?.pagination?.pages || 1,
  };
}

