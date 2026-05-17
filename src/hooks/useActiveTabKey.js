import { usePathname } from "next/navigation";

/**
 * Hook para obtener el activeKey de un tab basado en el pathname actual
 * @param {Object} options
 * @param {string} options.basePath - Ruta base donde están los tabs (ej: `/comunidades/${communityId}/administracion`)
 * @param {Array<{key: string, href: string}>} options.tabs - Array de tabs con sus keys y hrefs
 * @param {string} options.defaultKey - Key por defecto cuando no se encuentra una coincidencia (default: primera key del array)
 * @returns {string} El activeKey correspondiente
 */
export function useActiveTabKey({ basePath, tabs, defaultKey }) {
  const pathname = usePathname();

  // Si estamos en la ruta base, usar defaultKey o el primer tab
  if (pathname === basePath) {
    return defaultKey || tabs[0]?.key || "";
  }

  // Extraer el último segmento de la ruta
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Verificar si es uno de nuestros tabs
  const tab = tabs.find((t) => t.key === lastSegment);
  
  return tab ? tab.key : (defaultKey || tabs[0]?.key || "");
}























