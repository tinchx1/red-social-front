"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select, Button } from "@/components";
import styles from "./CreateAccountForm.module.scss";
import { getGoogleData } from "@/utils/googleDataStorage";

export default function CreateAccountForm() {
  const [accountType, setAccountType] = useState("");
  const router = useRouter();
  const [googleData, setGoogleData] = useState(null);

  useEffect(() => {
    // Leer datos de Google desde sessionStorage usando la utilidad
    const userData = getGoogleData();

    if (userData) {
      setGoogleData(userData);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accountType) {
      // Navigate to the specific form based on account type
      if (accountType === "industrial") {
        const url = `/crear-cuenta/parque-industrial`;
        router.push(url);
      } else if (accountType === "business") {
        const url = `/crear-cuenta/empresa`;
        router.push(url);
      } else if (accountType === "person") {
        const url = `/crear-cuenta/persona`;
        router.push(url);
      }
    }
  };

  const accountTypeOptions = [
    { value: "industrial", label: "Parque Industrial" },
    { value: "business", label: "Empresa" },
    { value: "person", label: "Persona" },
  ];

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.title}>CREAR CUENTA</h1>
        <p className={styles.subtitle}>
          Seleccioná el tipo de cuenta que querés crear y completá los datos
          requeridos
        </p>
        <div className={styles.formField}>
          <Select
            label="¿Qué tipo de cuenta querés crear?"
            value={accountType}
            onChange={setAccountType}
            options={accountTypeOptions}
            placeholder="Seleccionar"
          />
        </div>

        <div className={styles.buttonFixed}>
          <Button
            type="button"
            variant="light-blue"
            onClick={() => router.push("/")}
          >
            Volver
          </Button>
          <Button type="submit" variant="primary" disabled={!accountType}>
            Siguiente
          </Button>
        </div>
      </form>
    </div>
  );
}
