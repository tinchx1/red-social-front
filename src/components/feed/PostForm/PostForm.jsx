"use client";
import { useState, useEffect, useRef } from "react";
import useScrollLock from "@/hooks/useScrollLock";
import styles from "./PostForm.module.scss";
import { Button, Modal, LinkPreview, Spinner } from "@/components/ui";
import { getBase64 } from "@/utils/fileToBase64";
import ImageUpload from "@/assets/image-upload.svg";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api";
import {
  isCommunityBlockError,
  getBlockedCommunityMessage,
} from "@/utils/communityBlockError";
import { useProfile } from "@/contexts/ProfileContext";
// import Calendar from "@/assets/calendar.svg";
// import Plus from "@/assets/plus.svg";

const PostForm = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showTextAlert, setShowTextAlert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [urlPreview, setUrlPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const debounceTimerRef = useRef(null);
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

  // Check if we need to show text alert
  useEffect(() => {
    setShowTextAlert(!content.trim() && !selectedImage && !urlPreview);
  }, [selectedImage, content, urlPreview]);

  // Detect URLs and fetch preview
  useEffect(() => {
    if (selectedImage) {
      // Si hay imagen, no procesar URLs
      setUrlPreview(null);
      return;
    }

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Extraer la última URL del contenido
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    const lastUrl = urls ? urls[urls.length - 1] : null;

    if (!lastUrl) {
      setUrlPreview(null);
      return;
    }

    // Debounce: esperar 800ms antes de hacer la petición
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoadingPreview(true);
        const response = await api.post("/url-preview", { url: lastUrl });
        setUrlPreview(response.data);
      } catch (error) {
        console.error("Error fetching URL preview:", error);
        setUrlPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, selectedImage]);

  // Block scroll when modal is open (reusable, ref-counted)
  useScrollLock(isOpen);

  // Check if there's unsaved content
  const hasUnsavedContent = () => {
    return content.trim() || selectedImage || urlPreview;
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (hasUnsavedContent()) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    setContent("");
    setSelectedImage(null);
    setImagePreview(null);
    setUrlPreview(null);
    setShowConfirmModal(false);
    onClose();
  };

  // Handle save as draft (keep current behavior)
  const handleSaveAsDraft = () => {
    setShowConfirmModal(false);
    onClose();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64 = await getBase64(file);
        setSelectedImage(base64);
        setImagePreview(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUrlPreview = () => {
    setUrlPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((content.trim() || selectedImage || urlPreview) && !loading) {
      setLoading(true);
      try {
        const postData = {
          visibility: "public",
        };

        if (content.trim()) postData.content = content.trim();
        if (selectedImage) postData.mediaFile = `${selectedImage}`;
        if (urlPreview && !selectedImage) {
          postData.linkPreview = {
            url: urlPreview.url,
            title: urlPreview.title,
            description: urlPreview.description,
            image: urlPreview.image,
            favicon: urlPreview.favicon,
            domain: urlPreview.domain,
          };
        }

        const submitResult = await onSubmit(postData);

        // Si el server action indica redirección, redirigir y salir
        if (submitResult?.redirectTo) {
          window.location.href = submitResult.redirectTo;
          return;
        }

        // Show success toast
        showSuccess("Publicación creada exitosamente");

        setContent("");
        setSelectedImage(null);
        setImagePreview(null);
        setUrlPreview(null);

        onClose();
      } catch (error) {
        console.error("Error creating post:", error);

        if (error?.redirectTo) {
          window.location.href = error.redirectTo;
          return;
        }

        const blockError = isCommunityBlockError(error);
        if (blockError.isBlocked) {
          showError(getBlockedCommunityMessage("crear publicaciones"));
        } else if (error?.message?.includes("Solo el creador, administradores y moderadores pueden publicar")) {
          showError(error.message);
        } else {
          showError("Error al crear la publicación");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <img
                src={user?.avatarUrl || "/images/profile.svg"}
                alt="User avatar"
                className={styles.avatar}
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
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className={styles.content}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="¿Sobre qué quieres hablar?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={1}
                maxLength={5000}
              />

              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className={styles.removeImage}
                  >
                    ✕
                  </button>
                </div>
              )}

              {!imagePreview && urlPreview && (
                <div className={styles.urlPreviewWrapper}>
                  <LinkPreview
                    url={urlPreview.url}
                    title={urlPreview.title}
                    description={urlPreview.description}
                    image={urlPreview.image}
                    domain={urlPreview.domain}
                    favicon={urlPreview.favicon}
                    onRemove={removeUrlPreview}
                    showRemoveButton={true}
                  />
                </div>
              )}
            </form>
          </div>
          <div className={styles.footer}>
            <div className={styles.actions}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className={styles.actionIcon}
                title="Imagen"
                onClick={() => fileInputRef.current?.click()}
                disabled={!!urlPreview || loadingPreview}
              >
                <ImageUpload />
              </button>

              {/* <button
                type="button"
                className={styles.actionIcon}
                title="Calendario"
              >
                <Calendar />
              </button> */}
              {/* <button type="button" className={styles.actionIcon} title="Más">
                <Plus />
              </button> */}
            </div>

            <div className={styles.buttonContainer}>
              {content.length >= 5000 && (
                <span className={styles.textAlert}>Máximo 5000 caracteres</span>
              )}
              <Button
                type="submit"
                disabled={
                  !(content.trim() || selectedImage || urlPreview) ||
                  loading ||
                  loadingPreview
                }
                variant="primary"
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    Publicando <Spinner color="white" size="small" />
                  </>
                ) : (
                  "Publicar"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="¿Guardar esta publicación como borrador?"
        size="medium"
        closeOnOverlayClick={false}
      >
        <p>La publicación que has empezado seguirá aquí cuando vuelvas.</p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <Button variant="light-blue" onClick={handleDiscard}>
            Descartar
          </Button>
          <Button variant="primary" onClick={handleSaveAsDraft}>
            Guardar como borrador
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PostForm;
