import styles from './Footer.module.scss';
import DelsudIcon from '@/assets/delsud.svg';

export default function FooterFeed() {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        <p>Asociación de Parques Industriales Argentinos © 2022 - APIA.</p>
        <p>Todos los derechos reservados</p>
      </div>

      <div className={styles.developer}>
        <span>Desarrollado por</span>
        <div className={styles.delsudLogo}>
          <DelsudIcon className={styles.delsudSymbol} />
          <span className={styles.delsudText}>DELSUD</span>
        </div>
      </div>
    </footer>
  );
}
