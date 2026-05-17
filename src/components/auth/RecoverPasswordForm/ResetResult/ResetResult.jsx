"use client"

import { Button } from "@/components"
import styles from "@/components/auth/RecoverPasswordForm/RecoverPasswordForm.module.scss"
import Image from "next/image"
import calendarClockIcon from "@/assets/calendar-clock.svg?url"
import checkRoundFillIcon from "@/assets/check_round_fill.svg?url"
import closeRingFillIcon from "@/assets/close_ring_fill.svg?url"

export default function ResetResult({ type, message, onRetry, onGoToLogin }) {
  const isSuccess = type === "success"
  const isExpired = type === "expired"
  
  const title = isSuccess
    ? "CONTRASEÑA MODIFICADA CON ÉXITO"
    : isExpired
    ? "ESTE LINK EXPIRÓ"
    : "HUBO UN PROBLEMA"

  const subtitle = isSuccess
    ? null
    : isExpired
    ? "Deberás volver a pedir el link para cambiar tu contraseña."
    : "Volvé a intentar cambiar tu contraseña"

  const iconSrc = isSuccess
    ? checkRoundFillIcon
    : isExpired
    ? calendarClockIcon
    : closeRingFillIcon

  return (
    <div className={styles.formContainer}>
      <div className={`${styles.form} ${styles.resultContent}`}>
        <Image className={styles.resultIcon} src={iconSrc} alt={type} width={56} height={56} />
        <h1 className={styles.title} style={{ textAlign: "center", maxWidth: "482px" }}>{title}</h1>
        {subtitle && <p className={styles.subtitle} style={{ textAlign: "center" }}>{subtitle}</p>}

        <div className={styles.buttonFixed} style={{ justifyContent: "center" }}>
          {isSuccess ? (
            <Button type="button" variant="primary" onClick={onGoToLogin}>
              Iniciar sesión
            </Button>
          ) : (
            <>
              <Button type="button" variant="light-blue" onClick={onGoToLogin}>
                Volver al Ingreso
              </Button>
              <Button type="button" variant="primary" onClick={onRetry}>
                Reintentar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


