
import styles from "./Question.module.scss";
import { AnimatedDiv } from "@/components/ui";

export default function Question() {
  const sections = [
    {
      title: "SERVICIOS PARA COMERCIALIZACIÓN",
      items: [
        "Internacionalización",
        "Apertura a nuevos mercados y negocios",
        "Gestión del comercio exterior",
        "Búsqueda de financiamiento externo",
        "Radicación y relocalización de empresas",
      ],
    },
    {
      title: "OFERTA EDUCATIVA",
      items: [
        "Emprendimiento",
        "Innovación",
        "Desarrollo de negocios",
        "Gestión de proyectos",
      ],
    },
    {
      title: "SEMINARIOS WEB",
      items: [
        "Tendencias tecnológicas",
        "Oportunidades de financiamiento",
        "Casos de éxito",
      ],
    },
  ];

  return (
    <section className={styles.question}>
      <div className={styles.container}>
        <AnimatedDiv animation="fadeInUp" delay={0}>
          <h2 className={styles.mainTitle}>¿Qué tenemos para ofrecerte?</h2>
        </AnimatedDiv>
        <div className={styles.sections}>
          {sections.map((section, index) => (
            <AnimatedDiv key={section.title} animation="fadeInUp" delay={(index + 1) * 150}>
              <div className={styles.section}>
                <h3 className={styles.title}>{section.title}</h3>
                <ul className={styles.list}>
                  {section.items.map((label, index) => (
                    <li key={label} className={styles.item}>
                      <button type="button" className={styles.itemButton} style={{ borderBottom: index === section.items.length - 1 ? "none" : "1px solid #0288C2" }}>
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
