"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Feed.module.scss";
import PostCard from "../PostCard/PostCard";
import PostForm from "../PostForm/PostForm";
import { Button } from "@/components/ui";
import { getAllPosts, createPost, getPostById } from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import Image from "next/image";
import ButtonAds from "@/components/ads/ButtonAds/ButtonAds";
import AdsList from "@/components/ads/AdsList/AdsList";

const AD_DIMENSIONS = [
  { width: 257, height: 257 },
  { width: 257, height: 257 },
  { width: 257, height: 514 },
  { width: 810, height: 168 },
];

const DESKTOP_AD_DIMENSIONS = { width: 600, height: 119 };
const DESKTOP_AD_POSITION = 4;

const MOBILE_AD_DIMENSIONS = {
  1: { width: 334, height: 334 },
  2: { width: 334, height: 334 },
  3: { width: 334, height: 686 },
  4: { width: 600, height: 119 },
};

/**
 * Feed component - Always uses SSR ads from page.jsx (props)
 * Does NOT use WebSocket context to ensure SSR-first rendering
 */
const Feed = ({ user, ads = [] }) => {
  const {
    posts,
    appendPostsWithPagination,
    hasMore,
    setHasMorePosts,
    setPosts,
    pagination,
  } = usePosts();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedPostId, setFocusedPostId] = useState(null);
  const searchParams = useSearchParams();
  const processedPostIdRef = useRef(null);
  const postIdParam = useMemo(() => searchParams.get("post"), [searchParams]);
  useEffect(() => {
    const id = postIdParam;
    if (!id || processedPostIdRef.current === id) return;
    (async () => {
      try {
        const data = await getPostById(id);
        const post = data?.data || data;
        if (!post?.id) return;
        setPosts((prev) => {
          const without = prev.filter((p) => p.id !== post.id);
          return [post, ...without];
        });
        setFocusedPostId(post.id);
        processedPostIdRef.current = id;
      } catch (error) {
        console.error("Error fetching post by id:", error);
      }
    })();
  }, [postIdParam, setPosts]);
  const handleCreatePost = async (postData) => {
    try {
      const result = await createPost(postData);
      if (result?.blocked) {
        throw new Error("You are blocked from this community");
      }
      if (result?.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      const newPost = result?.data || result;
      // Add new post to the beginning of the list
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error?.redirectTo) {
        window.location.href = error.redirectTo;
        return;
      }
      throw error;
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = pagination.page + 1;
      const data = await getAllPosts(nextPage, 10);

      if (
        data &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        appendPostsWithPagination(data);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  }, [
    hasMore,
    loading,
    pagination.page,
    appendPostsWithPagination,
    setHasMorePosts,
  ]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    loadMore: loadMorePosts,
    hasMore,
    isLoading: loading,
    threshold: 100,
  });

  // Always use SSR ads from props (page.jsx) - never from WebSocket context
  const adsEntries = useMemo(() => {
    if (!Array.isArray(ads) || ads.length === 0) return [];

    return ads
      .map((ad, index) => {
        const image = ad?.asset_url || ad?.image || "";
        if (!image) return null;
        const normalized = {
          image,
          alt: ad?.package_title || ad?.alt || "Anuncio",
          href: ad?.click_url || ad?.href || "#",
        };
        const parsedPosition = Number(ad?.position);
        const position =
          Number.isFinite(parsedPosition) && parsedPosition > 0
            ? parsedPosition
            : index + 1;

        return {
          normalized,
          raw: ad,
          position,
        };
      })
      .filter(Boolean);
  }, [ads]);

  const normalizedAds = useMemo(
    () => adsEntries.map((entry) => entry.normalized),
    [adsEntries]
  );

  const getAdPayload = useCallback(
    (slotIndex) => {
      if (!adsEntries.length) return null;

      const entry = adsEntries[slotIndex % adsEntries.length];
      const dimensions = AD_DIMENSIONS[slotIndex % AD_DIMENSIONS.length];

      return { entry, dimensions };
    },
    [adsEntries]
  );

  const desktopAdEntry = useMemo(() => {
    if (!adsEntries.length) return null;

    return (
      adsEntries.find((entry) => entry.position === DESKTOP_AD_POSITION) || null
    );
  }, [adsEntries]);

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <div className={styles.userPrompt}>
          <Image
            width={40}
            height={40}
            src={user?.avatarUrl ?? "/images/profile.svg"}
            alt="User avatar"
            className={styles.userAvatar}
            priority
            fetchPriority="high"
          />
          <button
            className={styles.promptButton}
            onClick={() => setIsPostFormOpen(true)}
          >
            ¿Qué vas a compartir?
          </button>
        </div>

        <div className={styles.actionButtons}>
          <ButtonAds hideOnDesktop={true} style={{ padding: "10px" }} />
          <Button
            onClick={() => setIsPostFormOpen(true)}
            style={{ padding: "10px" }}
          >
            Crear Publicación
          </Button>
        </div>
      </div>

      <div className={styles.postsContainer}>
        {/* <span className={styles.postsTitle}>Publicaciones</span> */}
        {posts.map((post, index) => {
          const shouldShowAd =
            index % 2 === 0 && index < posts.length - 1 && normalizedAds.length;
          const adSlotIndex = Math.floor(index / 2);
          const payload = shouldShowAd ? getAdPayload(adSlotIndex) : null;
          const entry = payload?.entry;
          const showActionsDisabled = post?.communityId && !post?.statusMember

          return (
            <div key={post.id}>
              <PostCard
                post={post}
                forceOpenComments={post.id === focusedPostId}
                showActionsDisabled={showActionsDisabled}
              />
              {entry && (
                <div className={styles.inlineAdSlot}>
                  <div className={styles.mobileInlineAd}>
                    <AdsList
                      ads={[
                        {
                          ...entry.normalized,
                          width:
                            entry.position === 4
                              ? "100%"
                              : MOBILE_AD_DIMENSIONS[entry.position]?.width ||
                                "100%",
                          height:
                            MOBILE_AD_DIMENSIONS[entry.position]?.height ||
                            "auto",
                        },
                      ]}
                      positionIndices={[entry.position]}
                      initialAds={[
                        {
                          ...entry.raw,
                          position: entry.position,
                          width:
                            entry.position === 4
                              ? "100%"
                              : MOBILE_AD_DIMENSIONS[entry.position]?.width,
                          height: MOBILE_AD_DIMENSIONS[entry.position]?.height,
                        },
                      ]}
                      width={
                        entry.position === 4
                          ? "100%"
                          : MOBILE_AD_DIMENSIONS[entry.position]?.width ||
                            "100%"
                      }
                      height={
                        MOBILE_AD_DIMENSIONS[entry.position]?.height || "auto"
                      }
                      className={styles.inlineAdsList}
                    />
                  </div>
                  {desktopAdEntry && (
                    <div className={styles.desktopInlineAd}>
                      <AdsList
                        ads={[
                          {
                            ...desktopAdEntry.normalized,
                            width: DESKTOP_AD_DIMENSIONS.width,
                            height: DESKTOP_AD_DIMENSIONS.height,
                          },
                        ]}
                        initialAds={[
                          {
                            ...desktopAdEntry.raw,
                            position: desktopAdEntry.position,
                            width: DESKTOP_AD_DIMENSIONS.width,
                            height: DESKTOP_AD_DIMENSIONS.height,
                          },
                        ]}
                        positionIndices={[desktopAdEntry.position]}
                        width={DESKTOP_AD_DIMENSIONS.width}
                        height={DESKTOP_AD_DIMENSIONS.height}
                        className={styles.inlineAdsList}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {posts.length > 0 && hasMore && (
          <div
            ref={lastElementRef}
            className={styles.infiniteScrollTrigger}
            style={{ height: "1px", marginTop: "20px" }}
          ></div>
        )}

        {/* Show message when no more posts */}
        {posts.length > 0 && !hasMore && (
          <div className={styles.noMorePosts}>
            <span>No hay más publicaciones</span>
          </div>
        )}
      </div>

      <PostForm
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Feed;
