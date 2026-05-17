import { Suspense } from "react";
import {
  getReceiptInvitesOfSommeCommunity,
  getSendInvitesOfSommeCommunity,
} from "@/actions";
import styles from "/src/styles/pages/comunidad/invitacion.module.scss";
import { CommunityEmpty } from "@/components/comunidades/connections/communityEmpty/CommunityEmpty";
import { CardInvitation } from "@/components/comunidades/connections/cardInvitation/CardInvitation";
import { ResponsiveDropdown } from "@/components/comunidades/connections/ResposiveDropdown/ResposiveDropdown";
import { PageSkeleton } from '@/components/ui';

async function InvitacionesContent({ searchParams }) {
  const { data: usuarioRecibidas } = await getReceiptInvitesOfSommeCommunity();
  const { data: usuarioEnviadas } = await getSendInvitesOfSommeCommunity();

  const usuarioRecibidasData = usuarioRecibidas || [];
  const usuarioEnviadasData = usuarioEnviadas || [];
  const usuarioEnviadasFiltradas = usuarioEnviadasData?.filter((el) => el.status === "pending") || [];
  return (  
    <div className={styles.container}>
      {/* Vista Desktop */}
      <div className={styles.desktopView}>
        <div className={styles.containerDivCards}>
          {/* Sección de Invitaciones Recibidas */}
          <div className={styles.containerCards}>
            <div className={styles.title}>
              <p>Recibidas</p>
            </div>
            {usuarioRecibidasData.length > 0 ? (
              usuarioRecibidasData.map((el, index) => (
                <CardInvitation
                  id={el.id}
                  title={el.community.name}
                  description={el.community.bio || ""}
                  photoProfile={el.community.avatarUrl}
                  variant={"usuario"}
                  type={"request"}
                  isAdmin={false}
                  key={index}
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
            {usuarioEnviadasFiltradas.length > 0 ? (
              usuarioEnviadasFiltradas.map((el, index) => (
                <CardInvitation
                  id={el.id}
                  title={el.community.name}
                  description={el.community.bio || ""}
                  photoProfile={el.community.avatarUrl}
                  variant={"usuario"}
                  type={"send"}
                  isAdmin={false}
                  key={index}
                />
              ))
            ) : (
              <CommunityEmpty title={"No tienes invitaciones pendientes"} />
            )}
          </div>
        </div>
      </div>

      {/* Vista Mobile */}
      <div className={styles.mobileView}>
        <ResponsiveDropdown
          type="invitation"
          title="Recibidas"
          invitations={usuarioRecibidasData}
          count={usuarioRecibidasData.length}
          variant="usuario"
          invitationType="request"
          isAdmin={false}
        />

        <ResponsiveDropdown
          type="invitation"
          title="Enviadas"
          invitations={usuarioEnviadasFiltradas}
          count={usuarioEnviadasFiltradas.length}
          variant="usuario"
          invitationType="send"
          isAdmin={false}
        />
      </div>
    </div>
  );
}

export default function Invitaciones({ searchParams }) {
  return (
    <Suspense fallback={<PageSkeleton variant="communities" />}>
      <InvitacionesContent searchParams={searchParams} />
    </Suspense>
  );
}
