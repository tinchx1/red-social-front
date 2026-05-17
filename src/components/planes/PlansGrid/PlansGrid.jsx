"use client";
import React, { useMemo, useState, useTransition } from "react";
import styles from "./PlansGrid.module.scss";
import PlanCard from "../PlanCard/PlanCard";
import PremiumPlanCard from "../PremiumPlanCard/PremiumPlanCard";
import CancelSubscriptionModal from "@/components/settings/CancelSubscriptionModal/CancelSubscriptionModal";
import ChangeSubscriptionModal from "@/components/settings/ChangeSubscriptionModal/ChangeSubscriptionModal";
import { usePlan, useToast } from "@/contexts";
import { clientApi } from "@/lib/api";

const FEATURE_SETS = {
  gratuito: [
    { name: "Descuentos y beneficios", included: false },
    { name: "Mensajería ilimitada", included: false },
    { name: "Comunidades ilimitadas", included: false },
    { name: "Directorio de contactos", included: false },
    { name: "Eventos exclusivos", included: false },
    { name: "Consultoría personalizada", included: false },
  ],
  partner: [
    { name: "Descuentos y beneficios", included: true },
    { name: "Mensajería ilimitada", included: true },
    { name: "Comunidades ilimitadas", included: true },
    { name: "Directorio de contactos", included: true },
    { name: "Eventos exclusivos", included: true },
    { name: "Consultoría personalizada", included: true },
  ],
  socio: [
    { name: "Descuentos y beneficios", included: true },
    { name: "Mensajería ilimitada", included: true },
    { name: "Directorio de contactos", included: true },
    { name: "Comunidades ilimitadas", included: false },
    { name: "Eventos exclusivos", included: false },
    { name: "Consultoría personalizada", included: false },
  ],
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return "$0";
  const number = Number(value);
  if (Number.isNaN(number)) return "$0";
  return `$${number.toLocaleString("es-AR")}`;
};

const PLAN_ORDER = {
  gratuito: 0,
  partner: 1,
  socio: 2,
};

/**
 * @param {{ onSubscribe?: (planTitle: string) => void }} props
 */
export default function PlansGrid({ onSubscribe, plans = [] }) {
  const [isPending, startTransition] = useTransition();
  const [loadingPlanKey, setLoadingPlanKey] = useState(null);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] =
    useState(false);
  const [isChangeSubscriptionModalOpen, setIsChangeSubscriptionModalOpen] =
    useState(false);
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const { planKey } = usePlan();
  const { showSuccess } = useToast();
  const normalizedPlanKey = useMemo(
    () => (planKey ? String(planKey).toLowerCase() : ""),
    [planKey]
  );

  // Verificar si el usuario tiene un plan activo (no free/gratuito)
  const hasActivePlan = useMemo(() => {
    if (!normalizedPlanKey) return false;
    const freeKeys = ["free", "gratuito"];
    return !freeKeys.includes(normalizedPlanKey);
  }, [normalizedPlanKey]);
  const resolveFeatureKey = (rawKey) => {
    const key = (rawKey || "").toLowerCase();
    if (key === "free") return "gratuito";
    if (key === "basic") return "socio";
    if (key === "full") return "partner";
    return key;
  };
  const normalizedPlans = useMemo(() => {
    const mapped = plans.map((plan, index) => {
      const rawKey = plan.key || plan.name || "";
      const key = rawKey.toLowerCase();
      const featureKey = resolveFeatureKey(rawKey);
      const features = Array.isArray(plan.features)
        ? plan.features
        : FEATURE_SETS[featureKey] ||
          FEATURE_SETS.gratuito ||
          plan.features ||
          [];
      const matchesPlanKey =
        normalizedPlanKey &&
        (key === normalizedPlanKey ||
          featureKey === normalizedPlanKey ||
          String(plan.id || "").toLowerCase() === normalizedPlanKey);

      return {
        featureKey,
        sortIndex: index,
        key: plan.id || plan.key || plan.name || index,
        planId: plan.id || plan.planId || null,
        title: plan.name || plan.key || "Plan",
        price: formatPrice(plan.price),
        beforePrice:
          plan.beforePrice || plan.previousPrice
            ? formatPrice(plan.beforePrice ?? plan.previousPrice)
            : null,
        features,
        isPremium: featureKey === "partner",
        isCurrent: Boolean(matchesPlanKey),
      };
    });

    return mapped
      .sort((a, b) => {
        const aOrder = PLAN_ORDER[a.featureKey] ?? 99;
        const bOrder = PLAN_ORDER[b.featureKey] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.sortIndex - b.sortIndex;
      })
      .map(({ sortIndex, ...rest }) => rest);
  }, [plans, normalizedPlanKey]);

  const handleSubscribe = (plan) => {
    if (isPending) return;

    // Si el usuario tiene un plan activo y hace click en el plan "free", mostrar modal de cancelación
    const planKeyLower = plan.key?.toLowerCase() || "";
    const titleLower = plan.title?.toLowerCase() || "";
    const isFreePlan =
      plan.featureKey === "gratuito" ||
      planKeyLower === "free" ||
      planKeyLower === "gratuito" ||
      titleLower.includes("gratuito") ||
      titleLower.includes("free") ||
      plan.price === "$0";

    if (hasActivePlan && isFreePlan) {
      setIsCancelSubscriptionModalOpen(true);
      return;
    }

    // Si el usuario tiene un plan activo (no gratis) e intenta cambiarse a otro plan (no gratis), mostrar modal de cambio
    if (hasActivePlan && !isFreePlan && !plan.isCurrent) {
      setPendingPlan(plan);
      setIsChangeSubscriptionModalOpen(true);
      return;
    }

    setLoadingPlanKey(plan.key);

    startTransition(async () => {
      try {
        const { data } = await clientApi.post("/subscriptions", {
          planId: plan.planId,
        });

        const initPoint = data?.initPoint;
        if (initPoint) {
          window.location.href = initPoint;
          // Mantener la transición viva hasta que el browser navegue
          await new Promise(() => {});
        }
        console.error("Missing initPoint in subscription response", data);
      } catch (error) {
        console.error("Error creating subscription", error);
      }

      // Only reset if we don't redirect
      startTransition(() => {
        setLoadingPlanKey(null);
      });

      if (onSubscribe) {
        onSubscribe(plan.title);
      }
    });
  };

  const handleCloseCancelSubscriptionModal = () => {
    setIsCancelSubscriptionModalOpen(false);
  };

  const handleConfirmCancelSubscription = async () => {
    setIsCancellingSubscription(true);
    try {
      await clientApi.patch("/subscriptions/me/cancel");
      setIsCancelSubscriptionModalOpen(false);
      showSuccess("Suscripción cancelada exitosamente");
      // Recargar la página para reflejar los cambios después de mostrar el toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setIsCancellingSubscription(false);
    }
  };

  const handleCloseChangeSubscriptionModal = () => {
    setIsChangeSubscriptionModalOpen(false);
    setPendingPlan(null);
  };

  const handleConfirmChangeSubscription = () => {
    if (!pendingPlan) return;

    setIsChangingSubscription(true);
    setLoadingPlanKey(pendingPlan.key);

    startTransition(async () => {
      try {
        const { data } = await clientApi.post("/subscriptions", {
          planId: pendingPlan.planId,
        });

        const initPoint = data?.initPoint;
        if (initPoint) {
          window.location.href = initPoint;
          // Mantener la transición viva hasta que el browser navegue
          await new Promise(() => {});
        }
        console.error("Missing initPoint in subscription response", data);
      } catch (error) {
        console.error("Error creating subscription", error);
      }

      // Only reset if we don't redirect
      startTransition(() => {
        setIsChangingSubscription(false);
        setLoadingPlanKey(null);
      });

      if (onSubscribe) {
        onSubscribe(pendingPlan.title);
      }
    });
  };

  return (
    <>
      <div className={styles.grid}>
        {normalizedPlans.map((plan) =>
          plan.isPremium ? (
            <PremiumPlanCard
              key={plan.key}
              title={plan.title}
              beforePrice={plan.beforePrice}
              price={plan.price}
              features={plan.features}
              isSubscribed={plan.isCurrent}
              isLoading={isPending && loadingPlanKey === plan.key}
              onSubscribe={() => handleSubscribe(plan)}
            />
          ) : (
            <PlanCard
              key={plan.key}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              beforePrice={plan.beforePrice}
              isSubscribed={plan.isCurrent}
              isLoading={isPending && loadingPlanKey === plan.key}
              onSubscribe={() => handleSubscribe(plan)}
            />
          )
        )}
      </div>
      <CancelSubscriptionModal
        isOpen={isCancelSubscriptionModalOpen}
        onClose={handleCloseCancelSubscriptionModal}
        onConfirm={handleConfirmCancelSubscription}
        loading={isCancellingSubscription}
      />
      <ChangeSubscriptionModal
        isOpen={isChangeSubscriptionModalOpen}
        onClose={handleCloseChangeSubscriptionModal}
        onConfirm={handleConfirmChangeSubscription}
        loading={isChangingSubscription}
      />
    </>
  );
}
