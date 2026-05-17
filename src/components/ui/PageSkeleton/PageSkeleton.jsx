import { Skeleton } from "@/components/ui";
import styles from "./PageSkeleton.module.scss";

export default function PageSkeleton({
  variant = "default", // 'default', 'messages', 'communities', 'communities-with-aside', 'contacts', 'contacts-with-aside', 'contact-suggestions', 'notifications'
  className = "",
}) {
  const renderSkeleton = () => {
    switch (variant) {
      case "messages":
        return (
          <div className={styles.apiaChatsMessages}>
            <div
              className={
                styles.apiaChatRoomsMessagesSection + " container-padding"
              }
            >
              <div className={styles.apiaChatTitleHeader}>
                <Skeleton width="150px" height="24px" />
                <Skeleton variant="circular" width="25px" height="25px" />
              </div>

              <div className={styles.apiaChatRoomsMessagesFilesHolder}>
                {/* Chat Rooms */}
                <div className={styles.apiaChatRooms}>
                  <div className={styles.roleGroupsTabButtons}>
                    <Skeleton width="80px" height="32px" />
                    <div className={styles.tabButtonsVerticalDivider}></div>
                    <Skeleton width="80px" height="32px" />
                  </div>

                  <div className={styles.apiaChatRoomsList}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className={styles.chatRoomButton}>
                        <div className={styles.roomAvatarUsername}>
                          <Skeleton
                            variant="circular"
                            width="40px"
                            height="40px"
                          />
                          <div className={styles.usernameLastMessage}>
                            <Skeleton width="120px" height="16px" />
                            <Skeleton width="100px" height="14px" />
                          </div>
                        </div>
                        <div className={styles.roomLastTimeUnreadMessage}>
                          <Skeleton width="40px" height="12px" />
                          <Skeleton
                            variant="circular"
                            width="14px"
                            height="14px"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages Area */}
                <div className={styles.apiaChatRoomMessages}>
                  <div className={styles.roomMessagesBubble}>
                    <div className={styles.messagesBubbleHeader}>
                      <div className={styles.bubbleHeaderUser}>
                        <Skeleton
                          variant="circular"
                          width="40px"
                          height="40px"
                        />
                        <div className={styles.headerUserProfile}>
                          <Skeleton width="120px" height="16px" />
                        </div>
                      </div>
                    </div>

                    <div className={styles.messagesBubbleBody}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={styles.messageBubble}>
                          <Skeleton width="200px" height="40px" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.roomMessageSendForm}>
                    <div className={styles.messageSendInputSubmit}>
                      <div className={styles.inputAttachFile}>
                        <Skeleton width="100%" height="48px" />
                      </div>
                      <Skeleton width="177px" height="48px" />
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                <div className={styles.apiaChatRoomFiles}>
                  <div className={styles.chatFilesHeader}>
                    <Skeleton width="100px" height="22px" />
                  </div>

                  <div className={styles.chatFilesList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className={styles.chatFile}>
                        <div className={styles.fileInfo}>
                          <Skeleton width="24px" height="24px" />
                          <div className={styles.fileNameWeight}>
                            <Skeleton width="100px" height="16px" />
                            <Skeleton width="60px" height="12px" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "communities":
        return (
          <div className={styles.communitiesContainer}>
            <div className={styles.desktopView}>
              <div className={styles.containerCards}>
                <div className={styles.title}>
                  <Skeleton width="150px" height="28px" />
                </div>
                <div className={styles.communitiesGrid}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={styles.communityCard}>
                      <div className={styles.communityHeader}>
                        <Skeleton
                          variant="circular"
                          width="60px"
                          height="60px"
                        />
                        <div className={styles.communityInfo}>
                          <Skeleton width="120px" height="18px" />
                          <Skeleton width="80px" height="14px" />
                          <Skeleton width="100px" height="12px" />
                        </div>
                      </div>
                      <Skeleton width="100%" height="60px" />
                      <div className={styles.communityActions}>
                        <Skeleton width="80px" height="32px" />
                        <Skeleton width="60px" height="32px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile view skeleton */}
            <div className={styles.mobileView}>
              <Skeleton width="100%" height="50px" />
            </div>
          </div>
        );

      case "contacts":
        return (
          <div className={styles.contactsContainer}>
            <div className={styles.contactsList}>
              <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                  <Skeleton width="100%" height="44px" borderRadius="8px" />
                </div>
              </div>

              <div className={styles.contactsGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={styles.contactCard}>
                    <div className={styles.contactHeader}>
                      <Skeleton variant="circular" width="48px" height="48px" />
                      <div className={styles.contactInfo}>
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="80px" height="14px" />
                      </div>
                    </div>
                    <div className={styles.contactActions}>
                      <Skeleton width="60px" height="28px" />
                      <Skeleton width="60px" height="28px" />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.loadMore}>
                <Skeleton width="140px" height="32px" />
              </div>
            </div>
          </div>
        );

      case "contacts-with-aside":
        return (
          <div className={styles.redLayoutContainer + " container-padding"}>
            <div className={styles.redAside}>
              <div className={styles.redAsideHeader}>
                <div className={styles.redAsideTitle}>
                  <Skeleton width="80px" height="20px" />
                  <Skeleton variant="circular" width="30px" height="30px" />
                </div>
              </div>
              <div className={styles.redAsideNav}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.redAsideNavItem}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="20px" height="20px" variant="circular" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.redMain}>
              <div className={styles.contactsList}>
                <div className={styles.searchContainer}>
                  <div className={styles.searchBar}>
                    <Skeleton width="100%" height="44px" borderRadius="8px" />
                  </div>
                </div>

                <div className={styles.contactsGrid}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={styles.contactCard}>
                      <div className={styles.contactHeader}>
                        <Skeleton
                          variant="circular"
                          width="48px"
                          height="48px"
                        />
                        <div className={styles.contactInfo}>
                          <Skeleton width="120px" height="16px" />
                          <Skeleton width="80px" height="14px" />
                        </div>
                      </div>
                      <div className={styles.contactActions}>
                        <Skeleton width="60px" height="28px" />
                        <Skeleton width="60px" height="28px" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.loadMore}>
                  <Skeleton width="140px" height="32px" />
                </div>
              </div>
            </div>
          </div>
        );

      case "contact-suggestions":
        return (
          <div className={styles.contactsContainer}>
            <div className={styles.contactsList}>
              <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                  <Skeleton width="100%" height="44px" borderRadius="8px" />
                </div>
              </div>

              <div className={styles.contactSuggestionsGrid}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={styles.contactSuggestionCard}>
                    {/* Desktop Layout Skeleton */}
                    <div className={styles.desktopLayout}>
                      <div className={styles.bannerContainer}>
                        <Skeleton width="100%" height="120px" />
                        <div className={styles.profilePictureContainer}>
                          <Skeleton
                            variant="circular"
                            width="80px"
                            height="80px"
                          />
                        </div>
                      </div>

                      <div className={styles.desktopContent}>
                        <div className={styles.contactInfo}>
                          <Skeleton width="140px" height="20px" />
                          <Skeleton width="80px" height="14px" />
                        </div>

                        <div className={styles.desktopActions}>
                          <Skeleton width="120px" height="36px" />
                          <Skeleton width="140px" height="36px" />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout Skeleton */}
                    <div className={styles.mobileLayout}>
                      <div className={styles.mobileContactInfoContainer}>
                        <div className={styles.mobileProfilePicture}>
                          <Skeleton
                            variant="circular"
                            width="64px"
                            height="64px"
                          />
                        </div>
                        <div className={styles.mobileContactInfo}>
                          <Skeleton width="120px" height="18px" />
                          <Skeleton width="70px" height="14px" />
                        </div>
                      </div>

                      <div className={styles.mobileContent}>
                        <div className={styles.mobileActions}>
                          <Skeleton width="100%" height="36px" />
                          <Skeleton width="100%" height="36px" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.loadMore}>
                <Skeleton width="160px" height="32px" />
              </div>
            </div>
          </div>
        );

      case "communities-with-aside":
        return (
          <div
            className={styles.communitiesLayoutContainer + " container-padding"}
          >
            <div className={styles.redAside}>
              <div className={styles.redAsideHeader}>
                <div className={styles.redAsideTitle}>
                  <Skeleton width="80px" height="20px" />
                </div>
              </div>
              <div className={styles.redAsideNav}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.redAsideNavItem}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="20px" height="20px" variant="circular" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.communitiesMain}>
              <div className={styles.desktopView}>
                <div className={styles.containerCards}>
                  <div className={styles.title}>
                    <Skeleton width="150px" height="28px" />
                  </div>
                  <div className={styles.communitiesGrid}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className={styles.communityCard}>
                        <div className={styles.communityHeader}>
                          <Skeleton
                            variant="circular"
                            width="60px"
                            height="60px"
                          />
                          <div className={styles.communityInfo}>
                            <Skeleton width="120px" height="18px" />
                            <Skeleton width="80px" height="14px" />
                            <Skeleton width="100px" height="12px" />
                          </div>
                        </div>
                        <Skeleton width="100%" height="60px" />
                        <div className={styles.communityActions}>
                          <Skeleton width="80px" height="32px" />
                          <Skeleton width="60px" height="32px" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.mobileView}>
                {/* Mobile Header with Title */}
                <div className={styles.mobileHeaderSkeleton}>
                  <div className={styles.mobileTitleSkeleton}>
                    <Skeleton width="140px" height="24px" />
                  </div>
                </div>

                {/* Mobile Navigation Tabs */}
                <div className={styles.mobileTabsSkeleton}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={styles.mobileTabSkeleton}>
                      <Skeleton width="60px" height="14px" />
                    </div>
                  ))}
                </div>

                {/* Mobile Content Skeleton */}
                <div className={styles.mobileContentSkeleton}>
                  <div className={styles.mobileDropdownSkeleton}>
                    <div className={styles.mobileDropdownHeader}>
                      <Skeleton width="120px" height="18px" />
                      <Skeleton width="24px" height="24px" variant="circular" />
                    </div>
                    <div className={styles.mobileDropdownContent}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className={styles.mobileCommunityItem}>
                          <div className={styles.mobileCommunityHeader}>
                            <Skeleton
                              variant="circular"
                              width="48px"
                              height="48px"
                            />
                            <div className={styles.mobileCommunityInfo}>
                              <Skeleton width="100px" height="16px" />
                              <Skeleton width="80px" height="14px" />
                            </div>
                          </div>
                          <Skeleton width="100%" height="40px" />
                          <div className={styles.mobileCommunityActions}>
                            <Skeleton width="60px" height="28px" />
                            <Skeleton width="50px" height="28px" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "communities-layout":
        return (
          <div className={styles.communitiesLayoutGrid}>
            {/* Left Aside - Navigation */}
            <div className={styles.communitiesLeftColumn}>
              <div className={styles.communitiesAsideHeader}>
                <div className={styles.communitiesAsideTitle}>
                  <Skeleton width="100px" height="20px" />
                  <Skeleton variant="circular" width="24px" height="24px" />
                </div>
              </div>
              <div className={styles.communitiesAsideNav}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={styles.communitiesAsideNavItem}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="16px" height="16px" variant="circular" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content - Communities List */}
            <div className={styles.communitiesMainColumn}>
              <div className={styles.communitiesContent}>
                <div className={styles.communitiesTitle}>
                  <Skeleton width="150px" height="24px" />
                </div>
                <div className={styles.communitiesList}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={styles.communityCardSkeleton}>
                      <div className={styles.communityCardHeader}>
                        <Skeleton
                          variant="circular"
                          width="48px"
                          height="48px"
                        />
                        <div className={styles.communityCardInfo}>
                          <Skeleton width="120px" height="16px" />
                          <Skeleton width="80px" height="14px" />
                          <Skeleton width="100px" height="12px" />
                        </div>
                      </div>
                      <Skeleton width="100%" height="40px" />
                      <div className={styles.communityCardActions}>
                        <Skeleton width="70px" height="28px" />
                        <Skeleton width="50px" height="28px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className={styles.notificationsContainer + " container-padding"}>
            {/* Mobile title skeleton */}
            <div className={styles.mobileTitle}>
              <Skeleton width="200px" height="32px" />
            </div>

            {/* Main grid container */}
            <div className={styles.container}>
              {/* Left sidebar - UserProfile + Settings card */}
              <div className={styles.leftSidebar}>
                {/* UserProfile skeleton */}
                <div className={styles.userCard}>
                  <div className={styles.userHeader}>
                    <Skeleton width="100%" height="80px" />
                    <div className={styles.profileContainer}>
                      <Skeleton variant="circular" width="80px" height="80px" />
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="80px" height="14px" />
                    <div className={styles.publicaciones}>
                      <Skeleton width="100px" height="14px" />
                    </div>
                  </div>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <Skeleton width="60px" height="14px" />
                      <Skeleton width="30px" height="14px" />
                    </div>
                    <div className={styles.stat}>
                      <Skeleton width="60px" height="14px" />
                      <Skeleton width="30px" height="14px" />
                    </div>
                    <div className={styles.stat}>
                      <Skeleton width="60px" height="14px" />
                      <Skeleton width="30px" height="14px" />
                    </div>
                  </div>
                </div>

                {/* Settings card skeleton */}
                <div className={styles.settingsCard}>
                  <Skeleton width="160px" height="20px" />
                  <div style={{ marginTop: "8px" }}>
                    <Skeleton width="140px" height="16px" />
                  </div>
                </div>
              </div>

              {/* Main content - Notifications list */}
              <div className={styles.mainContent}>
                {/* Mobile settings card skeleton */}
                <div className={styles.mobileSettingsCard}>
                  <Skeleton width="180px" height="16px" />
                  <Skeleton variant="circular" width="20px" height="20px" />
                </div>

                {/* Action buttons skeleton */}
                <div className={styles.buttonContainers}>
                  <Skeleton width="200px" height="32px" />
                  <Skeleton width="180px" height="32px" />
                </div>

                {/* Notifications list */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={styles.notificationItem}>
                    <div className={styles.notificationHeader}>
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className={styles.notificationInfo}>
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="80px" height="14px" />
                      </div>
                      <Skeleton width="60px" height="12px" />
                    </div>
                    <div className={styles.notificationContent}>
                      <Skeleton width="100%" height="14px" />
                      <Skeleton width="70%" height="14px" />
                    </div>
                    <div className={styles.notificationActions}>
                      <Skeleton width="60px" height="28px" />
                      <Skeleton width="60px" height="28px" />
                    </div>
                  </div>
                ))}

                {/* Load more button skeleton */}
                <Skeleton width="100%" height="40px" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.defaultContainer}>
            <Skeleton width="100%" height="400px" />
          </div>
        );
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>{renderSkeleton()}</div>
  );
}
