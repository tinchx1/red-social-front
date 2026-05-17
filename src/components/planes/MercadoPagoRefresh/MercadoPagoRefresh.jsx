"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Componente que detecta cuando el usuario vuelve de Mercado Pago
 * y fuerza la actualización de los datos de la página
 * Maneja tanto suscripciones (planes) como pagos únicos (anuncios)
 */
export default function MercadoPagoRefresh() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Parámetros de suscripciones (planes)
    const preapprovalId = searchParams.get("preapproval_id");
    const paymentId = searchParams.get("payment_id");
    const preferenceId = searchParams.get("preference_id");
    const externalReference = searchParams.get("external_reference");

    // Parámetros de pagos únicos (anuncios)
    const collectionId = searchParams.get("collection_id");
    const collectionStatus = searchParams.get("collection_status");
    const merchantOrderId = searchParams.get("merchant_order_id");
    const paymentType = searchParams.get("payment_type");
    const siteId = searchParams.get("site_id");
    const processingMode = searchParams.get("processing_mode");
    const merchantAccountId = searchParams.get("merchant_account_id");
    const status = searchParams.get("status");

    const refreshParam = searchParams.get("_refresh");

    // Detectar si viene de Mercado Pago (suscripciones o pagos únicos)
    const isFromMercadoPago =
      preapprovalId ||
      paymentId ||
      preferenceId ||
      externalReference ||
      collectionId ||
      collectionStatus ||
      merchantOrderId ||
      paymentType ||
      siteId ||
      processingMode ||
      merchantAccountId ||
      status;

    if (isFromMercadoPago) {
      // Limpiar todos los query params de Mercado Pago y agregar parámetro temporal para forzar bypass del cache
      const url = new URL(window.location.href);

      // Limpiar parámetros de suscripciones
      url.searchParams.delete("preapproval_id");
      url.searchParams.delete("payment_id");
      url.searchParams.delete("preference_id");
      url.searchParams.delete("external_reference");

      // Limpiar parámetros de pagos únicos (anuncios)
      url.searchParams.delete("collection_id");
      url.searchParams.delete("collection_status");
      url.searchParams.delete("merchant_order_id");
      url.searchParams.delete("payment_type");
      url.searchParams.delete("site_id");
      url.searchParams.delete("processing_mode");
      url.searchParams.delete("merchant_account_id");
      url.searchParams.delete("status");

      // Agregar parámetro temporal para forzar recarga desde servidor
      url.searchParams.set("_refresh", Date.now().toString());

      // Forzar recarga completa desde el servidor
      window.location.replace(url.toString());
    }
    // Si solo hay el parámetro de refresh, limpiarlo
    else if (refreshParam && !isFromMercadoPago) {
      const url = new URL(window.location.href);
      url.searchParams.delete("_refresh");
      window.history.replaceState({}, "", url.pathname + (url.search || ""));
    }
  }, [searchParams]);

  return null;
}
