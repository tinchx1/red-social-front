"use client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

const PlanContext = createContext(null);

export function PlanProvider({ children, initialPlan = {} }) {
  const [planKey, setPlanKey] = useState(
    initialPlan?.key || initialPlan?.planKey || null
  );
  const [status, setStatus] = useState(initialPlan?.status || null);
  const [planName, setPlanName] = useState(
    initialPlan?.name || initialPlan?.planName || null
  );

  const setPlan = useCallback((plan) => {
    setPlanKey(plan?.planKey || plan?.plan?.key || plan?.key || null);
    setStatus(plan?.status || null);
    setPlanName(plan?.planName || plan?.name || null);
  }, []);

  const value = useMemo(
    () => ({
      planKey,
      status,
      planName,
      setPlan,
      setPlanKey,
      setStatus,
    }),
    [planKey, status, planName, setPlan]
  );
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return ctx;
}
