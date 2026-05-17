import React from "react";
import Image from "next/image";
import styles from "./CompanyCard.module.scss";

/**
 * @param {{ image: any; company: string; alt?: string; companyLogo?: any; companyName?: string }} props
 */
export default function CompanyCard({ image, company, alt, companyLogo, companyName }) {
  return (
    <div className={styles.card}>
      <Image 
        src={image} 
        alt={alt || company} 
        className={styles.image}
      />
      {/* {(companyLogo || companyName) && (
        <div className={styles.companyBadge}>
          {companyLogo && (
            <Image 
              src={companyLogo} 
              alt={companyName || "Company logo"} 
              className={styles.companyLogo}
            />
          )}
          {companyName && (
            <span className={styles.companyName}>{companyName}</span>
          )}
        </div>
      )} */}
    </div>
  );
}
