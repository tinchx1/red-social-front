"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AddParticipants.module.scss";
import { Button, Input, Spinner } from "@/components/ui";
import {
  searchCommunityUsers,
  inviteUserToCommunity,
} from "@/actions/community";
import Image from "next/image";
import { useToast } from "@/contexts/ToastContext";
import SearchIcon from "@/assets/search.svg";
import { useRouter } from "next/navigation";

/**
 * AddParticipants
 * Render a list of recommended contacts with a search box and an Invite button
 */
/**
 * @param {{ communityId: string }} props
 */
export default function AddParticipants({ communityId }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [invitingIds, setInvitingIds] = useState({});
  const { showSuccess, showError } = useToast();
  const debounceRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // initial load
    loadSuggestions("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const mapContacts = (arr) => {
    return (arr || []).map((contact) => ({
      id: contact.id,
      name:
        contact.role?.key === "empresa"
          ? contact.firstName
          : `${contact.firstName} ${contact.lastName ?? ""}`.trim(),
      role: contact.role?.key === "empresa" ? "Empresa" : "Persona",
      avatar: contact.avatarUrl,
      bannerImage: contact.bannerUrl || null,
      province: contact.province,
      city: contact.city,
      bio: contact.bio,
      organization: contact.company || contact.profile?.company || null,
    }));
  };

  const loadSuggestions = async (currentQuery = query) => {
    if (!communityId) return;
    try {
      setLoading(true);
      const data = await searchCommunityUsers(communityId, currentQuery, 1, 5);
      const items =
        data?.data || data?.items || data?.users || data?.results || data || [];
      const mapped = mapContacts(items);
      setSuggestions(mapped);
    } catch (error) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!communityId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSuggestions(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, communityId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((u) =>
      [u.name, u.role, u.organization]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, suggestions]);

  const handleInvite = async (userId) => {
    try {
      setInvitingIds((s) => ({ ...s, [userId]: true }));
      await inviteUserToCommunity(communityId, userId);
      showSuccess("Invitación a la comunidad enviada");
      // Remove the invited user from the suggestions list
      setSuggestions((prev) => prev.filter((user) => user.id !== userId));
    } catch (e) {
      showError("No se pudo enviar la invitación a la comunidad");
    } finally {
      setInvitingIds((s) => ({ ...s, [userId]: false }));
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Agregar participantes</h2>
      <div className={styles.searchRow}>
        <Input
          placeholder="Buscar usuarios"
          value={query}
          icon={<SearchIcon />}
          rounded="large"
          iconPosition="right"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className={styles.subtitle}>Usuarios recomendados</p>
      {loading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((u) => (
            <li
              key={u.id}
              className={styles.item}
              onClick={() => router.push(`/perfil/${u.id}`)}
            >
              <div className={styles.userInfo}>
                <div className={styles.avatarWrap}>
                  <Image
                    src={u.avatar || "/images/profile.svg"}
                    alt={u.name || "Usuario"}
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <div className={styles.name}>{u.name}</div>
                  <div className={styles.org}>
                    {u.organization || u.city || ""}
                  </div>
                </div>
              </div>
              <Button
                disabled={!!invitingIds[u.id]}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInvite(u.id);
                }}
              >
                {invitingIds[u.id] ? (
                  <>
                    Enviando <Spinner color="white" size="small" />
                  </>
                ) : (
                  "Invitar"
                )}
              </Button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className={styles.empty}>No hay sugeridos</li>
          )}
        </ul>
      )}
    </section>
  );
}
