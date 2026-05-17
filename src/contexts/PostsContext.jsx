"use client";
import { createContext, useContext, useState, useEffect } from "react";

const PostsContext = createContext();

export const PostsProvider = ({
  children,
  initialPosts = [],
  initialPagination = null,
}) => {
  const [posts, setPosts] = useState(initialPosts);
  const [communityPosts, setCommunityPosts] = useState({}); // { communityId: posts[] }
  const [hasMore, setHasMore] = useState(true);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [communityMembershipStatus, setCommunityMembershipStatus] =
    useState(null);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    }
  );
  // Initialize hasMore based on initial pagination
  useEffect(() => {
    if (initialPagination) {
      setHasMore(initialPagination.page < initialPagination.pages);
    }
  }, [initialPagination]);

  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePosts = (newPosts) => {
    setPosts(newPosts);
  };

  const updatePostsWithPagination = (responseData) => {
    setPosts(responseData.data);
    setPagination(responseData.pagination);
    setHasMore(responseData.pagination.page < responseData.pagination.pages);
  };

  const appendPosts = (newPosts) => {
    setPosts((prev) => [...prev, ...newPosts]);
  };

  const appendPostsWithPagination = (responseData) => {
    setPosts((prev) => [...prev, ...responseData.data]);
    setPagination(responseData.pagination);
    setHasMore(responseData.pagination.page < responseData.pagination.pages);
  };

  const updatePost = (postId, updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? updatedPost : post))
    );
    // Also update in community posts if it exists there
    setCommunityPosts((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((communityId) => {
        updated[communityId] = updated[communityId].map((post) =>
          post.id === postId ? updatedPost : post
        );
      });
      return updated;
    });
  };

  const removePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    // Also remove from community posts
    setCommunityPosts((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((communityId) => {
        updated[communityId] = updated[communityId].filter(
          (post) => post.id !== postId
        );
      });
      return updated;
    });
  };

  // Community posts functions
  const addCommunityPost = (communityId, newPost) => {
    setCommunityPosts((prev) => ({
      ...prev,
      [communityId]: [newPost, ...(prev[communityId] || [])],
    }));
  };

  const updateCommunityPosts = (communityId, newPosts) => {
    setCommunityPosts((prev) => ({
      ...prev,
      [communityId]: newPosts,
    }));
  };

  const appendCommunityPosts = (communityId, newPosts) => {
    setCommunityPosts((prev) => ({
      ...prev,
      [communityId]: [...(prev[communityId] || []), ...newPosts],
    }));
  };

  const appendCommunityPostsWithPagination = (communityId, responseData) => {
    setCommunityPosts((prev) => {
      const existingPosts = prev[communityId] || [];
      const newPosts = responseData.data || [];

      // Create a Set of existing post IDs for O(1) lookup
      const existingIds = new Set(existingPosts.map((post) => post.id));

      // Filter out duplicates from new posts
      const uniqueNewPosts = newPosts.filter(
        (post) => !existingIds.has(post.id)
      );

      return {
        ...prev,
        [communityId]: [...existingPosts, ...uniqueNewPosts],
      };
    });
    // Store pagination per community if needed
    // For now, we'll use the main pagination state
    setPagination(responseData.pagination);
  };

  const getCommunityPosts = (communityId) => {
    return communityPosts[communityId] || [];
  };

  const setHasMorePosts = (value) => {
    setHasMore(value);
  };

  const value = {
    posts,
    setPosts,
    addPost,
    updatePosts,
    updatePostsWithPagination,
    appendPosts,
    appendPostsWithPagination,
    updatePost,
    removePost,
    hasMore,
    setHasMorePosts,
    isPostFormOpen,
    setIsPostFormOpen,
    communityMembershipStatus,
    setCommunityMembershipStatus,
    pagination,
    setPagination,
    // Community posts
    communityPosts,
    addCommunityPost,
    updateCommunityPosts,
    appendCommunityPosts,
    appendCommunityPostsWithPagination,
    getCommunityPosts,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
