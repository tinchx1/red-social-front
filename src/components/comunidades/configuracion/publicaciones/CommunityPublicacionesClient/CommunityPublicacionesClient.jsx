"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import StatusPill from "../StatusPill/StatusPill";
import PostDetailModal from "../PostDetailModal/PostDetailModal";
import PostCard from "../PostCard/PostCard";
import PostsTableSkeleton from "../PostsTableSkeleton/PostsTableSkeleton";
import styles from "./CommunityPublicacionesClient.module.scss";
import pubStyles from "./CommunityPublicacionesClient.publicaciones.module.scss";
import { Select, Input, Pagination, Button, DataTable } from "@/components/ui";
import SearchIcon from "@/assets/search.svg?react";
import { getCommunityAdminPosts, updateCommunityPostApproval } from "@/actions";
import dayjs from "dayjs";

/**
 * @param {{
 *   communityId: string;
 *   initialData?: { data?: any[]; pagination?: any };
 * }}
 */
export default function CommunityPublicacionesClient({
  communityId,
  initialData,
}) {
  const [estado, setEstado] = useState("");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [email, setEmail] = useState("");

  // Data and pagination state
  const [posts, setPosts] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    initialData?.pagination?.page || 1
  );
  const [totalItems, setTotalItems] = useState(
    initialData?.pagination?.total || 0
  );
  const [pageSize, setPageSize] = useState(
    initialData?.pagination?.limit || 10
  );
  const [totalPages, setTotalPages] = useState(
    initialData?.pagination?.pages || 0
  );
  const isAppendingRef = useRef(false);

  // Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Fetch posts data
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      // Only add filters if they have values
      if (estado) params.status = estado;
      if (dateFrom && dateFrom.trim() !== "") params.dateFrom = dateFrom;
      if (dateTo && dateTo.trim() !== "") params.dateTo = dateTo;
      if (debouncedQuery && debouncedQuery.trim() !== "")
        params.search = debouncedQuery;
      if (email && email.trim() !== "") params.email = email;

      const response = await getCommunityAdminPosts(communityId, params);

      if (response) {
        const incoming = response.data || [];
        if (isAppendingRef.current) {
          setPosts((prev) => [...prev, ...incoming]);
        } else {
          setPosts(incoming);
        }

        // Handle pagination data from API response
        if (response.pagination) {
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.pages || 0);
          setCurrentPage(response.pagination.page || 1);
        } else {
          // Fallback for different API structure
          setTotalItems(response.total || 0);
          setTotalPages(Math.ceil((response.total || 0) / pageSize));
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      isAppendingRef.current = false;
    }
  }, [
    communityId,
    currentPage,
    pageSize,
    estado,
    debouncedQuery,
    dateFrom,
    dateTo,
    email,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Track if we've done the initial fetch
  const hasInitialFetchRef = useRef(false);

  // Fetch data when filters change (skip initial render if we have initialData)
  useEffect(() => {
    const hasInitialData = initialData?.data?.length > 0;
    const hasFilters =
      (estado && estado.trim() !== "") ||
      (debouncedQuery && debouncedQuery.trim() !== "") ||
      (dateFrom && dateFrom.trim() !== "") ||
      (dateTo && dateTo.trim() !== "") ||
      (email && email.trim() !== "");

    const pageChanged =
      currentPage !== (initialData?.pagination?.page || 1) ||
      pageSize !== (initialData?.pagination?.limit || 10);

    // Skip initial fetch if we have initial data and no filters/page changes
    if (
      !hasInitialFetchRef.current &&
      hasInitialData &&
      !hasFilters &&
      !pageChanged
    ) {
      hasInitialFetchRef.current = true;
      return;
    }

    hasInitialFetchRef.current = true;
    fetchPosts();
  }, [fetchPosts]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Mobile-only: load more (append)
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      isAppendingRef.current = true;
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle detail click
  const handleDetailClick = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleApprovePost = async (postId) => {
    await updateCommunityPostApproval(communityId, postId, {
      status: "approved",
    });
    await fetchPosts();
  };

  const handleBlockPost = async (postId) => {
    await updateCommunityPostApproval(communityId, postId, {
      status: "rejected",
      reason: "Contenido inapropiado",
    });
    await fetchPosts();
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle date range changes with validation
  const handleDateFromChange = (value) => {
    const newDateFrom = value || "";
    setDateFrom(newDateFrom);
    setCurrentPage(1);
    // If dateFrom is after dateTo, reset dateTo
    if (newDateFrom && dateTo && dayjs(newDateFrom).isAfter(dayjs(dateTo))) {
      setDateTo("");
    }
  };

  const handleDateToChange = (value) => {
    const newDateTo = value || "";
    setDateTo(newDateTo);
    setCurrentPage(1);
    // If dateTo is before dateFrom, reset dateFrom
    if (newDateTo && dateFrom && dayjs(newDateTo).isBefore(dayjs(dateFrom))) {
      setDateFrom("");
    }
  };

  // Handle estado change
  const handleEstadoChange = (value) => {
    setEstado(value);
    setCurrentPage(1);
  };

  // Handle search query change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setEstado("");
    setQuery("");
    setDateFrom("");
    setDateTo("");
    setEmail("");
    setCurrentPage(1);
  };
  // Define columns with custom renderers
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value, row) => (
        <span className={styles.id}>#{row.id.slice(-5)}</span>
      ),
    },
    {
      key: "status",
      label: "ESTADO",
      render: (value, row) => <StatusPill status={row.approvalStatus} />,
    },
    {
      key: "name",
      label: "NOMBRE Y APELLIDO",
      render: (value, row) => (
        <span className={styles.name}>
          {row.author.firstName} {row.author.lastName || ""}
        </span>
      ),
    },
    {
      key: "email",
      label: "CORREO",
      render: (value, row) => (
        <span className={styles.email}>{row.author.email}</span>
      ),
    },
    {
      key: "contact",
      label: "CONTACTO",
      render: (value, row) => (
        <span className={styles.contact}>{row.author.phone || "N/A"}</span>
      ),
    },
    {
      key: "sector",
      label: "Rubro",
      render: (value, row) => (
        <span className={styles.sector}>{row.author.industry || "N/A"}</span>
      ),
    },
    {
      key: "company",
      label: "EMPRESA",
      render: (value, row) => <span>{row.author.company || "N/A"}</span>,
    },
    {
      key: "date",
      label: "FECHA",
      render: (value, row) => (
        <span className={pubStyles.date}>{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: "detail",
      label: "DETALLE",
      render: (value, row) => (
        <button
          className={pubStyles.detailLink}
          onClick={() => handleDetailClick(row.id)}
          type="button"
        >
          Ver detalle
        </button>
      ),
    },
  ];

  // Show skeleton loading state
  if (loading && posts.length === 0) {
    return <PostsTableSkeleton />;
  }

  return (
    <div>
      <div className={styles.headerRow}>
        <h2 className={styles.headerTitle + " " + styles.titleGestion}>
          Publicaciones
        </h2>
        <div className={styles.filtersRow}>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            label="Desde"
            className={pubStyles.dateInput}
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            label="Hasta"
            className={pubStyles.dateInput}
          />
          <Select
            value={estado}
            onChange={handleEstadoChange}
            label="Estado"
            variant={"neutral"}
            options={[
              { value: "", label: "Todos" },
              {
                value: "approved",
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#34C759",
                        display: "inline-block",
                      }}
                    />
                    Activa
                  </div>
                ),
              },
              {
                value: "rejected",
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#FF3B30",
                        display: "inline-block",
                      }}
                    />
                    Bloqueada
                  </div>
                ),
              },
            ]}
            style={{ width: "180px" }}
            placeholder="Estado"
            truncate
          />
          <Input
            placeholder="Buscar usuarios"
            value={query}
            onChange={handleQueryChange}
            className={styles.searchInput}
            icon={<SearchIcon />}
            iconPosition="right"
            rounded="large"
          />
          <Button
            onClick={clearFilters}
            variant="link"
            disabled={!estado && !query && !dateFrom && !dateTo && !email}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <DataTable
          data={posts}
          columns={columns}
          loading={loading && posts.length > 0}
        />
      </div>

      {/* Cards Grid - Visible only below 1200px */}
      <div className={pubStyles.noShowDesktop}>
        <Input
          placeholder="Buscar"
          value={query}
          onChange={handleQueryChange}
          className={styles.searchInput}
          icon={<SearchIcon />}
          iconPosition="right"
          rounded="large"
        />
      </div>
      <div className={pubStyles.cardsGrid}>
        {posts.length > 0
          ? posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDetailClick={handleDetailClick}
              />
            ))
          : !loading && (
              <div className={pubStyles.noPosts}>No hay publicaciones</div>
            )}
      </div>
      {currentPage < totalPages && posts.length > 0 && (
        <div className={pubStyles.noShowDesktop}>
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      )}

      <div className={styles.paginationContainer}>
        <Pagination
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <PostDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        post={selectedPost}
        onApprove={handleApprovePost}
        onBlock={handleBlockPost}
      />
    </div>
  );
}
