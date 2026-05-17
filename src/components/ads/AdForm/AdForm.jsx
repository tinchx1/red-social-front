"use client";
import { useEffect, useState, useCallback, useTransition } from "react";
import AdFormMobile from "../AdFormMobile/AdFormMobile";
import AdFormDesktop from "../AdFormDesktop/AdFormDesktop";
import { calculatePricing, createAd } from "@/actions/ads";
import { useAdForm } from "@/contexts/AdFormContext";
import { useToast } from "@/contexts";
import { useRouter } from "next/navigation";

const MIN_DAYS = 15;

export default function AdForm({ isOpen, onClose, onSubmit, onRedirecting }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { dailyMinutes, buildAdPayload, setError, resetForm } = useAdForm();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const fetchPricing = useCallback(async () => {
    if (!dailyMinutes) return;

    try {
      const response = await calculatePricing({
        positions: [1, 2, 3, 4],
        dailyMinutes,
        contractDays: MIN_DAYS,
      });
      setPricingData(response.pricing);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      setPricingData(null);
    }
  }, [dailyMinutes]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 960);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const submitAd = useCallback(() => {
    setError("");
    startTransition(async () => {
      try {
        const payload = await buildAdPayload();
        const response = await createAd(payload);

        // Redirigir al link de Mercado Pago
        const mercadoPagoUrl =
          response?.payment?.mercadoPago?.initPoint ||
          response?.payment?.mercadoPago?.sandboxInitPoint;

        if (mercadoPagoUrl) {
          window.location.href = mercadoPagoUrl;
          // Mantener la transición viva hasta que el browser navegue
          // Esta promise nunca resuelve, pero el browser navegará antes
          await new Promise(() => {});
        }
      } catch (error) {
        console.error("Error creating ad:", error);
        const message = "No pudimos crear tu anuncio. Probá de nuevo.";
        startTransition(() => {
          setError(message);
        });
        showError(message);
      }
    });
  }, [buildAdPayload, setError, showError, startTransition]);

  const handleSubmit = useCallback(() => {
    if (isPending) return;
    if (typeof onSubmit === "function") {
      onSubmit();
      return;
    }

    submitAd();
  }, [isPending, onSubmit, submitAd]);

  if (isDesktop) {
    return (
      <AdFormDesktop
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        pricingData={pricingData}
        isSubmitting={isPending}
      />
    );
  }

  return (
    <AdFormMobile
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      pricingData={pricingData}
      isSubmitting={isPending}
    />
  );
}
