"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { clientApi } from "@/lib/api";
import {
  DataTable,
  Select,
  Input,
  Button,
  ConfirmModal,
  Spinner,
} from "@/components/ui";
import SearchIcon from "@/assets/search.svg";
import UserRemoveIcon from "@/assets/user-remove.svg";
import WarningIcon from "@/assets/warning2.svg";
import { useToast } from "@/contexts";
import { changeAdminRole } from "@/actions/community";
import styles from "./CommunityAdminsClient.module.scss";
import AdminCard from "./AdminCard/AdminCard";
import { CommunityEmpty } from "../../connections/communityEmpty/CommunityEmpty";

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

const formatDate = (dateString) => {
  if (!dateString) return "dd/mm/aaaa";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "dd/mm/aaaa";
  }
};

/**
 * @param {{
 *   communityId: string;
 *   initialData: any[];
 * }} props
 */
export default function CommunityAdminsClient({ communityId, initialData }) {
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [admins, setAdmins] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    admin: null,
  });
  const { showSuccess, showError } = useToast();
  const debouncedQuery = useDebounced(query, 400);

  const fetchAdmins = useCallback(async () => {
    if (!communityId) return;

    setLoading(true);
    try {
      const response = await clientApi.get(
        `/communities/${communityId}/admins`
      );
      const data = response?.data?.data || response?.data || [];

      // Apply client-side filtering
      let filtered = data;
      if (role) {
        filtered = filtered.filter((admin) => admin.key === role);
      }
      if (debouncedQuery) {
        const queryLower = debouncedQuery.toLowerCase();
        filtered = filtered.filter(
          (admin) =>
            admin.firstName?.toLowerCase().includes(queryLower) ||
            admin.lastName?.toLowerCase().includes(queryLower) ||
            admin.email?.toLowerCase().includes(queryLower)
        );
      }

      setAdmins(filtered);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [communityId, role, debouncedQuery]);

  // Initialize from server-provided initialData or fetch from API on mount
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setAdmins(initialData);
    } else if (communityId) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when communityId becomes available or changes during client navigation
  useEffect(() => {
    if (!communityId) return;
    if (!initialData || initialData.length === 0) {
      fetchAdmins();
    }
  }, [communityId, initialData, fetchAdmins]);

  // Refetch when filters change
  useEffect(() => {
    if (!communityId) return;
    // Skip on initial mount if we have initialData
    if (initialData && initialData.length > 0 && !role && !debouncedQuery) {
      return;
    }
    fetchAdmins();
  }, [communityId, role, debouncedQuery, fetchAdmins, initialData]);

  const clearFilters = () => {
    setRole("");
    setQuery("");
  };

  const openConfirm = useCallback((type, admin) => {
    setConfirmState({ isOpen: true, type, admin });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ isOpen: false, type: null, admin: null });
  }, []);

  const handleConfirm = useCallback(async () => {
    const admin = confirmState.admin;
    if (!admin?.id) return;
    try {
      if (confirmState.type === "changeRole") {
        await changeAdminRole(communityId, admin.id, "member");
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
        showSuccess("Rol de administrador removido exitosamente");
      }
    } catch (error) {
      console.error("Error al cambiar rol de administrador:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "";
      if (
        errorMessage.toLowerCase().includes("cannot change creator role") ||
        errorMessage.toLowerCase().includes("creator role")
      ) {
        showError("No se puede cambiar el rol del creador de la comunidad.");
      } else {
        showError(
          "No se pudo completar la acción. Por favor, intentá nuevamente."
        );
      }
    } finally {
      closeConfirm();
    }
  }, [confirmState, communityId, closeConfirm, showSuccess, showError]);

  const columns = useMemo(
    () => [
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
            <Link href={`/perfil/${row.id}`} className={styles.nameLink}>
              {row.firstName} {row.lastName || ""}
            </Link>
          </div>
        ),
      },
      {
        key: "accountType",
        label: "TIPO DE CUENTA",
        render: (_value, row) => (
          <span>{toDisplayAccountType(row.accountType)}</span>
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
          <span className={styles.company}>{row.company || "N/A"}</span>
        ),
      },
      {
        key: "adminSince",
        label: "ADMIN DESDE",
        render: (_value, row) => (
          <span className={styles.adminSince}>
            {formatDate(row.joinedAt || row.joinedAt)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "ACCIONES",
        render: (_value, row) => (
          <div className={styles.actions}>
            <button
              type="button"
              title="Quitar rol de administrador"
              className={styles.actionIcon}
              onClick={() => openConfirm("changeRole", row)}
            >
              <UserRemoveIcon />
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
        <h1 className={styles.title}>ADMINISTRADORES</h1>
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
            placeholder="Buscar"
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
          data={admins}
          columns={columns}
          loading={loading && admins.length > 0}
        />
      </div>

      <div className={styles.mobileSearchInput}>
        <Input
          placeholder="Buscar"
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
        {admins.length > 0 ? (
          admins.map((row) => (
            <AdminCard
              key={row.id}
              admin={row}
              onChangeRole={() => openConfirm("changeRole", row)}
            />
          ))
        ) : (
          <CommunityEmpty title="No hay administradores" showButton={false} />
        )}
      </div>

      {loading && admins.length === 0 && (
        <div className={styles.loadingContainer}>
          <span>Cargando administradores <Spinner /></span>
        </div>
      )}

      {confirmState.isOpen && (
        <ConfirmModal
          isOpen
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          title={
            <p style={{ margin: "0 auto" }}>
              <span style={{ fontWeight: 400 }}>¿Estás seguro que querés</span>{" "}
              <span style={{ fontWeight: 700 }}>
                quitarle el rol de Administrador de la Comunidad
              </span>
              <span style={{ fontWeight: 400 }}>?</span>
            </p>
          }
          icon={WarningIcon}
          confirmText="Sí"
          cancelText="No"
          confirmVariant="primary"
          iconSize={58}
          iconStyle={{ color: "#616161", width: 64, height: 58 }}
          confirmButtonStyle={{}}
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
