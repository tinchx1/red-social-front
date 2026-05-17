"use client";

import { AdsList } from "..";
import styles from "./DesktopPreviewFeed.module.scss";
import { Skeleton } from "@/components/ui";

const FORMAT_DIMENSIONS = {
  square: { width: 257, height: 257 },
  square_2: { width: 257, height: 257 },
  portrait: { width: 257, height: 514 },
  landscape: { width: 600, height: 119 },
};

/**
 * @param {{
 *  imageSrc?: string;
 *  format?: { id?: string; position?: number };
 * }} props
 */
export default function DesktopPreviewFeed({ imageSrc, format }) {
  const fallback = FORMAT_DIMENSIONS.square;
  const meta =
    (format?.id && FORMAT_DIMENSIONS[format.id]) ||
    (format?.position === 3 ? FORMAT_DIMENSIONS.portrait : undefined) ||
    (format?.position === 4 ? FORMAT_DIMENSIONS.landscape : undefined) ||
    fallback;

  const isPositionFour = format?.position === 4;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.leftSidebar}>
          <div className={styles.profileSkeleton}>
            <div className={styles.profileSkeletonCover} />
            <div className={styles.profileSkeletonAvatar} />
          </div>
          {format?.position === 1 ? (
            <AdsList
              ads={[
                {
                  image: imageSrc,
                  alt: "Vista previa del anuncio",
                  width: 176,
                  height: 176,
                },
              ]}
            />
          ) : (
            <div className={styles.placeholderBox}>
              <span className={styles.placeholderNumber}>1</span>
            </div>
          )}
          {format?.position === 2 ? (
            <AdsList
              ads={[
                {
                  image: imageSrc,
                  alt: "Vista previa del anuncio",
                  width: 176,
                  height: 176,
                },
              ]}
            />
          ) : (
            <div className={styles.placeholderBox}>
              <span className={styles.placeholderNumber}>2</span>
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.feed}>
            <div className={styles.postSmall}>
              <div className={styles.postHeader}>
                <Skeleton
                  width="36px"
                  height="36px"
                  variant="circular"
                  className={styles.staticSkeleton}
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

            {isPositionFour && imageSrc ? (
              <div className={styles.positionFourWrapper}>
                <AdsList
                  ads={[
                    {
                      image: imageSrc,
                      alt: "Vista previa del anuncio",
                      width: FORMAT_DIMENSIONS.landscape.width,
                      height: FORMAT_DIMENSIONS.landscape.height,
                    },
                  ]}
                  width={FORMAT_DIMENSIONS.landscape.width}
                  height={FORMAT_DIMENSIONS.landscape.height}
                />
              </div>
            ) : (
              <div
                className={
                  styles.positionFourCard + " " + styles.placeholderNumber
                }
              >
                4
              </div>
            )}

            <div className={styles.postBig}>
              <div className={styles.postHeader}>
                <Skeleton
                  width="40px"
                  height="40px"
                  variant="circular"
                  className={styles.staticSkeleton}
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
            <div className={styles.postBig}>
              <div className={styles.postHeader}>
                <Skeleton
                  width="40px"
                  height="40px"
                  variant="circular"
                  className={styles.staticSkeleton}
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

        <div className={styles.rightSidebar}>
          {format?.position === 3 ? (
            <AdsList
              ads={[
                {
                  image: imageSrc,
                  alt: "Vista previa del anuncio",
                  width: FORMAT_DIMENSIONS.portrait.width,
                  height: FORMAT_DIMENSIONS.portrait.height,
                },
              ]}
              width={FORMAT_DIMENSIONS.portrait.width}
              height={FORMAT_DIMENSIONS.portrait.height}
            />
          ) : (
            <div
              className={
                styles.placeholderBox + " " + styles.placeholderNumber3
              }
            >
              <span className={styles.placeholderNumber}>3</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
