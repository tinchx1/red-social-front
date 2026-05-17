"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./CommunityInfo.module.scss";
import Button from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui";
import buttonEditar from "@/assets/buttonEditar.svg?url";
import close from "@/assets/close.svg?url";
import { updateCommunity } from "@/actions/community/communities";
import CommunityContactStatusButton from "@/components/comunidades/profile/ContactStatusButton/ContactStatusButton";
import ProfileMediaHeader from "@/components/perfil/ProfileMediaHeader/ProfileMediaHeader";
import { INTEREST_SECTORS } from "@/constants/sectors";

/**
 * @param {{ 
 *   community: any; 
 *   isOwner: boolean;
 *   membershipStatus?: { status: string; canLeave?: boolean; canRequest?: boolean };
 *   clickable?: boolean;
 * }} props
 */
export default function CommunityInfo({ community, isOwner, membershipStatus, clickable = false }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(community?.name || '');
  const [selectedSector, setSelectedSector] = useState(community?.sector || '');

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const payload = {
        name: name?.trim() || undefined,
        sector: selectedSector?.trim() || undefined
      };

      // Remove empty values
      const cleanPayload = Object.entries(payload).reduce((acc, [k, v]) => {
        if (v === null || v === undefined) return acc;
        if (typeof v === 'string' && v.trim() === '') return acc;
        return { ...acc, [k]: v };
      }, {});

      const result = await updateCommunity(community.id, cleanPayload);
      setIsEditing(false);
      
      // Optionally refresh the page or show success message
      // The page will re-render with updated data on next navigation
    } catch (error) {
      console.error('Error updating community:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedSector(community?.sector || '');
    setName(community?.name || '');
    setIsEditing(false);
  };

  const handleClick = () => {
    if (clickable && community?.id) {
      router.push(`/comunidades/${community.id}`);
    }
  };

  const content = (
    <div className={styles.infoContainer}>
      {/* Header media (banner + avatar) integrated to keep it one single block */}
      <ProfileMediaHeader
        initialAvatarUrl={community?.avatarUrl}
        initialBannerUrl={community?.bannerUrl}
        editable={isOwner}
        updateAvatarPath={`/communities/${community?.id}/avatar`}
        updateBannerPath={`/communities/${community?.id}/banner`}
      />

      <div className={`${styles.content} ${isEditing ? styles.isEditing : ''}`}>
        {/* Action buttons positioned at top right */}
        {isOwner && (
          <div className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
            {!isEditing ? (
              <Image 
                src={buttonEditar} 
                alt="Editar" 
                width={20} 
                height={20} 
                onClick={handleEditToggle}
                className={styles.editIcon}
              />
            ) : (
              <div className={styles.editButtons}>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  rounded="medium"
                >
                  {isLoading ? <>Guardando <Spinner color="white" size="small" /></> : 'Guardar cambios'}
                </Button>
                <Image 
                  src={close} 
                  alt="Cancelar" 
                  width={20} 
                  height={20} 
                  onClick={handleCancelEdit}
                  className={styles.cancelIcon}
                />
              </div>
            )}
          </div>
        )}

        <div className={styles.header}>
          <h1>{name || 'Comunidad'}</h1>
        </div>

        <div className={styles.contactInfo}>
          {isEditing ? (
            <>
              <div className={styles.contactRow}>
                <span className={styles.contactLabel}>Nombre</span>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.contactInput}
                    placeholder="Nombre de la comunidad"
                    maxLength={50}
                    />
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactLabel}>Sector</span>
                <div className={styles.inputGroup}>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className={styles.contactInput}
                  >
                    <option value="">Seleccionar sector</option>
                    {INTEREST_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.contactRow}>
                
                <span className={styles.contactLabel}>Sector</span>
                <span>{selectedSector || 'No especificado'}</span>
              </div>
              <div className={styles.contactRowAround}>
                <div className={styles.contactRow}>
                <span className={styles.contactLabel}>Participantes</span>
                <span>{community?.participantsCount ?? 0}</span>
                </div>
              {!isOwner && (
                <div className={styles.contactRowItem} onClick={(e) => e.stopPropagation()}>
                  <CommunityContactStatusButton communityId={community?.id} initialStatus={membershipStatus?.status} clickable={clickable} />
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (clickable) {
    return (
      <div 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}