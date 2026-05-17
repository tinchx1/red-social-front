"use server"

export async function requestPasswordReset(email) {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Ingresá un correo electrónico válido")
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/password/forgot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    )

    if (!response.ok) {
      const statusCode = response.status
      const errorData = await response.json().catch(() => ({}))
      
      if (statusCode === 404) {
        return {
          success: false,
          message: "No encontramos una cuenta asociada a este correo electrónico",
        }
      }
      
      if (statusCode === 429) {
        return {
          success: false,
          message: "Demasiadas solicitudes. Por favor, intentá nuevamente más tarde.",
        }
      }

      const message =
        errorData?.message ||
        errorData?.error ||
        errorData?.errors?.email?.[0] ||
        "No se pudo procesar la solicitud"
      throw new Error(message)
    }

    // Some APIs might return empty body on success
    let result = null
    try {
      result = await response.json()
    } catch (_) {
      result = null
    }

    return {
      success: true,
      message:
        "Correo de recuperación enviado. Por favor, revisá tu correo para restablecer tu contraseña.",
      data: result,
    }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { success: false, message: "Error al solicitar reset de contraseña. Por favor, intentá nuevamente." }
  }
}


export async function resetPassword({ token, password }) {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido")
    }
    if (!password || typeof password !== "string") {
      throw new Error("Contraseña inválida")
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      }
    )

    if (!response.ok) {
      const statusCode = response.status
      const errorData = await response.json().catch(() => ({}))
      let message =
        errorData?.message ||
        errorData?.error ||
        errorData?.errors?.password?.[0] ||
        "No se pudo actualizar la contraseña"
      const normalized = `${message}`.toLowerCase()
      if (statusCode === 410 || statusCode === 422 || normalized.includes("expir")) {
        message = "Este link expiró. Volvé a solicitar uno nuevo."
      }
      throw new Error(message)
    }

    let result = null
    try {
      result = await response.json()
    } catch (_) {
      result = null
    }

    return {
      success: true,
      message: "Contraseña actualizada correctamente",
      data: result,
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, message: "Error al actualizar la contraseña" }
  }
}

