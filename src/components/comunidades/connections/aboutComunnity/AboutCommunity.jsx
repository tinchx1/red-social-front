"use client";
import { usePathname } from "next/navigation";
import { useMemo, memo } from "react";
import styles from "./AboutCommunity.module.scss";

export const AboutComunity = memo(({ count }) => {
  const pathname = usePathname();
  
  const shouldShow = useMemo(() => {
    return pathname === "/comunidades" || 
           pathname === "/comunidades/buscar-comunidad" || 
           (pathname === "/comunidades/mis-comunidades" && count === 0);
  }, [pathname, count]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>¿Qué son nuestras comunidades?</p>
      <p className={styles.description}>
        Asociación de Empresarios de Campollano, representa y aglutina a todas las empresas
        instaladas en el Parque Empresarial de Campollano, el Parque de referencia industrial en
        Castilla-La Mancha.
      </p>
      <p className={styles.description}>
        ADECA nació el 14 de noviembre de 1980, y sigue teniendo el mismo objetivo que hace 40
        años: la defensa de los intereses de las empresas de Campollano, así como ofrecerles el
        máximo de servicios para su normal funcionamiento.
      </p>
    </div>
  );
});

AboutComunity.displayName = 'AboutComunity';