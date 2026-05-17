import { Marquee } from "@/components/ui";
import styles from "./CompaniesLogosCarousel.module.scss";
import Image from "next/image";
import { COMPANY_LOGOS } from "@/constants/companies";

/**
 * CompaniesLogosCarousel renders a horizontal marquee of company logos.
 * @param {{ speed?: number; direction?: 'left'|'right'; className?: string }} props
 */
export default function CompaniesLogosCarousel({
  speed = 100,
  direction = "left",
  className = "",
}) {
  return (
    <div className={`${styles.marqueeWrap} ${className}`}>
      <Marquee speed={speed} direction={direction} className={styles.marquee}>
        <div className={styles.track}>
          {COMPANY_LOGOS.map((company) => (
            <Image
              key={company.name}
              src={company.image}
              alt={company.alt}
              className={styles.logo}
            />
          ))}
        </div>
      </Marquee>
    </div>
  );
}
