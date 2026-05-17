import {
  UserProfile,
  Footer,
  ResumenPerfilPublications,
  VolverButton,
  PublicationsList,
} from "@/components";
import styles from "@/styles/pages/user-publications.module.scss";
import { getUserPosts, getMyProfile } from "@/actions";
import { notFound } from "next/navigation";

export default async function UserPublicationsPage({ params }) {
  const { id: userId } = await params;
  let userProfile = null;
  let userPosts = null;
  let errorMessage = null;

  try {
    userPosts = await getUserPosts(userId, 1, 6); // Load first 6 posts
    userProfile = await getMyProfile();

    // Normalize the posts data structure to match what PostCard expects
    if (userPosts) {
      userPosts = userPosts.map((post) => ({
        ...post,
        // Use reactions array length if likes count is inconsistent
        likes:
          post.likes ||
          post.likesCount ||
          post.reactionsCount ||
          post.reactions?.length ||
          0,
        userReaction:
          post.userReaction ||
          post.hasLiked ||
          post.reactions?.length > 0 ||
          false,
      }));
    }
  } catch (error) {
    errorMessage =
      error?.message || "Error al cargar las publicaciones del usuario";
  }

  if (errorMessage) {
    return notFound();
  }

  if (!userPosts || !userPosts.length) {
    notFound();
  }

  return (
    <div className={styles.container + " container-padding"}>
      <div className={styles.leftSidebar}>
        <VolverButton className={styles.volverButton} />
        <div className={styles.hideTablet}>
          <UserProfile showInMobile={true} />
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.feedContainer}>
          <PublicationsList
            userId={userId}
            initialPosts={userPosts}
            postsPerPage={6}
          />
        </div>
      </div>
      <div className={styles.rightSidebar}>
        <ResumenPerfilPublications
          summary={userProfile.bio}
          style={{ marginTop: "41px" }}
        />
        <Footer />
      </div>
    </div>
  );
}
