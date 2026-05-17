"use client";
import React, { useState, useMemo, useEffect } from "react";
import styles from "./EditUserDataModal.module.scss";
import { Modal, Button, Spinner } from "@/components/ui";
import {
  updateProfile,
  updateEmail,
  updatePassword,
} from "@/actions/profile/profile";
import { useToast } from "@/contexts";
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/utils/validations";
import PersonalDataTab from "./PersonalDataTab";
import EmailTab from "./EmailTab";
import PasswordTab from "./PasswordTab";

/**
 * @param {{
 *  isOpen: boolean;
 *  onClose: () => void;
 *  defaultTab?: 'personal' | 'email' | 'password';
 *  userData?: {
 *    firstName?: string;
 *    lastName?: string;
 *    email?: string;
 *    phone?: string;
 *    province?: string;
 *    city?: string;
 *    industry?: string;
 *    company?: string;
 *    roleKey?: string;
 *    profile?: any;
 *  };
 *  onSave?: (data: any) => void;
 * }} props
 */
export default function EditUserDataModal({
  isOpen,
  onClose,
  defaultTab = "personal",
  userData = {},
  onSave,
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Determinar si es una persona o empresa/parque
  const isPersonAccount = userData.roleKey === "persona";

  // Initial values from userData
  const initialValues = useMemo(
    () => ({
      firstName: isPersonAccount
        ? userData.firstName || ""
        : userData.businessName || userData.name || userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      province: userData.profile?.province || userData.province || "",
      city: userData.profile?.city || userData.city || "",
      locality: userData.profile?.locality || userData.locality || "",
      address: userData.profile?.address || userData.address || "",
      representative:
        userData.profile?.representative || userData.representative || "",
      industry: userData.profile?.industry || userData.industry || "",
      company: userData.profile?.company || userData.company || "",
      newEmail: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [userData, isPersonAccount]
  );

  const [formData, setFormData] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Maximum length validations
    const MAX_LENGTHS = {
      firstName: 50,
      lastName: 50,
      representative: 100,
      phone: 20,
      province: 100,
      city: 100,
      locality: 100,
      address: 200,
      industry: 100,
      company: 100,
      newEmail: 255,
      currentPassword: 128,
      newPassword: 128,
      confirmPassword: 128,
    };

    // Validate field on blur
    const newErrors = { ...errors };

    // Check max length first
    if (MAX_LENGTHS[name] && value && value.length > MAX_LENGTHS[name]) {
      newErrors[
        name
      ] = `Este campo no puede exceder ${MAX_LENGTHS[name]} caracteres`;
      setErrors(newErrors);
      return;
    }

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || !value.trim()) {
          newErrors[name] = "Este campo es requerido";
        } else if (value.trim().length < 2) {
          newErrors[name] = "Debe tener al menos 2 caracteres";
        } else {
          delete newErrors[name];
        }
        break;

      case "phone":
        if (!value || !value.trim()) {
          newErrors.phone = "Este campo es requerido";
        } else {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
          if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            newErrors.phone = "El teléfono debe tener entre 7 y 15 dígitos";
          } else if (!/^\d+$/.test(cleanPhone)) {
            newErrors.phone = "El teléfono solo debe contener números";
          } else {
            delete newErrors.phone;
          }
        }
        break;

      case "representative":
      case "province":
      case "city":
      case "locality":
      case "industry":
      case "company":
        if (!value || !value.trim()) {
          newErrors[name] = "Este campo es requerido";
        } else if (value.trim().length < 2) {
          newErrors[name] = "Debe tener al menos 2 caracteres";
        } else {
          delete newErrors[name];
        }
        break;

      case "address":
        if (!value || !value.trim()) {
          newErrors[name] = "Este campo es requerido";
        } else if (value.trim().length < 2) {
          newErrors[name] = "Debe tener al menos 2 caracteres";
        } else {
          delete newErrors[name];
        }
        break;

      case "newEmail":
        if (!value || !value.trim()) {
          newErrors.newEmail = "Este campo es requerido";
        } else if (value.trim() === formData.email.trim()) {
          newErrors.newEmail = "El nuevo email debe ser diferente al actual";
        } else {
          const emailError = validateEmail(value);
          if (emailError) {
            newErrors.newEmail = emailError;
          } else {
            delete newErrors.newEmail;
          }
        }
        break;

      case "currentPassword":
        if (activeTab === "password" && !value) {
          newErrors.currentPassword = "La contraseña actual es requerida";
        } else {
          delete newErrors.currentPassword;
        }
        break;

      case "newPassword":
        if (value) {
          if (formData.currentPassword === value) {
            newErrors.newPassword =
              "La nueva contraseña debe ser diferente a la actual";
          } else {
            const passwordError = validatePassword(value);
            if (passwordError) {
              newErrors.newPassword = passwordError;
            } else {
              delete newErrors.newPassword;
            }
          }
        } else {
          delete newErrors.newPassword;
        }
        break;

      case "confirmPassword":
        if (value) {
          const confirmError = validatePasswordConfirmation(
            value,
            formData.newPassword
          );
          if (confirmError) {
            newErrors.confirmPassword = confirmError;
          } else {
            delete newErrors.confirmPassword;
          }
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Validation functions
  const validatePersonalFields = () => {
    const newErrors = {};

    // Validate firstName (required for all)
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "Este campo es requerido";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Debe tener al menos 2 caracteres";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "Este campo no puede exceder 50 caracteres";
    }

    // Validate lastName (only for persona)
    if (isPersonAccount) {
      if (!formData.lastName || !formData.lastName.trim()) {
        newErrors.lastName = "Este campo es requerido";
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "Debe tener al menos 2 caracteres";
      } else if (formData.lastName.length > 50) {
        newErrors.lastName = "Este campo no puede exceder 50 caracteres";
      }
    }

    // Validate representative (only for empresa/parque)
    if (!isPersonAccount) {
      if (!formData.representative || !formData.representative.trim()) {
        newErrors.representative = "Este campo es requerido";
      } else if (formData.representative.trim().length < 2) {
        newErrors.representative = "Debe tener al menos 2 caracteres";
      } else if (formData.representative.length > 100) {
        newErrors.representative = "Este campo no puede exceder 100 caracteres";
      }
    }

    // Validate phone (required)
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Este campo es requerido";
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        newErrors.phone = "El teléfono debe tener entre 7 y 15 dígitos";
      } else if (!/^\d+$/.test(cleanPhone)) {
        newErrors.phone = "El teléfono solo debe contener números";
      }
    }

    // Validate province (required for all)
    if (!formData.province || !formData.province.trim()) {
      newErrors.province = "Este campo es requerido";
    } else if (formData.province.trim().length < 2) {
      newErrors.province = "Debe tener al menos 2 caracteres";
    } else if (formData.province.length > 100) {
      newErrors.province = "Este campo no puede exceder 100 caracteres";
    }

    // Validate city (only for persona) or locality (for empresa/parque)
    if (isPersonAccount) {
      if (!formData.city || !formData.city.trim()) {
        newErrors.city = "Este campo es requerido";
      } else if (formData.city.trim().length < 2) {
        newErrors.city = "Debe tener al menos 2 caracteres";
      } else if (formData.city.length > 100) {
        newErrors.city = "Este campo no puede exceder 100 caracteres";
      }
    } else {
      if (!formData.locality || !formData.locality.trim()) {
        newErrors.locality = "Este campo es requerido";
      } else if (formData.locality.trim().length < 2) {
        newErrors.locality = "Debe tener al menos 2 caracteres";
      } else if (formData.locality.length > 100) {
        newErrors.locality = "Este campo no puede exceder 100 caracteres";
      }
    }

    // Validate address (only for empresa/parque)
    if (!isPersonAccount) {
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = "Este campo es requerido";
      } else if (formData.address.trim().length < 2) {
        newErrors.address = "Debe tener al menos 2 caracteres";
      } else if (formData.address.length > 200) {
        newErrors.address = "Este campo no puede exceder 200 caracteres";
      }
    }

    // Validate industry (required for all)
    if (!formData.industry || !formData.industry.trim()) {
      newErrors.industry = "Este campo es requerido";
    } else if (formData.industry.trim().length < 2) {
      newErrors.industry = "Debe tener al menos 2 caracteres";
    } else if (formData.industry.length > 100) {
      newErrors.industry = "Este campo no puede exceder 100 caracteres";
    }

    // Validate company (only for persona)
    if (isPersonAccount) {
      if (!formData.company || !formData.company.trim()) {
        newErrors.company = "Este campo es requerido";
      } else if (formData.company.trim().length < 2) {
        newErrors.company = "Debe tener al menos 2 caracteres";
      } else if (formData.company.length > 100) {
        newErrors.company = "Este campo no puede exceder 100 caracteres";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailFields = () => {
    const newErrors = {};

    if (!formData.newEmail || !formData.newEmail.trim()) {
      newErrors.newEmail = "Este campo es requerido";
    } else if (formData.newEmail.trim() === formData.email.trim()) {
      newErrors.newEmail = "El nuevo email debe ser diferente al actual";
    } else {
      const emailError = validateEmail(formData.newEmail);
      if (emailError) newErrors.newEmail = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordFields = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida";
    }

    if (formData.newPassword) {
      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword =
          "La nueva contraseña debe ser diferente a la actual";
      } else {
        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) newErrors.newPassword = passwordError;
      }
    }

    if (formData.confirmPassword) {
      const confirmError = validatePasswordConfirmation(
        formData.confirmPassword,
        formData.newPassword
      );
      if (confirmError) newErrors.confirmPassword = confirmError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Detect if there are changes based on active tab
  const hasChanges = useMemo(() => {
    if (activeTab === "personal") {
      const baseChanges =
        formData.firstName !== savedValues.firstName ||
        formData.phone !== savedValues.phone ||
        formData.province !== savedValues.province ||
        formData.industry !== savedValues.industry;

      if (isPersonAccount) {
        return (
          baseChanges ||
          formData.lastName !== savedValues.lastName ||
          formData.city !== savedValues.city ||
          formData.company !== savedValues.company
        );
      } else {
        return (
          baseChanges ||
          formData.representative !== savedValues.representative ||
          formData.locality !== savedValues.locality ||
          formData.address !== savedValues.address
        );
      }
    }

    if (activeTab === "email") {
      return (
        formData.newEmail.trim() !== "" &&
        formData.newEmail.trim() !== formData.email.trim()
      );
    }

    if (activeTab === "password") {
      return (
        formData.currentPassword.trim() !== "" ||
        formData.newPassword.trim() !== "" ||
        formData.confirmPassword.trim() !== ""
      );
    }

    return false;
  }, [formData, savedValues, activeTab]);

  // Detect if there are active errors for the current tab
  const hasErrors = useMemo(() => {
    if (activeTab === "personal") {
      const personalFields = isPersonAccount
        ? [
          "firstName",
          "lastName",
          "phone",
          "province",
          "city",
          "industry",
          "company",
        ]
        : [
          "firstName",
          "representative",
          "phone",
          "province",
          "locality",
          "address",
          "industry",
        ];

      return personalFields.some((field) => errors[field]);
    }

    if (activeTab === "email") {
      return !!errors.newEmail;
    }

    if (activeTab === "password") {
      return !!(
        errors.currentPassword ||
        errors.newPassword ||
        errors.confirmPassword
      );
    }

    return false;
  }, [errors, activeTab, isPersonAccount]);

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate based on active tab
    let isValid = false;
    if (activeTab === "personal") {
      isValid = validatePersonalFields();
    } else if (activeTab === "email") {
      isValid = validateEmailFields();
    } else if (activeTab === "password") {
      isValid = validatePasswordFields();
    }

    if (!isValid) {
      // Find first field with error and scroll to it
      const firstErrorField = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorField) {
        const errorElement = document.querySelector(
          `input[name="${firstErrorField}"]`
        );
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          errorElement.focus();
        }
      }
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "personal") {
        // Mapear a claves del backend
        const payload = {
          firstName: formData.firstName?.trim(),
          phone: formData.phone?.trim(),
          province: formData.province?.trim(),
          industry: formData.industry?.trim(),
        };

        // Campos específicos según tipo de cuenta
        if (isPersonAccount) {
          payload.lastName = formData.lastName?.trim();
          payload.city = formData.city?.trim();
          payload.company = formData.company?.trim();
        } else {
          payload.businessName = formData.firstName?.trim();
          payload.representative = formData.representative?.trim();
          payload.locality = formData.locality?.trim();
          payload.address = formData.address?.trim();
        }

        // Quitar claves vacías/undefined
        const cleanPayload = Object.entries(payload).reduce((acc, [k, v]) => {
          if (v === null || v === undefined) return acc;
          if (typeof v === "string" && v.trim() === "") return acc;
          return { ...acc, [k]: v };
        }, {});

        await updateProfile(cleanPayload);

        // Actualizar savedValues para reflejar los cambios guardados
        const updatedValues = {
          ...savedValues,
          firstName: formData.firstName,
          phone: formData.phone,
          province: formData.province,
          industry: formData.industry,
        };

        if (isPersonAccount) {
          updatedValues.lastName = formData.lastName;
          updatedValues.city = formData.city;
          updatedValues.company = formData.company;
        } else {
          updatedValues.representative = formData.representative;
          updatedValues.locality = formData.locality;
          updatedValues.address = formData.address;
        }

        // Para cuentas empresa/parque, asegurarse de que lastName esté vacío en savedValues
        const finalUpdatedValues = isPersonAccount
          ? updatedValues
          : { ...updatedValues, lastName: "" };

        setSavedValues(finalUpdatedValues);

        showSuccess("Datos actualizados exitosamente");
      } else if (activeTab === "email") {
        const result = await updateEmail(formData.newEmail.trim());

        if (!result.success) {
          if (result.error === "Email already in use") {
            setErrors((prev) => ({
              ...prev,
              newEmail:
                "Este correo electrónico ya está en uso por otra cuenta",
            }));
            return;
          }
          throw new Error(result.error);
        }

        // Resetear campo de nuevo email después de éxito
        setFormData((prev) => ({ ...prev, newEmail: "" }));
        setSavedValues((prev) => ({ ...prev, newEmail: "" }));

        showSuccess(
          "Se envió un correo de confirmación a tu nueva dirección de correo electrónico"
        );
      } else if (activeTab === "password") {
        const result = await updatePassword(
          formData.currentPassword,
          formData.newPassword
        );

        if (!result.success) {
          if (result.error === "Current password is incorrect") {
            setErrors((prev) => ({
              ...prev,
              currentPassword: "La contraseña actual es incorrecta",
            }));
          } else {
            showError(
              "Error al actualizar la contraseña. Por favor, intenta de nuevo."
            );
          }
          return;
        }

        // Resetear campos de contraseña después de éxito
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setSavedValues((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        showSuccess("Contraseña actualizada exitosamente");
      }

      // Call original onSave if provided
      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(
        "Error al actualizar los datos, revisa los campos y vuelve a intentarlo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedValues);
    setErrors({});
    onClose();
  };

  // Reset form data when userData changes - only when modal is NOT open to avoid overriding user input
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialValues);
      setSavedValues(initialValues);
      setErrors({});
    }
  }, [initialValues, isOpen]);

  // Reset active tab and errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrors({});
    }
  }, [isOpen, defaultTab]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      closeOnOverlayClick={false}
      size="large"
    >
      <div className={styles.modalContent}>
        <h2 className={styles.title}>DATOS DE USUARIO</h2>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "personal" ? styles.tabActive : ""
              }`}
            onClick={() => setActiveTab("personal")}
          >
            Datos personales
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "email" ? styles.tabActive : ""
              }`}
            onClick={() => setActiveTab("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""
              }`}
            onClick={() => setActiveTab("password")}
          >
            Contraseña
          </button>
        </div>

        <div className={styles.formContainer}>
          {activeTab === "personal" && (
            <PersonalDataTab
              formData={formData}
              errors={errors}
              isPersonAccount={isPersonAccount}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
            />
          )}

          {activeTab === "email" && (
            <EmailTab
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
            />
          )}

          {activeTab === "password" && (
            <PasswordTab
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
            />
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            rounded="xmedium"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading || hasErrors}
            rounded="xmedium"
          >
            {isLoading ? (
              <>
                Guardando <Spinner color="white" size="small" />
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
