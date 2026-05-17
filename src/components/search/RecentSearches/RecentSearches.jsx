"use client";
import { useEffect, useState, useCallback } from "react";
import SearchCard from "@/components/search/SearchCard/SearchCard";
import SearchIcon from "@/assets/search.svg";
import styles from "./RecentSearches.module.scss";
import { useRouter } from "next/navigation";

const SEARCH_HISTORY_KEY = "searchHistory";

const normalizeEntry = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") {
    const label = raw;
    const url = `/buscar?keyword=${encodeURIComponent(label)}`;
    return { label, url };
  }
  if (typeof raw === "object" && raw.label && raw.url) {
    return { label: String(raw.label), url: String(raw.url) };
  }
  return null;
};

const safeRead = () => {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SEARCH_HISTORY_KEY)
        : null;
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map((item) => normalizeEntry(item))
      .filter(Boolean);
    return normalized;
  } catch {
    return [];
  }
};

const safeWrite = (items) => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
    }
  } catch {
    // ignore persistence errors
  }
};

// Deduplicate by label; keep the entry that has the longest URL (more params)
const dedupeByLabelPreferLonger = (items) => {
  const byLabel = new Map();
  for (const it of items) {
    const key = String(it.label || "").toLowerCase();
    const existing = byLabel.get(key);
    if (!existing || (it.url || "").length > (existing.url || "").length) {
      byLabel.set(key, it);
    }
  }
  return Array.from(byLabel.values());
};

const RecentSearches = ({
  isOpen,
  onClose,
  onSelect,
  title = "Ultimas búsquedas",
  placement = "absolute",
}) => {
  const [history, setHistory] = useState([]);
  const router = useRouter();
  const refresh = useCallback(() => {
    const items = dedupeByLabelPreferLonger(safeRead());
    // persist back the deduped list so other readers benefit
    safeWrite(items);
    setHistory(items.slice(0, 4));
  }, []);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const handleClick = (entry) => {
    if (onSelect) onSelect(entry.label);
    // Reorder without duplicates: keep the longest URL for this label
    const current = dedupeByLabelPreferLonger(safeRead());
    const labelKey = String(entry.label || "").toLowerCase();
    const existing = current.find(
      (it) => String(it.label || "").toLowerCase() === labelKey
    );
    const keep = existing
      ? (entry.url || "").length > (existing.url || "").length
        ? entry
        : existing
      : entry;
    const filtered = current.filter(
      (it) => String(it.label || "").toLowerCase() !== labelKey
    );
    const updated = [keep, ...filtered];
    safeWrite(updated);
    setHistory(updated.slice(0, 4));
    router.push(keep.url);
  };

  const handleRemove = (entry, e) => {
    if (e) e.stopPropagation();
    const current = safeRead();
    const updated = current.filter((it) => it.url !== entry.url);
    safeWrite(updated);
    setHistory(updated.slice(0, 4));
  };

  return (
    <SearchCard
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      placement={placement}
    >
      <div className={styles.searchHistory}>
        {history.map((entry) => (
          <div
            key={entry.url}
            className={styles.searchItem}
            onClick={() => handleClick(entry)}
          >
            <SearchIcon className={styles.historyIcon} />
            <span className={styles.searchText}>{entry.label}</span>
            <button
              type="button"
              className={styles.closeIcon}
              aria-label={`Eliminar ${entry.label} del historial`}
              onClick={(e) => handleRemove(entry, e)}
            >
              ×
            </button>
          </div>
        ))}
        {history.length === 0 && (
          <div className={`${styles.searchItem} ${styles.isEmpty}`}>
            <span className={styles.searchText}>
              No hay búsquedas recientes
            </span>
          </div>
        )}
      </div>
    </SearchCard>
  );
};

export default RecentSearches;
