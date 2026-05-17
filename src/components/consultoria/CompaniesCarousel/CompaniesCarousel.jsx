import { Marquee } from "@/components/ui";
import styles from "./CompaniesCarousel.module.scss";
import { CompanyCard } from "@/components/consultoria";
import companyOne from "@/../public/images/carouselCompanies/1.png";
import companyTwo from "@/../public/images/carouselCompanies/2.png";
import companyThree from "@/../public/images/carouselCompanies/3.png";
import companyFour from "@/../public/images/carouselCompanies/4.png";

/**
 * CompaniesCarousel renders a horizontal marquee of company cards.
 * @param {{ speed?: number; direction?: 'left'|'right'; className?: string }} props
 */
export default function CompaniesCarousel({
  speed = 80,
  direction = "left",
  className = "",
}) {
  return (
    <div className={`${styles.marqueeWrap} ${className}`}>
      <Marquee speed={speed} direction={direction} className={styles.marquee}>
        <div className={styles.track}>
          <CompanyCard image={companyOne} company="Company One" />
          <CompanyCard image={companyTwo} company="Company Two" />
          <CompanyCard image={companyThree} company="Company Three" />
          <CompanyCard image={companyFour} company="Company Four" />
        </div>
      </Marquee>
    </div>
  );
}
