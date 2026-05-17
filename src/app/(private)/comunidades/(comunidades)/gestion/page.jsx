import { Suspense } from "react";
import { getMyCommunities, getMyProfile } from "@/actions";
import {
  getRequestInvitesOfMyCommunity,
  getSendInvitesOfMyCommunity,
} from "@/actions";
import { CardComunnity } from "@/components/comunidades/connections/cardComunnity/CardCommunity";
import { CommunityEmpty } from "@/components/comunidades/connections/communityEmpty/CommunityEmpty";
import { CardInvitation } from "@/components/comunidades/connections/cardInvitation/CardInvitation";
import { ResponsiveDropdown } from "@/components/comunidades/connections/ResposiveDropdown/ResposiveDropdown";
import styles from "@/styles/pages/comunidad/gestion.module.scss";
import { PageSkeleton } from '@/components/ui';

async function GestionContent({ searchParams }) {
  const tab = (await searchParams)?.tab || "comunidades";  

  // Datos de comunidades
  const { data } = await getMyCommunities();
  const communitiesCreator = data.filter((el) => el.role === "creator");

  // Datos de invitaciones
  const { data: adminRecibidas } = await getRequestInvitesOfMyCommunity();
  const { data: adminEnviadas } = await getSendInvitesOfMyCommunity();
  const adminRecibidasData = adminRecibidas || [];
  const adminEnviadasData = adminEnviadas || [];
  const adminRecibidasFiltradas =
    adminRecibidasData[0]?.requests?.filter((el) => el.status === "pending") || [];

  const adminEnviadasFiltradas =
    adminEnviadasData?.filter((el) => el.status === "pending") || [];
  return (
    <div className={styles.container}>
      {/* Vista Desktop */}
      <div className={styles.desktopView}>
        {tab === "comunidades" && (
          <div className={styles.containerCards}>
            <div className={styles.title}>
              <p>Tus comunidades</p>
            </div>
            {communitiesCreator.length > 0 ? (
              communitiesCreator.map((el, index) => (
                <CardComunnity
                  id={el.community.id}
                  title={el.community.name}
                  members={el.community.membersCount}
                  description={el.community.bio}
                  photoProfile={el.community.avatarUrl}
                  url={`/comunidades/${el.community.id}`}
                  variant={"community-admin"}
                  key={index}
                />
              ))
            ) : (
              <CommunityEmpty title={"No tienes comunidades creadas aún"} />
            )}
          </div>
        )}

        {tab === "invitaciones" && (
          <div className={styles.containerDivCards}>
            {/* Sección de Invitaciones Recibidas */}
            <div className={styles.containerCards}>
              <div className={styles.title}>
                <p>Recibidas</p>
              </div>
              {adminRecibidasFiltradas.length > 0 ? (
                adminRecibidasFiltradas.map((el, index) => (
                  <CardInvitation
                    id={el.id}
                    title={el.author.displayName}
                    description={el.message || ""}
                    photoProfile={el.author?.avatarUrl}
                    variant={"administrador"}
                    type={"request"}
                    isAdmin={true}
                    key={index}
                    warningText={el.wasRemoved ? "Usuario eliminado anteriormente" : null}
                  />
                ))
              ) : (
                <CommunityEmpty title={"No tienes invitaciones pendientes"} />
              )}
            </div>

            {/* Sección de Invitaciones Enviadas */}
            <div className={styles.containerCards}>
              <div className={styles.title}>
                <p>Enviadas</p>
              </div>
              {adminEnviadasFiltradas.length > 0 ? (
                adminEnviadasFiltradas.map((el, index) => (
                  <CardInvitation
                    id={el.id}
                    title={el.user?.displayName || el.invitee?.firstName + " " + (el.invitee?.lastName ?? "")}
                    description={el.message || ""}
                    photoProfile={el.user?.avatarUrl || el.invitee?.avatarUrl}
                    variant={"administrador"}
                    type={"send"}
                    isAdmin={true}
                    key={index}
                  />
                ))
              ) : (
                <CommunityEmpty title={"No tienes invitaciones pendientes"} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vista Mobile */}
      <div className={styles.mobileView}>
        <ResponsiveDropdown
          type="community"
          title="Tus comunidades"
          communities={communitiesCreator}
          count={communitiesCreator.length}
          variant="community-admin"
        />

        <ResponsiveDropdown
          type="invitation"
          title="Solicitudes Recibidas"
          invitations={adminRecibidasFiltradas}
          count={adminRecibidasFiltradas.length}
          variant="administrador"
          invitationType="request"
          isAdmin={true}
        />

        <ResponsiveDropdown
          type="invitation"
          title="Solicitudes Enviadas"
          invitations={adminEnviadasFiltradas}
          count={adminEnviadasFiltradas.length}
          variant="administrador"
          invitationType="send"
          isAdmin={true}
        />
      </div>
    </div>
  );
}

export default function Gestion({ searchParams }) {
  return (
    <Suspense fallback={<PageSkeleton variant="communities" />}>
      <GestionContent searchParams={searchParams} />
    </Suspense>
  );
}
