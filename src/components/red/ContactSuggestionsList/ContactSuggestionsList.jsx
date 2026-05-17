"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./ContactSuggestionsList.module.scss";
import { ContactSuggestionCard } from "@/components";
import { Button, Input, PageSkeleton } from "@/components/ui";
import SearchIcon from "@/assets/search.svg";
import { getContactSuggestions, sendContactRequest } from "@/actions/contacts";

/**
 * @param {{ forceEmpty?: boolean }} props
 */
export default function ContactSuggestionsList({ forceEmpty = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContactSuggestions(1, 8);
      setSuggestions(data.data || []);
      // Check if there are more pages
      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setHasMore((data.data || []).length === 8);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
      // Fallback to mock data for demo
      setSuggestions([
        {
          id: "1",
          firstName: "Marta",
          lastName: "Sanchez",
          role: { key: "persona" },
          avatarUrl: null,
          bannerUrl: null,
        },
        {
          id: "2",
          firstName: "Carlos",
          lastName: "Rodriguez",
          role: { key: "persona" },
          avatarUrl: null,
          bannerUrl: null,
        },
        {
          id: "3",
          firstName: "Ana",
          lastName: "Martinez",
          role: { key: "persona" },
          avatarUrl: null,
          bannerUrl: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!forceEmpty) {
      loadSuggestions();
    } else {
      setLoading(false);
      setSuggestions([]);
      setFilteredSuggestions([]);
    }
  }, [forceEmpty, loadSuggestions]);

  useEffect(() => {
    const filtered = suggestions.filter((suggestion) => {
      const name =
        suggestion.role.key === "empresa"
          ? suggestion.firstName
          : `${suggestion.firstName} ${suggestion.lastName ?? ""}`.trim();
      const role = suggestion.role.key === "empresa" ? "Empresa" : "Persona";

      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredSuggestions(filtered);
  }, [searchTerm, suggestions]);

  const loadMoreSuggestions = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getContactSuggestions(nextPage, 8);

      if (data.data && data.data.length > 0) {
        setSuggestions((prev) => [...prev, ...data.data]);
        setPage(nextPage);

        // Check if there are more pages
        if (data.pagination) {
          setHasMore(nextPage < data.pagination.pages);
        } else {
          setHasMore(data.data.length === 8);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more suggestions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendRequest = async (contactId, message) => {
    try {
      await sendContactRequest(contactId, message);
      // Remove the suggestion after successful request
      setSuggestions((prev) =>
        prev.filter((suggestion) => suggestion.id !== contactId)
      );
      // You could show a success toast here
    } catch (error) {
      console.error("Error sending contact request:", error);
      // You could show an error toast here
    }
  };

  const handleContact = (contactId) => {
    // TODO: Implement contact functionality (e.g., open chat, call, etc.)
  };

  if (loading && !forceEmpty) {
    return <PageSkeleton variant="contact-suggestions" />;
  }
  return (
    <div className={styles.suggestionsList}>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Input
            type="text"
            placeholder="Buscar contacto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            rounded="large"
          />
          <SearchIcon className={styles.searchIcon} />
        </div>
      </div>

      <div className={styles.suggestionsContainer}>
        {filteredSuggestions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No se encontraron sugerencias de contactos</p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <ContactSuggestionCard
              key={suggestion.id}
              contact={suggestion}
              onSendRequest={handleSendRequest}
              onContact={handleContact}
            />
          ))
        )}
      </div>
      {filteredSuggestions.length > 0 && hasMore && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            onClick={loadMoreSuggestions}
            disabled={loadingMore}
          >
            {loadingMore ? "Cargando..." : "Ver más sugerencias"}
          </Button>
        </div>
      )}
    </div>
  );
}
