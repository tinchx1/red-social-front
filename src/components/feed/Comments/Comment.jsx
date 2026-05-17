"use client";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import styles from "./Comments.module.scss";
import ThumbsUp from "@/assets/thumb-up.svg";
import CommentIcon from "@/assets/comment.svg";
import MoreVertical from "@/assets/more-vertical.svg";
import { EditDeleteMenuPost as EditDeleteMenu } from "@/components";
import { useAuth } from "@/components/layout/AuthProvider";
import {
  addCommentReaction,
  removeCommentReaction,
  getCommentReplies,
  createCommentReply,
  updateComment,
  deleteComment,
} from "@/actions";
import Reply from "./Reply";
import EditCommentForm from "./EditCommentForm/EditCommentForm";
import DeleteConfirmModal from "./DeleteConfirmModal/DeleteConfirmModal";
import { useToast } from "@/contexts";
import { Spinner } from "@/components/ui";
import {
  isCommunityBlockError,
  getBlockedCommunityMessage,
} from "@/utils/communityBlockError";
import { useProfile } from "@/contexts/ProfileContext";

const Comment = ({
  comment,
  onReplySubmit,
  onEditComment,
  onDeleteComment,
}) => {
  const { profile: user } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [likes, setLikes] = useState(comment?.reactionCounts?.like || 0);
  const [isLiked, setIsLiked] = useState(comment.userReaction);
  const [content, setContent] = useState(comment.content || "");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showError } = useToast();
  const optionsButtonRef = useRef(null);
  const getAuthorName = (author) => {
    if (author?.profile?.businessName) {
      return author.profile.businessName;
    }

    const firstName = author?.firstName || "";
    const lastName = author?.lastName || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    }

    return "Usuario";
  };

  const getAvatarUrl = (author) => {
    return author?.avatarUrl || "/images/profile.svg";
  };

  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return; // Prevenir spam

    // Optimistic update - UI instantáneo
    const prevIsLiked = isLiked;
    const prevLikes = likes;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    setIsLiking(true);
    try {
      if (prevIsLiked) {
        await removeCommentReaction(comment.id);
      } else {
        await addCommentReaction(comment.id, "like");
      }
    } catch (error) {
      // Revertir en caso de error
      setIsLiked(prevIsLiked);
      setLikes(prevLikes);
      // Verificar si el error indica redirección
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
        console.log("Redirecting to:", redirectTo);
        window.location.href = redirectTo;
        return;
      }

      const blockError = isCommunityBlockError(error);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("dar me gusta a comentarios"));
      } else {
        showError("Error al dar me gusta al comentario");
      }
      console.error("Error toggling comment like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = () => {
    setShowReplyInput(!showReplyInput);
    if (showReplyInput) {
      setReplyText("");
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;

    try {
      setSubmittingReply(true);
      const newReply = await createCommentReply(comment.id, replyText);
      setReplies((prev) => [newReply, ...prev]);
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true); // Show replies if they were hidden
    } catch (error) {
      // Verificar si el error indica redirección
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
        console.log("Redirecting to:", redirectTo);
        window.location.href = redirectTo;
        return;
      }

      const blockError = isCommunityBlockError(error);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("responder comentarios"));
      } else {
        showError("No se pudo enviar la respuesta. Intenta nuevamente.");
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReplyToReply = async (
    commentId,
    replyText,
    mentionPrefix = ""
  ) => {
    try {
      // Add mention prefix if provided
      const fullReplyText = mentionPrefix + replyText;
      const newReply = await createCommentReply(commentId, fullReplyText);
      setReplies((prev) => [...prev, newReply]);
    } catch (error) {
      // Verificar si el error indica redirección
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
        console.log("Redirecting to:", redirectTo);
        window.location.href = redirectTo;
        return;
      }

      console.error("Error posting reply to reply:", error);
      const blockError = isCommunityBlockError(error);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("responder respuestas"));
      } else {
        showError("No se pudo enviar la respuesta. Intenta nuevamente.");
      }
    }
  };

  const handleEditReply = (updatedReply) => {
    setReplies((prev) =>
      prev.map((reply) => (reply.id === updatedReply.id ? updatedReply : reply))
    );
  };

  const handleDeleteReply = (deletedReply) => {
    setReplies((prev) => prev.filter((reply) => reply.id !== deletedReply.id));
  };

  const loadReplies = async (pageNum = 1) => {
    if (loadingReplies) return;

    setLoadingReplies(true);
    try {
      const response = await getCommentReplies(comment.id, pageNum, 5);
      const newReplies = response?.rows || [];
      const totalCount = response?.count ?? newReplies.length;
      const limit = 5;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      if (pageNum === 1) {
        setReplies(newReplies || []);
        setRepliesLoaded(true);
      } else {
        setReplies((prev) => [...prev, ...(newReplies || [])]);
      }

      setRepliesPage(pageNum);
      setHasMoreReplies(pageNum < totalPages);
    } catch (error) {
      console.error("Error loading replies:", error);
      if (pageNum === 1) {
        setRepliesLoaded(true);
      }
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) {
      setShowReplies(true);
      if (!repliesLoaded) {
        loadReplies(1);
      }
    } else {
      setShowReplies(false);
    }
  };

  const loadMoreReplies = () => {
    if (hasMoreReplies && !loadingReplies) {
      loadReplies(repliesPage + 1);
    }
  };

  const cancelReply = () => {
    setShowReplyInput(false);
    setReplyText("");
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const fullText = content || "";
  const hasLongContent = fullText.length > 150;
  const repliesCount = replies.length || 0;
  const isCurrentUserAuthor =
    user &&
    (comment.author?.id === user.id ||
      comment.authorId === user.id ||
      comment.userId === user.id);

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <img
          src={getAvatarUrl(comment.author)}
          alt={getAuthorName(comment.author)}
          className={styles.commentAvatar}
        />
        <div className={styles.commentInfo}>
          <div className={styles.commentMeta}>
            <span className={styles.commentAuthor}>
              {getAuthorName(comment.author)}
            </span>
            {comment.created_at && (
              <span className={styles.commentDate}>
                {dayjs(comment.created_at).format("DD/MM/YYYY HH:mm")}
              </span>
            )}
            {isCurrentUserAuthor && (
              <div className={styles.optionsContainer}>
                <button
                  ref={optionsButtonRef}
                  className={styles.optionsButton}
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <MoreVertical className={styles.optionsIcon} />
                </button>
                <EditDeleteMenu
                  isOpen={showOptions}
                  onClose={() => setShowOptions(false)}
                  anchorRef={optionsButtonRef}
                  onEdit={() => {
                    setShowEditForm(true);
                    setShowOptions(false);
                  }}
                  onDelete={() => {
                    setShowDeleteConfirm(true);
                    setShowOptions(false);
                  }}
                  itemName="comentario"
                />
              </div>
            )}
          </div>
          <p
            className={`${styles.commentContent} ${
              !isExpanded && hasLongContent ? styles.commentTextCollapsed : ""
            }`}
          >
            {fullText}
          </p>
          {hasLongContent && (
            <button
              className={styles.commentExpandBtn}
              onClick={toggleExpanded}
            >
              {isExpanded ? "" : "ver más"}
            </button>
          )}

          <div className={styles.commentActions}>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`${styles.commentActionBtn} ${
                isLiked ? styles.liked : ""
              }`}
            >
              <ThumbsUp />
              {likes > 0 && `${likes}`} Me gusta
            </button>

            <button className={styles.commentActionBtn} onClick={handleReply}>
              <CommentIcon />
              Responder
            </button>
          </div>

          {/* Input de respuesta */}
          {showReplyInput && (
            <form className={styles.replyForm} onSubmit={handleReplySubmit}>
              <div className={styles.replyHeader}>
                <span className={styles.replyingToText}>
                  Respondiendo a {getAuthorName(comment.author)}
                </span>
                <button
                  type="button"
                  onClick={cancelReply}
                  className={styles.cancelReplyBtn}
                >
                  Cancelar
                </button>
              </div>
              <div className={styles.commentInputContainer}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className={styles.commentInput}
                  maxLength={1000}
                  disabled={submittingReply}
                />
                <button
                  type="submit"
                  className={styles.commentSubmitBtn}
                  disabled={!replyText.trim() || submittingReply}
                >
                  Responder
                </button>
              </div>
            </form>
          )}

          {/* Sección de respuestas */}
          {(repliesCount > 0 || showReplies || loadingReplies) && (
            <div className={styles.repliesSection}>
              <button className={styles.showRepliesBtn} onClick={toggleReplies}>
                {showReplies ? "Ocultar" : "Ver"} {repliesCount}{" "}
                {repliesCount === 1 ? "respuesta" : "respuestas"}
              </button>

              {showReplies && (
                <div className={styles.repliesList}>
                  {loadingReplies && repliesCount === 0 && (
                    <div className={styles.loadingReplies}>
                      Cargando respuestas <Spinner />
                    </div>
                  )}
                  {replies.map((reply) => (
                    <Reply
                      key={reply.id}
                      reply={reply}
                      onReplySubmit={handleReplyToReply}
                      postId={comment.postId}
                      commentId={comment.id}
                      onEditReply={handleEditReply}
                      onDeleteReply={handleDeleteReply}
                    />
                  ))}

                  {hasMoreReplies && repliesLoaded && (
                    <button
                      onClick={loadMoreReplies}
                      disabled={loadingReplies}
                      className={styles.loadMoreRepliesBtn}
                    >
                      {loadingReplies ? (
                        <>
                          Cargando <Spinner size="small" />
                        </>
                      ) : (
                        "Cargar más respuestas"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <EditCommentForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        comment={comment}
        initialContent={content}
        onSave={async (newContent) => {
          try {
            await updateComment(comment.id, { content: newContent });
            setContent(newContent);
            setShowEditForm(false);
            if (onEditComment)
              onEditComment({ ...comment, content: newContent });
          } catch (error) {
            console.error("Error updating comment:", error);
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        itemName="comentario"
        onConfirm={async () => {
          try {
            await deleteComment(comment.id);
            setShowDeleteConfirm(false);
            if (onDeleteComment) onDeleteComment(comment);
          } catch (error) {
            console.error("Error deleting comment:", error);
          }
        }}
      />
    </div>
  );
};

export default Comment;
