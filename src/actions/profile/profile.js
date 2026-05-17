"use server";
import { cookies } from "next/headers";
import { serverApi } from "@/lib/api";

// Error especial para cuentas suspendidas o eliminadas
class AccountSuspendedError extends Error {
  constructor(message = "Account has been suspended") {
    super(message);
    this.name = "AccountSuspendedError";
  }
}

class AccountDeletedError extends Error {
  constructor(message = "Account has been deleted") {
    super(message);
    this.name = "AccountDeletedError";
  }
}

// Función helper para verificar si un error es de cuenta suspendida o eliminada
export async function isAccountBlockedError(error) {
  return (
    error instanceof AccountSuspendedError ||
    error instanceof AccountDeletedError ||
    error?.message === "Account has been suspended" ||
    error?.message === "Account has been deleted"
  );
}

// Función helper para obtener el token fuera del scope cacheado
async function getAuthToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("accessToken")?.value;
  } catch (error) {
    return null;
  }
}

export async function getMyProfile() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const response = await serverApi.get("/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error obteniendo perfil";
    // Si la cuenta está suspendida o eliminada, lanzar error especial
    if (message === "Account has been suspended") {
      throw new AccountSuspendedError(message);
    }
    if (message === "Account has been deleted") {
      throw new AccountDeletedError(message);
    }
    throw new Error(message);
  }
}

export async function getUserProfile(userId) {
  try {
    const response = await serverApi.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Error obteniendo perfil del usuario";

    console.log("Error getting user profile", error);
    throw new Error(message);
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await serverApi.put("/profile/me", profileData);

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Error actualizando perfil";

    console.log("Error updating profile", error);
    throw new Error(message);
  }
}

export async function getProfileStats() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const response = await serverApi.get("/profile/me/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Error obteniendo estadísticas del perfil";

    // Si la cuenta está suspendida o eliminada, lanzar error especial
    if (message === "Account has been suspended") {
      throw new AccountSuspendedError(message);
    }
    if (message === "Account has been deleted") {
      throw new AccountDeletedError(message);
    }

    console.log("Error getting profile stats", error);
    throw new Error(message);
  }
}

export async function updateEmail(newEmail) {
  try {
    const response = await serverApi.patch("/profile/me/email", {
      email: newEmail,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message || "Error actualizando correo electrónico";

    console.log("Error updating email", error);
    return { success: false, error: message };
  }
}

export async function updatePassword(currentPassword, newPassword) {
  try {
    const response = await serverApi.patch("/profile/me/password", {
      currentPassword,
      newPassword,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message || "Error actualizando contraseña";

    console.log("Error updating password", error);
    return { success: false, error: message };
  }
}
