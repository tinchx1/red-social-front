"use client";
import { useState, useEffect, useRef } from "react";
import useScrollLock from "@/hooks/useScrollLock";
import Image from "next/image";
import styles from "./SharePostModal.module.scss";
import { Button, LinkPreview, Spinner } from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import {
  isCommunityBlockError,
  getBlockedCommunityMessage,
} from "@/utils/communityBlockError";
import { useProfile } from "@/contexts/ProfileContext";

const SharePostModal = ({ isOpen, onClose, post, onSubmit }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const { showSuccess, showError } = useToast();
  const { profile: user } = useProfile();

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  // Block scroll when share modal is open (reusable, ref-counted)
  useScrollLock(isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loading) {
      setLoading(true);
      try {
        const shareData = {
          originalPostId: post.id,
          content: content.trim(),
          visibility: "public",
        };

        const sharedPostResponse = await onSubmit(shareData);

        // Verificar si la respuesta indica un caso especial (bloqueado o redirect)
        if (sharedPostResponse?.blocked) {
          showError(getBlockedCommunityMessage("compartir posts"));
          return;
        }

        if (sharedPostResponse?.redirectTo) {
          console.log("Redirecting to:", sharedPostResponse.redirectTo);
          window.location.href = sharedPostResponse.redirectTo;
          return;
        }

        // Solo continuar si tenemos una respuesta válida
        if (!sharedPostResponse || !sharedPostResponse.id) {
          throw new Error("Respuesta inválida del servidor");
        }

        // Create link to the shared post
        const postLink = `/inicio?post=${sharedPostResponse.id}`;

        // Show success toast with link
        showSuccess("Post compartido exitosamente. ", 5000, postLink);

        setContent("");
        onClose();
      } catch (error) {

        // Fallback para errores tradicionales (por si onSubmit lanza errores)
        const blockError = isCommunityBlockError(error);
        if (blockError.isBlocked) {
          showError(getBlockedCommunityMessage("compartir posts"));
          return;
        }

        let redirectTo = error?.redirectTo;
        console.log("Direct redirectTo:", redirectTo);

        if (!redirectTo && error?.message) {
          try {
            const parsedError = JSON.parse(error.message);
            if (parsedError.redirectTo) {
              redirectTo = parsedError.redirectTo;
            }
          } catch (parseError) {

          }
        }

        if (redirectTo) {
          console.log("Redirecting to:", redirectTo);
          window.location.href = redirectTo;
          return;
        }

        // Finalmente, error genérico
        showError("Error al compartir el post");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <Image
              src={user?.avatarUrl || "/images/profile.svg"}
              alt="User avatar"
              className={styles.avatar}
              width={40}
              height={40}
            />
            <div>
              <h3 className={styles.userName}>
                {user?.profile?.businessName ||
                  `${user?.firstName} ${user?.lastName ?? ""}` ||
                  "Usuario"}
              </h3>
              <p className={styles.userSubtitle}>
                {user?.profile?.industry || user?.company || ""}
              </p>
            </div>
          </div>
          <Button variant="icon" className={styles.closeBtn} onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Agregá tu idea sobre esta publicación"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              maxLength={1000}
            />
          </form>
        </div>

        {/* Original Post Preview */}
        <div className={styles.originalPost}>
          <div className={styles.originalPostHeader}>
            <Image
              src={
                post.author?.avatarUrl ||
                post.author?.profilePicture ||
                "/images/profile.svg"
              }
              alt={post.author?.firstName || "Author"}
              className={styles.originalAuthorAvatar}
              width={36}
              height={36}
            />
            <div className={styles.originalAuthorInfo}>
              <h4 className={styles.originalAuthorName}>
                {post.author?.firstName && post.author?.lastName
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : post.author?.firstName || "Usuario"}
              </h4>
              {post.author?.industry && (
                <p className={styles.originalAuthorIndustry}>
                  {post.author.industry}
                </p>
              )}
            </div>
          </div>

          <div className={styles.originalPostContent}>
            <p className={styles.originalPostText}>
              {post.content || post.text || ""}
            </p>

            {post.image || post.mediaUrl || post.mediaFile ? (
              <div className={styles.originalPostImage}>
                <Image
                  src={post.image || post.mediaUrl || post.mediaFile}
                  alt="Post content"
                  className={styles.postImage}
                  width={800}
                  height={600}
                />
                {post.imageCredit && (
                  <span className={styles.imageCredit}>{post.imageCredit}</span>
                )}
              </div>
            ) : null}

            {post.linkPreview && (
              <div className={styles.linkPreviewContainer}>
                <LinkPreview
                  url={post.linkPreview.url}
                  title={post.linkPreview.title}
                  description={post.linkPreview.description}
                  image={post.linkPreview.image}
                  domain={post.linkPreview.domain}
                  favicon={post.linkPreview.favicon}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.buttonContainer}>
            {content.length >= 1000 && (
              <span className={styles.textAlert}>Máximo 1000 caracteres</span>
            )}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  Compartiendo <Spinner color="white" size="small" />
                </>
              ) : (
                "Compartir"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
