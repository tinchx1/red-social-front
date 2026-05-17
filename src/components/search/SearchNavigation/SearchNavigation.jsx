"use client";

import styles from './SearchNavigation.module.scss';

const SearchNavigation = ({ summary }) => {
  const navigationItems = [
    { key: 'posts', label: 'Publicaciones', count: summary.posts },
    { key: 'people', label: 'Personas', count: summary.people },
    { key: 'companies', label: 'Empresas', count: summary.companies },
    { key: 'industrial_parks', label: 'Parques Industriales', count: summary.industrial_parks },
    { key: 'communities', label: 'Comunidades', count: summary.communities }
  ];

  // Filtrar solo los elementos que tienen más de 0 resultados
  const activeItems = navigationItems.filter(item => item.count > 0);

  // Función para hacer scroll suave al elemento
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Si no hay elementos activos, mostrar solo el título
  if (activeItems.length === 0) {
    return (
      <nav className={styles.navigation}>
        <h3 className={styles.title}>En esta página</h3>
      </nav>
    );
  }

  return (
    <nav className={styles.navigation}>
      <h3 className={styles.title}>En esta página</h3>
      <ul className={styles.list}>
        {activeItems.map((item, index) => (
          <li key={item.key} className={styles.listItem}>
            <a 
              onClick={() => scrollToElement(item.key)}
              className={styles.link}
            >
              {item.label}
            </a>
            {index < activeItems.length - 1 && <hr className={styles.separator} />}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SearchNavigation;
