import React from "react";
import "@/styles/pages/perfil.scss";
import {
  InformacionPerfilSimple,
  Publicaciones,
  ResumenPerfilSimple,
  AlertaAnuncio,
  VolverButton,
  AdminActions,
  ProfileSkeletonSimple,
} from "@/components";
import {
  getUserProfile,
  getUserPosts,
  getMyProfile,
  getContactStatus,
} from "@/actions";
import { notFound, redirect } from "next/navigation";

export default async function UserProfilePage({ params }) {
  const { id: userId } = await params;
  let userProfile = null;
  let userPosts = null;
  let contactStatus = null;
  let errorMessage = null;

  // Get current user profile to check if it's the same user
  let currentUser = null;
  try {
    currentUser = await getMyProfile();
  } catch (error) {
    // If we can't get current user, continue without redirect
    console.log("Could not get current user:", error);
  }

  // If the current profile is the same as the logged-in user, redirect to /perfil
  if (currentUser && currentUser.id === userId) {
    redirect("/perfil");
  }

  try {
    // Get user profile by ID
    userProfile = await getUserProfile(userId);
    userPosts = await getUserPosts(userId);
    // Get contact status if current user exists
    if (currentUser) {
      try {
        contactStatus = await getContactStatus(userId);
        if (currentUser.roleKey === "super_admin") {
          contactStatus = null;
        }
      } catch (contactError) {
        // Contact status is optional, don't fail the whole page
        contactStatus = { status: "none" };
      }
    }
  } catch (error) {
    console.log(error, "error");
    errorMessage = error?.message || "Error al cargar el perfil del usuario";
  }

  if (errorMessage) {
    notFound();
  }

  if (!userProfile) {
    notFound();
  }

  // Transform backend data to component format
  const profile = {
    avatar: userProfile.avatarUrl,
    banner: userProfile.bannerUrl,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    verified: userProfile.emailVerified,
    roleKey: userProfile.roleKey,
    description:
      userProfile.roleKey === "persona"
        ? [userProfile.profile?.industry, userProfile.profile?.company]
            .filter(Boolean)
            .join(" - ")
        : userProfile.profile?.industry || "",
    address: userProfile.profile?.address || "",
    city: userProfile.profile?.city || "",
    province: userProfile.profile?.province || "",
    phone: userProfile.phone,
    email: userProfile.email,
    website: userProfile.profile?.websiteUrl || userProfile.websiteUrl || null,
    linkedin:
      userProfile.profile?.linkedinUrl || userProfile.linkedinUrl || null,
    sectors: userProfile.profile?.sectors || [],
    industrialSectors: userProfile.profile?.industrialSectors || [],
    contactsCount: userProfile.contactsCount || 0,
  };
  return (
    <div className="perfil-container-simple">
      <div className="aside-mobile">
        <VolverButton variant="light-blue" />
      </div>
      <div className="perfil-main">
        <InformacionPerfilSimple
          profile={profile}
          contactStatus={contactStatus}
          userId={userId}
        />
        <ResumenPerfilSimple summary={userProfile.bio} />
        {userPosts && userPosts.length > 0 && (
          <Publicaciones posts={userPosts} userId={userProfile.id} />
        )}
      </div>
      {currentUser.roleKey === "super_admin" && (
        <div className="aside-mobile">
          <AdminActions user={userProfile} />
        </div>
      )}
    </div>
  );
}
