/**
 * Roles permitidos para agregar usuarios a la comunidad
 */
export const ALLOWED_ROLES_TO_ADD_USERS = ["empresa", "parque_industrial"];

/**
 * Plan requerido para agregar usuarios a la comunidad
 */
export const REQUIRED_PLAN_TO_ADD_USERS = "full";

/**
 * Verifica si el usuario tiene permisos para agregar usuarios a la comunidad
 * @param {Object} creator - Objeto del creador/usuario
 * @param {string} creator.keyPlan - Plan del usuario ("full", "basic", etc.)
 * @param {Object} creator.role - Rol del usuario
 * @param {string} creator.role.key - Clave del rol ("empresa", "parque_industrial", etc.)
 * @returns {boolean} True si el usuario puede agregar usuarios
 */
export const canAddUsersToCommuni = (creator) => {
  if (!creator || !creator.role) {
    return false;
  }
  const isFullPlan = creator.keyPlan === REQUIRED_PLAN_TO_ADD_USERS;
  const isValidRole = ALLOWED_ROLES_TO_ADD_USERS.includes(creator.role.key);

  return isFullPlan && isValidRole;
};
