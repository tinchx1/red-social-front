"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, ProgressIndicator, AccountTypeTabs } from "@/components";
import { Spinner } from "@/components/ui";
import checkRoundFillIcon from "@/assets/check_round_fill.svg?url";
import styles from "./BusinessForm.module.scss";
import resultStyles from "@/components/auth/RecoverPasswordForm/RecoverPasswordForm.module.scss";
import { getBase64 } from "@/utils";
import BusinessFormStage1 from "./BusinessFormStage1";
import BusinessFormStage2 from "./BusinessFormStage2";
import BusinessFormStage3 from "./BusinessFormStage3";
import { submitBusinessForm } from "@/actions";
import {
  ACCOUNT_TYPE_OPTIONS,
  FORM_STAGES,
  STAGE_VALIDATION_RULES,
  INITIAL_FORM_DATA,
  FORM_LABELS,
  BUTTON_TEXTS,
  FORM_FIELDS,
} from "@/constants/businessForm";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateLocation,
  validatePasswordConfirmation,
  validateLinkedInUrl,
  validateWebsiteUrl,
} from "@/utils";
import {
  getGoogleData,
  clearGoogleDataAfterRegistration,
} from "@/utils/googleDataStorage";

export default function BusinessForm({ accountType: propAccountType }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState(propAccountType);
  const [currentStage, setCurrentStage] = useState(1);
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    accountType: propAccountType,
  });
  const [errors, setErrors] = useState({});
  const [resultType, setResultType] = useState(null); // "success"
  const [successMessage, setSuccessMessage] = useState("");
  const [googleData, setGoogleData] = useState(null);

  // Capturar datos de Google de sessionStorage
  useEffect(() => {
    const userData = getGoogleData();
    if (userData) {
      setGoogleData(userData);

      // Pre-llenar campos con datos de Google
      setFormData((prev) => ({
        ...prev,
        representante: `${userData.firstName || ""} ${
          userData.lastName || ""
        }`.trim(),
        emailEmpresarial: userData.email || "",
      }));
    }
  }, []);

  // Scroll to top when stage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStage]);

  const validateField = (field, value) => {
    // Maximum length validations
    const MAX_LENGTHS = {
      nombre: 100,
      representante: 100,
      emailEmpresarial: 255,
      telefonoEmpresarial: 20,
      contraseña: 128,
      confirmarContraseña: 128,
      provincia: 100,
      localidad: 100,
      direccion: 200,
      rubroIndustria: 100,
      linkedinUrl: 200,
      sitioWeb: 200,
    };

    // Check max length first
    if (
      MAX_LENGTHS[field] &&
      value &&
      value.toString().length > MAX_LENGTHS[field]
    ) {
      return `Este campo no puede exceder ${MAX_LENGTHS[field]} caracteres`;
    }

    if (field === "emailEmpresarial") {
      return validateEmail(value);
    } else if (field === "telefonoEmpresarial") {
      return validatePhone(value);
    } else if (field === "contraseña") {
      return validatePassword(value);
    } else if (field === "confirmarContraseña") {
      return validatePasswordConfirmation(value, formData.contraseña);
    } else if (
      field === "provincia" ||
      field === "localidad" ||
      field === "direccion"
    ) {
      return validateLocation(value);
    } else if (field === "linkedinUrl") {
      return null;
    } else if (field === "sitioWeb") {
      return null;
    } else if (
      field === "nombre" ||
      field === "representante" ||
      field === "rubroIndustria"
    ) {
      // Basic text validation for required fields
      if (!value || value.trim() === "") {
        return "Este campo es requerido";
      }
      if (value.trim().length < 2) {
        return "Debe tener al menos 2 caracteres";
      }
    } else if (field === "cantidadEmpleados") {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return "Debe ser un número válido mayor o igual a 0";
      }
      if (num > 10000000) {
        return "El número de empleados no puede exceder 10,000,000";
      }
    }
    return null;
  };

  const validateCurrentStage = () => {
    const requiredFields = STAGE_VALIDATION_RULES[currentStage] || [];
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      const value = formData[field];
      let fieldError = null;

      // Check if field is empty
      if (Array.isArray(value)) {
        if (value.length === 0) {
          fieldError = "Debes seleccionar al menos un sector";
          isValid = false;
        }
      } else if (field === FORM_FIELDS.ACEPTA_TERMINOS) {
        // Special validation for checkbox
        if (!value) {
          fieldError = "Debes aceptar los términos y condiciones y la política de privacidad";
          isValid = false;
        }
      } else if (!value || value.toString().trim() === "") {
        fieldError = "Este campo es requerido";
        isValid = false;
      } else {
        // Validate specific field types
        fieldError = validateField(field, value);
        if (fieldError) {
          isValid = false;
        }
      }

      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Do not proceed if there are active validation errors
    const hasActiveErrors = Object.values(errors || {}).some(Boolean);
    if (hasActiveErrors) return;

    try {
      if (currentStage < 3) {
        // Validate current stage
        if (validateCurrentStage()) {
          setCurrentStage(currentStage + 1);
          setErrors({}); // Clear errors when moving to next stage
        }
      } else {
        // Final submission

        // Validate final stage before submission
        if (!validateCurrentStage()) {
          throw new Error("Por favor, completa todos los campos requeridos");
        }

        setIsSubmitting(true);
        const result = await submitBusinessForm(formData);
        if (result.success) {
          // Show success - confirmation email sent
          setResultType("success");
          setSuccessMessage(
            result.message || "Te enviamos un correo para confirmar tu email"
          );
          // Clear Google data after successful registration
          clearGoogleDataAfterRegistration();
        } else {
          // Handle API error
          throw new Error(result.message || "Error al crear la cuenta");
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);

      // Set a general error message
      setErrors((prev) => ({
        ...prev,
        general:
          error.message ||
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      }));

      // Clear general error after 5 seconds
      setTimeout(() => {
        setErrors((prev) => {
          const { general, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStage === 1) {
      router.push("/");
    } else {
      setCurrentStage(currentStage - 1);
      setErrors({}); // Clear errors when going back
    }
  };

  if (resultType === "success") {
    return (
      <div
        className={resultStyles.formContainer}
        style={{ minHeight: "500px" }}
      >
        <div className={`${resultStyles.form} ${resultStyles.resultContent}`}>
          <Image
            className={resultStyles.resultIcon}
            src={checkRoundFillIcon}
            alt="success"
            width={56}
            height={56}
          />
          <h1
            className={resultStyles.title}
            style={{ textAlign: "center", maxWidth: "300px" }}
          >
            TU CUENTA HA SIDO CREADA CON ÉXITO
          </h1>
          <p
            className={resultStyles.subtitle}
            style={{ textAlign: "center", maxWidth: "300px" }}
          >
            Revisa tu casilla de correo para verificar tu email y acceder a todo
            el contenido de la plataforma.
          </p>
        </div>
      </div>
    );
  }

  const handleAccountTypeChange = (value) => {
    setAccountType(value);
    if (value === "industrial") {
      router.push("/crear-cuenta/parque-industrial");
    } else if (value === "business") {
      router.push("/crear-cuenta/empresa");
    } else if (value === "person") {
      router.push("/crear-cuenta/persona");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Validate specific fields in real time (only if they have content)
    if (
      value &&
      (field === "linkedinUrl" ||
        field === "sitioWeb" ||
        field === "emailEmpresarial" ||
        field === "telefonoEmpresarial" ||
        field === "cantidadEmpleados")
    ) {
      const error = validateField(field, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await getBase64(file);
        setFormData((prev) => ({
          ...prev,
          estatuto: base64,
        }));
        // Clear error when file is selected
        if (errors.estatuto) {
          setErrors((prev) => ({ ...prev, estatuto: null }));
        }
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const handleInputBlur = (field) => {
    const value = formData[field];
    // Validate on blur for optional fields only if they have content
    if (value) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case FORM_STAGES.BASIC_INFO:
        return (
          <BusinessFormStage1
            formData={formData}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            errors={errors}
          />
        );
      case FORM_STAGES.BUSINESS_DETAILS:
        return (
          <BusinessFormStage2
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      case FORM_STAGES.COMPANY_PROFILE:
        return (
          <BusinessFormStage3
            formData={formData}
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.title}>{FORM_LABELS.TITLE}</h1>
        <p className={styles.subtitle}>
          {currentStage !== FORM_STAGES.COMPANY_PROFILE
            ? FORM_LABELS.SUBTITLE_STAGE_1_2
            : accountType === "business"
            ? FORM_LABELS.SUBTITLE_STAGE_3_BUSINESS
            : FORM_LABELS.SUBTITLE_STAGE_3_INDUSTRIAL}
        </p>

        <div className={styles.progressIndicatorMobile}>
          <ProgressIndicator currentStep={currentStage} />
        </div>

        {currentStage === FORM_STAGES.BASIC_INFO && (
          <div className={styles.formField}>
            <AccountTypeTabs
              label={FORM_LABELS.ACCOUNT_TYPE}
              value={accountType}
              onChange={handleAccountTypeChange}
              options={ACCOUNT_TYPE_OPTIONS}
            />
          </div>
        )}

        {renderCurrentStage()}

        {/* General error message */}
        {errors.general && (
          <div className={styles.generalError}>
            <p>{errors.general}</p>
          </div>
        )}

        {/* General success message */}
        {successMessage && (
          <div className={styles.generalSuccess}>
            <p>{successMessage}</p>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <div className={styles.desktopControls}>
            <ProgressIndicator currentStep={currentStage} />
            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="light-blue"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                {BUTTON_TEXTS.BACK}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {currentStage === FORM_STAGES.COMPANY_PROFILE ? (
                  isSubmitting ? (
                    <>
                      Creando <Spinner color="white" size="small" />
                    </>
                  ) : (
                    BUTTON_TEXTS.CREATE_ACCOUNT
                  )
                ) : (
                  BUTTON_TEXTS.CONTINUE
                )}
              </Button>
            </div>
          </div>
          <div className={styles.mobileControls}>
            <Button
              type="button"
              variant="outline"
              style={{ border: "0px", maxWidth: "107px", width: "100%" }}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              {BUTTON_TEXTS.BACK}
            </Button>
            <Button
              type={
                currentStage === FORM_STAGES.COMPANY_PROFILE
                  ? "submit"
                  : "button"
              }
              variant="primary"
              style={{ maxWidth: "107px", width: "100%" }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {currentStage === FORM_STAGES.COMPANY_PROFILE ? (
                isSubmitting ? (
                  <>
                    Creando <Spinner color="white" size="small" />
                  </>
                ) : (
                  BUTTON_TEXTS.CREATE_ACCOUNT
                )
              ) : (
                BUTTON_TEXTS.CONTINUE
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
