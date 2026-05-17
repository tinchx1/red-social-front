import { FooterAuth } from "@/components";
import styles from "@/styles/pages/crear-cuenta.module.scss";
import Image from "next/image";
import LogoIcon from "@/public/images/apia-logo.png";

export default function CrearCuentaLayout({ children }) {
  return (
    <div className={styles.pageContainer}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <Image
            src={LogoIcon}
            alt="Logo"
            width={260}
            height={100}
            priority
            fetchPriority="high"
          />
        </div>
        {children}
      </main>
      <FooterAuth />
    </div>
  );
}
