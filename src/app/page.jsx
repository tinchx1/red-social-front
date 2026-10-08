import Image from "next/image";
import logoRoundedUrl from "@/assets/logo-rounded.svg?url";
import styles from "@/styles/pages/portfolio-demo.module.scss";

const posts = [
  {
    author: "Parque Industrial Norte",
    meta: "Comunidad Energia y Logistica",
    text: "Abrimos cupos para proveedores de mantenimiento electrico industrial durante octubre.",
    tag: "Oportunidad",
  },
  {
    author: "Metalurgica Sur",
    meta: "Empresa verificada",
    text: "Buscamos partners para optimizar entregas entre Buenos Aires, Cordoba y Santa Fe.",
    tag: "Networking",
  },
  {
    author: "APIA Comunicacion",
    meta: "Equipo institucional",
    text: "Nuevo reporte de actividad: 128 conexiones, 34 anuncios activos y 12 comunidades nuevas.",
    tag: "Reporte",
  },
];

const chats = [
  ["Cluster Plastico", "Hay disponibilidad para reunion el jueves."],
  ["Proveedor logistico", "Envie propuesta y costos estimados."],
  ["Comunidad Seguridad", "Se sumaron 8 empresas al protocolo."],
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Image src={logoRoundedUrl} alt="APIA" width={150} height={50} priority />
          <span>Demo de portfolio</span>
        </nav>

        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Red social industrial mockeada</p>
            <h1>APIA conecta parques, empresas y proveedores en una comunidad privada.</h1>
            <p className={styles.lead}>
              Esta version publica preserva la experiencia visual del producto con datos de muestra:
              feed, comunidades, mensajes, anuncios y metricas, sin login ni backend activo.
            </p>
            <div className={styles.actions}>
              <a href="#demo">Ver demo</a>
              <a href="#features">Modulos</a>
            </div>
          </div>

          <div className={styles.productFrame} id="demo" aria-label="Vista mockeada de APIA">
            <div className={styles.sidebar}>
              <strong>APIA</strong>
              <span>Inicio</span>
              <span>Comunidades</span>
              <span>Mensajes</span>
              <span>Anuncios</span>
            </div>
            <div className={styles.feed}>
              <div className={styles.composer}>
                <span>Publicar novedad</span>
                <button>Demo</button>
              </div>
              {posts.map((post) => (
                <article className={styles.post} key={post.author}>
                  <div>
                    <strong>{post.author}</strong>
                    <small>{post.meta}</small>
                  </div>
                  <p>{post.text}</p>
                  <span>{post.tag}</span>
                </article>
              ))}
            </div>
            <aside className={styles.panel}>
              <h2>Actividad</h2>
              <div className={styles.metric}><strong>128</strong><span>Conexiones</span></div>
              <div className={styles.metric}><strong>34</strong><span>Anuncios</span></div>
              <div className={styles.chatList}>
                {chats.map(([name, message]) => (
                  <div key={name}>
                    <strong>{name}</strong>
                    <small>{message}</small>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <article>
          <span>01</span>
          <h2>Comunidades segmentadas</h2>
          <p>Espacios por industria, parque o interes comercial para encontrar contactos relevantes.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Chat y notificaciones</h2>
          <p>Mensajeria interna, salas, avisos y estado de lectura representados con datos mock.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Anuncios institucionales</h2>
          <p>Publicacion de oportunidades y campanas para empresas verificadas dentro de la red.</p>
        </article>
      </section>
    </main>
  );
}
