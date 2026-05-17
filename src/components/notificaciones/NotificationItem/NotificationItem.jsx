"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import styles from "./NotificationItem.module.scss";
import MoreHorizontal from "@/assets/more-horizontal.svg";
import MoreVertical from "@/assets/more-vertical.svg";
import NotificationIcon from "@/assets/notification.svg";
import TrashIcon from "@/assets/trash.svg";
import { Submenu } from "@/components/ui";
import { useRouter } from "next/navigation";
import { deleteNotification } from "@/actions";
import { markNotificationRead } from "@/actions/notifications";
import { useProfile } from "@/contexts/ProfileContext";
/**
 * @param {{ n: { id: string|number; title: string; content: string; link?: string; is_read?: boolean; created_at: string } }} props
 */
export default function NotificationItem({ n }) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [timerId, setTimerId] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const moreBtnRef = useRef(null);
  const created = useMemo(() => new Date(n.created_at), [n.created_at]);
  const router = useRouter();
  const { profile: user } = useProfile();

  const time = useMemo(() => {
    const now = dayjs();
    const then = dayjs(created);
    const seconds = Math.max(1, now.diff(then, "second"));
    if (seconds < 60) return `${seconds}s`;
    const minutes = now.diff(then, "minute");
    if (minutes < 60) return `${minutes}m`;
    const hours = now.diff(then, "hour");
    if (hours < 24) return `${hours}h`;
    const days = now.diff(then, "day");
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w`;
    const months = now.diff(then, "month");
    if (months < 12) return `${months}mo`;
    const years = now.diff(then, "year");
    return `${years}y`;
  }, [created]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startDeleteCountdown = () => {
    // 3s countdown with 50ms ticks for smoother bar
    const totalMs = 3000;
    const stepMs = 50;
    const startedAt = Date.now();
    setPendingDelete(true);
    setProgress(0);
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setProgress(pct);
      if (elapsed >= totalMs) {
        clearInterval(id);
        setTimerId(null);
        // Fire API and optimistically remove
        const revert = () => {
          setPendingDelete(false);
          setProgress(0);
          setIsRemoved(false);
        };
        if (user?.id) {
          setIsRemoved(true);
          deleteNotification(n.id, user.id).catch(() => {
            revert();
          });
        } else {
          setIsRemoved(true);
        }
      }
    }, stepMs);
    setTimerId(id);
  };

  const cancelDelete = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (timerId) clearInterval(timerId);
    setTimerId(null);
    setPendingDelete(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  const submenuItems = [
    {
      label: "Cambiar tus preferencias de notificaciones",
      prewrap: true,
      icon: NotificationIcon,
      iconWidth: 32,
      iconHeight: 23,
      onClick: () => {
        // TODO: Implement notification preferences
        router.push("/notificaciones/configuracion");
      },
    },
    {
      label: "Eliminar notificación",
      icon: TrashIcon,
      iconWidth: 21,
      iconHeight: 21,
      onClick: () => {
        startDeleteCountdown();
      },
    },
  ];

  return isRemoved ? null : (
    <div className={`${styles.card} ${!n.is_read ? styles.unread : ""}`}>
      {pendingDelete ? (
        <div className={styles.undoRow}>
          <span className={styles.undoText}>Notificación eliminada</span>
          <button className={styles.undoBtn} onClick={cancelDelete}>
            Deshacer
          </button>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <Link
            href={n.link || "#"}
            className={styles.link}
            onClick={() => {
              if (!n.is_read && user?.id && n?.id) {
                // Fire-and-forget: do not change local UI color optimistically
                markNotificationRead(n.id, user.id).catch(() => {});
              }
            }}
          >
            <img
              src={n.actorAvatarUrl || "/images/profile.svg"}
              alt="avatar"
              width={55}
              height={55}
              className={styles.avatar}
            />
            <div className={styles.content}>
              <p className={styles.text}>{n.content}</p>
            </div>
            <div className={styles.meta}>
              <span suppressHydrationWarning className={styles.time}>
                {isMounted ? time : ""}
              </span>
              <div className={styles.actions}>
                <button
                  ref={moreBtnRef}
                  type="button"
                  className={styles.moreBtn}
                  aria-label="actions"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSubmenuOpen(!isSubmenuOpen);
                  }}
                >
                  <MoreHorizontal className={styles.moreDesktop} />
                  <MoreVertical className={styles.moreMobile} />
                </button>
                <Submenu
                  isOpen={isSubmenuOpen}
                  onClose={() => setIsSubmenuOpen(false)}
                  anchorRef={moreBtnRef}
                  items={submenuItems}
                  position="bottom-right"
                />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
