"use client";
import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./PostCard.module.scss";
import ThumbsUp from "@/assets/thumb-up.svg";
import Comment from "@/assets/comment.svg";
import Share from "@/assets/share.svg";
import MoreVertical from "@/assets/more-vertical.svg";
import { Comments, SharePostModal, ImagePostModal } from "@/components";
import { EditDeleteMenuPost as EditDeleteMenu } from "@/components";
import EditPostForm from "./EditPostForm/EditPostForm";
import DeleteConfirmModal from "./DeleteConfirmModal/DeleteConfirmModal";
import {
  addReaction,
  removeReaction,
  sharePost,
  addSharedReaction,
  removeSharedReaction,
} from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import SharedPost from "./SharedPost";
import NormalPost from "./NormalPost";
import { useToast } from "@/contexts";
import {
  isCommunityBlockError,
  getBlockedCommunityMessage,
} from "@/utils/communityBlockError";
import { useProfile } from "@/contexts/ProfileContext";
import CommunityJoinOverlay from "../CommunityJoinOverlay/CommunityJoinOverlay";
import { useCommunityPrivacy } from "@/contexts/CommunityPrivacyContext";

const PostCard = ({
  post,
  isCommunity = false,
  forceOpenComments = false,
  className = "",
  showActionsDisabled = false,
  communityId = undefined,
  initialStatus = undefined,
  isInCommunityPage = false,
  membershipStatus = undefined
}) => {
  const { profile: user } = useProfile();
  const { isPrivate: isCommunityPrivate } = useCommunityPrivacy();
  const { updatePost, addPost, posts, getCommunityPosts } = usePosts();
  const [isExpanded, setIsExpanded] = useState(false);
  // Buscar el post actualizado en el contexto apropiado
  let currentPost = posts.find((p) => p.id === post.id) || post;
  // Si es un post de comunidad, también buscar en los posts de comunidad
  if (isCommunity && post.communityId) {
    const communityPosts = getCommunityPosts(post.communityId);
    const communityPost = communityPosts.find((p) => p.id === post.id);
    if (communityPost) {
      currentPost = communityPost;
    }
  }
  const { showError } = useToast();
  const [likes, setLikes] = useState(currentPost.reactionCounts?.like || 0);
  const [isLiked, setIsLiked] = useState(currentPost.userReaction);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const optionsButtonRef = useRef(null);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Actualizar estado local cuando cambie el post global
  useEffect(() => {
    if (currentPost) {
      setLikes(currentPost.reactionCounts?.like || 0);
      setIsLiked(currentPost.userReaction);
    }
  }, [currentPost]);

  // Abrir comentarios si es el post enfocado desde query param
  useEffect(() => {
    if (forceOpenComments) {
      setShowComments(true);
    }
  }, [forceOpenComments]);

  const handleLike = async () => {
    if (isLiking) return;

    // Optimistic update - guardar estado previo para revertir si hay error
    const prevIsLiked = isLiked;
    const prevLikes = likes;
    const newIsLiked = !isLiked;
    const newLikes = isLiked ? likes - 1 : likes + 1;

    // UI instantáneo
    setIsLiked(newIsLiked);
    setLikes(newLikes);

    // Actualizar contexto global inmediatamente
    const updatedPostLocal = {
      ...currentPost,
      reactionCounts: {
        ...(currentPost.reactionCounts || {}),
        like: newLikes,
      },
      userReaction: newIsLiked ? "like" : null,
    };
    updatePost(currentPost.id, updatedPostLocal);

    setIsLiking(true);
    try {
      let response;
      if (currentPost.type === "share") {
        if (prevIsLiked) {
          response = await removeSharedReaction(currentPost.id);
        } else {
          response = await addSharedReaction(currentPost.id, "like");
        }
      } else {
        if (prevIsLiked) {
          response = await removeReaction(currentPost.id);
        } else {
          response = await addReaction(currentPost.id, "like");
        }
      }

      // Verificar si la respuesta indica un caso especial (blocked, redirect, etc.)
      if (response?.blocked) {
        // Revertir optimistic update
        setIsLiked(prevIsLiked);
        setLikes(prevLikes);
        updatePost(currentPost.id, { ...currentPost, reactionCounts: { ...(currentPost.reactionCounts || {}), like: prevLikes }, userReaction: prevIsLiked ? "like" : null });
        showError(getBlockedCommunityMessage("dar me gusta a publicaciones"));
        return;
      }

      if (response?.redirectTo) {
        console.log("Redirecting to:", response.redirectTo);
        window.location.href = response.redirectTo;
        return;
      }
    } catch (error) {
      // Revertir optimistic update
      setIsLiked(prevIsLiked);
      setLikes(prevLikes);
      updatePost(currentPost.id, { ...currentPost, reactionCounts: { ...(currentPost.reactionCounts || {}), like: prevLikes }, userReaction: prevIsLiked ? "like" : null });
      // PRIMERO verificar si es error de bloqueo (403) - mostrar toast específico
      const blockError = isCommunityBlockError(error);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("dar me gusta a publicaciones"));
        return;
      }

      // SEGUNDO verificar si el error indica redirección (not member) - fallback para casos legacy
      let redirectTo = error?.redirectTo;

      // Si no hay redirectTo directo, intentar parsear del mensaje (para Server Actions)
      if (!redirectTo && error?.message) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.redirectTo) {
            redirectTo = parsedError.redirectTo;
            console.log("Parsed redirectTo from message:", redirectTo);
          }
        } catch (parseError) {
          // No es un JSON válido, continuar
        }
      }

      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }

      // Finalmente, error genérico
      showError("Error al dar me gusta a la publicación");
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = () => setShowComments(!showComments);
  const handleOptionsClick = () => setShowOptions(!showOptions);
  const handleEdit = () => setShowEditForm(true);
  const handleDelete = () => setShowDeleteConfirm(true);
  const handleShare = () => setShowShareModal(true);

  // ... existing code ...
  const handleShareSubmit = async (shareData) => {
    // If this is a shared post, use the original post ID for sharing
    const postIdToShare =
      currentPost.type === "share" && currentPost.sharedPost?.id
        ? currentPost.sharedPost.id
        : currentPost.id;

    return await sharePost(postIdToShare, shareData);
  };
  // ... existing code ...

  const fullText =
    currentPost.type === "share"
      ? currentPost.content || ""
      : currentPost.content || currentPost.text || "";
  const hasLongContent = fullText.length > 300;
  const isCurrentUserAuthor =
    user &&
    (currentPost.author?.id === user.id ||
      currentPost.authorId === user.id ||
      currentPost.userId === user.id);
  // Pick a live reference for the modal: if share, resolve original from global posts
  const modalPost =
    currentPost.type === "share"
      ? posts.find((p) => p.id === currentPost.sharedPost?.id) ||
      currentPost.sharedPost
      : currentPost;


  const showShareButton = (isCommunity && !isCommunityPrivate) || (!isCommunity && currentPost.visibility === "public");
  return (
    <div className={`${styles.postCard} ${className}`}>
      <div className={styles.header + " " + styles.headerContent}>
        <Link
          href={`/perfil/${currentPost.author?.id || currentPost.authorId || currentPost.userId
            }`}
          className={styles.avatarLink}
        >
          <Image
            src={currentPost.author?.avatarUrl || "/images/profile.svg"}
            alt={
              currentPost.author?.firstName +
              " " +
              (currentPost.author?.lastName ?? "")
            }
            className={styles.orgLogo}
            width={40}
            height={40}
          />
        </Link>
        <div className={styles.orgInfo}>
          {currentPost.communityName ? (
            <h3 className={styles.orgName} style={{ fontWeight: 300 }}>
              <Link
                href={`/perfil/${currentPost.author?.id ||
                  currentPost.authorId ||
                  currentPost.userId
                  }`}
                className={styles.link}
              >
                {currentPost.author?.firstName +
                  (currentPost.author?.lastName
                    ? " " + currentPost.author?.lastName
                    : "")}
              </Link>
              {" publicó en "}
              <Link
                href={`/comunidades/${currentPost.communityId}`}
                className={styles.link}
              >
                {currentPost.communityName}
              </Link>
            </h3>
          ) : (
            <>
              <h3 className={styles.orgName}>
                <Link
                  href={`/perfil/${currentPost.author?.id ||
                    currentPost.authorId ||
                    currentPost.userId
                    }`}
                  className={styles.orgName}
                >
                  {currentPost.author?.firstName +
                    " " +
                    (currentPost.author?.lastName ?? "")}
                </Link>
              </h3>
              <span className={styles.timestamp}>
                {dayjs(currentPost.created_at || currentPost.createdAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </span>
            </>
          )}
        </div>

        {isCurrentUserAuthor && (
          <div className={styles.optionsContainer}>
            <button
              ref={optionsButtonRef}
              className={styles.optionsButton}
              onClick={handleOptionsClick}
            >
              <MoreVertical className={styles.optionsIcon} />
            </button>
            <EditDeleteMenu
              isOpen={showOptions}
              onClose={() => setShowOptions(false)}
              anchorRef={optionsButtonRef}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemName="publicación"
            />
          </div>
        )}
      </div>

      <div className={styles.content}>
        {currentPost.type === "share" ? (
          <SharedPost
            post={currentPost}
            isExpanded={isExpanded}
            toggleExpanded={toggleExpanded}
            hasLongContent={hasLongContent}
            onOpenImageModal={() => setShowImageModal(true)}
          />
        ) : (
          <NormalPost
            post={currentPost}
            isExpanded={isExpanded}
            toggleExpanded={toggleExpanded}
            hasLongContent={hasLongContent}
            onOpenImageModal={() => setShowImageModal(true)}
          />
        )}
      </div>
      <div className={styles.actionsWrapper}>
        <div className={styles.actions} style={{ justifyContent: !showShareButton ? "space-around" : "space-between" }}>
          <button
            onClick={handleLike}
            disabled={isLiking || showActionsDisabled}
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
            title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : isLiked ? "Quitar me gusta" : "Me gusta"}
          >
            <ThumbsUp />
            {likes > 0 && `${likes}`} Me gusta
          </button>

          <button
            className={`${styles.actionBtn} ${showComments ? styles.liked : ""}`}
            onClick={handleCommentClick}
            disabled={showActionsDisabled}
            title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : "Comentar esta publicación"}
          >
            <Comment />
            Comentar
          </button>

          {showShareButton && (
            <button className={styles.actionBtn} onClick={handleShare} disabled={showActionsDisabled} title={showActionsDisabled ? "Debes pertenecer a esta comunidad para poder interactuar" : "Compartir esta publicación"}>
              <Share />
              Compartir
            </button>
          )}
        </div>
        {showActionsDisabled && (
          <CommunityJoinOverlay
            communityId={currentPost.communityId || communityId}
            className={styles.actionsOverlay}
            initialStatus={membershipStatus?.status || initialStatus}
            isInCommunityPage={isInCommunityPage}
          />
        )}
      </div>

      <Comments
        postId={currentPost.id}
        initialComments={currentPost.comments || []}
        isVisible={showComments}
        onToggle={handleCommentClick}
      />

      <EditPostForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        post={currentPost}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        post={currentPost}
      />

      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={
          currentPost.type === "share"
            ? currentPost.sharedPost || currentPost
            : currentPost
        }
        onSubmit={handleShareSubmit}
      />

      <ImagePostModal
        key={modalPost?.id}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        post={modalPost}
        showActionsDisabled={showActionsDisabled}
        isInCommunityPage={isInCommunityPage}
        membershipStatus={membershipStatus}
        showShareButton={showShareButton}
      />
    </div>
  );
};

export default PostCard;
