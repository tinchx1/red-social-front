"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import styles from "./PlanCard.module.scss";
import { useSubscriptionHistory } from "@/hooks";
import { PaymentHistoryModal } from "@/components/settings";

/**
 * @param {{
 *  subscriptionName: string;
 *  isFree: boolean;
 *  renewalDateLabel?: string;
 *  amountLabel?: string;
 *  userData?: any;
 *  onSave?: (data: any) => void;
 * }} props
 */
export default function PlanCard({
  subscriptionName,
  isFree,
  renewalDateLabel,
  amountLabel,
  userData,
  onSave,
}) {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = useSubscriptionHistory();

  const handleViewHistoryClick = () => {
    setIsHistoryModalOpen(true);
  };

  const handleChangePasswordClick = () => {
    setEditModalDefaultTab("password");
    setIsEditModalOpen(true);
  };
  return (
    <>
      <section className={styles.container}>
        <h2 className={styles.title}>Plan actual</h2>

        <div className={styles.row}>
          <div className={styles.text}>{subscriptionName}</div>
        </div>

        {!isFree ? (
          <>
            <div className={styles.block}>
              <div className={styles.subtitle}>
                Fecha de renovación de la suscripción
              </div>
              <div className={styles.muted}>
                {renewalDateLabel
                  ? dayjs(renewalDateLabel).format("DD/MM/YYYY")
                  : "-"}
              </div>
            </div>

            <div className={styles.block}>
              <div className={styles.subtitle}>Lo que te cobraremos</div>
              <div className={styles.muted}>{`${amountLabel} ARS` || "-"}</div>
            </div>
          </>
        ) : null}

        {/* {historyData && historyData.data && historyData.data.length > 0 && ( */}
        <button
          type="button"
          className={styles.link}
          onClick={handleViewHistoryClick}
        >
          Ver Historial de Pagos
        </button>
        {/* )} */}
      </section>

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        data={historyData}
        loading={historyLoading}
        error={historyError}
        currentPage={currentPage}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
      />
    </>
  );
}
