"use client";

import { useState } from "react";
import { Toggle } from "@/components";
import { updateCommunity } from "@/actions";
import styles from "@/styles/pages/Community.module.scss";
import stylesPrivacy from './PrivacyToggle.module.scss';
import { useProfile } from "@/contexts/ProfileContext";
import { canCreatePrivateCommunity } from "@/constants/communityLimits";
import { useToast } from "@/contexts";
import { useCommunityPrivacy } from "@/contexts/CommunityPrivacyContext";
import HelpVIsivility from "../../configuracion/HelpVIsivility/HelpVIsivility";

export function PrivacyToggle({ communityId, isPrivate: initialIsPrivate, isOwner }) {
  const { profile } = useProfile();
  const { setIsPrivate: setPrivacyContext } = useCommunityPrivacy();
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess } = useToast();
  // Solo mostrar el toggle si el usuario puede crear comunidades privadas
  if (!canCreatePrivateCommunity(profile)) {
    return null;
  }

  const handleToggle = async (newState) => {
    if (!isOwner) return;

    setLoading(true);
    setError(null);
    setIsPrivate(newState);
    setPrivacyContext(newState);

    try {
      const visibility = newState ? "private" : "public";
      await updateCommunity(communityId, { visibility });
      showSuccess("Privacidad actualizada correctamente");
    } catch (err) {
      setError(err.message || "Error al actualizar la privacidad de la comunidad");
      setIsPrivate(!newState);
      setPrivacyContext(!newState);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.containerNotifications + " " + stylesPrivacy.containerNotifications}
    >
      <div className={stylesPrivacy.toggleContent}>

        <p className={stylesPrivacy.p}>{isPrivate ? "Comunidad privada" : "Comunidad pública"}</p>
        <Toggle
          checked={isPrivate}
          onChange={handleToggle}
          disabled={loading || !isOwner}
        />
      </div>
      <HelpVIsivility isPrivate={isPrivate} />
      {error && <div style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>{error}</div>}
    </div>
  );
}
