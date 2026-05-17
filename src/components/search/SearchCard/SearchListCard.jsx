"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { PostCard } from "@/components";
import ContactStatusButton from "@/components/perfil/ContactStatusButton/ContactStatusButton";
import styles from "./SearchListCard.module.scss";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";

/**
 * Reusable list card for search suggestions/results.
 * - Shows first N items (default 3), supports "load more" action.
 * - Renders a per-item action button (e.g., Seguir) and a bottom CTA (e.g., Ver más personas).
 */
const SearchListCard = ({
  title,
  items = [],
  typeLabel = "", // e.g., "personas", "comunidades"
  initialCount = 3,
  onMoreClick, // called when bottom CTA is clicked
  moreButtonText, // overrides default "Ver más {typeLabel}"
  // Per-item action
  itemActionText = "", // e.g., "Seguir"
  onItemAction, // function(item)
  renderItem, // optional custom renderer ({ item, onAction, actionText }) => JSX
  // special-case renderer: if true and type is posts/publicaciones, render PostCard per item
  renderPostsAsPostCard = false,
  className,
}) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visibleItems = useMemo(
    () => items.slice(0, Math.max(0, visibleCount)),
    [items, visibleCount]
  );
  const router = useRouter();
  const handleItemAction = (item) => {
    if (title === "Comunidades") {
      router.push(`/comunidades/${item.id}`);
    }
  };

  const bottomCtaText = moreButtonText || `Ver más ${typeLabel}`.trim();

  const handleMoreClick = () => {
    setVisibleCount((prev) => prev + 3);
    if (typeof onMoreClick === "function") onMoreClick();
  };
  const isPosts =
    renderPostsAsPostCard ||
    typeLabel === "publicaciones" ||
    title === "Publicaciones";
  return (
    <div
      className={`${styles.card} ${
        isPosts ? styles["card--posts"] : ""
      } ${className}`}
    >
      {!isPosts && title && <h3 className={styles.card__title}>{title}</h3>}

      <ul className={styles.list}>
        {visibleItems.map((item, index) => {
          const hasFooter = items.length > visibleCount;
          const isLast = index === visibleItems.length - 1;
          const addBorder = hasFooter || !isLast;
          const shouldRenderPostCard = isPosts;
          return (
            <li key={item.id ?? index} className={styles.list__item}>
              {isPosts && index === 0 && title && (
                <h3 className={styles.card__title}>{title}</h3>
              )}
              {shouldRenderPostCard ? (
                <PostCard
                  post={item}
                  className={`postcard-search ${
                    index === 0 ? "postcard-search-first" : ""
                  } ${
                    index === visibleItems.length - 1 &&
                    items.length > visibleCount
                      ? "postcard-search-last"
                      : ""
                  }`}
                />
              ) : renderItem ? (
                renderItem({
                  item,
                  onAction: handleItemAction,
                  actionText: itemActionText,
                })
              ) : (
                <DefaultRow
                  item={item}
                  onAction={handleItemAction}
                  actionText={itemActionText}
                  addBorder={addBorder}
                  // title={title}
                  typeLabel={typeLabel}
                />
              )}
            </li>
          );
        })}
      </ul>

      {items.length > visibleCount && (
        <div className={styles.card__footer}>
          <button className={styles.button} onClick={handleMoreClick}>
            {bottomCtaText}
          </button>
        </div>
      )}
    </div>
  );
};

const DefaultRow = ({
  item,
  onAction,
  actionText,
  addBorder,
  title,
  typeLabel,
}) => {
  const { avatarUrl, name, subtitle, metaText, contactStatus, id } = item;
  const router = useRouter();
  const { profile: user } = useProfile();
  // Use ContactStatusButton if contactStatus is available, otherwise fallback to simple button
  const renderActionButton = () => {
    // Don't render anything if user data is not loaded yet
    if (!user?.id) {
      return null;
    }

    // If it's the current user, show "Ver" button
    if (String(id) === String(user.id)) {
      return (
        <Button variant="primary" onClick={handleProfileClick}>
          Ver
        </Button>
      );
    }

    // For communities, show "Ver" button
    if (title === "Comunidades" || typeLabel === "comunidades") {
      return (
        <Button variant="primary" onClick={handleProfileClick}>
          Ver
        </Button>
      );
    }

    // If we have contactStatus data, use it
    if (contactStatus !== undefined && id) {
      return (
        <ContactStatusButton
          contactStatus={contactStatus}
          userId={id}
          currentUserId={user?.id}
          onStatusChange={(newStatus) => {
            onAction?.(item, newStatus);
          }}
          isSearchContext={true}
        />
      );
    }

    // If no contactStatus data yet, don't show anything (wait for data)
    if (contactStatus === undefined) {
      return null;
    }

    // Fallback for other cases
    if (actionText) {
      return (
        <Button variant="primary" onClick={() => onAction?.(item)}>
          {actionText}
        </Button>
      );
    }

    return null;
  };

  const handleProfileClick = () => {
    if (id) {
      // Check if it's a community based on the title or typeLabel
      const isCommunity =
        title === "Comunidades" || typeLabel === "comunidades";
      if (isCommunity) {
        router.push(`/comunidades/${id}`);
      } else {
        // If it's the current user, redirect to their own profile
        if (user?.id && String(id) === String(user.id)) {
          router.push("/perfil");
        } else {
          router.push(`/perfil/${id}`);
        }
      }
    }
  };

  return (
    <div className={`${styles.row} ${addBorder ? styles.row__border : ""}`}>
      <div
        className={styles.row__left}
        onClick={handleProfileClick}
        style={{ cursor: "pointer" }}
      >
        <Image
          className={styles.row__avatar}
          src={avatarUrl || "/images/profile.svg"}
          alt={name}
          width={48}
          height={48}
          loading="lazy"
        />
        <div className={styles.row__texts}>
          <span className={styles.row__name}>{name}</span>
          {subtitle && <span className={styles.row__subtitle}>{subtitle}</span>}
          {metaText && <span className={styles.row__meta}>{metaText}</span>}
        </div>
      </div>
      {renderActionButton()}
    </div>
  );
};

export default SearchListCard;
