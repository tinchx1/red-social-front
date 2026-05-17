import React from "react";
import "@/styles/pages/perfil.scss";
import {
  InformacionPerfil,
  Publicaciones,
  EditarPerfil,
  ResumenPerfil,
  AlertaAnuncio,
  SuscribiteALaRed,
  PageSkeleton,
  ProfileSkeleton,
} from "@/components";
import { getMyProfile } from "@/actions/profile";
import { getUserPosts } from "@/actions";

export default async function Perfil() {
  let profileData = null;
  let errorMessage = null;
  try {
    profileData = await getMyProfile();
  } catch (error) {
    errorMessage = error?.message || "Error al cargar el perfil";
  }

  if (errorMessage) return <div>Error: {errorMessage}</div>;
  if (!profileData) return <div>No se encontró información del perfil</div>;
  // Transform backend data to component format
  const profile = {
    avatar: profileData.avatarUrl,
    banner: profileData.bannerUrl,
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    verified: profileData.emailVerified,
    roleKey: profileData.roleKey,
    description:
      profileData.roleKey === "persona"
        ? [profileData.profile?.industry, profileData.profile?.company]
            .filter(Boolean)
            .join(" - ")
        : profileData.profile?.industry || "",
    address: profileData.profile?.address || "",
    city: profileData.profile?.city || "",
    province: profileData.profile?.province || "",
    phone: profileData.phone,
    email: profileData.email,
    website: profileData.profile?.websiteUrl || profileData.websiteUrl || null,
    linkedin:
      profileData.profile?.linkedinUrl || profileData.linkedinUrl || null,
    sectors: profileData.profile?.sectors || [],
    industrialSectors: profileData.profile?.industrialSectors || [],
    contactsCount: profileData.contactsCount || 0,
  };
  const publications = await getUserPosts(profileData.id);
  return (
    <div className="perfil-container">
      <div className="perfil-main">
        <InformacionPerfil profile={profile} />
        <div className="only-mobile">
          {profileData.subscription?.key === "free" && <SuscribiteALaRed />}
          <AlertaAnuncio />
        </div>
        <ResumenPerfil summary={profileData.profile?.bio} />
        {publications.length > 0 && (
          <Publicaciones posts={publications} userId={profileData.id} />
        )}
      </div>
      <div className="perfil-sidebar">
        {profileData.subscription?.key === "free" && <SuscribiteALaRed />}
        <EditarPerfil />
        <AlertaAnuncio />
      </div>
    </div>
  );
}
