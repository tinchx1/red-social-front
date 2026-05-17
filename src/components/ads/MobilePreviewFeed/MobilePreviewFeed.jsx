"use client";

import styles from "./MobilePreviewFeed.module.scss";
import { Skeleton } from "@/components/ui";
import AdsList from "../AdsList/AdsList";

const FORMAT_DIMENSIONS = {
  square: { width: 257, height: 257 },
  square_2: { width: 257, height: 257 },
  portrait: { width: 257, height: 514 },
  landscape: { width: 802, height: 160 },
};

/**
 * @param {{
 *  imageSrc?: string;
 *  format?: { id?: string; position?: number };
 * }} props
 */
export default function MobilePreviewFeed({ imageSrc, format, showHelperText = true }) {
  const fallback = FORMAT_DIMENSIONS.square;
  const meta =
    (format?.id && FORMAT_DIMENSIONS[format.id]) ||
    (format?.position === 3 ? FORMAT_DIMENSIONS.portrait : undefined) ||
    (format?.position === 4 ? FORMAT_DIMENSIONS.landscape : undefined) ||
    fallback;

  let ads = imageSrc
    ? [
        {
          image: imageSrc,
          alt: "Anuncio",
          width: meta.width,
          height: meta.height,
        },
      ]
    : [];

  const isPortrait = format?.position === 4;

  if (isPortrait) {
    ads = ads.map((ad) => ({
      ...ad,
      width: "100%",
      height: "auto",
    }));
  }
  return (
    <>
      {showHelperText && <p className={styles.helperText}>Vista previa del anuncio</p>}
      <div className={styles.container}>
        <div className={styles.feed}>
          <div className={styles.postSmall}>
            <div className={styles.postHeader}>
              <Skeleton
                width="36px"
                height="36px"
                variant="circular"
                className={`${styles.staticSkeleton}`}
              />
              <div className={styles.postMeta}>
                <Skeleton
                  width="110px"
                  height="12px"
                  className={styles.staticSkeleton}
                />
                <Skeleton
                  width="80px"
                  height="10px"
                  className={styles.staticSkeleton}
                />
              </div>
            </div>
            <Skeleton
              width="70%"
              height="12px"
              className={styles.staticSkeleton}
            />
            <Skeleton
              width="60%"
              height="24px"
              className={styles.staticSkeleton}
            />
          </div>

          <div>
            {isPortrait ? (
              <AdsList ads={ads} width={"auto"} height={169} />
            ) : (
              <AdsList ads={ads} width={257} height={257} />
            )}
          </div>

          <div className={styles.postBig}>
            <div className={styles.postHeader}>
              <Skeleton
                width="40px"
                height="40px"
                variant="circular"
                className={`${styles.staticSkeleton}`}
              />
              <div className={styles.postMeta}>
                <Skeleton
                  width="140px"
                  height="12px"
                  className={styles.staticSkeleton}
                />
                <Skeleton
                  width="90px"
                  height="10px"
                  className={styles.staticSkeleton}
                />
              </div>
            </div>
            <Skeleton
              width="90%"
              height="12px"
              className={styles.staticSkeleton}
              style={{ background: "#ebebeb" }}
            />
            <Skeleton
              width="100%"
              height="12px"
              className={styles.staticSkeleton}
            />
            <Skeleton
              width="80%"
              height="12px"
              className={styles.staticSkeleton}
            />
            <Skeleton
              width="100%"
              height="80px"
              className={styles.staticSkeleton}
            />
          </div>
        </div>
      </div>
    </>
  );
}
