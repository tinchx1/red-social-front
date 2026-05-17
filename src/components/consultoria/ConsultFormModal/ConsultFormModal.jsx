"use client";
import React, { useState, useEffect } from "react";
import styles from "./ConsultFormModal.module.scss";
import { Modal, Input, Select, Button, Spinner } from "@/components/ui";
import { createConsultancy } from "@/actions";
import { getMyProfile } from "@/actions/profile";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/utils";
/**
 * @param {{ isOpen: boolean; onClose: () => void }} props
 */
export default function ConsultFormModal({ isOpen, onClose }) {
  const router = useRouter();

  const initialFormState = {
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rubro: "",
    empresa: "",
    tipo: "",
    mensaje: "",
    contactoTelefono: false,
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getMyProfile();
      // Auto-fill form with user data
      setForm((prev) => ({
        ...prev,
        nombre:
          userProfile.roleKey === "persona"
            ? userProfile.firstName
            : userProfile.profile?.representative || "",
        apellido: userProfile.lastName || "",
        email: userProfile.email || "",
        telefono: userProfile.phone.replace(/\D/g, "") || "",
        rubro: userProfile.profile?.industry || "",
        empresa: userProfile.profile?.company || "",
      }));
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const tipos = [
    {
      value: "fe",
      label:
        "Facturación electrónica: Emisión y recepción de facturas electrónicas de forma segura y eficiente.",
    },
    {
      value: "contabilidad",
      label:
        "Contabilidad: Gestión de la contabilidad financiera y administrativa de la empresa.",
    },
    {
      value: "recursos_humanos",
      label:
        "Recursos humanos: Administración de nóminas, gestión de empleados y control de asistencia.",
    },
    {
      value: "impuestos",
      label:
        "Impuestos: Cálculo y presentación de impuestos de forma precisa y oportuna.",
    },
    {
      value: "legal",
      label: "Legal: Asesoría legal y gestión de trámites legales.",
    },
    {
      value: "otros",
      label: "Otros: Otros tipos de consulta.",
    },
  ];

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // Función para formatear el teléfono mientras se escribe
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Solo números
    setField("telefono", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields except mensaje and telefono
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (form.nombre.length < 1 || form.nombre.length > 100) {
      newErrors.nombre = "El nombre debe tener entre 1 y 100 caracteres";
    }

    if (!form.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (form.apellido.length < 1 || form.apellido.length > 100) {
      newErrors.apellido = "El apellido debe tener entre 1 y 100 caracteres";
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validación del teléfono - obligatorio
    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else {
      // Limpiar el teléfono para validar solo números
      const cleanPhone = form.telefono.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.telefono = "El teléfono debe tener entre 10 y 15 caracteres";
      }
    }

    if (!form.rubro.trim()) {
      newErrors.rubro = "El rubro es requerido";
    } else if (form.rubro.length < 1 || form.rubro.length > 100) {
      newErrors.rubro = "El rubro debe tener entre 1 y 100 caracteres";
    }

    if (!form.empresa.trim()) {
      newErrors.empresa = "La empresa es requerida";
    } else if (form.empresa.length < 1 || form.empresa.length > 255) {
      newErrors.empresa = "La empresa debe tener entre 1 y 255 caracteres";
    }

    if (!form.tipo) {
      newErrors.tipo = "El tipo de consulta es requerido";
    }

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Map UI form -> API payload
    const tipoMap = {
      fe: "Facturacion electronica",
      contabilidad: "Contabilidad",
      recursos_humanos: "Recursos Humanos",
      impuestos: "Impuestos",
      legal: "Legal",
      otros: "Otros",
    };

    const payload = {
      firstName: form.nombre,
      lastName: form.apellido,
      email: form.email,
      phone: form.telefono,
      industry: form.rubro,
      company: form.empresa,
      consultationType: tipoMap[form.tipo] || "",
      message: form.mensaje,
      contactByPhone: Boolean(form.contactoTelefono),
    };

    try {
      const result = await createConsultancy(payload);
      router.push("/mensajes");

      handleClose();
    } catch (err) {
      // Optionally hook into ToastContext in future
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="large">
      <div className={styles.header}>
        <Button variant="icon" className={styles.closeBtn} onClick={handleClose}>
          ✕
        </Button>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <Input
            label="Nombre"
            placeholder="Marta"
            value={form.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
            rounded="small"
            error={errors.nombre}
            maxLength={100}
          />
          <Input
            label="Apellido"
            placeholder="Sanchez"
            value={form.apellido}
            onChange={(e) => setField("apellido", e.target.value)}
            rounded="small"
            error={errors.apellido}
            maxLength={100}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Correo electrónico"
            placeholder="miempresa@dominio.com.ar"
            // type="email"
            autocomplete="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            rounded="small"
            error={errors.email}
          />
          <Input
            label="Teléfono"
            placeholder="2211234567"
            type="tel"
            autocomplete="tel"
            value={form.telefono}
            onChange={handlePhoneChange}
            rounded="small"
            error={errors.telefono}
            maxLength={15}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Rubro"
            placeholder="Metalúrgica"
            value={form.rubro}
            onChange={(e) => setField("rubro", e.target.value)}
            rounded="small"
            error={errors.rubro}
          />
          <Input
            label="Empresa"
            placeholder="Tornillos Tomi"
            value={form.empresa}
            onChange={(e) => setField("empresa", e.target.value)}
            rounded="small"
            error={errors.empresa}
            maxLength={255}
          />
        </div>

        <div className={styles.rowFull}>
          <Select
            label="Tipo de consulta"
            value={form.tipo}
            onChange={(v) => setField("tipo", v)}
            options={tipos}
            prefixClass={styles.labelPrefix}
            error={errors.tipo}
          />
        </div>

        <div className={styles.rowFull}>
          <Input
            as="textarea"
            rows={6}
            label="Mensaje"
            placeholder="Dejá tu propuesta lo más detallada posible para poder asesorarte"
            value={form.mensaje}
            onChange={(e) => setField("mensaje", e.target.value)}
            rounded="small"
            maxLength={5000}
          />
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.contactoTelefono}
            onChange={(e) => setField("contactoTelefono", e.target.checked)}
          />
          <span>Quiero que me contacten por teléfono</span>
        </label>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <>Cargando <Spinner color="white" size="small" /></> : "Enviar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
