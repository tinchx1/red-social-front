"use client";

import { useState, useEffect, Suspense } from "react";
import { SearchbarContainer } from "@/components/comunidades/connections/searchBar/SearchBar";
import { getAllCommunities } from "@/actions";
import styles from "@/styles/pages/comunidad/buscar-comunidad.module.scss";
import { CardComunnity } from "@/components/comunidades/connections/cardComunnity/CardCommunity";
import { CommunityEmpty } from "@/components/comunidades/connections/communityEmpty/CommunityEmpty";
import { useDebounce } from "@/hooks";
import { PageSkeleton, Spinner } from "@/components/ui";

function SearchComunnityContent() {
  const [communities, setCommunities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data } = await getAllCommunities("", 1, 10);
        setCommunities(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (value) => {
    setIsLoading(true);
    try {
      const { data } = await getAllCommunities(value, 1, 10);
      setFiltered(data);
    } catch (error) {
      console.error("Error searching communities:", error);
      setFiltered(communities);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchbarContainer}>
        <SearchbarContainer onSearch={handleSearchInputChange} />
      </div>

      {isLoading ? (
        <div className={styles.loading + " " + styles.loadingText}>
          <p className={styles.loadingText}>Buscando comunidades</p>
          <Spinner size="small" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          {filtered.map((el, index) => (
            <CardComunnity
              title={el.name}
              members={el.membersCount}
              description={el.bio}
              photoProfile={el.avatarUrl}
              url={`/comunidades/${el.id}`}
              variant="ver"
              key={el.id}
            />
          ))}
        </>
      ) : (
        <CommunityEmpty
          title={"¡Ups! No se ha encontrado ninguna comunidad"}
          showButton={false}
        />
      )}
    </div>
  );
}

export default function SearchComunnity() {
  return (
    <Suspense fallback={<PageSkeleton variant="communities" />}>
      <SearchComunnityContent />
    </Suspense>
  );
}
