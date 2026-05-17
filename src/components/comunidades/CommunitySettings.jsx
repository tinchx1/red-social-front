"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";
import { PrivacyToggle, CommunityAddUser } from "@/components/comunidades";
import ImageUpload from "@/assets/file-new.svg";
import styles from "@/styles/pages/Community.module.scss";
import { canAddUsersToCommuni } from "../../constants/communityPermissions";

export default function CommunitySettings({
  communityId,
  isPrivate,
  isOwner,
  creator
}) {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const showAddUserSection = canAddUsersToCommuni(creator);
  if (!isOwner) return null;

  return (
    <div className={styles.showDesktop}>
      <PrivacyToggle
        communityId={communityId}
        isPrivate={isPrivate}
        isOwner={isOwner}
      />
      {showAddUserSection &&
        <>
          <div
            onClick={() => setIsAddUserModalOpen(true)}
            className={styles.containerNotifications}
            style={{ paddingRight: "22px", cursor: "pointer" }}
          >
            <span
              style={
                {
                  fontFamily: 'Roboto',
                  fontWeight: '400',
                  fontStyle: 'Regular',
                  fontSize: '16px',
                  lineHeight: '120%',
                  letterSpacing: '0%',
                }
              }
            >Agregar usuarios
            </span>
            <ImageUpload width={20} height={20} />
          </div>
          <Modal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            showCloseButton
            size="large"
          >
            <CommunityAddUser isModal={true} toggleModal={() => setIsAddUserModalOpen(false)} />
          </Modal>
        </>
      }
    </div>
  );
}
