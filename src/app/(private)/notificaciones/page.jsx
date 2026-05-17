import React from "react";
import notificationItemStyles from "@/components/notificaciones/LoadMoreNotifications/LoadMoreNotifications.module.scss";
import { getMyProfile } from "@/actions";
import { getNotifications } from "@/actions/notifications";
import { NotificationItem, UserProfile } from "@/components";
import styles from "@/styles/pages/notificaciones.module.scss";
import Link from "next/link";

import LoadMoreNotifications from "@/components/notificaciones/LoadMoreNotifications/LoadMoreNotifications";

export const revalidate = 0;

async function fetchMore(page) {
  "use server";
  const me = await getMyProfile();
  const res = await getNotifications({ userId: me.id, page, limit: 10 });
  return res;
}

export default async function NotificationsPage() {
  const me = await getMyProfile();
  const first = await getNotifications({ userId: me.id, page: 1, limit: 10 });

  return (
    <div className={styles.container + " container-padding"}>
      <div className={styles.leftSidebar}>
        <UserProfile showContacts />
        <div className={styles.settingsCard}>
          <h4>Gestiona tus notificaciones</h4>
          <Link
            href="/notificaciones/configuracion"
            className={styles.settingsLink}
          >
            Ver configuración
          </Link>
        </div>
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.mobileTitle}>NOTIFICACIONES</h1>
        <LoadMoreNotifications
          initialItems={first.data}
          initialPage={first.pagination.page}
          totalPages={first.pagination.pages}
          onFetchMore={fetchMore}
          listClassName={notificationItemStyles.list}
          ItemComponent={NotificationItem}
        />
      </div>
    </div>
  );
}
