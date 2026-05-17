import { Suspense } from "react"
import { NewPasswordForm } from "@/components/auth"
import { Spinner } from "@/components"

export default function NuevaContraseñaPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "16px"
      }}>
        Cargando <Spinner color="white" size="small" />
      </div>
    }>
      <NewPasswordForm />
    </Suspense>
  )
}