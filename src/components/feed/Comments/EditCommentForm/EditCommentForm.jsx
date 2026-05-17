"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./EditCommentForm.module.scss";
import { Button, Spinner } from "@/components/ui";

const EditCommentForm = ({
  isOpen,
  onClose,
  comment,
  initialContent = "",
  onSave,
}) => {
  const [content, setContent] = useState(initialContent || "");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || comment?.content || "");
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isOpen, initialContent, comment]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (loading) return;
    const next = (content || "").trim();
    if (!next) return;
    try {
      setLoading(true);
      await onSave?.(next);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Editar comentario</h3>
          <Button variant="icon" className={styles.closeBtn} onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={4}
            maxLength={1000}
            className={styles.textarea}
          />
        </form>

        <div className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
          >
            {loading ? <>Guardando <Spinner color="white" size="small" /></> : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentForm;
