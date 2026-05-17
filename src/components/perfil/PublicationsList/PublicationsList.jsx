"use client";
import React, { useState, useCallback } from "react";
import { PostCard } from "@/components/feed";
import { getUserPosts } from "@/actions";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import styles from "./PublicationsList.module.scss";

/**
 * @param {{ userId: string; initialPosts: any[]; postsPerPage?: number }} props
 */
export default function PublicationsList({
  userId,
  initialPosts,
  postsPerPage = 10,
}) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newPosts = await getUserPosts(userId, nextPage, postsPerPage);

      if (newPosts && newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(newPosts.length === postsPerPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, postsPerPage, userId]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    loadMore: loadMorePosts,
    hasMore,
    isLoading,
    threshold: 100,
  });

  return (
    <div className={styles.container}>
      <div className={styles.postsContainer}>
        <span className={styles.postsTitle}>Publicaciones</span>

        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <div key={post.id}>
                <PostCard post={post} />
                {/* Add ad image every 2 posts (after post 1, 3, 5, etc.) */}
                {/* {(index + 1) % 2 === 0 && index < posts.length - 1 && (
                  <>
                    <span className={styles.adTitle}>Anuncio</span>
                    <div className={styles.adImageContainer}>
                      <img
                        src="/images/ad-delsud.webp"
                        alt="Anuncio"
                        className={styles.adImage}
                      />
                    </div>
                  </>
                )} */}
              </div>
            ))}

            {posts.length > 0 && hasMore && (
              <div
                ref={lastElementRef}
                className={styles.infiniteScrollTrigger}
                style={{ height: "1px", marginTop: "20px" }}
              ></div>
            )}
          </>
        ) : (
          <div className={styles.noPosts}>
            <p>Este usuario aún no tiene publicaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
