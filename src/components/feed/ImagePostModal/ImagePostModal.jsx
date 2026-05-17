"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import styles from "./ImagePostModal.module.scss";
import ThumbsUp from "@/assets/thumb-up.svg";
import Comment from "@/assets/comment.svg";
import Share from "@/assets/share.svg";
import { Comments, SharePostModal } from "@/components";
import {
  addReaction,
  removeReaction,
  addSharedReaction,
  removeSharedReaction,
  sharePost,
} from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import Image from "next/image";
import { useProfile } from "@/contexts/ProfileContext";
import CommunityJoinOverlay from "../CommunityJoinOverlay/CommunityJoinOverlay";
import { useCommunityPrivacy } from "@/contexts/CommunityPrivacyContext";

const ImagePostModal = ({
  isOpen,
  onClose,
  post,
  showActionsDisabled = false,
  isInCommunityPage = false,
  membershipStatus = undefined,
  showShareButton = false
}) => {
  const showDisabled = post?.communityId && !post?.statusMember;
  const { profile: user } = useProfile();
  const { isPrivate: isCommunityPrivate } = useCommunityPrivacy();
  const { updatePost } = usePosts();
  const [likes, setLikes] = useState(post?.reactionCounts?.like || 0);
  const [isLiked, setIsLiked] = useState(post?.userReaction);
  const [showComments, setShowComments] = useState(showActionsDisabled || showDisabled ? false : true);
  const [showShareModal, setShowShareModal] = useState(false);
  useEffect(() => {
    if (post) {
      setLikes(post.reactionCounts?.like || 0);
      setIsLiked(!!post.userReaction);
    }
  }, [post]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const isCurrentUserAuthor = useMemo(() => {
    if (!user || !post) return false;
    return (
      post.author?.id === user.id ||
      post.authorId === user.id ||
      post.userId === user.id
    );
  }, [user, post]);

  const handleLike = async () => {
    if (!post) return;
    try {
      if (post.type === "share") {
        if (isLiked) {
          await removeSharedReaction(post.id);
        } else {
          await addSharedReaction(post.id, "like");
        }
      } else {
        if (isLiked) {
          await removeReaction(post.id);
        } else {
          await addReaction(post.id, "like");
        }
      }

      const newIsLiked = !isLiked;
      const newLikes = isLiked ? likes - 1 : likes + 1;
      setIsLiked(newIsLiked);
      setLikes(newLikes);

      // Actualizar el estado global correctamente
      const updatedPost = {
        ...post,
        reactionCounts: { ...post.reactionCounts, like: newLikes },
        userReaction: newIsLiked ? "like" : null,
      };

      // Actualizar el post principal en el estado global
      updatePost(post.id, updatedPost);

      // Si es un post compartido, también actualizar el post original compartido
      if (post.type === "share" && post.sharedPost?.id) {
        const updatedSharedPost = {
          ...post.sharedPost,
          reactionCounts: { ...post.sharedPost.reactionCounts, like: newLikes },
          userReaction: newIsLiked ? "like" : null,
        };
        updatePost(post.sharedPost.id, updatedSharedPost);
      }
    } catch (err) {
      console.log("handleLike modal catch:", err);
      console.log("error.redirectTo:", err?.redirectTo);
      console.log("error.message:", err?.message);

      // PRIMERO verificar si es error de bloqueo (403) - mostrar toast específico
      const blockError = isCommunityBlockError(err);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("dar me gusta a publicaciones"));
        return;
      }

      // SEGUNDO verificar si el error indica redirección (not member)
      let redirectTo = err?.redirectTo;

      // Si no hay redirectTo directo, intentar parsear del mensaje (para Server Actions)
      if (!redirectTo && err?.message) {
        try {
          const parsedError = JSON.parse(err.message);
          if (parsedError.redirectTo) {
            redirectTo = parsedError.redirectTo;
            console.log("Parsed redirectTo from message:", redirectTo);
          }
        } catch (parseError) {
          // No es un JSON válido, continuar
        }
      }

      if (redirectTo) {
        console.log("Redirecting to:", redirectTo);
        window.location.href = redirectTo;
        return;
      }

      console.error("Error toggling like (modal):", err);
    }
  };

  const handleShareSubmit = async (shareData) => {
    const postIdToShare =
      post.type === "share" && post.sharedPost?.id
        ? post.sharedPost.id
        : post.id;

    return await sharePost(postIdToShare, shareData);
  };

  if (!isOpen || !post) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.mediaSection}>
          {(post.image || post.mediaUrl || post.mediaFile) && (
            <Image
              src={
                post.image ||
                post.postShared?.image ||
                post.mediaUrl ||
                post.mediaFile
              }
              alt="Post content"
              className={styles.media}
              width={800}
              height={600}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        <aside className={styles.infoSection}>
          <div className={styles.header}>
            <Link
              href={`/perfil/${post.author?.id || post.authorId || post.userId
                }`}
              className={styles.authorBox}
            >
              <Image
                src={post.author?.avatarUrl || "/images/profile.svg"}
                alt={post.author?.firstName || "Author"}
                className={styles.avatar}
                width={36}
                height={36}
              />
              <div className={styles.authorMeta}>
                <h3 className={styles.authorName}>
                  {post.author?.firstName + " " + (post.author?.lastName ?? "")}
                </h3>
                <span className={styles.timestamp}>
                  {dayjs(post.created_at || post.createdAt).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </span>
              </div>
            </Link>
          </div>

          {(post.content || post.text) && (
            <p className={styles.text}>{post.content || post.text}</p>
          )}

          <div className={styles.actionsWrapper}>
            <div className={styles.actions}>
              <button
                onClick={handleLike}
                className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
                disabled={showActionsDisabled}
                title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : isLiked ? "Quitar me gusta" : "Me gusta"}
              >
                <ThumbsUp />
                {likes > 0 && `${likes}`} Me gusta
              </button>

              <button
                className={`${styles.actionBtn} ${showComments ? styles.liked : ""
                  }`}
                onClick={() => setShowComments((v) => !v)}
                disabled={showActionsDisabled}
                title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : "Comentar esta publicación"}
              >
                <Comment />
                Comentar
              </button>

              {showShareButton && (
                <button
                  className={styles.actionBtn}
                  onClick={() => setShowShareModal(true)}
                  disabled={showActionsDisabled}
                  title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : "Compartir esta publicación"}
                >
                  <Share />
                  Compartir
                </button>
              )}
            </div>
            {!showActionsDisabled && !showDisabled ? (
              null
            ) : (
              <CommunityJoinOverlay
                communityId={post.communityId}
                className={styles.actionsOverlay}
                onClose={onClose}
                initialStatus={membershipStatus?.status}
                isInCommunityPage={isInCommunityPage}
              />
            )}
          </div>

          {/* <div className={styles.commentsContainer}> */}
          {!showActionsDisabled && !showDisabled ? <Comments
            postId={post.id}
            initialComments={post.comments || []}
            isVisible={showComments}
            onToggle={() => setShowComments((v) => !v)}
          /> :
            <p className={styles.disabledText}>Debes pertenecer a esta comunidad para poder ver los comentarios.</p>
          }
          {/* </div> */}
        </aside>

        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post.type === "share" ? post.sharedPost || post : post}
          onSubmit={handleShareSubmit}
        />
      </div>
    </div>
  );
};

export default ImagePostModal;
