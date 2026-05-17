"use server"

import { cookies } from "next/headers"

export async function verifyEmail(token, permanentToken) {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido o faltante")
    }

    // Si hay permanentToken, es verificación de registro inicial
    if (permanentToken) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const error = new Error('API Error')
        error.response = { status: response.status, data: errorData }
        throw error
      }
      
      const result = await response.json()

      return {
        success: true,
        code: 200,
        message: "Email verificado exitosamente",
        data: result,
      }
    }

    // Sin permanentToken, es cambio de email (NO requiere autenticación - el token es la autenticación)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/me/email/verify/${token}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error('API Error')
      error.response = { status: response.status, data: errorData }
      throw error
    }
    
    const result = await response.json()

    return {
      success: true,
      code: 200,
      message: result.message || "Email actualizado exitosamente",
      data: result,
    }
  } catch (error) {
    const statusCode = error.response?.status || 500
    const message = error.response?.data?.message || "Error al verificar el email"
    return {
      success: false,
      code: statusCode,
      message,
    }
  }
}

export async function resendEmailVerification(permanentToken) {
  try {
    if (!permanentToken || typeof permanentToken !== "string") {
      throw new Error("Token permanente inválido o faltante")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permanentToken }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error('API Error')
      error.response = { status: response.status, data: errorData }
      throw error
    }
    
    const result = await response.json()

    return {
      success: true,
      code: 200,
      message: "Correo de verificación reenviado exitosamente",
      data: result,
    }
  } catch (error) {
    const statusCode = error.response?.status || 500
    const message =  "Error al reenviar el correo de verificación"
    return {
      success: false,
      code: statusCode,
      message,
    }
  }
}


