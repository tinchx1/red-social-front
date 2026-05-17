"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./EditPostForm.module.scss";
import { Button, Spinner, LinkPreview } from "@/components/ui";
import { updatePost, updateSharedPost } from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import { getMyProfile } from "@/actions";
import { useToast } from "@/contexts/ToastContext";
import { getBase64 } from "@/utils/fileToBase64";
import ImageUpload from "@/assets/image-upload.svg";
import api from "@/lib/api";

const EditPostForm = ({ isOpen, onClose, post }) => {
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [urlPreview, setUrlPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { updatePost: updatePostInContext } = usePosts();
  const { showSuccess, showError } = useToast();

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

  // Block scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

    // Debounce: esperar 200ms antes de hacer la petición
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

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || post.text || "");
      // Set existing image if post has one - use same fields as PostCard
      if (post.image || post.mediaUrl || post.mediaFile) {
        const existingImage = post.image || post.mediaUrl || post.mediaFile;
        setImagePreview(existingImage);
        setSelectedImage(existingImage);
        setOriginalImage(existingImage);
        setUrlPreview(null);
      } else {
        setImagePreview(null);
        setSelectedImage(null);
        setOriginalImage(null);
        // TODO: Handle existing URL preview from post if it has one
        setUrlPreview(null);
      }
      if (!user) {
        getMyProfile().then(setUser).catch(console.error);
      }
    }
  }, [isOpen, post, user]);

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
    if ((content.trim() || selectedImage) && !loading && post) {
      setLoading(true);
      try {
        const postData = {};
        // Always send content field, even if empty, so backend can clear text when needed
        postData.content = content.trim();

        // Only send mediaFile if image was actually changed
        if (selectedImage && selectedImage !== originalImage) {
          // Use the same field name that the API expects
          postData.mediaFile = selectedImage;
        } else if (!selectedImage && originalImage) {
          // Add removeMedia flag when image is removed
          postData.removeMedia = true;
        }

        // Handle link preview - only send if there's no image
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
        let updatedPost;
        if (post.type === "share") {
          updatedPost = await updateSharedPost(post.id, postData);
        } else {
          updatedPost = await updatePost(post.id, postData);
        }

        // Update post in context
        updatePostInContext(post.id, updatedPost);

        // Show success toast
        showSuccess("Publicación actualizada exitosamente");

        setContent("");
        setSelectedImage(null);
        setImagePreview(null);
        setOriginalImage(null);
        setUrlPreview(null);
        onClose();
      } catch (error) {
        console.error("Error updating post:", error);
        showError("Error al actualizar la publicación");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
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
          <Button variant="icon" className={styles.closeBtn} onClick={onClose}>
            ✕
          </Button>
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
              maxLength={post.type === "share" ? 1000 : 5000}
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
            {post.type !== "share" && (
              <button
                type="button"
                className={styles.actionIcon}
                title="Imagen"
                onClick={() => fileInputRef.current?.click()}
                disabled={!!urlPreview || loadingPreview}
              >
                <ImageUpload />
              </button>
            )}
          </div>

          <div className={styles.buttons}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
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
                  Actualizando <Spinner color="white" size="small" />
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostForm;
