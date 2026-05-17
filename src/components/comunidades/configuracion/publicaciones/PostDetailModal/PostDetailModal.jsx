"use client";
import React, { useEffect, useState } from "react";
import { Button, ConfirmModal, Spinner } from "@/components/ui";
import CheckCircleIcon from "@/assets/check-circle.svg?react";
import CloseCircleIcon from "@/assets/close_ring.svg?react";
import AlertIcon from "@/assets/alert.svg?react";
import styles from "./PostDetailModal.module.scss";
import { getPostById } from "@/actions";
import { useToast } from "@/contexts/ToastContext";

const PostDetailModal = ({ isOpen, onClose, post, onApprove, onBlock }) => {
  const [loading, setLoading] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [fullPost, setFullPost] = useState(null);
  const [isExpandedMain, setIsExpandedMain] = useState(false);
  const [isExpandedOriginal, setIsExpandedOriginal] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fetch enriched data for share posts when opening the modal
  useEffect(() => {
    const fetchShared = async () => {
      try {
        const data = await getPostById(post.id);
        setFullPost(data?.data || data);
      } catch (err) {
        console.error("Error fetching shared post detail:", err);
      }
    };

    if (isOpen && post?.type === "share" && !post.sharedPost) {
      fetchShared();
    } else {
      setFullPost(null);
    }
  }, [isOpen, post]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
    };
  }, [isOpen]);

  // Reset expand states when opening/closing or changing post
  useEffect(() => {
    if (isOpen) {
      setIsExpandedMain(false);
      setIsExpandedOriginal(false);
    }
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  const handleApprove = async () => {
    if (onApprove) {
      setLoading(true);
      try {
        await onApprove(post.id);
        showSuccess("Publicación aprobada");
      } catch (error) {
        console.error("Error approving post:", error);
        showError("Error al aprobar");
      } finally {
        setLoading(false);
        onClose();
      }
    }
  };

  const handleBlock = async () => {
    if (onBlock) {
      setLoading(true);
      try {
        await onBlock(post.id);
        showSuccess("Publicación bloqueada");
      } catch (error) {
        console.error("Error blocking post:", error);
        showError("Error al bloquear");
      } finally {
        setLoading(false);
        setShowBlockConfirm(false);
        onClose();
      }
    }
  };

  const currentPost = fullPost ? { ...post, ...fullPost } : post;
  const isShare = currentPost.type === "share";
  const originalPost =
    currentPost.originalPost ||
    currentPost.sharedPost ||
    currentPost.original ||
    currentPost.post ||
    null;

  const mainText = currentPost.content || "";
  const hasLongMain = mainText.length > 300;
  const hasMediaMain = Boolean(
    currentPost.image || currentPost.mediaUrl || currentPost.mediaFile
  );
  const shouldTruncateMain =
    hasLongMain && (isShare || hasMediaMain) && !isExpandedMain;
  const visibleMainText = shouldTruncateMain
    ? `${mainText.slice(0, 300)}…`
    : mainText;

  const originalText = originalPost?.content || "";
  const hasLongOriginal = originalText.length > 300;
  const visibleOriginalText =
    hasLongOriginal && !isExpandedOriginal
      ? `${originalText.slice(0, 300)}…`
      : originalText;
  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <img
                src={post.author.avatarUrl || "/images/profile.svg"}
                alt="User avatar"
                className={styles.avatar}
              />
              <div>
                <h3 className={styles.userName}>
                  {post.author.firstName} {post.author.lastName || ""}
                </h3>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          <div className={styles.content}>
            {/* Post Preview */}
            <div className={styles.postPreview}>
              {currentPost.content && (
                <div>
                  <p className={styles.postContent}>{visibleMainText}</p>
                  {hasLongMain && (isShare || hasMediaMain) && (
                    <Button
                      variant="link"
                      onClick={() => setIsExpandedMain(!isExpandedMain)}
                      disabled={loading}
                      style={{
                        marginLeft: "auto",
                        display: "block",
                      }}
                    >
                      {isExpandedMain ? "Ver menos" : "Ver más"}
                    </Button>
                  )}
                </div>
              )}

              {!isShare && currentPost.mediaUrl && (
                <div className={styles.imagePreview}>
                  {currentPost.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={currentPost.mediaUrl}
                      alt="Media del post"
                      className={styles.mediaImage}
                    />
                  ) : (
                    <video
                      src={currentPost.mediaUrl}
                      controls
                      className={styles.mediaVideo}
                    />
                  )}
                </div>
              )}

              {isShare && originalPost && (
                <div className={styles.originalPost}>
                  <div className={styles.originalPostHeader}>
                    <img
                      src={
                        originalPost.author?.avatarUrl ||
                        originalPost.author?.profilePicture ||
                        "/images/profile.svg"
                      }
                      alt={originalPost.author?.firstName || "Author"}
                      className={styles.originalAuthorAvatar}
                    />
                    <div className={styles.originalAuthorInfo}>
                      <h4 className={styles.originalAuthorName}>
                        {originalPost.author?.firstName &&
                        originalPost.author?.lastName
                          ? `${originalPost.author.firstName} ${originalPost.author.lastName}`
                          : originalPost.author?.firstName || "Usuario"}
                      </h4>
                      {(originalPost.author?.industry ||
                        originalPost.author?.empresa ||
                        originalPost.author?.sector) && (
                        <p className={styles.originalAuthorIndustry}>
                          {originalPost.author?.industry ||
                            originalPost.author?.empresa ||
                            originalPost.author?.sector}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.originalPostContent}>
                    {originalPost?.content && (
                      <div>
                        <p className={styles.originalPostText}>
                          {visibleOriginalText}
                        </p>
                        {hasLongOriginal && (
                          <Button
                            variant="link"
                            onClick={() =>
                              setIsExpandedOriginal(!isExpandedOriginal)
                            }
                            disabled={loading}
                            style={{
                              marginLeft: "auto",
                              display: "block",
                            }}
                          >
                            {isExpandedOriginal ? "Ver menos" : "Ver más"}
                          </Button>
                        )}
                      </div>
                    )}

                    {(originalPost.image ||
                      originalPost.mediaUrl ||
                      originalPost.mediaFile) && (
                      <div className={styles.originalPostImage}>
                        <img
                          src={
                            originalPost.image ||
                            originalPost.mediaUrl ||
                            originalPost.mediaFile
                          }
                          alt="Post content"
                          className={styles.postImage}
                        />
                        {originalPost.imageCredit && (
                          <span className={styles.imageCredit}>
                            {originalPost.imageCredit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.buttonContainer}>
              {post.approvalStatus === "approved" && (
                <Button
                  variant="link"
                  onClick={() => setShowBlockConfirm(true)}
                  disabled={loading}
                  iconPosition="right"
                  icon={<CloseCircleIcon height={20} width={20} />}
                  className={styles.blockBtn}
                >
                  {loading ? <>Procesando <Spinner /></> : "Bloquear publicación"}
                </Button>
              )}
              {post.approvalStatus === "rejected" && (
                <Button
                  variant="link"
                  onClick={handleApprove}
                  disabled={loading}
                  className={styles.approveBtn}
                  iconPosition="right"
                  icon={<CheckCircleIcon />}
                >
                  {loading ? <>Procesando <Spinner /></> : "Permitir publicación"}
                </Button>
              )}
            </div>

            {/* Mobile-only buttons */}
            <div className={styles.mobileButtons}>
              {post.approvalStatus === "approved" && (
                <button
                  onClick={() => setShowBlockConfirm(true)}
                  disabled={loading}
                  className={styles.mobileBlockBtn}
                >
                  {loading ? <>Procesando <Spinner /></> : "Bloquear"}
                  <CloseCircleIcon height={24} width={24} />
                </button>
              )}
              {post.approvalStatus === "rejected" && (
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  icon={<CheckCircleIcon className={styles.mobileBlockIcon} />}
                  iconPosition="right"
                  style={{ alignItems: "center" }}
                >
                  {loading ? <>Procesando <Spinner /></> : "Permitir"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Confirm Block Modal */}
      <ConfirmModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleBlock}
        title={
          <>
            ¿Estás seguro que querés <strong>bloquear esta publicación</strong>?
          </>
        }
        icon={AlertIcon}
        confirmText="Sí, bloquear publicación"
        loading={loading}
        loadingText="Procesando"
        confirmButtonStyle={{
          backgroundColor: "#E6E6E6",
          color: "#FF383C",
          borderColor: "#E6E6E6",
        }}
        closeButtonPublications={true}
        iconSize={64}
        iconStyle={{ width: 64, height: 64 }}
      />
    </>
  );
};

export default PostDetailModal;
