import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for infinite scroll functionality
 * @param {Function} loadMore - Function to load more data
 * @param {boolean} hasMore - Whether there's more data to load
 * @param {boolean} isLoading - Whether data is currently loading
 * @param {number} threshold - Distance from bottom to trigger load (in pixels)
 * @param {number} rootMargin - Root margin for intersection observer
 */
export const useInfiniteScroll = ({
  loadMore,
  hasMore,
  isLoading,
  threshold = 100,
  rootMargin = '0px'
}) => {
  const observerRef = useRef()
  const loadMoreRef = useRef()

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore()
          }
        },
        {
          rootMargin,
          threshold: 0.1
        }
      )
      
      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasMore, loadMore, rootMargin]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { lastElementRef, loadMoreRef }
}
