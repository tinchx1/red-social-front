"use client";
import React, { useMemo, useState } from "react";
import styles from "./SettingsClient.module.scss";
import SettingsTabs from "../SettingsTabs/SettingsTabs";
import SettingsCard from "../SettingsCard/SettingsCard";
import PlanCard from "../cards/PlanCard/PlanCard";
import UserDataCard from "../cards/UserDataCard/UserDataCard";
import PaymentInfoCard from "../cards/PaymentInfoCard/PaymentInfoCard";
import CancelSubscriptionModal from "@/components/settings/CancelSubscriptionModal/CancelSubscriptionModal";
import { clientApi } from "@/lib/api";
import { useToast } from "@/contexts";

/**
 * @param {{
 *  profile: {
 *    email: string;
 *    firstName: string;
 *    lastName: string | null;
 *    phone: string | null;
 *    subscription: { name: string; key: string };
 *  };
 * }} props
 */
export default function SettingsClient({ profile }) {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState("account"); // 'account' | 'plan'
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] =
    useState(false);

  const isFree =
    profile?.subscription?.key === "free" ||
    !profile?.subscription?.nextPaymentDate;
  const showCancelSubscription = profile?.subscription?.key === "free";
  const fullName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    return parts.join(" ").trim();
  }, [profile?.firstName, profile?.lastName]);

  const handleUpdatePayment = async (planId) => {
    if (!planId) return;
    setIsUpdatingPayment(true);
    try {
      const response = await clientApi.post("/subscriptions", { planId });
      if (response?.data?.initPoint) {
        window.location.href = response.data.initPoint;
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      setIsUpdatingPayment(false);
    }
  };

  const handleOpenCancelSubscriptionModal = () => {
    setIsCancelSubscriptionModalOpen(true);
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
      // Podrías agregar un toast aquí para mostrar el error al usuario
    }
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.mobileTabs}>
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className={styles.grid}>
        <div
          className={`${styles.leftCol} ${
            activeTab === "plan" ? styles.mobileHidden : ""
          }`}
        >
          <SettingsCard>
            <PlanCard
              subscriptionName={profile?.subscription?.name || "-"}
              isFree={isFree}
              renewalDateLabel={profile?.subscription?.nextPaymentDate || "-"}
              amountLabel={profile?.subscription?.price || "-"}
            />
          </SettingsCard>

          <SettingsCard>
            <UserDataCard
              name={fullName || "-"}
              email={profile?.email || "-"}
              phone={profile?.phone || "-"}
              userData={profile}
            />
          </SettingsCard>
        </div>

        <div
          className={`${styles.rightCol} ${
            activeTab === "plan" ? "" : styles.mobileHidden
          }`}
        >
          <SettingsCard>
            <PaymentInfoCard
              isFree={isFree}
              onUpdatePayment={handleUpdatePayment}
              subscriptionId={profile?.subscription?.id}
              planId={
                profile?.subscription?.planId || profile?.subscription?.plan?.id
              }
              isLoading={isUpdatingPayment}
            />
          </SettingsCard>

          <div className={styles.supportBox}>
            <p className={styles.supportText}>
              Si tenés inconvenientes con la suscripción o el pago comunicate a{" "}
              <a
                href="mailto:mailsoporte@apia.com.ar"
                className={styles.supportLink}
              >
                mailsoporte@apia.com.ar
              </a>
            </p>
          </div>

          {!showCancelSubscription ? (
            <button
              type="button"
              className={styles.cancelLink}
              onClick={handleOpenCancelSubscriptionModal}
            >
              Cancelar suscripción
            </button>
          ) : null}
        </div>
      </div>
      <CancelSubscriptionModal
        isOpen={isCancelSubscriptionModalOpen}
        onClose={handleCloseCancelSubscriptionModal}
        onConfirm={handleConfirmCancelSubscription}
        loading={isCancellingSubscription}
      />
    </div>
  );
}
