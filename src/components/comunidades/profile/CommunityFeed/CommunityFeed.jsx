"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./CommunityFeed.module.scss";
import PostCard from "@/components/feed/PostCard/PostCard";
import PostForm from "@/components/feed/PostForm/PostForm";
import { Button, Spinner } from "@/components/ui";
import { createPost, getPostById } from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import UsersIcon from "@/assets/users.svg";
import { useProfile } from "@/contexts/ProfileContext";
import CommunityJoinOverlay from "@/components/feed/CommunityJoinOverlay/CommunityJoinOverlay";

/**
 * @param {{ posts: any[]; communityId: string; hasMore?: boolean; onLoadMore?: () => Promise<void> }} props
 */
export default function CommunityFeed({
  posts: initialPosts = [],
  communityId,
  hasMore: initialHasMore = false,
  onLoadMore,
  isJoined,
  isPublicCommunity,
  canCreatePost,
  membershipStatus,
  isInCommunityPage = false
}) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [focusedPostId, setFocusedPostId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { profile: user } = useProfile();
  const {
    isPostFormOpen,
    setIsPostFormOpen,
    getCommunityPosts,
    updateCommunityPosts,
    addCommunityPost,
    appendCommunityPosts,
    appendCommunityPostsWithPagination,
  } = usePosts();
  const searchParams = useSearchParams();
  const processedPostIdRef = useRef(null);
  const postIdParam = useMemo(() => searchParams.get("post"), [searchParams]);

  // Get community posts from context
  const communityPosts = getCommunityPosts(communityId);

  // Initialize community posts with initial posts if they're not already there
  useEffect(() => {
    if (initialPosts.length > 0 && communityPosts.length === 0) {
      updateCommunityPosts(communityId, initialPosts);
    }
    // Set initial loading to false once we have processed initial posts
    setIsInitialLoading(false);
  }, [initialPosts, communityPosts.length, updateCommunityPosts, communityId]);

  // Read `post` from query, fetch it, move/insert first, open comments
  useEffect(() => {
    const id = postIdParam;
    if (!id || processedPostIdRef.current === id) return;
    (async () => {
      try {
        const data = await getPostById(id);
        const post = data?.data || data;
        if (!post?.id) return;
        // Optional: ensure it belongs to this community if the API provides it
        if (post.communityId && post.communityId !== communityId) return;

        const current = getCommunityPosts(communityId);
        const without = current.filter((p) => p.id !== post.id);
        updateCommunityPosts(communityId, [post, ...without]);
        setFocusedPostId(post.id);
        processedPostIdRef.current = id;
      } catch (error) {
        // Non-blocking
      }
    })();
  }, [postIdParam, communityId, getCommunityPosts, updateCommunityPosts]);

  const handleCreatePost = async (postData) => {
    const payload = { ...postData, communityId };
    const result = await createPost(payload);
    if (result?.blocked) {
      throw new Error("You are blocked from this community");
    }
    if (result?.success === false) {
      throw new Error(result.message || "No tienes permisos para publicar en esta comunidad");
    }
    if (result?.redirectTo) {
      window.location.href = result.redirectTo;
      return;
    }
    const newPost = result?.data || result;
    addCommunityPost(communityId, newPost);
    setIsPostFormOpen(false);
  };

  const loadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const result = await onLoadMore();
      if (
        result &&
        result.posts &&
        Array.isArray(result.posts) &&
        result.posts.length > 0
      ) {
        // Use the new function with pagination
        appendCommunityPostsWithPagination(communityId, {
          data: result.posts,
          pagination: result.pagination,
        });
        const hasNext = result.pagination
          ? result.pagination.page < result.pagination.pages
          : false;
        setHasMore(hasNext);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [
    onLoadMore,
    loadingMore,
    appendCommunityPostsWithPagination,
    communityId,
  ]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading: loadingMore,
    threshold: 100,
  });


  const showActionsDisabled = !isJoined && isPublicCommunity;
  return (
    <div className={styles.feedContainer}>
      {isJoined || isPublicCommunity ? (
        <>
          {(isJoined && canCreatePost) && (
            <div className={styles.feedHeader}>
              <div className={styles.userPrompt}>
                <img
                  src={user?.avatarUrl || "/images/profile.svg"}
                  alt="User avatar"
                  className={styles.userAvatar}
                />
                <button
                  className={styles.promptButton}
                  onClick={() => setIsPostFormOpen(true)}
                >
                  ¿Qué vas a compartir?
                </button>

                <div className={styles.actionButtons}>
                  {/* No AdForm button here */}
                  <Button onClick={() => setIsPostFormOpen(true)}>
                    Crear Publicación
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className={styles.postsContainer}>
            {isInitialLoading ? (
              <div className={styles.loadingContainer}>
                Cargando publicaciones <Spinner />
              </div>
            ) : communityPosts.length > 0 ? (
              communityPosts.map((post) => (
                <div key={post.id}>
                  <PostCard
                    post={post}
                    isCommunity={true}
                    forceOpenComments={post.id === focusedPostId}
                    showActionsDisabled={showActionsDisabled}
                    communityId={communityId}
                    membershipStatus={membershipStatus}
                    isInCommunityPage={isInCommunityPage}
                  />
                </div>
              ))
            ) : (
              <div className={styles.noPosts}>
                <p>No hay publicaciones en esta comunidad</p>
              </div>
            )}

            {/* Infinite scroll trigger element */}
            {communityPosts.length > 0 && hasMore && (
              <div
                ref={lastElementRef}
                className={styles.infiniteScrollTrigger}
                style={{ height: "1px", marginTop: "20px" }}
              ></div>
            )}

            {/* Show message when no more posts */}
            {communityPosts.length > 0 && !hasMore && (
              <div className={styles.noMorePosts}>
                <span>No hay más publicaciones</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.noPosts}>
          <div className={styles.joinRequired}>
            <UsersIcon className={styles.joinIcon} aria-hidden="true" />
            <div className={styles.joinCopy}>
              <p className={styles.joinTitle}>Únete a la comunidad</p>
              <p className={styles.joinSubtitle}>
                Debes unirte para ver y participar en las publicaciones.
              </p>
            </div>
          </div>
        </div>
      )}

      <PostForm
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
