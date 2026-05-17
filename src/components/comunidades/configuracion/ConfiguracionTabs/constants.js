/**
 * Genera el array de tabs para la configuración de comunidades
 * @param {string} basePath - Ruta base (ej: `/comunidades/${communityId}/administracion`)
 * @returns {Array<{key: string, label: string, href: string}>}
 */
export function getConfiguracionTabs(basePath) {
  return [
    {
      key: "publicaciones",
      label: "Publicaciones",
      href: `${basePath}/publicaciones`,
    },
    {
      key: "administradores",
      label: "Administradores",
      href: `${basePath}/administradores`,
    },
    { key: "usuarios", label: "Usuarios", href: `${basePath}/usuarios` },
    {
      key: "solicitudes",
      label: "Solicitudes",
      href: `${basePath}/solicitudes`,
    },
    {
      key: "configuracion",
      label: "Configuración",
      href: `${basePath}/configuracion`,
    },
  ];
}

export const DEFAULT_CONFIGURACION_KEY = "publicaciones";
