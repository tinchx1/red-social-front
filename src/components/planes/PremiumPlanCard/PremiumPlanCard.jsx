"use client";
import React from "react";
import styles from "./PremiumPlanCard.module.scss";
import { Button, Spinner } from "@/components/ui";
import CheckIcon from "@/assets/check-planes-premium.svg";
import XIcon from "@/assets/close-planes.svg";

/**
 * @param {{
 *   title: string;
 *   price: string;
 *   features: Array<{ name: string; included: boolean }>;
 *   onSubscribe?: () => void;
 *   isSubscribed?: boolean;
 *   isLoading?: boolean;
 * }} props
 */
export default function PremiumPlanCard({
  title,
  price,
  features,
  onSubscribe,
  beforePrice,
  isSubscribed = false,
  isLoading = false,
}) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.titleDescription}>Más Popular</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{price} ARS</span>
          <span className={styles.month}>/mes</span>
        </div>
        {beforePrice && (
          <span className={styles.beforePrice}>
            Antes <span className={styles.beforePriceValue}>{beforePrice}</span>
          </span>
        )}
      </div>
      <ul className={styles.features}>
        {features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            <span className={styles.featureName}>{feature.name}</span>
            {feature.included ? (
              <CheckIcon className={styles.checkIcon} />
            ) : (
              <XIcon className={styles.xIcon} />
            )}
          </li>
        ))}
      </ul>
      <Button
        onClick={onSubscribe}
        className={styles.subscribeButton}
        disabled={isSubscribed || isLoading}
      >
        {isSubscribed ? (
          "Suscripto"
        ) : isLoading ? (
          <>
            Redirigiendo <Spinner color="white" size="small" />
          </>
        ) : (
          "Suscribirme"
        )}
      </Button>
    </article>
  );
}
