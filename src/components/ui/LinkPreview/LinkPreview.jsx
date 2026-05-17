"use client";
import React from "react";
import styles from "./LinkPreview.module.scss";
import Link from "next/link";

/**
 * @param {{
 *   url: string;
 *   title?: string;
 *   description?: string;
 *   image?: string;
 *   domain?: string;
 *   favicon?: string;
 *   onRemove?: () => void;
 *   showRemoveButton?: boolean;
 * }} props
 */
export default function LinkPreview({
  url,
  title,
  description,
  image,
  domain,
  favicon,
  onRemove,
  showRemoveButton = false,
}) {
  return (
    <Link href={url} target="_blank">
      <div className={styles.linkPreview}>
        {showRemoveButton && onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            aria-label="Eliminar preview"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            ✕
          </button>
        )}

        {image && (
          <div className={styles.imageContainer}>
            <img src={image} alt={title || "Link preview"} />
          </div>
        )}

        <div className={styles.content}>
          {title && <h4 className={styles.title}>{title}</h4>}

          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.urlInfo}>
            {favicon && (
              <img
                src={favicon}
                alt=""
                className={styles.favicon}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <span className={styles.domain}>{domain || url}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
