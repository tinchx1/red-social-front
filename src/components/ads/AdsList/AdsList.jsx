"use client";

import { useMemo, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./AdsList.module.scss";
import { AdsListContext } from "@/contexts/AdsListContext";

const resolveSize = (value, fallback) => {
  const target = value ?? fallback;
  if (typeof target === "number") {
    return `${target}px`;
  }
  return target;
};

const AdsList = ({
  ads: propAds = [],
  positionIndices = null,
  initialAds = null, // Ads del SSR para mostrar inmediatamente
  width = "100%",
  height = "auto",
  className,
}) => {
  const context = useContext(AdsListContext);
  const [contextAds, setContextAds] = useState([]);

  const indicesKey = useMemo(() => {
    if (!Array.isArray(positionIndices) || !positionIndices.length) {
      return "";
    }
    const sanitized = positionIndices
      .map((index) => Number(index))
      .filter((index) => Number.isFinite(index));
    return sanitized.join("|");
  }, [positionIndices]);

  const parsedIndices = useMemo(() => {
    if (!indicesKey) {
      return [];
    }
    return indicesKey
      .split("|")
      .map((value) => Number(value))
      .filter((index) => Number.isFinite(index));
  }, [indicesKey]);

  const slotInitialAds = useMemo(() => {
    if (!parsedIndices.length) {
      return [];
    }
    const slots = Array(parsedIndices.length).fill(null);
    const sourceAds = Array.isArray(initialAds) ? initialAds : [];

    parsedIndices.forEach((position, index) => {
      const matchByPosition = sourceAds.find((ad) => {
        const parsedPosition = Number(ad?.position);
        return Number.isFinite(parsedPosition) && parsedPosition === position;
      });

      const fallbackByOrder =
        sourceAds[index] &&
        (sourceAds[index].asset_url || sourceAds[index].image)
          ? sourceAds[index]
          : null;

      slots[index] =
        matchByPosition && (matchByPosition.asset_url || matchByPosition.image)
          ? matchByPosition
          : fallbackByOrder;
    });

    return slots;
  }, [parsedIndices, initialAds]);

  const normalizeAd = (ad) => {
    if (!ad) {
      return null;
    }
    const image = ad.asset_url || ad.image;
    if (!image) {
      return null;
    }
    return {
      image,
      alt: ad.package_title || ad.alt || "Anuncio",
      href: ad.click_url || ad.href || "#",
      width: ad.width,
      height: ad.height,
    };
  };

  const normalizeList = (list = []) =>
    list.map((ad) => normalizeAd(ad)).filter(Boolean);

  // Si se pasan positionIndices y hay contexto, suscribirse a actualizaciones
  useEffect(() => {
    if (!context || !parsedIndices.length) {
      setContextAds([]);
      return () => {};
    }

    const initialSnapshot = parsedIndices.map(
      (index) => context.getIndexSnapshot?.(index) ?? null
    );
    setContextAds(initialSnapshot);

    const unsubscribes = parsedIndices.map((index, arrayIndex) =>
      context.subscribeToIndex?.(index, (data) => {
        setContextAds((prev) => {
          const baseLength = parsedIndices.length;
          const next =
            prev.length === baseLength
              ? [...prev]
              : Array(baseLength).fill(null);
          next[arrayIndex] = data ?? null;
          return next;
        });
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [context, parsedIndices]);

  // Si se pasan positionIndices, usar ads del contexto por índice
  // Si no hay ads del contexto aún, usar initialAds del SSR como fallback
  // Si no, usar los ads pasados como prop (comportamiento original)
  const ads = useMemo(() => {
    if (parsedIndices.length) {
      return parsedIndices
        .map((_, index) => {
          const contextAd = contextAds[index] ?? null;
          const initialAd = slotInitialAds[index];

          if (contextAd && (contextAd.asset_url || contextAd.image)) {
            // Preservar dimensiones del initialAd si están disponibles
            const normalized = normalizeAd(contextAd);
            if (initialAd && (initialAd.width || initialAd.height)) {
              return {
                ...normalized,
                width: initialAd.width ?? normalized.width,
                height: initialAd.height ?? normalized.height,
              };
            }
            return normalized;
          }
          return normalizeAd(initialAd);
        })
        .filter(Boolean);
    }
    return normalizeList(propAds);
  }, [propAds, parsedIndices, contextAds, slotInitialAds]);
  return (
    <div className={`${styles.sidebar} ${className}`}>
      <div className={styles.adsSection}>
        {/* <h4 className={styles.adsTitle}>Anuncios</h4> */}

        {ads
          .filter((ad) => ad && ad.image) // Solo renderizar ads con imagen válida
          .map((ad, index) => {
            const isGif =
              typeof ad.image === "string" &&
              ad.image.toLowerCase().includes(".gif");
            const containerWidth = resolveSize(ad.width, width);
            const containerHeight = resolveSize(ad.height, height);

            // Calcular aspect ratio si tenemos dimensiones numéricas
            let aspectRatio = null;
            const adWidth = typeof ad.width === "number" ? ad.width : null;
            const adHeight = typeof ad.height === "number" ? ad.height : null;

            if (adWidth && adHeight && adHeight > 0) {
              // Calcular el ratio más simple (ej: 600/160 = 15/4)
              const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
              const divisor = gcd(adWidth, adHeight);
              aspectRatio = `${adWidth / divisor}/${adHeight / divisor}`;
            } else if (adHeight && typeof adHeight === "number") {
              // Si tenemos altura numérica pero ancho es porcentaje, usar ratio basado en dimensiones estándar
              // Para desktop landscape: 600/124 = 150/31
              if (adHeight === 124) {
                aspectRatio = "150/31"; // 600/124 simplificado
              } else if (adHeight === 160) {
                aspectRatio = "15/4"; // 600/160 simplificado
              } else {
                // Calcular basado en ancho estándar de 600px
                const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
                const divisor = gcd(600, adHeight);
                aspectRatio = `${600 / divisor}/${adHeight / divisor}`;
              }
            } else if (
              containerHeight === "auto" ||
              containerHeight === height
            ) {
              // Fallback: usar ratio rectangular para desktop (600x160 = 3.75:1)
              // o ratio cuadrado para mobile si no hay info
              aspectRatio = "15/4"; // 600/160 simplificado
            }

            const hasDefinedHeight =
              containerHeight !== "auto" && containerHeight !== height;

            // Para anuncios con ancho fijo grande (como 600px o 334px), usar max-width para que sea responsive
            // Verificar tanto ad.width como el prop width
            const propWidthNum = typeof width === "number" ? width : null;
            const adWidthNum = typeof ad.width === "number" ? ad.width : null;
            const effectiveWidth = adWidthNum ?? propWidthNum;
            const isFixedLargeWidth = effectiveWidth && effectiveWidth >= 334;

            // Calcular aspect ratio específico para 600x119 si aplica
            let finalAspectRatio = aspectRatio;
            if (adWidthNum === 600 && adHeight === 119) {
              // 600/119 - usar ratio exacto
              finalAspectRatio = "600/119";
            } else if (!finalAspectRatio && adWidthNum && adHeight) {
              // Calcular GCD para simplificar el ratio
              const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
              const divisor = gcd(adWidthNum, adHeight);
              finalAspectRatio = `${adWidthNum / divisor}/${
                adHeight / divisor
              }`;
            }

            // Para anuncios grandes, hacer responsive: usar 100% width con max-width
            // La altura se calculará automáticamente con aspect-ratio
            const containerStyle = isFixedLargeWidth
              ? {
                  width: "100%",
                  maxWidth: containerWidth,
                  aspectRatio: finalAspectRatio || "600/119",
                }
              : {
                  width: containerWidth,
                  height:
                    hasDefinedHeight && !finalAspectRatio
                      ? containerHeight
                      : undefined,
                  aspectRatio:
                    finalAspectRatio || (hasDefinedHeight ? undefined : "15/4"),
                };

            return (
              <Link
                href={ad.href || "#"}
                key={index}
                className={styles.adCard}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={styles.imageContainer} style={containerStyle}>
                  <div className={styles.adTag}>Anuncio</div>
                  <Image
                    src={ad.image}
                    alt={ad.alt || "Anuncio"}
                    fill
                    className={styles.adImage}
                    style={{ objectFit: "cover" }}
                    unoptimized={isGif}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 393px"
                    fetchPriority="high"
                    priority
                  />
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default AdsList;
