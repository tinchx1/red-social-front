"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, ProgressIndicator, AccountTypeTabs } from "@/components";
import { Spinner } from "@/components/ui";
import checkRoundFillIcon from "@/assets/check_round_fill.svg?urlcheckRoundFillIcon";
import {
  ACCOUNT_TYPE_OPTIONS,
  INITIAL_FORM_DATA,
  FORM_STAGES,
  STAGE_VALIDATION_RULES,
  FORM_LABELS,
  BUTTON_TEXTS,
  FORM_FIELDS,
} from "@/constants/personForm";
import styles from "./PersonForm.module.scss";
import resultStyles from "@/components/auth/RecoverPasswordForm/RecoverPasswordForm.module.scss";
import PersonFormStage1 from "./PersonFormStage1";
import PersonFormStage2 from "./PersonFormStage2";
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/utils";
import { submitPersonForm } from "@/actions";
import {
  getGoogleData,
  clearGoogleDataAfterRegistration,
} from "@/utils/googleDataStorage";

export default function PersonForm({}) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(FORM_STAGES.PERSONAL_INFO);
  const [accountType, setAccountType] = useState("person");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [resultType, setResultType] = useState(null); // "success"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleData, setGoogleData] = useState(null);

  // Capturar datos de Google de sessionStorage
  useEffect(() => {
    const userData = getGoogleData();
    if (userData) {
      setGoogleData(userData);

      // Pre-llenar campos con datos de Google
      setFormData((prev) => ({
        ...prev,
        [FORM_FIELDS.NOMBRE]: userData.firstName || "",
        [FORM_FIELDS.APELLIDO]: userData.lastName || "",
        [FORM_FIELDS.EMAIL]: userData.email || "",
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
      nombre: 50,
      apellido: 50,
      email: 255,
      telefono: 20,
      provincia: 100,
      ciudad: 100,
      contraseña: 128,
      confirmarContraseña: 128,
      rubroIndustria: 100,
      empresa: 100,
    };

    // Check max length first
    if (
      MAX_LENGTHS[field] &&
      value &&
      value.toString().length > MAX_LENGTHS[field]
    ) {
      return `Este campo no puede exceder ${MAX_LENGTHS[field]} caracteres`;
    }

    // Basic text validation for required text fields
    if (
      field === "nombre" ||
      field === "apellido" ||
      field === "rubroIndustria" ||
      field === "empresa" ||
      field === "ciudad"
    ) {
      if (!value || value.trim() === "") {
        return "Este campo es requerido";
      }
      if (value.trim().length < 2) {
        return "Debe tener al menos 2 caracteres";
      }
    }

    if (field === "telefono") {
      return validatePhone(value);
    } else if (field === "email") {
      return validateEmail(value);
    } else if (field === "contraseña") {
      return validatePassword(value);
    } else if (field === "confirmarContraseña") {
      return validatePasswordConfirmation(value, formData.contraseña);
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
      if (currentStage < FORM_STAGES.PROFESSIONAL_INFO) {
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

        // Submit to API using the server action
        setIsSubmitting(true);
        const result = await submitPersonForm(formData);
        if (!result.success) {
          throw new Error(result.message || "Error al crear la cuenta");
        }

        setSuccessMessage(
          result.message || "Te enviamos un correo para confirmar tu email"
        );
        setResultType("success");
        // Clear Google data after successful registration
        clearGoogleDataAfterRegistration();
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
    if (currentStage === FORM_STAGES.PERSONAL_INFO) {
      router.push("/");
    } else {
      setCurrentStage(currentStage - 1);
      setErrors({}); // Clear errors when going back
    }
  };

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
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case FORM_STAGES.PERSONAL_INFO:
        return (
          <PersonFormStage1
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      case FORM_STAGES.PROFESSIONAL_INFO:
        return (
          <PersonFormStage2
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      default:
        return null;
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
            style={{ textAlign: "center", maxWidth: "500px" }}
          >
            TU CUENTA HA SIDO CREADA CON ÉXITO
          </h1>
          <p
            className={resultStyles.subtitle}
            style={{ textAlign: "center", maxWidth: "500px" }}
          >
            Revisa tu casilla de correo para verificar tu email y acceder a todo
            el contenido de la plataforma.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.title}>{FORM_LABELS.TITLE}</h1>
        <p className={styles.subtitle}>{FORM_LABELS.SUBTITLE}</p>

        <div className={styles.progressIndicatorMobile}>
          <ProgressIndicator currentStep={currentStage} totalSteps={2} />
        </div>
        {currentStage === FORM_STAGES.PERSONAL_INFO && (
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
            <ProgressIndicator currentStep={currentStage} totalSteps={2} />
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
                {currentStage === FORM_STAGES.PROFESSIONAL_INFO ? (
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
                currentStage === FORM_STAGES.PROFESSIONAL_INFO
                  ? "submit"
                  : "button"
              }
              variant="primary"
              style={{ maxWidth: "107px", width: "100%" }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {currentStage === FORM_STAGES.PROFESSIONAL_INFO
                ? isSubmitting
                  ? "Creando..."
                  : BUTTON_TEXTS.CREATE_ACCOUNT
                : BUTTON_TEXTS.CONTINUE}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
