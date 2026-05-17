import styles from "./PostCard.module.scss";
import Image from "next/image";
import { LinkPreview } from "@/components/ui";
import linkify from "@/utils/linkify";

const NormalPost = ({
  post,
  isExpanded,
  toggleExpanded,
  hasLongContent,
  onOpenImageModal,
}) => (
  <>
    <p
      className={`${styles.text} ${
        !isExpanded && hasLongContent ? styles.textCollapsed : ""
      }`}
      dangerouslySetInnerHTML={{
        __html: linkify(post.content || post.text || ""),
      }}
    />

    {hasLongContent && (
      <button className={styles.expandBtn} onClick={toggleExpanded}>
        {isExpanded ? "" : "ver más"}
      </button>
    )}

    {(post.image || post.mediaUrl) && (
      <div
        className={styles.imageContainer}
        onClick={() => {
          if (typeof window !== "undefined" && window.innerWidth <= 768) return;
          onOpenImageModal && onOpenImageModal();
        }}
      >
        <Image
          src={post.image || post.mediaUrl}
          alt="Post content"
          width={800}
          height={600}
          className={styles.postImage}
          priority
          fetchPriority="high"
          onError={(e) => {
            console.error("Error loading image:", e.target.src);
            e.target.style.display = "none";
          }}
        />
        {post.imageCredit && (
          <span className={styles.imageCredit}>{post.imageCredit}</span>
        )}
      </div>
    )}

    {!post.image && !post.mediaUrl && post.linkPreview && (
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
  </>
);

export default NormalPost;
