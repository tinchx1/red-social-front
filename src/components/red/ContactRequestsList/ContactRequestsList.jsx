"use client";
import React, { useState, useEffect } from "react";
import styles from "./ContactRequestsList.module.scss";
import ContactRequestCard from "../ContactRequestCard/ContactRequestCard";
import { Button, Input, PageSkeleton, Spinner } from "@/components/ui";
import SearchIcon from "@/assets/search.svg";
import {
  getContactRequests,
  acceptContactRequest,
  rejectContactRequest,
} from "@/actions/contacts";
import { createChat } from "@/actions/chat";

export default function ContactRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const filtered = requests.filter(
      (request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);
  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getContactRequests(1, 8);
      // Map the API data to match ContactRequestCard props
      const mappedRequests = (data.data || []).map((request) => ({
        id: request.id,
        name:
          request.sender.role.key === "empresa"
            ? request.sender.firstName
            : `${request.sender.firstName} ${
                request.sender.lastName ?? ""
              }`.trim(),
        role:
          request.sender.role.key === "empresa"
            ? "Empresa"
            : request.sender.role.key === "parque_industrial"
            ? "Parque Industrial"
            : "Persona",
        avatar: request.sender.avatarUrl,
        bannerUrl: request.sender.bannerUrl || null,
        province: request.sender.province,
        city: request.sender.city,
        bio: request.sender.bio,
        message: request.message,
        sender_id: request.senderId,
        receiver_id: request.receiverId,
      }));

      setRequests(mappedRequests);

      // Check if there are more pages
      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setHasMore(mappedRequests.length === 8);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      // Fallback to mock data for demo
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRequests = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getContactRequests(nextPage, 10);

      const newRequests = (data.data || []).map((request) => ({
        id: request.id,
        name:
          request.sender.role.key === "empresa"
            ? request.sender.firstName
            : `${request.sender.firstName} ${
                request.sender.lastName || ""
              }`.trim(),
        role:
          request.sender.role.key === "empresa"
            ? "Empresa"
            : request.sender.role.key === "parque_industrial"
            ? "Parque Industrial"
            : "Persona",
        avatar: request.sender.avatarUrl,
        bannerUrl: request.sender.bannerUrl || null,
        province: request.sender.province,
        city: request.sender.city,
        bio: request.sender.bio,
        message: request.message,
        sender_id: request.senderId,
        receiver_id: request.receiverId,
      }));

      if (newRequests.length > 0) {
        setRequests((prev) => [...prev, ...newRequests]);
        setPage(nextPage);

        // Check if there are more pages
        if (data.pagination) {
          setHasMore(nextPage < data.pagination.pages);
        } else {
          setHasMore(newRequests.length === 10);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more requests:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptContactRequest(requestId);

      const requestSelected = requests.find(
        (request) => request.id === requestId
      );
      await createChat(
        requestSelected?.sender_id,
        requestSelected?.receiver_id
      );

      // Remove the request after successful acceptance
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error("Error accepting contact request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectContactRequest(requestId);
      // Remove the request after successful rejection
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error("Error rejecting contact request:", error);
    }
  };

  if (loading) {
    return <PageSkeleton variant="contacts" />;
  }
  return (
    <div className={styles.requestsList}>
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

      <div className={styles.requestsContainer}>
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tienes solicitudes de contacto pendientes</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <ContactRequestCard
              key={request.id}
              id={request.id}
              userId={request.sender_id}
              name={request.name}
              role={request.role}
              avatar={request.avatar}
              bannerUrl={request.bannerUrl}
              province={request.province}
              city={request.city}
              bio={request.bio}
              message={request.message}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))
        )}

        {filteredRequests.length > 0 && hasMore && (
          <div className={styles.loadMore}>
            <Button
              variant="ghost"
              onClick={loadMoreRequests}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  Cargando <Spinner color="white" size="small" />
                </>
              ) : (
                "Ver más solicitudes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
