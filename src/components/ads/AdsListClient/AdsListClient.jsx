"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PaymentPill from "../PaymentPill/PaymentPill";
import AdCard from "../AdCard/AdCard";
import ButtonAds from "../ButtonAds/ButtonAds";
import AdDetailModal from "../AdDetailModal/AdDetailModal";
import { DataTable, Spinner, Input, Button, Pagination } from "@/components/ui";
import styles from "./AdsListClient.module.scss";
import pubStyles from "./AdsListClient.ads.module.scss";
import { getUserAds } from "@/actions/ads";
import dayjs from "dayjs";
import CloseCircleIcon from "@/assets/close_ring.svg?react";

/**
 * @param {{
 *   clientId: string;
 *   initialData?: { ads?: any[]; profile?: any };
 *   dateFrom?: string;
 *   dateTo?: string;
 *   onDateFromChange?: (value: string) => void;
 *   onDateToChange?: (value: string) => void;
 *   onClearFilters?: () => void;
 * }}
 */
export default function AdsListClient({
  clientId,
  initialData,
  dateFrom: externalDateFrom,
  dateTo: externalDateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}) {
  const [ads, setAds] = useState(initialData?.ads || []);
  const [userProfile] = useState(initialData?.profile || null);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [internalDateFrom, setInternalDateFrom] = useState("");
  const [internalDateTo, setInternalDateTo] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(initialData?.pagination?.total || initialData?.total || 0);

  // Mobile pagination state (for load more functionality)
  const [internalPage, setInternalPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    initialData?.pagination?.pages || (initialData?.total ? Math.ceil(initialData.total / 10) : 0)
  );
  const isAppendingRef = useRef(false);

  // Use external dates if provided, otherwise use internal state
  const dateFrom =
    externalDateFrom !== undefined ? externalDateFrom : internalDateFrom;
  const dateTo = externalDateTo !== undefined ? externalDateTo : internalDateTo;
  // Fetch ads data
  const fetchAds = useCallback(async (page = currentPage, limit = pageSize, dateFromFilter, dateToFilter) => {
    setLoading(true);
    try {
      const response = await getUserAds({
        clientId,
        page,
        limit,
        dateFrom: dateFromFilter || dateFrom,
        dateTo: dateToFilter || dateTo
      });
      if (response && response.ads) {
        setAds(response.ads);
        // Handle pagination data from API response
        if (response.pagination) {
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.pages || 0);
        } else if (response.total !== undefined) {
          setTotalItems(response.total || 0);
          setTotalPages(Math.ceil((response.total || 0) / pageSize));
        }
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [clientId, currentPage, pageSize, dateFrom, dateTo]);

  // Fetch data on mount if no initial data
  useEffect(() => {
    if (!initialData?.ads || initialData.ads.length === 0) {
      fetchAds(currentPage, pageSize);
    }
  }, [fetchAds, initialData, currentPage, pageSize]);

  // Reset mobile pagination when filters change
  useEffect(() => {
    setInternalPage(1);
  }, [dateFrom, dateTo]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Resolve total price from ad object
  const resolveTotalPrice = (ad) => {
    const parseAmount = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const fromTotalPrice = parseAmount(ad.totalPrice);
    if (fromTotalPrice !== null) return fromTotalPrice;

    const fromPricingTotalPrice = parseAmount(ad?.pricing?.totalPrice);
    if (fromPricingTotalPrice !== null) return fromPricingTotalPrice;

    const fromPaymentAmount = parseAmount(ad.paymentAmount);
    if (fromPaymentAmount !== null) return fromPaymentAmount;

    const fromPaymentNestedAmount = parseAmount(ad?.payment?.amount);
    if (fromPaymentNestedAmount !== null) return fromPaymentNestedAmount;

    return null;
  };

  // Handle detail click
  const handleDetailClick = (ad) => {
    setSelectedAd(ad);
  };

  const handleCloseDetail = () => {
    setSelectedAd(null);
  };

  // Helper to determine if ad is published
  const isPublished = (ad) => {
    const endDate = ad.duration?.endDate;
    const isExpired = endDate && dayjs(endDate).isBefore(dayjs(), 'day');
    return ad.status === "active" && 
           !ad.isPaused && 
           ad.paymentStatus !== 'pending' &&
           !isExpired;
  };

  // Helper to get status text
  const getStatusText = (status, isPaused, paymentStatus, endDate) => {
    if (isPaused) return "PAUSADA";
    
    // Check if the ad has expired (past end date)
    if (endDate && dayjs(endDate).isBefore(dayjs(), 'day')) {
      return "FINALIZADO";
    }
    
    // If status is active but payment is pending, show as pending
    if (status === "active" && paymentStatus === "pending") {
      return "PENDIENTE";
    }
    
    if (status === "active") return "ACTIVA";
    if (status === "pending") return "PENDIENTE";
    if (status === "inactive") return "FINALIZADO";
    return "CANCELADO";
  };

  // Handle date filter changes
  const handleDateFromChange = (value) => {
    if (onDateFromChange) {
      onDateFromChange(value);
    } else {
      setInternalDateFrom(value);
      // If dateTo is set and dateFrom is after dateTo, clear dateTo
      if (value && dateTo && dayjs(value).isAfter(dayjs(dateTo))) {
        if (onDateToChange) {
          onDateToChange("");
        } else {
          setInternalDateTo("");
        }
      }
    }
  };

  const handleDateToChange = (value) => {
    if (onDateToChange) {
      onDateToChange(value);
    } else {
      setInternalDateTo(value);
      // If dateFrom is set and dateTo is before dateFrom, clear dateFrom
      if (value && dateFrom && dayjs(value).isBefore(dayjs(dateFrom))) {
        if (onDateFromChange) {
          onDateFromChange("");
        } else {
          setInternalDateFrom("");
        }
      }
    }
  };

  // Clear all filters
  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      setInternalDateFrom("");
      setInternalDateTo("");
    }
  };


  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAds(page, pageSize);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchAds(1, size);
  };

  // Mobile-only: load more (append)
  const handleLoadMore = async () => {
    if (internalPage < totalPages && !loading) {
      isAppendingRef.current = true;
      const nextPage = internalPage + 1;
      setLoading(true);
      try {
        const response = await getUserAds({
          clientId,
          page: nextPage,
          limit: pageSize,
          dateFrom: dateFrom,
          dateTo: dateTo
        });
        if (response) {
          const incoming = response.ads || [];
          setAds((prev) => [...prev, ...incoming]);
          setInternalPage(nextPage);
          // Update pagination if needed
          if (response.pagination) {
            setTotalItems(response.pagination.total || 0);
            setTotalPages(response.pagination.pages || 0);
          }
          // Don't notify parent - we're appending, not changing page
        }
      } catch (error) {
        console.error("Error loading more ads:", error);
      } finally {
        setLoading(false);
        isAppendingRef.current = false;
      }
    }
  };

  // Filter ads based on date range
  const filteredAds = useMemo(() => {
    if (!dateFrom && !dateTo) return ads;

    return ads.filter((ad) => {
      const adStartDateStr = ad.duration?.startDate;
      const adEndDateStr = ad.duration?.endDate;

      // If ad has no dates, exclude it
      if (!adStartDateStr && !adEndDateStr) return false;

      // Parse dates, handling invalid dates
      const adStartDate = adStartDateStr
        ? dayjs(adStartDateStr).startOf("day")
        : null;
      const adEndDate = adEndDateStr
        ? dayjs(adEndDateStr).startOf("day")
        : null;

      // Validate parsed dates
      if (adStartDate && !adStartDate.isValid()) return false;
      if (adEndDate && !adEndDate.isValid()) return false;

      const filterFrom = dateFrom ? dayjs(dateFrom).startOf("day") : null;
      const filterTo = dateTo ? dayjs(dateTo).startOf("day") : null;

      // Check if ad overlaps with filter range
      if (filterFrom && filterTo) {
        // Ad must overlap with the filter range
        // Ad starts before or on filter end AND ad ends after or on filter start
        const adStartsBeforeFilterEnd =
          adStartDate &&
          (adStartDate.isBefore(filterTo, "day") ||
            adStartDate.isSame(filterTo, "day"));
        const adEndsAfterFilterStart =
          adEndDate &&
          (adEndDate.isAfter(filterFrom, "day") ||
            adEndDate.isSame(filterFrom, "day"));

        return adStartsBeforeFilterEnd && adEndsAfterFilterStart;
      } else if (filterFrom) {
        // Only from date: ad must end after or on filterFrom
        return (
          adEndDate &&
          (adEndDate.isAfter(filterFrom, "day") ||
            adEndDate.isSame(filterFrom, "day"))
        );
      } else if (filterTo) {
        // Only to date: ad must start before or on filterTo
        return (
          adStartDate &&
          (adStartDate.isBefore(filterTo, "day") ||
            adStartDate.isSame(filterTo, "day"))
        );
      }

      return true;
    });
  }, [ads, dateFrom, dateTo]);

  // Define columns with custom renderers
  const columns = useMemo(
    () => [
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
        render: (value, row) => (
          <span className={styles.statusText}>
            {getStatusText(row.status, row.isPaused, row.paymentStatus, row.duration?.endDate)}
          </span>
        ),
      },
      {
        key: "startDate",
        label: "DESDE",
        render: (value, row) => (
          <span className={styles.date}>
            {formatDate(row.duration?.startDate)}
          </span>
        ),
      },
      {
        key: "endDate",
        label: "HASTA",
        render: (value, row) => (
          <span className={styles.date}>
            {formatDate(row.duration?.endDate)}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        label: "PAGO",
        render: (value, row) => <PaymentPill status={row.paymentStatus} />,
      },
      {
        key: "totalPrice",
        label: "PRECIO",
        render: (value, row) => {
          const totalPrice = resolveTotalPrice(row);
          return (
            <span className={styles.price}>
              {totalPrice !== null ? formatCurrency(totalPrice) : "-"}
            </span>
          );
        },
      },
      {
        key: "detail",
        label: "DETALLE",
        render: (value, row) => (
          <button
            className={pubStyles.detailLink}
            onClick={() => handleDetailClick(row)}
            type="button"
          >
            VER ANUNCIO
          </button>
        ),
      },
    ],
    []
  );

  // Show loading state
  if (loading && ads.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <span>
            Cargando <Spinner color="white" size="small" />
          </span>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && ads.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyMessage} style={{ color: "#101F2A" }}>
          AÚN NO CREASTE ANUNCIOS. EMPEZÁ A PROMOCIONAR TU EMPRESA
        </p>
        <div className={styles.emptyButton}>
          <ButtonAds />
        </div>
      </div>
    );
  }

  // Check if using external filters (filters in header)
  const usingExternalFilters = onDateFromChange !== undefined;

  return (
    <div className={styles.tableWrapper}>
      {/* Desktop Filters - Only render if not using external filters */}
      {!usingExternalFilters && (
        <div className={styles.filtersRow}>
          <div className={styles.dateFilterContainer}>
            <div className={styles.dateInputContainer}>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  const value = e?.target?.value || e;
                  handleDateFromChange(value);
                }}
                label="Desde"
                className={styles.dateInput}
              />
              {dateFrom && (
                <span
                  className={styles.clearButton}
                  onClick={() => handleDateFromChange("")}
                  aria-label="clear"
                  role="button"
                >
                  <CloseCircleIcon height={15} width={15} />
                </span>
              )}
            </div>
            <div className={styles.dateInputContainer}>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  const value = e?.target?.value || e;
                  handleDateToChange(value);
                }}
                label="Hasta"
                className={styles.dateInput}
              />
              {dateTo && (
                <span
                  className={styles.clearButton}
                  onClick={() => handleDateToChange("")}
                  aria-label="clear"
                  role="button"
                >
                  <CloseCircleIcon height={15} width={15} />
                </span>
              )}
            </div>
          </div>
          <Button onClick={clearFilters} disabled={!dateFrom && !dateTo}>
            Limpiar filtros
          </Button>
        </div>
      )}

      <DataTable
        data={filteredAds}
        columns={columns}
        loading={loading && ads.length > 0}
      />


      {/* Mobile Filters - Visible only below 1200px */}
      <div className={pubStyles.mobileFilters}>
        <div className={pubStyles.dateFilterContainer}>
          <div className={pubStyles.dateInputContainer}>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                const value = e?.target?.value || e;
                handleDateFromChange(value);
              }}
              label="Desde"
              className={pubStyles.dateInputMobile}
            />
            {dateFrom && (
              <span
                className={pubStyles.clearButton}
                onClick={() => handleDateFromChange("")}
                aria-label="clear"
                role="button"
              >
                <CloseCircleIcon height={15} width={15} />
              </span>
            )}
          </div>
          <div className={pubStyles.dateInputContainer}>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                const value = e?.target?.value || e;
                handleDateToChange(value);
              }}
              label="Hasta"
              className={pubStyles.dateInputMobile}
            />
            {dateTo && (
              <span
                className={pubStyles.clearButton}
                onClick={() => handleDateToChange("")}
                aria-label="clear"
                role="button"
              >
                <CloseCircleIcon height={15} width={15} />
              </span>
            )}
          </div>
        </div>
        <Button onClick={clearFilters} disabled={!dateFrom && !dateTo}>
          Limpiar filtros
        </Button>
      </div>

      {/* Cards Grid - Visible only below 1200px */}
      <div className={pubStyles.cardsGrid}>
        {filteredAds.length > 0
          ? filteredAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDetailClick={handleDetailClick} />
          ))
          : !loading && (
            <div className={pubStyles.noAds}>
              No hay anuncios en el rango de fechas seleccionado
            </div>
          )}
      </div>

      {selectedAd ? (
        <AdDetailModal
          ad={selectedAd}
          onClose={handleCloseDetail}
          userProfile={userProfile}
          clientId={clientId}
          onPause={() => fetchAds(currentPage, pageSize)}
        />
      ) : null}

      {/* Desktop Pagination */}
      {totalItems > 0 && (
        <div className={`${styles.paginationContainer} ${pubStyles.noShowMobile}`}>
          <Pagination
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemName="Anuncios"
          />
        </div>
      )}

      {/* Mobile Load More Button */}
      {internalPage < totalPages && ads.length > 0 && (
        <div className={pubStyles.noShowDesktop} style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      )}
    </div>
  );
}
