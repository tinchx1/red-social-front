import { Suspense } from "react";
import { PlansGrid } from "@/components/planes";
import { serverApi } from "@/lib/api";
import styles from "@/styles/pages/planes-page.module.scss";
import MercadoPagoRefresh from "@/components/planes/MercadoPagoRefresh/MercadoPagoRefresh";

async function fetchPlans() {
  try {
    const response = await serverApi.get("/plans");
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching plans on server:", error);
    return [];
  }
}

export default async function PlanesPage() {
  const plans = await fetchPlans();

  return (
    <div className={styles.container}>
      <Suspense fallback={null}>
        <MercadoPagoRefresh />
      </Suspense>
      <h1 className={styles.title}>SÚMATE A LA COMUNIDAD APIA</h1>
      <p className={styles.description}>
        Tenemos un plan ideal para vos, suscribite y disfruta todos los
        beneficios de ser parte de nuestra comunidad
      </p>
      <PlansGrid plans={plans} />
    </div>
  );
}
