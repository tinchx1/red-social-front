"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "./InformacionPerfil.module.scss";
import Button from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui";
import buttonEditar from "@/assets/buttonEditar.svg?url";
import insigniaPark from "@/assets/insigniaVerificado.svg?url";
import insigniaCompany from "@/assets/insignia-company.svg?url";
import close from "@/assets/close.svg?url";
import plus from "@/assets/plus.svg?url";
import ProfileMediaHeader from "@/components/perfil/ProfileMediaHeader/ProfileMediaHeader";
import { INTEREST_SECTORS } from "@/constants/sectors";
import { updateProfile } from "@/actions/profile/profile";
import { validateWebsiteUrl, validateLinkedInUrl } from "@/utils/validations";

const InformacionPerfil = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(
    profile.industrialSectors || []
  );

  // Form state for editable fields
  const [formData, setFormData] = useState({
    firstName: profile.firstName || profile.name?.split(" ")[0] || "",
    lastName:
      profile.lastName || profile.name?.split(" ").slice(1).join(" ") || "",
    phone: profile.phone || "",
    province: profile.province || profile.state || "",
    city: profile.city || profile.town || "",
    industry: profile.industry || "",
    company: profile.company || "",
    bio: profile.bio || profile.description || "",
    websiteUrl: profile.website || profile.websiteUrl || "",
    linkedinUrl: profile.linkedin || "",
    businessName: profile.businessName || "",
    representative: profile.representative || "",
    locality: profile.locality || "",
    address: profile.address || profile.street || "",
    employeesCount: profile.employeesCount || 1,
  });

  // Helper function to get full address
  const getFullAddress = () => {
    return [formData.address, formData.city, formData.province]
      .filter(Boolean)
      .join(", ");
  };

  // Determine which sectors to use based on account type

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes here - you can add API call
    }
    setIsEditing(!isEditing);
  };

  const handleInterestToggle = (sector) => {
    setSelectedInterests((prev) => {
      if (prev.includes(sector)) {
        return prev.filter((s) => s !== sector);
      } else {
        return [...prev, sector];
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // Basic min/max validation for phone digits length
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    const isPhoneInvalid =
      phoneDigits.length > 0 &&
      (phoneDigits.length < 8 || phoneDigits.length > 20);
    if (isPhoneInvalid) {
      // Do not proceed if invalid. UX: keep editing and show inline error
      return;
    }

    // URL validation
    if (websiteUrlError || linkedinUrlError) {
      // Do not proceed if URLs are invalid
      return;
    }
    setIsLoading(true);
    try {
      // Mapear a claves del backend y sanear datos
      const base = {
        // Campos comunes
        firstName: formData.firstName?.trim(),
        lastName:
          profile.roleKey === "persona" ? formData.lastName?.trim() : undefined,
        phone: formData.phone?.trim(),
        description: formData.bio?.trim(),
        websiteUrl: formData.websiteUrl?.trim(),
        linkedinUrl: formData.linkedinUrl?.trim(),
        state: formData.province?.trim(),
        town: formData.city?.trim(),
        street: formData.address?.trim(),
        locality: formData.locality?.trim(),
        industrialSectors: Array.isArray(selectedInterests)
          ? selectedInterests
          : [],
        contactsCount: profile.contactsCount || 0,
      };

      // Campos específicos según tipo de cuenta
      if (profile.roleKey !== "persona") {
        base.businessName = formData.firstName?.trim();
        base.representative = formData.representative?.trim();
        base.company = formData.company?.trim();
        base.industry = formData.industry?.trim();
        const parsedEmployees = Number(formData.employeesCount);
        base.employeesCount =
          Number.isFinite(parsedEmployees) && parsedEmployees > 0
            ? parsedEmployees
            : undefined;
        // Opcional: enviar también name si backend lo usa
        const name = [formData.firstName, formData.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (name) base.name = name;
      }

      // Quitar claves vacías/undefined (excepto URLs que pueden borrarse)
      const allowEmptyFields = ["websiteUrl", "linkedinUrl"];
      const payload = Object.entries(base).reduce((acc, [k, v]) => {
        if (v === null || v === undefined) return acc;
        if (
          typeof v === "string" &&
          v.trim() === "" &&
          !allowEmptyFields.includes(k)
        )
          return acc;
        return { ...acc, [k]: v };
      }, {});

      const result = await updateProfile(payload);
      setIsEditing(false);

      // Optionally refresh the profile data or show success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error - show toast notification, etc.
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedInterests(profile.industrialSectors || []);
    setFormData({
      firstName: profile.firstName || profile.name?.split(" ")[0] || "",
      lastName:
        profile.lastName || profile.name?.split(" ").slice(1).join(" ") || "",
      phone: profile.phone || "",
      province: profile.province || profile.state || "",
      city: profile.city || profile.town || "",
      industry: profile.industry || "",
      company: profile.company || "",
      bio: profile.bio || profile.description || "",
      websiteUrl: profile.websiteUrl || profile.website || "",
      linkedinUrl: profile.linkedinUrl || "",
      businessName: profile.firstName || "",
      representative: profile.representative || "",
      locality: profile.locality || "",
      address: profile.address || profile.street || "",
      employeesCount: profile.employeesCount || 1,
    });
    setIsEditing(false);
  };

  // Derived validation state for phone input (min/max digits)
  const phoneDigits = (formData.phone || "").replace(/\D/g, "");
  const phoneHasValue = phoneDigits.length > 0;
  const phoneError =
    phoneHasValue && (phoneDigits.length < 8 || phoneDigits.length > 20);
  // Derived validation for name fields (2-50 chars when provided)
  const firstNameTrim = (formData.firstName || "").trim();
  const lastNameTrim = (formData.lastName || "").trim();
  const firstNameHasValue = firstNameTrim.length > 0;
  const lastNameHasValue = lastNameTrim.length > 0;
  const firstNameError =
    firstNameHasValue &&
    (firstNameTrim.length < 2 || firstNameTrim.length > 50);
  const lastNameError =
    profile.roleKey === "persona" &&
    lastNameHasValue &&
    (lastNameTrim.length < 2 || lastNameTrim.length > 50);
  // URL validation
  const websiteUrlError = validateWebsiteUrl(formData.websiteUrl);

  const linkedinUrlError = validateLinkedInUrl(formData.linkedinUrl);
  return (
    <div
      className={`${styles.infoContainer} ${isEditing ? styles.isEditing : ""}`}
    >
      <ProfileMediaHeader
        initialAvatarUrl={profile.avatar}
        initialBannerUrl={profile.banner}
      />

      <div className={styles.content}>
        {/* Action buttons positioned at top right */}
        <div className={styles.actionButtons}>
          {!isEditing ? (
            <Image
              src={buttonEditar}
              alt="Editar"
              width={20}
              height={20}
              onClick={handleEditToggle}
              className={styles.editIcon}
              priority
            />
          ) : (
            <div className={styles.editButtons}>
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                disabled={isLoading}
                rounded="medium"
              >
                {isLoading ? (
                  <>
                    Guardando <Spinner color="white" size="small" />
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
              <Image
                src={close}
                alt="Cancelar"
                width={20}
                height={20}
                onClick={handleCancelEdit}
                className={styles.cancelIcon}
              />
            </div>
          )}
        </div>

        <div className={styles.header}>
          <h1 className={styles.uWrapAnywhere}>
            {!isEditing &&
              (profile.roleKey === "persona"
                ? `${formData.firstName} ${formData.lastName}`.trim()
                : formData.firstName)}
            {profile.roleKey !== "persona" && !isEditing && (
              <>
                {"\u00A0"}
                <span className={styles.verifiedBadge}>
                  <Image
                    src={
                      profile.roleKey === "parque_industrial"
                        ? insigniaPark
                        : insigniaCompany
                    }
                    alt="Verificado"
                    width={20}
                    height={20}
                    priority
                  />
                </span>
              </>
            )}
          </h1>
        </div>

        {isEditing && (
          <div className={styles.contactInfo}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Nombre:</span>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={`${styles.contactInput} ${
                    firstNameError ? styles.inputError : ""
                  }`}
                  placeholder="Nombre"
                  minLength={2}
                  maxLength={50}
                  aria-invalid={firstNameError}
                  aria-describedby={
                    firstNameError ? "firstname-error" : undefined
                  }
                />
                {firstNameError && (
                  <span id="firstname-error" className={styles.errorText}>
                    Debe tener entre 2 y 50 caracteres
                  </span>
                )}
              </div>
            </div>
            {profile.roleKey === "persona" && (
              <div className={styles.contactRow}>
                <span className={styles.contactLabel}>Apellido:</span>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`${styles.contactInput} ${
                      lastNameError ? styles.inputError : ""
                    }`}
                    placeholder="Apellido"
                    minLength={2}
                    maxLength={50}
                    aria-invalid={lastNameError}
                    aria-describedby={
                      lastNameError ? "lastname-error" : undefined
                    }
                  />
                  {lastNameError && (
                    <span id="lastname-error" className={styles.errorText}>
                      Debe tener entre 2 y 50 caracteres
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.contactInfo}>
          <div className={styles.contactRow}>
            {isEditing ? null : (
              <span className={styles.addressSection}>{getFullAddress()}</span>
            )}
          </div>
        </div>

        <div className={styles.contactInfo}>
          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Teléfono</span>
            {isEditing ? (
              <div className={styles.inputGroup}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`${styles.contactInput} ${
                    phoneError ? styles.inputError : ""
                  }`}
                  placeholder="+54 9 221 123 45 85"
                  minLength={8}
                  maxLength={20}
                  onBlur={() =>
                    handleInputChange(
                      "phone",
                      formData.phone.replace(/[^0-9]/g, "")
                    )
                  }
                  aria-invalid={phoneError}
                  aria-describedby={phoneError ? "phone-error" : undefined}
                />
                {phoneError && (
                  <span id="phone-error" className={styles.errorText}>
                    Debe tener entre 8 y 20 dígitos
                  </span>
                )}
              </div>
            ) : (
              <span>{formData.phone}</span>
            )}
          </div>

          {!isEditing && (
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Correo</span>
              <span>{profile.email}</span>
            </div>
          )}

          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Web</span>
            {isEditing ? (
              <div className={styles.inputGroup}>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    handleInputChange("websiteUrl", e.target.value)
                  }
                  className={`${styles.contactInput} ${
                    websiteUrlError ? styles.inputError : ""
                  }`}
                  placeholder="https://ejemplo.com"
                  aria-invalid={!!websiteUrlError}
                  aria-describedby={
                    websiteUrlError ? "website-error" : undefined
                  }
                />
                {websiteUrlError && (
                  <span id="website-error" className={styles.errorText}>
                    {websiteUrlError}
                  </span>
                )}
              </div>
            ) : formData.websiteUrl ? (
              <a
                href={formData.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.websiteUrl}
              </a>
            ) : (
              <span>No hay web</span>
            )}
          </div>

          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>LinkedIn</span>
            {isEditing ? (
              <div className={styles.inputGroup}>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    handleInputChange("linkedinUrl", e.target.value)
                  }
                  className={`${styles.contactInput} ${
                    linkedinUrlError ? styles.inputError : ""
                  }`}
                  placeholder="https://linkedin.com/in/usuario"
                  aria-invalid={!!linkedinUrlError}
                  aria-describedby={
                    linkedinUrlError ? "linkedin-error" : undefined
                  }
                />
                {linkedinUrlError && (
                  <span id="linkedin-error" className={styles.errorText}>
                    {linkedinUrlError}
                  </span>
                )}
              </div>
            ) : formData.linkedinUrl ? (
              <a
                href={formData.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.linkedinUrl}
              </a>
            ) : (
              <span>No hay LinkedIn</span>
            )}
          </div>
        </div>

        <div className={styles.interests}>
          <div className={styles.interestRow}>
            <span className={styles.contactLabel}>Intereses</span>
            <div className={styles.interestTags}>
              {isEditing
                ? // Edit mode - show all available sectors with add/remove functionality
                  INTEREST_SECTORS.map((sector) => {
                    const isSelected = selectedInterests.includes(sector);
                    return (
                      <button
                        key={sector}
                        className={`${styles.interestTag} ${
                          isSelected ? styles.selected : styles.available
                        }`}
                        onClick={() => handleInterestToggle(sector)}
                      >
                        {isSelected ? (
                          <>
                            {sector}
                            <Image
                              src={close}
                              alt="Remover"
                              width={12}
                              height={12}
                            />
                          </>
                        ) : (
                          <>
                            {sector}
                            <Image
                              src={plus}
                              alt="Agregar"
                              width={12}
                              height={12}
                            />
                          </>
                        )}
                      </button>
                    );
                  })
                : // View mode - show only selected interests
                  selectedInterests.map((sector, index) => (
                    <span key={index} className={styles.interestTag}>
                      {sector}
                    </span>
                  ))}
            </div>
          </div>
        </div>

        <div className={styles.contactRow} style={{ marginTop: "8px" }}>
          <span className={styles.contactsCount}>
            {profile.contactsCount || 0} Contactos
          </span>
        </div>
      </div>
    </div>
  );
};

export default InformacionPerfil;
