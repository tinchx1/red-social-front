'use client'
import { useState } from 'react'
import { getCommunityPosts } from '@/actions'
import { usePosts } from '@/contexts/PostsContext'
import CommunityFeed from './profile/CommunityFeed/CommunityFeed'

export default function CommunityFeedWrapper({
  posts: initialPosts,
  communityId,
  hasMore: initialHasMore,
  isJoined,
  isPublicCommunity,
  canCreatePost,
  membershipStatus,
  isInCommunityPage = false
}) {
  const [communityPagination, setCommunityPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const { appendCommunityPostsWithPagination, pagination } = usePosts()

  const handleLoadMore = async () => {
    try {
      const nextPage = communityPagination.page + 1
      const response = await getCommunityPosts(communityId, nextPage, 10)

      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        appendCommunityPostsWithPagination(communityId, response)
        setCommunityPagination(response.pagination)
        return {
          posts: response.data,
          pagination: response.pagination
        }
      }
      return { posts: [], pagination: null }
    } catch (error) {
      console.error('Error loading more community posts:', error)
      return { posts: [], pagination: null }
    }
  }

  return (
    <CommunityFeed
      posts={initialPosts}
      communityId={communityId}
      hasMore={initialHasMore}
      onLoadMore={handleLoadMore}
      isJoined={isJoined}
      isPublicCommunity={isPublicCommunity}
      canCreatePost={canCreatePost}
      membershipStatus={membershipStatus}
      isInCommunityPage={isInCommunityPage}
    />
  )
}
