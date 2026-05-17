"use client";

import { useEffect, useState } from "react";
import { CommunityDropdown } from "@/components/comunidades/connections/communityDropdown/CommunityDropdown";
import { InvitationDropdown } from "@/components/comunidades/connections/invitationDropdown/InvitationDropdown";

export const ResponsiveDropdown = ({
  type, // 'community' o 'invitation'
  title,
  communities,
  invitations,
  count,
  variant,
  isAdmin, // Solo para invitations
  invitationType, // Solo para invitations (renombrado de 'type' para evitar conflicto)
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  if (!isMobile) {
    return null;
  }

  if (type === "community") {
    return (
      <CommunityDropdown title={title} communities={communities} count={count} variant={variant} />
    );
  }

  if (type === "invitation") {
    return (
      <InvitationDropdown
        title={title}
        invitations={invitations}
        count={count}
        variant={variant}
        type={invitationType}
        isAdmin={isAdmin}
      />
    );
  }

  return null;
};
