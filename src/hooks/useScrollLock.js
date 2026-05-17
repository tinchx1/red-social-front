"use client";

import { useEffect, useRef } from "react";

// Module-level reference count to support multiple simultaneous locks
let activeLocks = 0;
const previousOverflowByElement = new WeakMap();

export function useScrollLock(enabled = true, getTarget) {
  const enabledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      enabledRef.current = false;
      return;
    }

    if (typeof document === "undefined") return; // SSR safety

    const provided = typeof getTarget === "function" ? getTarget() : null;
    const targets = provided ? [provided] : [document.documentElement, document.body].filter(Boolean);
    if (targets.length === 0) return;

    enabledRef.current = true;

    if (activeLocks === 0) {
      for (const el of targets) {
        previousOverflowByElement.set(el, el.style.overflow);
        el.style.overflow = "hidden";
      }
    }
    activeLocks += 1;

    return () => {
      if (!enabledRef.current) return;
      enabledRef.current = false;
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks === 0 && typeof document !== "undefined") {
        const restoreProvided = typeof getTarget === "function" ? getTarget() : null;
        const restoreTargets = restoreProvided ? [restoreProvided] : [document.documentElement, document.body].filter(Boolean);
        for (const el of restoreTargets) {
          const prev = previousOverflowByElement.get(el) ?? "";
          el.style.overflow = prev;
          previousOverflowByElement.delete(el);
        }
      }
    };
  }, [enabled, getTarget]);
}

export default useScrollLock;


