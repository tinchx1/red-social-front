"use client";
import React from "react";
import StatusPill from "../StatusPill/StatusPill";
import PaymentPill from "../PaymentPill/PaymentPill";
import styles from "./AdCard.module.scss";
import dayjs from "dayjs";

/**
 * @param {{ ad: any; onDetailClick: (ad: any) => void }} props
 */
const AdCard = ({ ad, onDetailClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Check if ad is currently published considering status, payment, pause state and expiration date
  const endDate = ad.duration?.endDate;
  const isExpired = endDate && dayjs(endDate).isBefore(dayjs(), 'day');
  const isPublished = ad.status === "active" && 
                      !ad.isPaused && 
                      ad.paymentStatus !== 'pending' &&
                      !isExpired;
  const totalPrice = resolveTotalPrice(ad);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <StatusPill 
          status={ad.status} 
          isPaused={ad.isPaused}
          paymentStatus={ad.paymentStatus}
          endDate={ad.duration?.endDate}
        />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.field}>
          <div className={styles.id}>ID #{ad.id.slice(-3)}</div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Publicado actualmente:</span>
          <span className={styles.value}>{isPublished ? "SI" : "NO"}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Desde:</span>
          <span className={styles.value}>
            {formatDate(ad.duration?.startDate)}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Hasta:</span>
          <span className={styles.value}>
            {formatDate(ad.duration?.endDate)}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Precio:</span>
          <span className={styles.value}>
            {totalPrice !== null ? formatCurrency(totalPrice) : "-"}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Pago:</span>
          <PaymentPill status={ad.paymentStatus} />
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          className={styles.detailButton}
          onClick={() => onDetailClick(ad)}
          type="button"
        >
          VER ANUNCIO
        </button>
      </div>
    </div>
  );
};

export default AdCard;
