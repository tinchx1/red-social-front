import { AnimatedDiv } from "@/components/ui";
import styles from "./Hero.module.scss";
import LogoRounded from "@/assets/rounded-logo.svg";
import {
  CompaniesLogosCarousel,
  ConsultButton,
} from "@/components/consultoria";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <AnimatedDiv animation="fadeInUp" delay={0}>
        <div className={styles.logoContainer}>
          <LogoRounded className={styles.logo} />
          <span className={styles.consultoriaTag}>Consultoría</span>
        </div>
      </AnimatedDiv>
      <div className={styles.shell}>
        <div className={styles.content}>
          <AnimatedDiv animation="fadeInUp" delay={0}></AnimatedDiv>
          <div className={styles.contentContainer}>
            <AnimatedDiv animation="fadeInUp" delay={200}>
              <h1 className={styles.title}>
                soluciones para todo
                <br />
                tipo de industria
              </h1>
            </AnimatedDiv>

            <AnimatedDiv animation="fadeInUp" delay={400}>
              <p className={styles.subtitle}>
                APIA ofrece una amplia gama de servicios de consultoría, atentos
                a las necesidades de empresas y parques industriales. Nuestra
                trayectoria y el trabajo con nuestros socios estratégicos nos
                avalan
              </p>
            </AnimatedDiv>

            <ConsultButton
              animate={true}
              animationDelay={1200}
              style={{ maxWidth: "340px", width: "100%" }}
            >
              Dejar Consulta
            </ConsultButton>
          </div>
        </div>
        <div className={styles.logos + " " + styles.marqueeWrap}>
          <AnimatedDiv animation="slideInLeft" delay={180}>
            <CompaniesLogosCarousel direction="right" />
          </AnimatedDiv>
          <AnimatedDiv animation="slideInLeft" delay={260}>
            <CompaniesLogosCarousel direction="left" />
          </AnimatedDiv>
        </div>
      </div>
    </section>
  );
}
