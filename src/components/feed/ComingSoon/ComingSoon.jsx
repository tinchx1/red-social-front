import Image from "next/image";
import styles from "./ComingSoon.module.scss";
import closeRingFillIcon from "@/assets/calendar-clock.svg?url";

export default function ComingSoon({ alt = "Próximamente", title = "Próximamente", subtitle = "Esta sección está en desarrollo", hint = "Estamos trabajando para traerla muy pronto." }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Image src={closeRingFillIcon} alt={alt} width={36} height={36} />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
    </div>
  );
}


