"use client"
import { useEffect, useState } from "react"
import { ConsultFormModal } from "@/components/consultoria"

export default function ConsultModalRoot() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const openHandler = () => setOpen(true)
    const closeHandler = () => setOpen(false)
    window.addEventListener("open-consult-modal", openHandler)
    window.addEventListener("close-consult-modal", closeHandler)
    return () => {
      window.removeEventListener("open-consult-modal", openHandler)
      window.removeEventListener("close-consult-modal", closeHandler)
    }
  }, [])

  return (
    <ConsultFormModal isOpen={open} onClose={() => setOpen(false)} />
  )
}


