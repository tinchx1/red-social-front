"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components"
import { Spinner } from "@/components/ui"
import styles from "@/components/auth/RecoverPasswordForm/RecoverPasswordForm.module.scss"
import { verifyEmail, resendEmailVerification } from "@/actions"
import calendarClockIcon from "@/assets/calendar-clock.svg?url"
import checkRoundFillIcon from "@/assets/check_round_fill.svg?url"
import closeRingFillIcon from "@/assets/close_ring_fill.svg?url"

function VerificarEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const permanentToken = searchParams.get("permanentToken") || ""
  const communityId = searchParams.get("communityId") || ""

  const [resultType, setResultType] = useState(null) // "success" | "expired" | "error"
  const [message, setMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [resendMessageType, setResendMessageType] = useState("") // "success" | "error"

  const runVerification = useCallback(async () => {
    if (!token) {
      setResultType("error")
      setMessage("Token inválido o faltante")
      return
    }
    const res = await verifyEmail(token, permanentToken)
    if (res.success) {
      setResultType("success")
      setMessage(res.message || "Email verificado exitosamente")

      // Guardar communityId en sessionStorage si existe
      if (communityId) {
        sessionStorage.setItem("redirectAfterLogin", `/comunidades/${communityId}`)
      }

      return
    }
    const normalized = `${res.message}`.toLowerCase()
    if (res.code === 400 || normalized.includes("expir")) {
      setResultType("expired")
    } else {
      setResultType("error")
    }
    setMessage(res.message || "No se pudo verificar el email")
  }, [token, permanentToken, communityId])

  const handleResendEmail = async () => {
    if (!permanentToken) {
      setResendMessage("Token permanente inválido o faltante")
      setResendMessageType("error")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const res = await resendEmailVerification(permanentToken)
      if (res.success) {
        setResendMessage(res.message || "Correo de verificación reenviado exitosamente")
        setResendMessageType("success")
      } else {
        setResendMessage(res.message || "Error al reenviar el correo")
        setResendMessageType("error")
      }
    } catch (error) {
      setResendMessage("Error al reenviar el correo de verificación")
      setResendMessageType("error")
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    runVerification()
  }, [runVerification])

  const iconSrc = resultType === null ? calendarClockIcon : resultType === "success"
    ? checkRoundFillIcon
    : resultType === "expired"
      ? calendarClockIcon
      : closeRingFillIcon


  const title = resultType === "success"
    ? "CORREO VALIDADO CON ÉXITO"
    : resultType === "expired"
      ? "ESTE LINK EXPIRÓ"
      : resultType === "error"
        ? "HUBO UN PROBLEMA"
        : "VERIFICANDO CORREO…"

  const subtitle = resultType === "success"
    ? null
    : resultType === "expired"
      ? "Deberás volver a pedir el link para validar tu email."
      : resultType === "error"
        ? "Volvé a intentar verificar tu email"
        : "Por favor, esperá un momento mientras validamos tu correo."

  return (
    <div className={styles.formContainer}>
      <div className={`${styles.form} ${styles.resultContent}`}>
        <Image className={styles.resultIcon} src={iconSrc} alt={resultType || "loading"} width={56} height={56} />
        <h1 className={styles.title} style={{ textAlign: "center" }}>{title}</h1>
        {subtitle && <p className={styles.subtitle} style={{ textAlign: "center" }}>{subtitle}</p>}

        {/* Resend message positioned above buttons */}

        {resendMessage && (
          <div className={styles.statusFixed} style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div className={resendMessageType === "success" ? styles.generalSuccess : styles.generalError}>
              <p>{resendMessage}</p>
            </div>
          </div>
        )}
        <div className={styles.buttonFixed} style={{ justifyContent: "center" }}>
          {resultType === "success" ? (
            <Button type="button" variant="primary" onClick={() => router.push("/")}>Iniciar sesión</Button>
          ) : resultType === "expired" ? (
            <>
              <Button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? <>Reenviando <Spinner color="white" size="small" /></> : "Reenviar correo"}
              </Button>
              <Button type="button" variant="light-blue" onClick={() => router.push("/")}>Volver al Ingreso</Button>
            </>
          ) : resultType === "error" ? (
            <Button type="button" variant="light-blue" onClick={() => router.push("/")}>Volver al Ingreso</Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.formContainer}>
        <div className={`${styles.form} ${styles.resultContent}`}>
          <Image className={styles.resultIcon} src={calendarClockIcon} alt="loading" width={56} height={56} />
          <h1 className={styles.title} style={{ textAlign: "center" }}>VERIFICANDO CORREO…</h1>
          <p className={styles.subtitle} style={{ textAlign: "center" }}>Por favor, esperá un momento mientras validamos tu correo.</p>
        </div>
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  )
}


