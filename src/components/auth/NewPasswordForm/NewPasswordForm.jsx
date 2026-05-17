"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input, Button, PasswordRequirements } from "@/components"
import { Spinner } from "@/components/ui"
import { validatePassword, validatePasswordConfirmation } from "@/utils"
import { resetPassword } from "@/actions"
import styles from "../RecoverPasswordForm/RecoverPasswordForm.module.scss"
import ResetResult from "../RecoverPasswordForm/ResetResult/ResetResult"

export default function NewPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: null, message: "" })
  const [resultType, setResultType] = useState(null) // "success" | "expired" | "error"

  const passwordError = useMemo(() => validatePassword(password), [password])
  const confirmError = useMemo(
    () => validatePasswordConfirmation(confirmPassword, password),
    [confirmPassword, password]
  )

  const handleGoBack = () => router.push("/recuperar-contrasena")

  const handleRetry = () => {
    // If link expired, send user to request a new link, otherwise reload form
    if (resultType === "expired") {
      router.push("/recuperar-contrasena")
    } else {
      setResultType(null)
      setStatus({ type: null, message: "" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setResultType("error")
      setStatus({ type: "error", message: "Token inválido o faltante" })
      return
    }
    if (passwordError || confirmError) return

    try {
      setIsSubmitting(true)
      setStatus({ type: null, message: "" })
      const result = await resetPassword({ token, password })
      if (!result.success) throw new Error(result.message || "No se pudo actualizar la contraseña")
      setStatus({ type: "success", message: result.message || "Contraseña actualizada correctamente" })
      setResultType("success")
    } catch (error) {
      const message = error.message || "Ocurrió un error. Intentá de nuevo."
      setStatus({ type: "error", message })
      const normalized = message.toLowerCase()
      if (normalized.includes("expir")) {
        setResultType("expired")
      } else {
        setResultType("error")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled =
    isSubmitting || !password || !confirmPassword || Boolean(passwordError) || Boolean(confirmError)

  useEffect(() => {
    if (!token) {
      setResultType("error")
      setStatus({ type: "error", message: "Token inválido o faltante" })
    }
  }, [token])

  if (resultType) {
    return (
      <ResetResult
        type={resultType}
        message={status.message}
        onRetry={handleRetry}
        onGoToLogin={() => router.push("/")}
      />
    )
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.title}>RECUPERAR CONTRASEÑA</h1>
        <p className={styles.subtitle}>Elegí una nueva contraseña para tu cuenta</p>

        <div className={styles.formField}>
          <Input
            id="new-password"
            label="Nueva contraseña*"
            type="password"
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu nueva contraseña"
            error={password ? passwordError : undefined}
            autocomplete="new-password"
          />
        </div>

        <div className={styles.formField}>
          <Input
            id="confirm-password"
            label="Confirmar contraseña*"
            type="password"
            showPasswordToggle
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí tu nueva contraseña"
            error={confirmPassword ? confirmError : undefined}
            autocomplete="new-password"
          />
        </div>

        <PasswordRequirements password={password} singleColumn />
        <div className={styles.buttonFixed}>
          <Button type="button" variant="light-blue" onClick={handleGoBack}>
            Volver
          </Button>
          <Button type="submit" variant="primary" disabled={isButtonDisabled}>
            {isSubmitting ? <>Enviando <Spinner color="white" size="small" /></> : "Enviar"}
          </Button>
        </div>
      </form>
    </div>
  )
}


