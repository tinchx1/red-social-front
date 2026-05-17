import styles from "@/styles/pages/not-found.module.scss";
import layoutStyles from "@/styles/layout/layout.module.scss";
import { FooterMobile, NavbarMobile, NavbarDesktop, Providers } from "@/components";
import JoinNotificationRoom from "@/components/socket/JoinNotificationRoom";
import FloatChat from "@/components/ui/FloatChat";
import { getMyProfile } from "@/actions";
import { redirect } from "next/navigation";
import NotFoundView from "@/components/ui/NotFound/NotFound";

export default async function NotFound() {

  let isAuthenticated = false;
  let isSuperAdmin = false;
  let profile = null;

  try {
    profile = await getMyProfile();
    const roleKey = profile?.roleKey || profile?.user?.roleKey;
    isSuperAdmin = roleKey === "super_admin";
    isAuthenticated = Boolean(profile);
  } catch (error) {
    
  }

  const initialPosts = [];
  const initialPagination = { page: 1, limit: 10, total: 0, pages: 0 };

  if (!isAuthenticated) redirect("/");


  return (
    <Providers
      initialPlan={profile?.subscription}
      initialPosts={initialPosts}
      initialPagination={initialPagination}
    >
      <JoinNotificationRoom />
      <header className={layoutStyles.header}>
        <NavbarMobile isSuperAdmin={isSuperAdmin} />
        <NavbarDesktop isSuperAdmin={isSuperAdmin} />
      </header>
      <main className={styles.main}>
        <NotFoundView />
      </main>
      <FloatChat />
      <FooterMobile isSuperAdmin={isSuperAdmin} />
    </Providers>
  );
}