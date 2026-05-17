"use client";
import React, { useCallback, useState, useMemo } from "react";
import notificationItemStyles from "./LoadMoreNotifications.module.scss";
import { Button, Spinner } from "../../ui";
import { NotificationsEmptyState } from "@/components/notificaciones";
import CheckIcon from "@/assets/check-circle.svg";
import DeleteIcon from "@/assets/trash.svg";
import SettingIcon from "@/assets/setting_line.svg";
import Link from "next/link";
import {
  deleteAllNotifications,
  markAllNotificationsRead,
} from "@/actions/notifications";
import { useToast } from "@/contexts";
import { useRealtimeNotifications } from "@/hooks";
import { useProfile } from "@/contexts/ProfileContext";

/**
 * @param {{
 *  initialItems: any[];
 *  initialPage: number;
 *  totalPages: number;
 *  onFetchMore: (nextPage: number) => Promise<{ data: any[], pagination: { page: number, pages: number } }>;
 *  listClassName: string;
 *  buttonClassName: string;
 *  ItemComponent: React.ComponentType<{ n: any }>;
 * }} props
 */
export default function LoadMoreNotifications({
  initialItems,
  initialPage,
  totalPages,
  onFetchMore,
  listClassName,
  buttonClassName,
  ItemComponent,
}) {
  const [items, setItems] = useState(initialItems || []);
  const [page, setPage] = useState(initialPage || 1);
  const [pages, setPages] = useState(totalPages || 1);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const { showSuccess, showError } = useToast();
  const { profile: user } = useProfile();
  // Prepend incoming realtime notifications
  useRealtimeNotifications(
    useMemo(
      () => (payload) => {
        // Avoid duplicates if the notification already exists
        setItems((prev) => {
          if (!prev || prev.length === 0) return [payload];
          const exists = prev.some((n) => n.id === payload.id);
          if (exists) return prev;
          return [payload, ...prev];
        });
        // When new notification arrives, ensure pagination reflects at least one page
        setPages((prev) => (prev < 1 ? 1 : prev));
      },
      []
    ),
    true
  );
  const handleMore = useCallback(async () => {
    if (loading) return;
    const nextPage = page + 1;
    if (nextPage > pages) return;
    setLoading(true);
    try {
      const res = await onFetchMore(nextPage);
      setItems((prev) => [...prev, ...res.data]);
      setPage(res.pagination.page);
    } finally {
      setLoading(false);
    }
  }, [loading, onFetchMore, page, pages]);

  const handleDeleteAll = useCallback(async () => {
    if (deletingAll || !user?.id || items.length === 0) return;

    setDeletingAll(true);
    try {
      await deleteAllNotifications(user.id);
      setItems([]);
      setPages(1); // Reset pages to hide "Mostrar más" button
      setPage(1); // Reset current page
      showSuccess("Todas las notificaciones han sido eliminadas");
    } catch (error) {
      showError("Error al eliminar las notificaciones");
    } finally {
      setDeletingAll(false);
    }
  }, [deletingAll, user?.id, items.length, showSuccess, showError]);

  const handleMarkAllRead = useCallback(async () => {
    if (!user?.id || items.length === 0) return;
    try {
      await markAllNotificationsRead(user.id);
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showSuccess("Todas las notificaciones marcadas como leídas");
    } catch (error) {
      showError("Error al marcar como leídas");
    }
  }, [user?.id, items.length, showSuccess, showError]);

  return (
    <div>
      <Link
        href="/notificaciones/configuracion"
        className={notificationItemStyles.settingsCard}
      >
        <span className={notificationItemStyles.settingsText}>
          Gestiona tus notificaciones
        </span>
        <SettingIcon
          width={20}
          height={20}
          className={notificationItemStyles.settingsIcon}
        />
      </Link>
      <div className={notificationItemStyles.buttonContainers}>
        <Button
          rounded="small"
          variant="outline"
          iconPosition="right"
          icon={<DeleteIcon width={20} height={20} />}
          style={{ color: "#A3A3A3", borderColor: "#A3A3A3" }}
          onClick={handleDeleteAll}
          disabled={deletingAll || items.length === 0}
        >
          <span className={notificationItemStyles.desktopText}>
            {deletingAll ? (
              <>
                Eliminando <Spinner color="white" size="small" />
              </>
            ) : (
              "Eliminar todas las notificaciones"
            )}
          </span>
          <span className={notificationItemStyles.mobileText}>
            {deletingAll ? (
              <>
                Eliminando <Spinner color="white" size="small" />
              </>
            ) : (
              "Eliminar todas"
            )}
          </span>
        </Button>
        <Button
          rounded="small"
          variant="outline"
          icon={<CheckIcon width={20} height={20} />}
          iconPosition="right"
          onClick={handleMarkAllRead}
          disabled={items.length === 0}
        >
          <span className={notificationItemStyles.mobileText}>
            {" "}
            Marcar todas como leídas
          </span>
          <span className={notificationItemStyles.desktopText}>
            {" "}
            Marcar todas como leídas
          </span>
        </Button>
      </div>

      {items.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        <div className={listClassName}>
          {items.map((n) => (
            <ItemComponent key={n.id} n={n} />
          ))}
        </div>
      )}
      {pages > page && (
        <button
          className={notificationItemStyles.buttonPrimary}
          disabled={loading}
          onClick={handleMore}
        >
          {loading ? "Cargando…" : "Mostrar más notificaciones"}
        </button>
      )}
    </div>
  );
}
