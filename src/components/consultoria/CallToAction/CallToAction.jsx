import { AnimatedDiv } from "@/components/ui";
import { ConsultButton } from "@/components/consultoria";
import styles from "./CallToAction.module.scss";
import Image from "next/image";
import LogoRounded from "@/assets/logo-rounded.svg?url";

export default function CallToAction() {
  const toTitleCase = (text = "") =>
    text
      .split(" ")
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
      .join(" ");

  const empresasItems = [
    {
      title: "Facturación electrónica",
      desc: "Emisión y recepción de facturas electrónicas de forma segura y eficiente.",
    },
    {
      title: "Contabilidad",
      desc: "Gestión de la contabilidad financiera y administrativa de la empresa.",
    },
    {
      title: "Recursos humanos",
      desc: "Administración de nóminas, gestión de empleados y control de asistencia.",
    },
    {
      title: "Impuestos",
      desc: "Cálculo y presentación de impuestos de forma precisa y oportuna.",
    },
    { title: "Legal", desc: "Asesoría legal y gestión de trámites legales." },
  ];

  const parquesItems = [
    {
      title: "Gestión de inquilinos",
      desc: "Administración de contratos de alquiler, cobro de rentas y gestión de incidencias.",
    },
    {
      title: "Mantenimiento",
      desc: "Gestión del mantenimiento preventivo y correctivo de las instalaciones del parque.",
    },
    {
      title: "Seguridad",
      desc: "Implementación de medidas de seguridad para el parque y sus inquilinos.",
    },
    {
      title: "Comunicación",
      desc: "Comunicación efectiva con los inquilinos y las autoridades locales.",
    },
    {
      title: "Marketing",
      desc: "Promoción del parque industrial para atraer nuevas inversiones.",
    },
    {
      title: "Creación y gestión de emprendimientos",
    },
    {
      title: "Búsqueda de oportunidades",
      desc: "Identificación de terrenos con potencial para el desarrollo inmobiliario.",
    },
    {
      title: "Análisis de mercado",
      desc: "Estudio de la demanda y la competencia para determinar la viabilidad del proyecto.",
    },
    {
      title: "Desarrollo del proyecto",
      desc: "Diseño y planificación del proyecto inmobiliario.",
    },
    {
      title: "Financiamiento",
      desc: "Obtención de financiamiento para el desarrollo del proyecto.",
    },
    {
      title: "Construcción",
      desc: "Gestión de la construcción del proyecto inmobiliario.",
    },
    {
      title: "Comercialización",
      desc: "Venta o alquiler de las unidades inmobiliarias.",
    },
    {
      title: "Gestión de la propiedad",
      desc: "Administración",
    },
  ];

  return (
    <section className={styles.callToAction}>
      <AnimatedDiv animation="fadeInUp" delay={0}>
        <h2 className={styles.title}>
          Servicios para la gestión administrativa
        </h2>
      </AnimatedDiv>

      <div className={styles.cardsWrap}>
        <span aria-hidden className={styles.betweenGradient} />

        <div className={styles.leftColumn}>
          <AnimatedDiv animation="fadeInUp" delay={200}>
            <article className={styles.card}>
              <div className={`${styles.tag} ${styles.tagLeft}`}>Empresas</div>
              <ul className={styles.list}>
                {empresasItems.map((item, index) => (
                  <li
                    key={item.title}
                    className={styles.item}
                    style={{
                      borderBottom:
                        index === empresasItems.length - 1
                          ? "none"
                          : "1px solid #B1DAEC",
                    }}
                  >
                    <strong className={styles.itemTitle}>
                      {toTitleCase(item.title)}
                      {item.desc ? ":" : ""}
                    </strong>
                    {item.desc ? (
                      <span className={styles.itemDesc}>
                        {" "}
                        {toTitleCase(item.desc)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          </AnimatedDiv>
          <AnimatedDiv animation="fadeInUp" delay={300}>
            <div className={styles.empresasImage} aria-hidden>
              <Image
                src={LogoRounded}
                alt="Empresas"
                width={530}
                height={343}
              />
            </div>
          </AnimatedDiv>
        </div>

        <div className={styles.rightColumn}>
          <AnimatedDiv animation="fadeInUp" delay={300}>
            <article className={styles.card}>
              <div className={`${styles.tag} ${styles.tagRight}`}>
                Parques industriales
              </div>
              <ul className={styles.list}>
                {parquesItems.map((item, index) => (
                  <li
                    key={item.title}
                    className={styles.item}
                    style={{
                      borderBottom:
                        index === parquesItems.length - 1
                          ? "none"
                          : "1px solid #B1DAEC",
                    }}
                  >
                    <strong className={styles.itemTitle}>
                      {toTitleCase(item.title)}
                      {item.desc ? ":" : ""}
                    </strong>
                    {item.desc ? (
                      <span className={styles.itemDesc}>
                        {" "}
                        {toTitleCase(item.desc)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          </AnimatedDiv>
        </div>
      </div>

      <AnimatedDiv animation="fadeInUp" delay={400}>
        <div className={styles.ctaWrap}>
          <ConsultButton
            animate={true}
            animationDelay={1200}
            style={{ width: "100%", maxWidth: "340px" }}
          >
            Consultanos
          </ConsultButton>
        </div>
      </AnimatedDiv>
    </section>
  );
}
