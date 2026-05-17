/**
 * Límites de comunidades creadas según plan y rol
 * @type {Record<string, Record<string, number | null>>}
 * null = ilimitado
 */
export const COMMUNITY_CREATION_LIMITS = {
  free: {
    persona: 0,
    empresa: 1,
    parque_industrial: 1,
  },
  basic: {
    persona: 1,
    empresa: 2,
    parque_industrial: 2,
  },
  full: {
    persona: null, // ilimitado
    empresa: null, // ilimitado
    parque_industrial: null, // ilimitado
  },
};

/**
 * Verifica si el usuario puede crear más comunidades
 * @param {string} planKey - Clave del plan (free, basic, full)
 * @param {string} userRole - Rol del usuario (persona, empresa, parque_industrial)
 * @param {number} currentCount - Cantidad actual de comunidades creadas
 * @returns {boolean}
 */
export function canCreateCommunity(planKey, userRole, currentCount) {
  const limit = COMMUNITY_CREATION_LIMITS[planKey]?.[userRole];
  
  // Si no hay límite definido, no permitir
  if (limit === undefined) {
    return false;
  }
  
  // Si el límite es null, es ilimitado
  if (limit === null) {
    return true;
  }
  
  // Verificar si no ha alcanzado el límite
  return currentCount < limit;
}

/**
 * Verifica si el usuario puede crear comunidades privadas
 * Solo empresas/parques con plan distinto de 'free' pueden crear comunidades privadas
 * @param {Object} profile - Objeto de perfil del usuario
 * @param {Object} profile.role - Rol del usuario
 * @param {string} profile.role.key - Clave del rol (persona, empresa, parque_industrial)
 * @param {string} profile.planKey - Clave del plan actual del usuario
 * @returns {boolean}
 */
export function canCreatePrivateCommunity(profile) {
  const roleKey = profile?.role?.key || profile?.roleKey;
  const planKey = profile?.planKey;
  const isBusinessOrPark = roleKey === 'empresa' || roleKey === 'parque_industrial';
  const hasValidPlan = planKey && planKey !== 'free';
  return isBusinessOrPark && hasValidPlan;
}