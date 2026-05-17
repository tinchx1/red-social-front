"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Toggle,
} from "@/components/ui";
import SearchIcon from "@/assets/search.svg";
import StopWarningIcon from "@/assets/stop-warning.svg";
import UserRemoveIcon from "@/assets/user-remove.svg";
import WarningIcon from "@/assets/warning2.svg";
import StarIcon from "@/assets/star.svg";
import { useToast } from "@/contexts";
import { changeAdminRole } from "@/actions/community";
import styles from "./CommunityUsersClient.module.scss";
import UserCard from "./UserCard/UserCard";
import UserRoundCogIcon from "@/assets/user-round-cog.svg";
import { CommunityEmpty } from "../../connections/communityEmpty/CommunityEmpty";
import { useProfile } from "@/contexts/ProfileContext";
import EditPencil from "@/assets/edit-pencil-blue.svg";
import { useCreator } from "@/contexts/CreatorProvider";

const roleOptions = [
  { value: "", label: "Todos" },
  { value: "persona", label: "Persona" },
  { value: "empresa", label: "Empresa" },
  { value: "parque_industrial", label: "Parque Industrial" },
];

const formatId = (id) => {
  if (!id) return "#-----";
  const suffix = String(id).slice(-5);
  return `#${suffix}`;
};

const formatPhone = (phone) => {
  if (!phone) return "—";
  // Format: (221) 484-3323 from +5491198765432
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

/**
 * Transform API response member data to flat structure for component
 * @param {object} member - Member object from API with nested user
 * @returns {object} Flattened member object
 */
const normalizeStatus = (status) => {
  if (!status) return "active";
  if (status === "bloqued") return "blocked";
  return status;
};

const transformMember = (member) => {
  if (!member) return null;
  const user = member.user || {};
  const userId = member.userId || user.id;
  if (!userId) return null; // Skip if no valid ID
  const status = normalizeStatus(member.status);
  return {
    id: user.id || userId,
    userId: userId,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    avatarUrl: user.avatarUrl || null,
    email: user.email || null,
    industry: user.industry || null,
    company: user.company || null,
    phone: user.phone || null,
    key: user.role?.key || null,
    status,
    role: member.role || "member",
    isActive: status === "active",
    joinedAt: member.joinedAt || null,
    blockedAt: member.blockedAt || null,
    blockReason: member.blockReason || null,
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
export default function CommunityUsersClient({ communityId, initialData }) {
  const creator = useCreator();
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const { profile: user } = useProfile();
  const userId = user?.id;
  const [currentPage, setCurrentPage] = useState(
    initialData?.pagination?.page || 1
  );
  const [pageSize, setPageSize] = useState(
    initialData?.pagination?.limit || 10
  );
  const [totalItems, setTotalItems] = useState(
    initialData?.pagination?.total || 0
  );
  const [totalPages, setTotalPages] = useState(
    initialData?.pagination?.pages || 0
  );
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    member: null,
  });
  const { showSuccess, showError } = useToast();

  const debouncedQuery = useDebounced(query, 400);
  const isAppendingRef = useRef(false);
  const prevFiltersRef = useRef({ role: "", debouncedQuery: "" });

  // Initialize from server-provided initialData or fetch from API on mount
  useEffect(() => {
    if (initialData) {
      const transformedData = (initialData.data || [])
        .map(transformMember)
        .filter(Boolean);
      setMembers(transformedData);
      const pg = initialData.pagination;
      if (pg) {
        setTotalItems(pg.total || 0);
        setTotalPages(pg.pages || 0);
        setCurrentPage(pg.page || 1);
      }
    } else {
      // No SSR data; fetch first page
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when communityId becomes available or changes during client navigation
  useEffect(() => {
    if (!communityId) return;
    // If we don't have server data or list is empty, fetch current view
    if (!initialData || members.length === 0) {
      fetchMembers();
    }
  }, [communityId]);

  // Members already come paginated from server, no need for client-side pagination
  const pagedMembers = members;

  const fetchMembers = useCallback(async () => {
    if (!communityId) return;

    setLoading(true);
    try {
      const paramsObj = {
        page: String(currentPage),
        limit: String(pageSize),
      };
      if (role) paramsObj.role = role;
      if (debouncedQuery) paramsObj.search = debouncedQuery;

      const params = new URLSearchParams(paramsObj);
      const response = await clientApi.get(
        `/communities/admin/${communityId}/members/search?${params.toString()}`
      );
      const rawData = response?.data?.data || [];
      const transformedData = rawData.map(transformMember).filter(Boolean);
      if (isAppendingRef.current) {
        setMembers((prev) => [...prev, ...transformedData]);
      } else {
        setMembers(transformedData);
      }

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.pages || 0);
        setCurrentPage(pagination.page || 1);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      isAppendingRef.current = false;
    }
  }, [communityId, currentPage, pageSize, role, debouncedQuery]);

  // Reset page to 1 when filters change, then fetch
  useEffect(() => {
    if (!communityId) return;
    const filtersChanged =
      prevFiltersRef.current.role !== role ||
      prevFiltersRef.current.debouncedQuery !== debouncedQuery;

    if (filtersChanged) {
      prevFiltersRef.current = { role, debouncedQuery };
      if (currentPage !== 1) {
        setCurrentPage(1);
        // Fetch will happen when currentPage changes to 1
        return;
      }
    }
    // Fetch when filters change (and page is already 1) or when page/pageSize changes
    fetchMembers();
  }, [communityId, role, debouncedQuery, currentPage, pageSize, fetchMembers]);

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
      setCurrentPage((p) => p + 1);
    }
  };

  const openConfirm = useCallback((type, member) => {
    setConfirmState({ isOpen: true, type, member });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ isOpen: false, type: null, member: null });
  }, []);

  // toast handled via context

  const blockMember = async (memberId, action) => {
    const { data } = await clientApi.put(
      `/communities/admin/${communityId}/members/${memberId}/block`,
      { action }
    );
    return data?.data || data;
  };

  const deleteMember = async (memberId) => {
    const { data } = await clientApi.delete(
      `/communities/${communityId}/members/${memberId}`
    );
    return data?.data || data;
  };
  const handleChangeModeratorRole = useCallback(async (member, value) => {
    if (!member?.userId) return;
    try {
      const newRole = value === "yes" ? "moderator" : "member";
      await changeAdminRole(communityId, member.userId, newRole);
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === member.userId ? { ...m, role: newRole } : m
        )
      );
    } catch (error) {
      let message = "Acción fallida, intente nuevamente";
      if (error?.message === "Cannot change creator role") {
        message = "No se puede cambiar el rol del creador de la comunidad";
      }
      showError(message);
    }
  }, [communityId, showSuccess, showError]);

  const handleConfirm = useCallback(async () => {
    const member = confirmState.member;
    if (!member?.userId) return;
    try {
      if (confirmState.type === "changeRole") {
        const newRole = member.role === "admin" ? "member" : "admin";
        await changeAdminRole(communityId, member.userId, newRole);
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === member.userId ? { ...m, role: newRole } : m
          )
        );
        showSuccess(
          newRole === "admin"
            ? "Usuario promovido a administrador"
            : "Rol de administrador removido"
        );
      } else if (confirmState.type === "block") {
        const action = member.isActive ? "block" : "unblock";
        await blockMember(member.userId, action);
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === member.userId
              ? {
                ...m,
                isActive: action === "block" ? false : true,
                status: action === "block" ? "blocked" : "active",
              }
              : m
          )
        );
        showSuccess(
          action === "block" ? "Miembro bloqueado" : "Miembro desbloqueado"
        );
      } else if (confirmState.type === "delete") {
        await deleteMember(member.userId);
        setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
        setTotalItems((t) => Math.max(0, t - 1));
        showSuccess("Miembro eliminado de la comunidad");
      }
    } catch (error) {
      let message = "Acción fallida, intente nuevamente";
      if (error?.message === "Cannot change creator role") {
        message = "No se puede cambiar el rol del creador de la comunidad";
      }
      showError(message);
    } finally {
      closeConfirm();
    }
  }, [confirmState, closeConfirm, communityId, showSuccess, showError]);

  const handleChangeModerator = useCallback(async () => {
    const member = confirmState.member;
    if (!member?.userId || !member?.targetRole) return;
    try {
      await changeAdminRole(communityId, member.userId, member.targetRole);
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === member.userId ? { ...m, role: member.targetRole } : m
        )
      );
      showSuccess(
        member.targetRole === "moderator"
          ? "Usuario promovido a moderador"
          : "Rol de moderador removido"
      );
    } catch (error) {
      let message = "Acción fallida, intente nuevamente";
      if (error?.message === "Cannot change creator role") {
        message = "No se puede cambiar el rol del creador de la comunidad";
      }
      showError(message);
    } finally {
      closeConfirm();
    }
  }, [confirmState, closeConfirm, communityId, showSuccess, showError]);

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          key: "id",
          label: "ID",
          render: (_value, row) => (
            <span className={styles.id}>{formatId(row.id)}</span>
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
              <div className={styles.nameWrapper}>
                <Link href={`/perfil/${row.id}`} className={styles.nameLink}>
                  {row.firstName} {row.lastName || ""}
                </Link>
                {row.role === "admin" || row.role === "creator" ? (
                  <StarIcon className={styles.starIcon} />
                ) : null}
                {row.role === "admin" || row.role === "creator" || row.role === "moderator" ? (
                  <EditPencil className={styles.starIcon} />
                ) : null}
              </div>
            </div>
          ),
        },
        {
          key: "accountType",
          label: "TIPO DE CUENTA",
          render: (_value, row) => <span>{toDisplayAccountType(row.key)}</span>,
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
            <span className={styles.company}>{row.company || "N/A"}</span>
          ),
        },
      ];

      // Solo agregar la columna createPost si creator.canModerate es true
      if (creator?.canModerate) {
        baseColumns.push({
          key: "createPost",
          label: "CREAR POSTS",
          render: (_value, row) => (
            <Toggle
              variant="community"
              checked={row.role === "admin" || row.role === "creator" || row.role === "moderator"}
              disabled={row.role === "creator" || row.role === "admin"}
              onChange={(checked) => {
                handleChangeModeratorRole(row, checked ? "yes" : "no");
              }}
            />
          ),
        });
      }

      baseColumns.push({
        key: "actions",
        label: "ACCIONES",
        render: (_value, row, userId) => (
          <div className={styles.actions}>
            <button
              type="button"
              title={row.isActive ? "Bloquear" : "Desbloquear"}
              className={`${styles.actionIcon} ${row.isActive ? "" : styles.isBlocked
                }`}
              onClick={() => openConfirm("block", row)}
              disabled={
                row.role === "creator" ||
                (row.role === "admin" && userId === row.userId) ||
                (userId === row.userId && !row.isActive)
              }
            >
              <StopWarningIcon />
            </button>
            <button
              type="button"
              title="Eliminar"
              className={styles.actionIcon}
              onClick={() => openConfirm("delete", row)}
              disabled={row.role === "creator"}
            >
              <UserRemoveIcon />
            </button>
            <button
              type="button"
              title="Cambiar rol"
              className={styles.actionIcon}
              onClick={() => openConfirm("changeRole", row)}
              disabled={row.role === "creator"}
            >
              <UserRoundCogIcon />
            </button>
          </div>
        ),
      });

      return baseColumns;
    },
    [creator?.canModerate, openConfirm, handleChangeModeratorRole]
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>USUARIOS</h1>
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
          data={pagedMembers}
          userId={userId}
          columns={columns}
          loading={loading && members.length > 0}
        />
      </div>

      <div className={styles.mobileSearchInput}>
        <Input
          placeholder="Buscar usuarios"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rounded="large"
          iconPosition="right"
          style={{ width: "100%" }}
          icon={<SearchIcon />}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.mobileList}>
        {pagedMembers.length > 0 ? (
          pagedMembers.map((row) => (
            <UserCard
              key={row.userId || row.id}
              user={row}
              onChangeRole={() => openConfirm("changeRole", row)}
              onBlock={() => openConfirm("block", row)}
              onDelete={() => openConfirm("delete", row)}
              currentUserId={userId}
              onChangeModerator={handleChangeModeratorRole}
            />
          ))
        ) : (
          <CommunityEmpty title="No hay usuarios" showButton={false} />
        )}
      </div>

      {currentPage < totalPages && members.length > 0 && (
        <div className={styles.mobileLoadMore}>
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      )}

      {loading && members.length === 0 && (
        <div className={styles.loadingContainer}>
          <span>
            Cargando usuarios <Spinner />
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
            confirmState.type === "changeRole" ? (
              <p style={{ margin: "0 auto" }}>
                <span style={{ fontWeight: 400 }}>
                  {confirmState.member?.role === "admin"
                    ? "¿Estás seguro que querés"
                    : "¿Estás seguro que querés"}
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  {confirmState.member?.role === "admin"
                    ? "quitarle el rol de Administrador de la Comunidad"
                    : "cambiarle el rol a Administrador de la Comunidad"}
                </span>
                <span style={{ fontWeight: 400 }}>?</span>
              </p>
            ) : confirmState.type === "delete" ? (
              <p style={{ margin: "0 auto" }}>
                <span style={{ fontWeight: 400 }}>
                  ¿Estás seguro que querés
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  eliminar a este miembro?
                </span>
              </p>
            ) : (
              <p style={{ margin: "0 auto" }}>
                <span style={{ fontWeight: 400, maxWidth: "250px" }}>
                  ¿Estás seguro que querés
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  {confirmState.member?.isActive
                    ? "bloquear a este miembro?"
                    : "desbloquear a este miembro?"}
                </span>
              </p>
            )
          }
          icon={
            confirmState.type === "changeRole"
              ? WarningIcon
              : confirmState.type === "delete"
                ? UserRemoveIcon
                : StopWarningIcon
          }
          confirmText={
            confirmState.type === "changeRole"
              ? "Sí"
              : confirmState.type === "delete"
                ? "Sí, eliminar miembro"
                : confirmState.member?.isActive
                  ? "Sí, bloquear miembro"
                  : "Sí, desbloquear miembro"
          }
          cancelText={confirmState.type === "changeRole" ? "No" : "Cancelar"}
          confirmVariant={
            confirmState.type === "changeRole" ? "primary" : "secondary"
          }
          iconSize={confirmState.type === "changeRole" ? 58 : 40}
          iconStyle={
            confirmState.type === "changeRole"
              ? { color: "#616161", width: 64, height: 58 }
              : { color: "#FF383C" }
          }
          confirmButtonStyle={
            confirmState.type === "changeRole"
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

// removed mobile hook & inline card; visibility handled via CSS media queries
