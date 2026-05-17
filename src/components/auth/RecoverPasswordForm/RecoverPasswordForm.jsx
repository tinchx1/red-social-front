"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input, Button } from "@/components"
import { Spinner } from "@/components/ui"
import { requestPasswordReset } from "@/actions"
import styles from "./RecoverPasswordForm.module.scss"

export default function RecoverPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [status, setStatus] = useState({ type: null, message: "" })
  const router = useRouter()

  useEffect(() => {
    let interval
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldownTime])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || cooldownTime > 0) return

    try {
      setIsSubmitting(true)
      setStatus({ type: null, message: "" })
      const result = await requestPasswordReset(email)
      if (!result.success) {
        throw new Error(result.message || "No se pudo enviar el enlace")
      }
      setStatus({ type: "success", message: result.message || "Correo de recuperación enviado" })
      setCooldownTime(300) // 5 minutes
    } catch (error) {
      console.error("Error in password recovery:", error)
      setStatus({ type: "error", message: error.message || "Ocurrió un error. Intentá de nuevo." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const isButtonDisabled = !email || isSubmitting || cooldownTime > 0

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.title}>RECUPERAR CONTRASEÑA</h1>
        <p className={styles.subtitle}>Te enviaremos un link para que puedas cambiar tu contraseña</p>


        <div className={styles.formField}>
          <Input
            id="email"
            label="Correo electrónico*"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="micorreoregistrado@empresa.com.ar"
            required
            autoComplete="email"
          />
        </div>
        
        {cooldownTime > 0 && (
          <p className={styles.timerText}>
            Podrás solicitar un nuevo link en {formatTime(cooldownTime)} mins
          </p>
        )}

        <div className={styles.statusFixed}>
          {status.type === "error" && (
            <div className={styles.generalError}>
              <p>{status.message}</p>
            </div>
          )}
          {status.type === "success" && (
            <div className={styles.generalSuccess}>
              <p>{status.message || "Correo de recuperación enviado"}</p>
            </div>
          )}
        </div>

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