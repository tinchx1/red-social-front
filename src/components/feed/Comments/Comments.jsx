"use client";
import { useState, useEffect } from "react";
import styles from "./Comments.module.scss";
import { clientApi } from "@/lib/api";
import Comment from "./Comment";
import { useToast } from "@/contexts";
import { Spinner } from "@/components/ui";
import {
  isCommunityBlockError,
  getBlockedCommunityMessage,
} from "@/utils/communityBlockError";

const Comments = ({ postId, initialComments = [], isVisible, onToggle }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const { showError } = useToast();

  const handleCommentEdited = (updated) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
  };

  const handleCommentDeleted = (toRemove) => {
    setComments((prev) => prev.filter((c) => c.id !== toRemove.id));
  };

  // Cargar comentarios cuando se abre la sección
  useEffect(() => {
    if (isVisible && !commentsLoaded) {
      loadComments();
    }
  }, [isVisible, commentsLoaded]);

  const loadComments = async (pageNum = 1) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await clientApi.get(`/posts/${postId}/comments`, {
        params: {
          page: pageNum,
          limit: 3,
        },
      });
      const rows = response?.data?.rows || [];
      const totalCount = response?.data?.count ?? rows.length;
      const limit = 3;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      if (pageNum === 1) {
        setComments(rows);
        setCommentsLoaded(true);
      } else {
        setComments((prev) => [...prev, ...rows]);
      }

      setPage(pageNum);
      // Calcular si hay más páginas basado en la paginación del servidor
      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error("Error loading comments:", error);
      // Si es la primera carga, usar los comentarios iniciales
      if (pageNum === 1) {
        setComments(initialComments);
        setCommentsLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      loadComments(page + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await clientApi.post(`/posts/${postId}/comments`, {
        content: newComment,
      });
      // Agregar el nuevo comentario al estado local
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
    } catch (error) {
      // Verificar si el error indica redirección (user is not a member of this community)
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "";
      const lowerMsg = message.toLowerCase();

      const isNotMember =
        (status === 400 || status === 500) &&
        (lowerMsg.includes("user is not a member of this community") ||
          lowerMsg.includes("not a member of this community") ||
          lowerMsg.includes("user is not a member"));

      if (isNotMember) {
        window.location.href = "/inicio";
        return;
      }

      const blockError = isCommunityBlockError(error);
      if (blockError.isBlocked) {
        showError(getBlockedCommunityMessage("comentar en este post"));
      } else {
        showError("No se pudo publicar el comentario. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (!isVisible) return null;
  return (
    <div className={styles.commentsSection}>
      {/* Input para nuevo comentario */}
      <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
        <div className={styles.commentInputContainer}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Agregar comentario..."
            className={styles.commentInput}
            maxLength={1000}
            disabled={submitting}
          />
          <button
            type="submit"
            className={styles.commentSubmitBtn}
            disabled={!newComment.trim() || submitting}
          >
            Enviar
          </button>
        </div>
      </form>

      {/* Estado de carga inicial */}
      {loading && !commentsLoaded && (
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>
            Cargando comentarios <Spinner />
          </span>
        </div>
      )}

      {/* Lista de comentarios existentes */}
      {comments.length > 0 && (
        <div className={styles.commentsList}>
          {comments.map((comment, index) => (
            <Comment
              key={comment.id || index}
              comment={comment}
              onEditComment={handleCommentEdited}
              onDeleteComment={handleCommentDeleted}
            />
          ))}

          {/* Botón cargar más */}
          {hasMore && (
            <button
              onClick={loadMoreComments}
              disabled={loading}
              className={styles.loadMoreBtn}
            >
              {loading ? (
                <>
                  Cargando <Spinner />
                </>
              ) : (
                "Cargar más comentarios"
              )}
            </button>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay comentarios */}
      {commentsLoaded && comments.length === 0 && (
        <div className={styles.noCommentsContainer}>
          <span className={styles.noCommentsText}>
            No hay comentarios aún. ¡Sé el primero en comentar!
          </span>
        </div>
      )}
    </div>
  );
};

export default Comments;
