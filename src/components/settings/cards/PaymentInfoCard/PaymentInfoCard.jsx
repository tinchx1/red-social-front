"use client";
import React, { useState, useEffect } from "react";
import styles from "./PaymentInfoCard.module.scss";
import { Button, Spinner } from "@/components/ui";
import { useRouter } from "next/navigation";

/**
 * @param {{ isFree: boolean; onUpdatePayment?: (subscriptionId: string) => void; subscriptionId?: string; isLoading?: boolean }} props
 */
export default function PaymentInfoCard({
  isFree,
  onUpdatePayment,
  subscriptionId,
  isLoading = false,
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleClick = () => {
    if (isFree) {
      router.push("/planes");
    } else {
      onUpdatePayment?.(subscriptionId);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Información de Pago</h2>
        {!isMobile && (
          <Button
            variant="outline"
            onClick={handleClick}
            className={styles.actionBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Cargando... <Spinner size="small" />
              </>
            ) : isFree ? (
              "Ver planes y precios"
            ) : (
              "Actualizar método de pago"
            )}
          </Button>
        )}
      </div>

      <div className={styles.block}>
        <div className={styles.subtitle}>Método de pago</div>
        <div className={styles.value}>
          {isFree ? "No hay método de pago" : "Mercado Pago"}
        </div>
      </div>

      {isMobile && (
        <div className={styles.mobileFooter}>
          <Button
            variant="outline"
            onClick={handleClick}
            className={styles.actionBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Cargando... <Spinner size="small" />
              </>
            ) : isFree ? (
              "Ver planes y precios"
            ) : (
              "Actualizar método de pago"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
