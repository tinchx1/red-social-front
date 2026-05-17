"use client"
import React from "react"
import { Button } from "@/components/ui"

/**
 * Client-only wrapper to open the consult modal via a global event.
 * Accepts the same visual props as Button and forwards them.
 */
export default function ConsultButton({ children, onClick, ...props }) {
  const handleClick = (e) => {
    if (onClick) onClick(e)
    window.dispatchEvent(new Event("open-consult-modal"))
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}


