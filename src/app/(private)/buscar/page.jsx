import SearchListCard from "@/components/search/SearchCard/SearchListCard";
import SearchNavigation from "@/components/search/SearchNavigation/SearchNavigation";
import NoResultsFound from "@/components/search/NoResultsFound/NoResultsFound";
import { InformacionPerfilSimple } from "@/components";
import CommunityInfo from "@/components/comunidades/profile/CommunityInfo/CommunityInfo";
import styles from "@/styles/pages/Search.module.scss";
import {
  getCommunityById,
  getCommunityMembershipStatusServer,
} from "@/actions/community/communities";
import { getUserProfile } from "@/actions/profile/profile";
import { getSearchResults } from "@/actions/search";
import { Footer } from "@/components";
import { getContactSuggestions } from "@/actions/contacts";
import { getMyProfile, getContactStatus } from "@/actions";
import { redirect } from "next/navigation";

export default async function SearchPage({ searchParams }) {
  const { keyword, type, ref } = await searchParams;

  let data = null;
  let title = "Personas";
  let typeLabel = "personas";
  let items = [];
  let itemActionText = "Seguir";
  let searchResults = { data: [], summary: { total: 0 } };
  let contactStatus = null;
  let currentUser = null;
  let membershipStatus = null;

  // Get current user profile first to check for redirect
  if (type && ref && type !== "community") {
    try {
      currentUser = await getMyProfile();
      // If the current profile is the same as the logged-in user, redirect to /perfil
      if (currentUser && currentUser.id === ref) {
        redirect("/perfil");
      }
    } catch (error) {
      // Check if it's a redirect error and re-throw it
      if (error.message === "NEXT_REDIRECT") {
        throw error;
      }
      console.log("Could not get current user:", error);
    }
  }
  // Fetch search suggestions if keyword exists
  if (keyword) {
    try {
      searchResults = await getSearchResults(keyword);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    }
  }

  if (type && ref) {
    try {
      if (type === "community") {
        // Fetch community data
        data = await getCommunityById(ref);
        title = "Comunidad";
        typeLabel = "comunidad";
        itemActionText = "Unirse";

        // Get current user and membership status for community
        try {
          currentUser = await getMyProfile();
          membershipStatus = await getCommunityMembershipStatusServer(ref);
        } catch (error) {
          console.log(
            "Could not get current user or membership status:",
            error
          );
        }

        // Transform community data to items format (fallback for non-CommunityInfo usage)
        if (data) {
          items = [
            {
              id: data.id,
              avatarUrl: data.avatar_url || "/images/profile.svg",
              name: data.name,
              subtitle: data.description,
              metaText: `${data.members_count || 0} participantes`,
            },
          ];
        }
      } else {
        // Fetch user profile data
        data = await getUserProfile(ref);
        title = "Persona";
        typeLabel = "persona";

        // Get contact status if current user exists
        if (currentUser) {
          try {
            contactStatus = await getContactStatus(ref);
          } catch (contactError) {
            contactStatus = { status: "none" };
          }
        }

        // Transform user data to items format
        if (data) {
          items = [
            {
              id: data.id,
              avatarUrl: data.avatarUrl || "/images/profile.svg",
              name: data.name || data.username,
              subtitle: data.bio || data.profession,
              metaText: `${data.followers_count || 0} seguidores`,
            },
          ];
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Keep default empty items on error
    }
  }
  // Transform data to SearchListCard format
  const transformPeopleData = (people) => {
    return people.map((person) => ({
      id: person.id,
      avatarUrl: person.avatarUrl || "/images/profile.svg",
      name: `${person.firstName} ${person.lastName || ""}`.trim(),
      subtitle: `${person.industry} - ${person.city}, ${person.province}`,
      metaText: person.company ? `${person.contactsCount} contactos` : null,
      contactStatus: person.connectionStatus || null,
    }));
  };

  const transformCompaniesData = (companies) => {
    return companies.map((company) => {
      const location = [company.locality, company.province]
        .filter((p) => p && p !== "null")
        .join(", ");
      const subtitle = [company.industry, location].filter(Boolean).join(" - ");
      return {
        id: company.id,
        avatarUrl: company.avatarUrl || "/images/profile.svg",
        name: company.firstName,
        subtitle: subtitle || null,
        metaText: company.phone ? `${company.contactsCount} contactos` : null,
        contactStatus: company.connectionStatus || null,
      };
    });
  };

  const transformIndustrialParksData = (parks) => {
    return parks.map((park) => {
      const location = [park.locality, park.province]
        .filter((p) => p && p !== "null")
        .join(", ");
      const subtitle = [park.industry, location].filter(Boolean).join(" - ");
      return {
        id: park.id,
        avatarUrl: park.avatarUrl || "/images/profile.svg",
        name: park.firstName,
        subtitle: subtitle || null,
        metaText: park.phone ? `${park.contactsCount} contactos` : null,
        contactStatus: park.connectionStatus || null,
      };
    });
  };

  // Removed: transformPostsData. Posts will be rendered by PostCard directly.

  const transformCommunitiesData = (communities) => {
    return communities.map((community) => ({
      id: community.id,
      avatarUrl: community.avatarUrl || "/images/profile.svg",
      name: community.name,
      subtitle: community.sector,
      metaText: `${community.membersCount} participantes`,
    }));
  };

  // Create search result cards based on summary counts and data
  const createSearchCards = (
    summary,
    data,
    refToFilter = null,
    currentType = null
  ) => {
    const cards = [];
    const filteredSummary = {
      posts: 0,
      people: 0,
      companies: 0,
      industrial_parks: 0,
      communities: 0,
    };

    if (summary.posts > 0 && data.posts) {
      cards.push({
        title: "Publicaciones",
        typeLabel: "publicaciones",
        count: summary.posts,
        // Pass raw posts without transforming
        items: data.posts,
      });
      filteredSummary.posts = summary.posts;
    }

    if (summary.people > 0 && data.people) {
      // Filter out the ref ID from people results if it exists
      const filteredPeople =
        refToFilter && currentType === "persona"
          ? data.people.filter((person) => person.id !== refToFilter)
          : data.people;

      if (filteredPeople.length > 0) {
        cards.push({
          title: "Personas",
          typeLabel: "personas",
          count: filteredPeople.length,
          items: transformPeopleData(filteredPeople),
          itemActionText: "Seguir",
        });
        filteredSummary.people = filteredPeople.length;
      }
    }

    if (summary.companies > 0 && data.companies) {
      // Filter out the ref ID from companies results if it exists
      const filteredCompanies =
        refToFilter && (currentType === "empresa" || currentType === "empresas")
          ? data.companies.filter((company) => company.id !== refToFilter)
          : data.companies;

      if (filteredCompanies.length > 0) {
        cards.push({
          title: "Empresas",
          typeLabel: "empresas",
          count: filteredCompanies.length,
          items: transformCompaniesData(filteredCompanies),
          itemActionText: "Seguir",
        });
        filteredSummary.companies = filteredCompanies.length;
      }
    }

    if (summary.industrial_parks > 0 && data.industrial_parks) {
      // Filter out the ref ID from industrial parks results if it exists
      const filteredParks =
        refToFilter && currentType === "parque_industrial"
          ? data.industrial_parks.filter((park) => park.id !== refToFilter)
          : data.industrial_parks;

      if (filteredParks.length > 0) {
        cards.push({
          title: "Parques Industriales",
          typeLabel: "parques industriales",
          count: filteredParks.length,
          items: transformIndustrialParksData(filteredParks),
          itemActionText: "Seguir",
        });
        filteredSummary.industrial_parks = filteredParks.length;
      }
    }

    if (summary.communities > 0 && data.communities) {
      // Filter out the ref ID from communities results if it exists
      const filteredCommunities =
        refToFilter && currentType === "community"
          ? data.communities.filter((community) => community.id !== refToFilter)
          : data.communities;

      if (filteredCommunities.length > 0) {
        cards.push({
          title: "Comunidades",
          typeLabel: "comunidades",
          count: filteredCommunities.length,
          items: transformCommunitiesData(filteredCommunities),
          itemActionText: "Ver",
        });
        filteredSummary.communities = filteredCommunities.length;
      }
    }

    return { cards, filteredSummary };
  };

  const { cards: searchCards, filteredSummary } = createSearchCards(
    searchResults.summary,
    searchResults.data,
    ref,
    type
  );
  const recommendations = await getContactSuggestions(1, 10);

  const recommendationItems = (recommendations?.data || []).map((r) => ({
    id: r.id,
    avatarUrl: r.avatarUrl || "/images/profile.svg",
    name:
      `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() ||
      r.firstName ||
      "Usuario",
    subtitle: `${r.industry} ${r?.sector ? `- ${r.sector}` : ""}`,
    metaText: `${r.contactsCount} contactos`,
    contactStatus: r.connectionStatus || null,
  }));
  return (
    <div className={styles.container}>
      <aside className={`${styles.leftSidebar} ${styles.showDesktop}`}>
        <SearchNavigation summary={filteredSummary} />
      </aside>
      <main className={styles.mainContent}>
        {/* Show specific item card when type and ref are provided */}
        {type && ref && (
          <>
            {type === "community"
              ? data && (
                  <CommunityInfo
                    community={{
                      id: data.id,
                      name: data.name,
                      avatarUrl: data.avatarUrl,
                      bannerUrl: data.bannerUrl,
                      sector: data.sector,
                      participantsCount: data.participantsCount || 0,
                    }}
                    membershipStatus={membershipStatus}
                    clickable={true}
                    isOwner={false}
                  />
                )
              : data && (
                  <InformacionPerfilSimple
                    profile={{
                      avatar: data.avatarUrl,
                      banner: data.bannerUrl,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      verified: data.emailVerified,
                      roleKey: data.roleKey,
                      description:
                        data.roleKey === "persona"
                          ? [data.profile?.industry, data.profile?.company]
                              .filter(Boolean)
                              .join(" - ")
                          : data.profile?.industry || "",
                      address: data.profile?.address || "",
                      city: data.profile?.city || "",
                      province: data.profile?.province || "",
                      phone: data.phone,
                      email: data.email,
                      website:
                        data.profile?.websiteUrl || data.websiteUrl || null,
                      linkedin:
                        data.profile?.linkedinUrl || data.linkedinUrl || null,
                      contactsCount: data.contactsCount || 0,
                    }}
                    contactStatus={contactStatus}
                    userId={ref}
                    clickable={true}
                  />
                )}
          </>
        )}

        {/* Show no results component when there's a keyword but no results */}
        {keyword && searchCards.length === 0 && !type && <NoResultsFound />}

        {/* Show search result cards based on summary */}
        {searchCards.map((card, index) => {
          // Map card types to navigation keys
          const typeToKey = {
            Personas: "people",
            Empresas: "companies",
            "Parques Industriales": "industrial_parks",
            Publicaciones: "posts",
            Comunidades: "communities",
          };

          return (
            <div key={index} id={typeToKey[card.title]}>
              <SearchListCard
                title={card.title}
                typeLabel={card.typeLabel}
                items={card.items}
                itemActionText={card.itemActionText}
                count={card.count}
              />
            </div>
          );
        })}
      </main>
      <aside className={`${styles.rightSidebar} ${styles.showDesktop}`}>
        {searchCards.length > 0 && recommendationItems.length > 0 && (
          <SearchListCard
            title="Otros usuarios han visto"
            typeLabel="personas"
            items={recommendationItems}
            itemActionText="Seguir"
            moreButtonText="Ver más"
            className={styles.recommendations}
          />
        )}
        <Footer />
      </aside>
    </div>
  );
}
