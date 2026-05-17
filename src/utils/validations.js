// Validation functions for forms

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const isValidIPv4 = (hostname) => {
  const octets = hostname.split(".");
  if (octets.length !== 4) return false;
  return octets.every((octet) => {
    if (!/^\d+$/.test(octet)) return false;
    const value = Number(octet);
    return value >= 0 && value <= 255;
  });
};

const isLikelyIPv6 = (hostname) => hostname.includes(":");

const hasValidTld = (hostname) => {
  const segments = hostname.split(".");
  if (segments.length < 2) return false;
  if (segments.some((segment) => !segment.trim())) return false;
  const tld = segments[segments.length - 1];
  return tld.length >= 2;
};
export const isValidUrlAds = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return false;
    }
    const hostname = parsed.hostname;
    if (!hostname) return false;
    if (isValidIPv4(hostname) || isLikelyIPv6(hostname) || hasValidTld(hostname)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validatePhone = (phone) => {
  if (!phone) return "El teléfono es requerido"
  // Remove spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "")
  if (cleanPhone.length < 7 || cleanPhone.length > 15) return "El teléfono debe tener entre 7 y 15 dígitos"
  if (!/^\d+$/.test(cleanPhone)) return "El teléfono solo debe contener números"
  return null
}

const MAX_EMAIL_LENGTH = 255;

export const validateEmail = (email) => {
  if (!email || (typeof email !== "string" && typeof email !== "number")) {
    return "El correo electrónico es requerido";
  }

  const normalizedEmail = String(email).trim();

  if (!normalizedEmail) {
    return "El correo electrónico es requerido";
  }

  if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return `El correo electrónico no puede exceder ${MAX_EMAIL_LENGTH} caracteres`;
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return "El correo electrónico no es válido";
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password) return "La contraseña es requerida"
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (password.length > 64) return "La contraseña debe tener como máximo 64 caracteres"
  if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una mayúscula"
  if (!/\d/.test(password)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "La contraseña debe contener al menos un carácter especial"
  return null
}

export const validatePasswordConfirmation = (confirmPassword, password) => {
  if (!confirmPassword) return "Debes confirmar tu contraseña"
  if (confirmPassword !== password) return "Las contraseñas no coinciden"
  return null
}

export const validateLocation = (location) => {
  if (!location) return "La ubicación es requerida"
  return null
}

export const validateUrl = (url, fieldName = "URL") => {
  if (!url) return null // URLs are usually optional
  if (!isValidUrl(url)) return `${fieldName} no es válida`
  return null
}

export const validateLinkedInUrl = (url) => {
  return null
}

export const validateWebsiteUrl = (url) => {
  return null
} 