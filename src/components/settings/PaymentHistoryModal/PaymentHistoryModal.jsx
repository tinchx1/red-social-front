"use client";
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import styles from "./PaymentHistoryModal.module.scss";
import { Modal, Spinner } from "@/components/ui";
import ChevronLeft from "@/assets/chevron_left.svg";
import ChevronRight from "@/assets/chevron_right.svg";

/**
 * @param {{
 *  isOpen: boolean;
 *  onClose: () => void;
 *  data: {
 *    currentSubscription: {
 *      plan: {
 *        name: string;
 *        key: string;
 *        price: string;
 *        currency: string;
 *      };
 *      nextBillingDate: string;
 *      amount: string;
 *    };
 *    paymentHistory: Array<{
 *      date: string;
 *      amount: string;
 *      currency: string;
 *      membershipPeriod: {
 *        from: string;
 *        to: string;
 *      };
 *      plan: {
 *        name: string;
 *        key: string;
 *      };
 *    }>;
 *    pagination: {
 *      page: number;
 *      limit: number;
 *      total: number;
 *      pages: number;
 *    };
 *  } | null;
 *  loading: boolean;
 *  error: any;
 *  currentPage: number;
 *  totalPages: number;
 *  nextPage: () => void;
 *  prevPage: () => void;
 * }} props
 */
export default function PaymentHistoryModal({
  isOpen,
  onClose,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
}) {
  const formatDate = (dateString) => {
    return dayjs(dateString).locale("es").format("DD [de] MMMM [de] YYYY");
  };
  const formatDateShort = (dateString) => {
    return dayjs(dateString).locale("es").format("DD/MM/YYYY");
  };
  const formatCurrency = (price, currency) => {
    return `${currency} ${price}`;
  };

  const formatMembershipPeriod = (from, to) => {
    const fromDate = formatDateShort(from);
    const toDate = formatDateShort(to);
    return `Membresía del ${fromDate} al ${toDate}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Pagos"
      size="large"
      titleClassName={styles.title}
      showCloseButton
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Current Subscription - Always visible */}
          {data?.currentSubscription && (
            <div className={styles.paymentItem}>
              <div className={styles.paymentHeader}>
                <div className={styles.planName}>
                  {data.currentSubscription.plan.name}
                </div>
                <span className={styles.priceHeader}>
                  {formatCurrency(
                    data.currentSubscription.plan.price,
                    data.currentSubscription.plan.currency
                  )}
                </span>
              </div>

              <div className={styles.paymentDetails}>
                <div className={styles.detail}>
                  <p className={styles.label}>
                    Tu próxima fecha de facturación es el{" "}
                    <span className={styles.value}>
                      {formatDate(data.currentSubscription.nextBillingDate)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className={styles.historySection}>
            <h4 className={styles.historyTitle}>Historial de pagos</h4>

            {loading ? (
              <div className={styles.historyLoading}>
                <Spinner />
                <p>Cargando historial de pagos</p>
              </div>
            ) : data?.paymentHistory && data.paymentHistory.length === 0 ? (
              <div className={styles.empty}>
                <p>No tienes historial de pagos aún.</p>
              </div>
            ) : data?.paymentHistory ? (
              <div className={styles.historyList}>
                {data.paymentHistory.map((payment, index) => (
                  <div key={index} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <div className={styles.historyDate}>
                        {formatDateShort(payment.date)}
                      </div>
                      <div className={styles.historyAmount}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                    <div className={styles.membershipPeriod}>
                      {formatMembershipPeriod(
                        payment.membershipPeriod.from,
                        payment.membershipPeriod.to
                      )}
                    </div>
                    <div className={styles.paymentMethod}>Mercado Pago</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationControls}>
            <div className={styles.pageIndicator}>
              <span className={styles.currentPage}>{currentPage}</span>
              <span className={styles.pageSeparator}>de</span>
              <span className={styles.totalPages}>{totalPages}</span>
            </div>
            <button
              type="button"
              className={`${styles.paginationButton} ${
                currentPage <= 1 ? styles.disabled : ""
              }`}
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              className={`${styles.paginationButton} ${
                currentPage >= totalPages ? styles.disabled : ""
              }`}
              onClick={nextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
