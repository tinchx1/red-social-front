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
  addReplyReaction,
  removeReplyReaction,
  updateReply,
  deleteReply,
} from "@/actions";
import EditCommentForm from "./EditCommentForm/EditCommentForm";
import DeleteConfirmModal from "./DeleteConfirmModal/DeleteConfirmModal";
import { useProfile } from "@/contexts/ProfileContext";

const Reply = ({
  reply,
  onReplySubmit,
  commentId,
  onEditReply,
  onDeleteReply,
}) => {
  const { profile: user } = useProfile();
  const [likes, setLikes] = useState(reply.reactions?.length || 0);
  const [isLiked, setIsLiked] = useState(
    reply.reactions?.some((r) => r.userId === user?.id) || false
  );
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [content, setContent] = useState(reply.content || "");
  const [showOptions, setShowOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const isCurrentUserAuthor =
    user &&
    (reply.author?.id === user.id ||
      reply.authorId === user.id ||
      reply.userId === user.id);

  const handleLike = async () => {
    if (isLiking) return;

    // Optimistic update
    const prevIsLiked = isLiked;
    const prevLikes = likes;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    setIsLiking(true);
    try {
      if (prevIsLiked) {
        await removeReplyReaction(reply.id);
      } else {
        await addReplyReaction(reply.id, "like");
      }
    } catch (error) {
      // Revertir optimistic update
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

      console.error("Error toggling reply like:", error);
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
      await onReplySubmit(commentId, replyText);
      setReplyText("");
      setShowReplyInput(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const cancelReply = () => {
    setShowReplyInput(false);
    setReplyText("");
  };

  return (
    <div className={styles.reply}>
      <div className={styles.replyHeader}>
        <img
          src={getAvatarUrl(reply.author)}
          alt={getAuthorName(reply.author)}
          className={styles.replyAvatar}
        />
        <div className={styles.replyInfo}>
          <div className={styles.replyMeta}>
            <span className={styles.replyAuthor}>
              {getAuthorName(reply.author)}
            </span>
            {reply.created_at && (
              <span className={styles.replyDate}>
                {dayjs(reply.created_at).format("DD/MM/YYYY HH:mm")}
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
                  itemName="respuesta"
                />
              </div>
            )}
          </div>
          <p className={styles.replyContent}>{content}</p>

          <div className={styles.replyActions}>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`${styles.replyActionBtn} ${
                isLiked ? styles.liked : ""
              }`}
            >
              <ThumbsUp />
              {likes > 0 && `${likes}`} Me gusta
            </button>

            <button className={styles.replyActionBtn} onClick={handleReply}>
              <CommentIcon />
              Responder
            </button>
          </div>

          {/* Input de respuesta a la respuesta */}
          {showReplyInput && (
            <form className={styles.replyForm} onSubmit={handleReplySubmit}>
              <div className={styles.replyHeader}>
                <span className={styles.replyingToText}>
                  Respondiendo a {getAuthorName(reply.author)}
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
        </div>
      </div>

      <EditCommentForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        comment={reply}
        initialContent={content}
        onSave={async (newContent) => {
          try {
            await updateReply(reply.id, { content: newContent });
            setContent(newContent);
            setShowEditForm(false);
            if (onEditReply) onEditReply({ ...reply, content: newContent });
          } catch (error) {
            console.error("Error updating reply:", error);
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        itemName="respuesta"
        onConfirm={async () => {
          try {
            await deleteReply(reply.id);
            setShowDeleteConfirm(false);
            if (onDeleteReply) onDeleteReply(reply);
          } catch (error) {
            console.error("Error deleting reply:", error);
          }
        }}
      />
    </div>
  );
};

export default Reply;
