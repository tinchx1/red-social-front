"use client";
import React from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import styles from "./Publicaciones.module.scss";
import { Button } from "@/components/ui";

// Simple post card component that matches the image style
const SimplePostCard = ({ post }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isShare = post?.type === "share";
  const shared = isShare ? post.sharedPost : null;
  const fullText = isShare
    ? post.content || ""
    : post.content || post.text || "";
  const hasLongContent = fullText.length > 300;
  const displayText = isExpanded
    ? fullText
    : hasLongContent
    ? fullText.substring(0, 300) + "..."
    : fullText;

  const mainImage = isShare
    ? shared?.image || shared?.mediaUrl
    : post.image || post.mediaUrl;

  return (
    <div className={styles.simplePostCard}>
      <div className={styles.postHeader}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img
              src={post.author?.avatarUrl || "/images/profile.svg"}
              alt={
                post.author?.roleKey === "persona"
                  ? post.author?.firstName + " " + (post.author?.lastName ?? "")
                  : post.author?.firstName || post.author?.name || ""
              }
              className={styles.logoImage}
            />
          </div>
          <div className={styles.organizationName}>
            {post.author?.roleKey === "persona"
              ? post.author?.firstName + " " + (post.author?.lastName ?? "")
              : post.author?.firstName || post.author?.name || ""}
          </div>
          <span className={styles.timestamp}>
            {dayjs(post.created_at || post.createdAt).format(
              "DD/MM/YYYY HH:mm"
            )}
          </span>
        </div>
      </div>

      {/* Share caption or original text */}
      {fullText && (
        <div className={styles.postContent}>
          <p className={styles.postText}>
            {displayText}
            {hasLongContent && (
              <span
                className={styles.readMore}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? " ver menos" : "... más"}
              </span>
            )}
          </p>
        </div>
      )}

      {/* If share, render a lightweight embed of the original post */}
      {isShare && shared && (
        <div className={styles.sharedContainer}>
          <div className={styles.sharedHeader}>
            <div className={styles.logo}>
              <img
                src={shared.author?.avatarUrl || "/images/profile.svg"}
                alt={
                  shared.author?.firstName +
                  " " +
                  (shared.author?.lastName ?? "")
                }
                className={styles.logoImage}
              />
            </div>
            <div className={styles.organizationName}>
              {shared.author?.firstName + " " + (shared.author?.lastName ?? "")}
            </div>
          </div>
          {(shared.content || shared.text) && (
            <div className={styles.postContent}>
              <p className={styles.postText}>{shared.content || shared.text}</p>
            </div>
          )}
          {(shared.image || shared.mediaUrl) && (
            <div className={styles.postImage}>
              <img
                src={shared.image || shared.mediaUrl}
                alt="Shared post content"
                className={styles.imageContent}
                onError={(e) => {
                  console.error("Error loading image:", e.target.src);
                  e.target.style.display = "none";
                }}
              />
              {shared.imageCredit && (
                <div className={styles.imageWatermark}>
                  {shared.imageCredit}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Only show main image for non-share posts */}
      {!isShare && mainImage && (
        <div className={styles.postImage}>
          <img
            src={mainImage}
            alt="Post content"
            className={styles.imageContent}
            onError={(e) => {
              console.error("Error loading image:", e.target.src);
              e.target.style.display = "none";
            }}
          />
          {post.imageCredit && (
            <div className={styles.imageWatermark}>{post.imageCredit}</div>
          )}
        </div>
      )}
    </div>
  );
};

const Publicaciones = ({ posts, userId }) => {
  const router = useRouter();

  // Get only the last post
  const lastPost = posts.slice(0);

  const handleViewAllPosts = () => {
    if (userId) {
      router.push(`/perfil/publicaciones/${userId}`);
    }
  };

  return (
    <div className={styles.publicacionesContainer}>
      <div className={styles.header}>
        <h2>Publicaciones</h2>
      </div>

      <div className={styles.grid}>
        <SimplePostCard post={lastPost[0]} />
      </div>

      <div className={styles.buttonContainer}>
        <Button variant="default" onClick={handleViewAllPosts}>
          Ver todas las publicaciones
        </Button>
      </div>
    </div>
  );
};

export default Publicaciones;
