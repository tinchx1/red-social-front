"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clientApi } from "@/lib/api";
import {
  DataTable,
  Pagination,
  Select,
  Input,
  Button,
  ConfirmModal,
  Spinner,
  Tooltip,
} from "@/components/ui";
import SearchIcon from "@/assets/search.svg";
import CheckCircleIcon from "@/assets/check-circle.svg?react";
import CloseCircleIcon from "@/assets/close_ring.svg?react";
import OctagonWarningIcon from "@/assets/octagon_warning.svg?react";
import { useToast } from "@/contexts";
import { acceptOrRefuseInvite } from "@/actions";
import { CardInvitation } from "@/components/comunidades/connections/cardInvitation/CardInvitation";
import styles from "./CommunityRequestsClient.module.scss";
import { CommunityEmpty } from "@/components/comunidades/connections/communityEmpty/CommunityEmpty";

const formatId = (id) => {
  if (!id) return "#-----";
  const suffix = String(id).slice(-5);
  return `#${suffix}`;
};

const formatPhone = (phone) => {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    const area = cleaned.slice(-10, -7);
    const first = cleaned.slice(-7, -4);
    const last = cleaned.slice(-4);
    return `(${area}) ${first}-${last}`;
  }
  return phone;
};

const toDisplayAccountType = (key) => {
  if (!key) return "Persona";
  const map = {
    persona: "Persona",
    empresa: "Empresa",
    parque_industrial: "Parque Industrial",
  };
  return map[key] || "Persona";
};

const roleOptions = [
  { value: "", label: "Tipo de cuenta" },
  { value: "persona", label: "Persona" },
  { value: "empresa", label: "Empresa" },
  { value: "parque_industrial", label: "Parque Industrial" },
];

const transformRequest = (request) => {
  if (!request) return null;
  const author = request.author || {};
  const userId = author.id || request.userId;
  if (!userId) return null;

  return {
    id: request.id,
    requestId: request.id,
    userId,
    communityId: request.communityId,
    firstName: author.firstName || "",
    lastName: author.lastName || "",
    displayName:
      author.displayName ||
      `${author.firstName || ""} ${author.lastName || ""}`.trim(),
    avatarUrl: author.avatarUrl || null,
    email: author.email || null,
    phone: author.phone || null,
    industry: author.industry || null,
    company: author.company || null,
    accountKey: author.role?.key || null,
    status: request.status || "pending",
    message: request.message || null,
    createdAt: request.created_at || request.createdAt || null,
    wasRemoved: request.wasRemoved || false,
  };
};

/**
 * @param {{
 *   communityId: string;
 *   initialData: {
 *     data: any[];
 *     pagination: { page: number; limit: number; total: number; pages: number };
 *   };
 * }} props
 */
export default function CommunityRequestsClient({ communityId, initialData }) {
  const [requests, setRequests] = useState(() =>
    (initialData?.data || []).map(transformRequest).filter(Boolean)
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    initialData?.pagination?.page || 1
  );
  const [pageSize, setPageSize] = useState(
    initialData?.pagination?.limit || 10
  );
  const [totalItems, setTotalItems] = useState(
    initialData?.pagination?.total || initialData?.data?.length || 0
  );
  const [totalPages, setTotalPages] = useState(
    initialData?.pagination?.pages || 0
  );
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    request: null,
  });
  const { showSuccess, showError } = useToast();
  const debouncedQuery = useDebounced(query, 400);
  const isAppendingRef = useRef(false);

  const fetchRequests = useCallback(async () => {
    if (!communityId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        communityId,
        status: "pending",
      });

      const response = await clientApi.get(
        `/communities/requests/received?${params.toString()}`
      );

      const payload = response?.data || {};
      const dataBlocks = Array.isArray(payload.data) ? payload.data : [];
      const nestedRequests = dataBlocks.flatMap(
        (block) => block?.requests || []
      );
      const directRequests = Array.isArray(payload.requests)
        ? payload.requests
        : [];
      const combined = [...nestedRequests, ...directRequests];
      const normalized = combined
        .map(transformRequest)
        .filter((item) => item && item.status === "pending");

      if (isAppendingRef.current) {
        setRequests((prev) => {
          const merged = [...prev, ...normalized];
          const seen = new Set();
          return merged.filter((item) => {
            if (!item.requestId) return false;
            if (seen.has(item.requestId)) return false;
            seen.add(item.requestId);
            return true;
          });
        });
      } else {
        setRequests(normalized);
      }

      const pagination = payload.pagination || {};
      setTotalItems(pagination.total || normalized.length || 0);
      setTotalPages(pagination.pages || 0);
      setCurrentPage(pagination.page || currentPage || 1);
    } catch (error) {
      console.error("Error fetching community requests:", error);
      if (!isAppendingRef.current) {
        setRequests([]);
        setTotalItems(0);
        setTotalPages(0);
      }
      showError(
        error?.response?.data?.message ||
          "No se pudieron cargar las solicitudes"
      );
    } finally {
      setLoading(false);
      isAppendingRef.current = false;
    }
  }, [communityId, currentPage, pageSize, showError]);

  useEffect(() => {
    if (!communityId) return;
    fetchRequests();
  }, [communityId, currentPage, pageSize, fetchRequests]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setRole("");
    setQuery("");
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      isAppendingRef.current = true;
      setCurrentPage((prev) => prev + 1);
    }
  };

  const filteredRequests = useMemo(() => {
    let list = requests;
    if (role) {
      list = list.filter((req) => req.accountKey === role);
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((req) => {
        const name = `${req.firstName} ${req.lastName}`.toLowerCase();
        const email = (req.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    return list;
  }, [requests, role, debouncedQuery]);

  const openConfirm = useCallback((action, request) => {
    setConfirmState({ isOpen: true, action, request });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ isOpen: false, action: null, request: null });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmState.request?.requestId || !confirmState.action) return;
    const targetAction =
      confirmState.action === "approve" ? "approved" : "rejected";

    try {
      await acceptOrRefuseInvite(targetAction, confirmState.request.requestId);
      setRequests((prev) =>
        prev.filter((req) => req.requestId !== confirmState.request.requestId)
      );
      setTotalItems((count) => Math.max(0, (count || 0) - 1));
      showSuccess(
        targetAction === "approved"
          ? "Solicitud aprobada correctamente"
          : "Solicitud rechazada correctamente"
      );
    } catch (error) {
      console.error("Error updating request status:", error);
      showError(
        error?.response?.data?.message || "No se pudo actualizar la solicitud"
      );
    } finally {
      closeConfirm();
    }
  }, [confirmState, closeConfirm, showError, showSuccess]);
  const columns = useMemo(
    () => [
      {
        key: "requestId",
        label: "ID",
        render: (_value, row) => (
          <span className={styles.id}>{formatId(row.requestId)}</span>
        ),
      },
      {
        key: "name",
        label: "NOMBRE Y APELLIDO",
        render: (_value, row) => (
          <div className={styles.nameCell}>
            <div className={styles.avatar}>
              <img
                src={row.avatarUrl || "/images/profile.svg"}
                alt={`${row.firstName} ${row.lastName || ""}`}
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.nameLinkContainer}>
              <Link href={`/perfil/${row.userId}`} className={styles.nameLink}>
                {row.firstName} {row.lastName || ""}
                {row.wasRemoved && (
                  <Tooltip
                    content="Usuario eliminado anteriormente"
                    position="right"
                    delay={200}
                  >
                    <OctagonWarningIcon className={styles.warningIcon} />
                  </Tooltip>
                )}
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "account",
        label: "TIPO DE CUENTA",
        render: (_value, row) => (
          <span>{toDisplayAccountType(row.accountKey)}</span>
        ),
      },
      {
        key: "email",
        label: "CORREO",
        render: (_value, row) => (
          <span className={styles.email}>{row.email || "—"}</span>
        ),
      },
      {
        key: "phone",
        label: "CONTACTO",
        render: (_value, row) => (
          <span className={styles.contact}>{formatPhone(row.phone)}</span>
        ),
      },
      {
        key: "industry",
        label: "RUBRO",
        render: (_value, row) => (
          <span className={styles.sector}>{row.industry || "N/A"}</span>
        ),
      },
      {
        key: "company",
        label: "EMPRESA",
        render: (_value, row) => (
          <span className={styles.company}>{row.company || "—"}</span>
        ),
      },
      {
        key: "actions",
        label: "ACCIONES",
        render: (_value, row) => (
          <div className={styles.actions}>
            <button
              type="button"
              title="Aprobar solicitud"
              className={`${styles.actionIcon} ${styles.accept}`}
              onClick={() => openConfirm("approve", row)}
              disabled={row.status !== "pending"}
            >
              <CheckCircleIcon />
            </button>
            <button
              type="button"
              title="Rechazar solicitud"
              className={`${styles.actionIcon} ${styles.reject}`}
              onClick={() => openConfirm("reject", row)}
              disabled={row.status !== "pending"}
            >
              <CloseCircleIcon />
            </button>
          </div>
        ),
      },
    ],
    [openConfirm]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SOLICITUDES</h1>
        <div className={styles.filtersRow}>
          <Select
            value={role}
            onChange={setRole}
            options={roleOptions}
            placeholder="Tipo de cuenta"
            variant="neutral"
            truncate
            containerClassName={styles.select}
          />
          <Input
            placeholder="Buscar usuarios"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rounded="large"
            iconPosition="right"
            icon={<SearchIcon />}
            className={styles.searchInputInput}
            containerClassName={styles.searchInput}
          />
          <Button
            onClick={clearFilters}
            variant="link"
            disabled={!role && !query}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <DataTable
          data={filteredRequests}
          columns={columns}
          loading={loading && requests.length > 0}
        />
      </div>

      <div className={styles.mobileList}>
        <div className={styles.containerCards}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((row) => (
              <CardInvitation
                key={row.requestId}
                id={row.requestId}
                title={
                  row.displayName ||
                  `${row.firstName} ${row.lastName || ""}`.trim()
                }
                description={
                  row.message || "Solicitud para unirse a tu comunidad"
                }
                photoProfile={row.avatarUrl}
                variant="administrador"
                type="request"
                isAdmin
                warningText={
                  row.wasRemoved ? "Usuario eliminado anteriormente" : null
                }
              />
            ))
          ) : (
            <CommunityEmpty
              title="No hay solicitudes pendientes"
              showButton={false}
            />
          )}
        </div>
      </div>

      {currentPage < totalPages && requests.length > 0 && (
        <div className={styles.mobileLoadMore}>
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      )}

      {loading && requests.length === 0 && (
        <div className={styles.loadingContainer}>
          <span>
            Cargando solicitudes <Spinner />
          </span>
        </div>
      )}

      {totalPages > 0 && (
        <div className={styles.paginationContainer}>
          <Pagination
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {confirmState.isOpen && (
        <ConfirmModal
          isOpen
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          title={
            confirmState.action === "approve" ? (
              <p style={{ margin: "0 auto", textAlign: "center" }}>
                <span style={{ fontWeight: 400 }}>¿Querés</span>{" "}
                <span style={{ fontWeight: 700 }}>aprobar</span>{" "}
                <span style={{ fontWeight: 400 }}>esta solicitud?</span>
              </p>
            ) : (
              <p style={{ margin: "0 auto", textAlign: "center" }}>
                <span style={{ fontWeight: 400 }}>¿Querés</span>{" "}
                <span style={{ fontWeight: 700 }}>rechazar</span>{" "}
                <span style={{ fontWeight: 400 }}>esta solicitud?</span>
              </p>
            )
          }
          icon={
            confirmState.action === "approve"
              ? CheckCircleIcon
              : CloseCircleIcon
          }
          confirmText={
            confirmState.action === "approve" ? "Sí, aprobar" : "Sí, rechazar"
          }
          cancelText="Cancelar"
          confirmVariant={
            confirmState.action === "approve" ? "primary" : "secondary"
          }
          iconStyle={confirmState.action === "approve"}
          confirmButtonStyle={
            confirmState.action === "approve"
              ? {}
              : {
                  backgroundColor: "#E6E6E6",
                  color: "#FF383C",
                  borderColor: "#E6E6E6",
                }
          }
        />
      )}
    </div>
  );
}

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
