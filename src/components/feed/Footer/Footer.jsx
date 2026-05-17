import styles from './Footer.module.scss';
import FacebookIcon from '@/assets/facebook-icon.svg';
import InstagramIcon from '@/assets/instagram.svg';
import XIcon from '@/assets/x.svg';
import YoutubeIcon from '@/assets/youtube.svg';
import LinkedInIcon from '@/assets/linkedin.svg';
import DelsudIcon from '@/assets/delsud.svg';
import ApiaIcon from '@/assets/logo.svg';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.contactSection}>
        <h3 className={styles.contactTitle}>CONTACTO</h3>
        <div className={styles.contactInfo}>
          <p>apia.comunicacion@gmail.com</p>
          <p>info@apia.ar</p>
          <p>+54 9 11 5498-3610</p>
        </div>
      </div>

      <div className={styles.socialMedia}>
        <a href="https://www.facebook.com/people/apiaparques/100063881887968/" className={styles.socialIcon} aria-label="Facebook" target="_blank">
          <FacebookIcon />
        </a>
        <a href="https://www.instagram.com/apia.parques/" className={styles.socialIcon} aria-label="Instagram" target="_blank">
          <InstagramIcon />
        </a>
        <a href="https://twitter.com/parquesindarg" className={styles.socialIcon} aria-label="X (Twitter)" target="_blank">
          <XIcon />
        </a>
        <a href="https://www.youtube.com/@apia.parques" className={styles.socialIcon} aria-label="YouTube" target="_blank">
          <YoutubeIcon />
        </a>
        <a href="https://ar.linkedin.com/company/apia-argentina" className={styles.socialIcon} aria-label="LinkedIn" target="_blank">
          <LinkedInIcon />
        </a>
      </div>

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

      <div className={styles.mainLogo}> 
        <ApiaIcon className={styles.apiaIcon} />
        <div className={styles.fullName}>
          <span>ASOCIACIÓN DE PARQUES</span>
          <span>INDUSTRIALES ARGENTINOS</span>
        </div>
      </div>
    </footer>
  );
}
