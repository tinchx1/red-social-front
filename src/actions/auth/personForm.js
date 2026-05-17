"use server";

import {
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateLocation,
} from "@/utils/validations";
import { PROVINCE_OPTIONS } from "@/constants/personForm";

export async function submitPersonForm(formData) {
  try {
    // Validate form data
    const validationError = validateFormData(formData);
    if (validationError) {
      throw new Error(validationError);
    }
    const cleanPhone = formData.telefono?.replace(/[\s\-\(\)\+]/g, "") || "";

    const provinceLabel =
      PROVINCE_OPTIONS?.find((p) => p.value === formData.provincia)?.label ||
      formData.provincia ||
      null;

    const apiData = {
      email: formData.email,
      password: formData.contraseña,
      firstName: formData.nombre,
      lastName: formData.apellido,
      roleKey: "persona",
      phone: cleanPhone,
      province: provinceLabel,
      city: formData.ciudad,
      industry: formData.rubroIndustria || null,
      company: formData.empresa || null,
      industrialSectors: Array.isArray(formData.sectoresIndustriales)
        ? formData.sectoresIndustriales
        : [],
    };
    // Avoid logging sensitive data like passwords

    // Make API call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error("API Error");
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();

    return {
      success: true,
      message: "Te enviamos un correo para confirmar tu email",
      data: result,
    };
  } catch (error) {
    console.error("Error submitting person form:", error);
    if (error.response?.status === 409) {
      return { success: false, message: "El email ya está en uso" };
    }
    const message =
      "Error al crear la cuenta, por favor intentá nuevamente, revisar los campos requeridos";
    return { success: false, message };
  }
}

function validateFormData(formData) {
  // Required presence
  if (!formData.nombre?.trim() || !formData.apellido?.trim()) {
    return "Nombre y apellido son requeridos";
  }

  // Format validations
  const emailError = validateEmail(formData.email);
  if (emailError) return emailError;

  const phoneError = validatePhone(formData.telefono);
  if (phoneError) return phoneError;

  // Location validations (align with BusinessForm)
  const provinceError = validateLocation(formData.provincia);
  if (provinceError) return provinceError;

  const cityError = validateLocation(formData.ciudad);
  if (cityError) return cityError;

  const passwordError = validatePassword(formData.contraseña);
  if (passwordError) return passwordError;

  const confirmError = validatePasswordConfirmation(
    formData.confirmarContraseña,
    formData.contraseña
  );
  if (confirmError) return confirmError;

  // Stage 2 validation - Professional Info
  if (
    !Array.isArray(formData.sectoresIndustriales) ||
    formData.sectoresIndustriales.length === 0
  ) {
    return "Seleccioná al menos un sector industrial";
  }

  return null;
}
