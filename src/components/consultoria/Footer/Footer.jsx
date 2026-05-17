
import styles from "./Footer.module.scss";
import FacebookIcon from "@/assets/facebook-icon.svg";
import InstagramIcon from "@/assets/instagram.svg";
import XIcon from "@/assets/x.svg";
import YoutubeIcon from "@/assets/youtube.svg";
import LinkedInIcon from "@/assets/linkedin.svg";
import DelsudIcon from "@/assets/delsud.svg";
import ApiaIcon from "@/assets/logo.svg";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topRow}>
        <div className={styles.brandBlock}>
          <ApiaIcon width={205} height={59} className={styles.apiaSymbol} />
          <div className={styles.brandText}>
            <span>ASOCIACIÓN DE PARQUES</span>
            <span>INDUSTRIALES ARGENTINOS</span>
          </div>
        </div>

        <div className={styles.contactBlock}>
          <h3 className={styles.sectionTitle}>CONTACTO</h3>
          <div className={styles.contactList}>
            <p>apia.comunicacion@gmail.com</p>
            <p>info@apia.ar</p>
            <p>+54 9 11 5498-3610</p>
          </div>
        </div>

        <div className={styles.socialBlock}>
          <h3 className={styles.sectionTitle}>REDES</h3>
          <div className={styles.socialList}>
            <a
              href="https://www.facebook.com/people/apiaparques/100063881887968/"
              className={styles.socialIcon}
              aria-label="Facebook"
              target="_blank"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/apia.parques/"
              className={styles.socialIcon}
              aria-label="Instagram"
              target="_blank"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://twitter.com/parquesindarg"
              className={styles.socialIcon}
              aria-label="X (Twitter)"
              target="_blank"
            >
              <XIcon />
            </a>
            <a
              href="https://www.youtube.com/@apia.parques"
              className={styles.socialIcon}
              aria-label="YouTube"
              target="_blank"
            >
              <YoutubeIcon />
            </a>
            <a
              href="https://ar.linkedin.com/company/apia-argentina"
              className={styles.socialIcon}
              aria-label="LinkedIn"
              target="_blank"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.copyright}>
          <span className={styles.copyrightText}>
            Asociación de Parques Industriales Argentinos © 2022 - APIA. Todos los
            derechos reservados
          </span>
        </div>
        <div className={styles.developed}>
          <span>Desarrollado por</span>
          <div className={styles.delsudLogo}>
            <DelsudIcon className={styles.delsudSymbol} />
            <span className={styles.delsudText}>DELSUD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
