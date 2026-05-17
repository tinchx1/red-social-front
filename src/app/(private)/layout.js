import {
  FooterMobile,
  NavbarMobile,
  NavbarDesktop,
  Providers,
} from "@/components";
import {
  getAllPosts,
  getMyProfile,
  getProfileStats,
  isAccountBlockedError,
} from "@/actions";
import styles from "@/styles/layout/layout.module.scss";
import JoinNotificationRoom from "@/components/socket/JoinNotificationRoom";
import FloatChat from "@/components/ui/FloatChat";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }) {
  let initialPosts = [];
  let initialPagination = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  };
  let isSuperAdmin = false;
  let profile = null;
  let profileStats = null;

  try {
    const result = await getAllPosts();
    initialPosts = result.data || [];
    initialPagination = result.pagination || initialPagination;
  } catch (error) {
    // Silenciar errores 401 durante SSR - son esperados si no hay token
    if (error.response?.status !== 401) {
      console.error("Error fetching posts:", error);
    }
  }

  // PRIMERO: Verificar si el usuario está suspendido ANTES de cualquier fetch
  try {
    const profileData = await getMyProfile();
    profile = profileData;
    if (profile?.isDeleted || !profile?.isActive) {
      redirect("/?logout=forced");
    }
    // Si llegamos aquí sin error, el usuario está activo
    const roleKey = profile?.roleKey || profile?.user?.roleKey;
    isSuperAdmin = roleKey === "super_admin";
  } catch (error) {
    // Si el usuario está suspendido o eliminado, redirigir inmediatamente SIN renderizar nada
    if (await isAccountBlockedError(error)) {
      console.log("User blocked during SSR, redirecting...");
      redirect("/?logout=forced");
    }
    // Si hay otro error, continuar sin perfil (navbar fallback to client)
    console.error("Error fetching profile data:", error);
  }

  // SEGUNDO: Solo si el usuario está activo, obtener posts y stats
  if (profile) {
    try {
      // Intentar obtener posts
      const postsResult = await getAllPosts();
      initialPosts = postsResult.data || [];
      initialPagination = postsResult.pagination || initialPagination;
    } catch (error) {
      // Si es error de suspensión, no mostrar posts (esperado)
      if (await isAccountBlockedError(error)) {
        console.log("User blocked, skipping posts fetch");
        initialPosts = [];
        initialPagination = { page: 1, limit: 10, total: 0, pages: 0 };
      } else {
        // Silenciar otros errores durante SSR
        console.error("Error fetching posts:", error);
      }
    }

    try {
      // Intentar obtener stats del perfil
      profileStats = await getProfileStats();
    } catch (error) {
      // Si es error de suspensión, no mostrar stats (esperado)
      if (await isAccountBlockedError(error)) {
        console.log("User blocked, skipping profile stats fetch");
        profileStats = null;
      } else {
        // Silenciar otros errores durante SSR
        console.error("Error fetching profile stats:", error);
      }
    }
  }

  return (
    <Providers
      initialPlan={profile?.subscription}
      initialPosts={initialPosts}
      initialPagination={initialPagination}
      initialProfile={profile}
      initialProfileStats={profileStats}
    >
      <JoinNotificationRoom />
      <header className={styles.header}>
        <NavbarMobile isSuperAdmin={isSuperAdmin} />
        <NavbarDesktop isSuperAdmin={isSuperAdmin} />
      </header>
      <main>
        {/* <Suspense fallback={<PrivatePageSkeleton />}> */}
        {children}
        {/* </Suspense> */}
      </main>
      <FloatChat />
      <FooterMobile isSuperAdmin={isSuperAdmin} />
    </Providers>
  );
}
