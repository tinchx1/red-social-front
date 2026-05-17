import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";
import styles from "./PostCard.module.scss";
import { LinkPreview } from "@/components/ui";
import linkify from "@/utils/linkify";

const SharedPost = ({
  post,
  isExpanded,
  toggleExpanded,
  hasLongContent,
  onOpenImageModal,
}) => {
  return (
    <>
      {post.content && (
        <p
          className={`${styles.text} ${
            !isExpanded && hasLongContent ? styles.textCollapsed : ""
          }`}
          dangerouslySetInnerHTML={{ __html: linkify(post.content) }}
        />
      )}

      {hasLongContent && post.content && (
        <button className={styles.expandBtn} onClick={toggleExpanded}>
          {isExpanded ? "" : "ver más"}
        </button>
      )}

      {post.sharedPost && (
        <div className={styles.originalPostContainer}>
          <div className={styles.originalPostHeader}>
            <Link
              href={`/perfil/${
                post.sharedPost.author?.id ||
                post.sharedPost.authorId ||
                post.sharedPost.userId
              }`}
            >
              <img
                src={post.sharedPost.author?.avatarUrl || "/images/profile.svg"}
                alt={post.sharedPost.author?.firstName || "Author"}
                className={styles.originalAuthorAvatar}
              />
            </Link>
            <div className={styles.originalAuthorInfo}>
              {post.sharedPost.communityName ? (
                <h4
                  className={styles.originalAuthorName}
                  style={{ fontWeight: 300 }}
                >
                  <Link
                    href={`/perfil/${
                      post.sharedPost.author?.id ||
                      post.sharedPost.authorId ||
                      post.sharedPost.userId
                    }`}
                    className={styles.link}
                  >
                    {post.sharedPost.author?.firstName +
                      (post.sharedPost.author?.lastName
                        ? " " + post.sharedPost.author?.lastName
                        : "")}
                  </Link>
                  {" publicó en "}
                  <Link
                    href={`/comunidades/${post.sharedPost.communityId}`}
                    className={styles.link}
                  >
                    {post.sharedPost.communityName}
                  </Link>
                </h4>
              ) : (
                <h4 className={styles.originalAuthorName}>
                  <Link
                    href={`/perfil/${
                      post.sharedPost.author?.id ||
                      post.sharedPost.authorId ||
                      post.sharedPost.userId
                    }`}
                    className={styles.originalAuthorName}
                  >
                    {post.sharedPost.author?.firstName +
                      " " +
                      (post.sharedPost.author?.lastName ?? "")}
                  </Link>
                </h4>
              )}
              <span className={styles.timestamp}>
                {dayjs(
                  post.sharedPost.created_at || post.sharedPost.createdAt
                ).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
          </div>

          <div className={styles.originalPostContent}>
            <p
              className={styles.text}
              style={{ paddingInline: "4px" }}
              dangerouslySetInnerHTML={{
                __html: linkify(
                  post.sharedPost.content || post.sharedPost.text || ""
                ),
              }}
            />
            {post.sharedPost.linkPreview && (
              <div>
                <LinkPreview
                  url={post.sharedPost.linkPreview.url}
                  title={post.sharedPost.linkPreview.title}
                  description={post.sharedPost.linkPreview.description}
                  image={post.sharedPost.linkPreview.image}
                  favicon={post.sharedPost.linkPreview.favicon}
                  domain={post.sharedPost.linkPreview.domain}
                />
              </div>
            )}
            {post.sharedPost.image ||
            post.sharedPost.mediaUrl ||
            post.sharedPost.mediaFile ? (
              <div
                className={styles.originalPostImage}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth <= 768)
                    return;
                  onOpenImageModal && onOpenImageModal();
                }}
              >
                <Image
                  src={
                    post.sharedPost.image ||
                    post.sharedPost.mediaUrl ||
                    post.sharedPost.mediaFile
                  }
                  alt="Post content"
                  width={800}
                  height={600}
                  className={styles.postImage}
                  fetchPriority="high"
                  priority
                  onError={(e) => {
                    console.error("Error loading image:", e.target.src);
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default SharedPost;
