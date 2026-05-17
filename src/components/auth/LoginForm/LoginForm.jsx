"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button, Input } from "@/components";
import { Spinner } from "@/components/ui";
import styles from "./LoginForm.module.scss";
import { useRouter } from "next/navigation";
import { loginAction, loginActionGoogle } from "@/actions";
import { useAuth } from "@/components/layout/AuthProvider";
import { useGoogleAuth } from "@/hooks";
import { saveGoogleData } from "@/utils/googleDataStorage";
import logoRoundedUrl from "@/assets/logo-rounded.svg?url";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncAuthLoading, setSyncAuthLoading] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const router = useRouter();
  const { handleLogin, loading: authLoading } = useAuth();
  const isProcessing = isSubmitting || syncAuthLoading;

  useEffect(() => {
    const clearLoadingTimeout = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };

    if (authLoading) {
      clearLoadingTimeout();
      setSyncAuthLoading(true);
      return () => clearLoadingTimeout();
    }

    loadingTimeoutRef.current = setTimeout(() => {
      setSyncAuthLoading(false);
      loadingTimeoutRef.current = null;
    }, 600);

    return () => clearLoadingTimeout();
  }, [authLoading]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors on submit
    setErrors({});

    // Basic validation
    const newErrors = {};

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const result = await loginAction(email, password);
      if (!result) {
        throw new Error("Credenciales inválidas");
      }

      // Actualizar el estado de auth con los datos del usuario
      setSyncAuthLoading(true);
      await handleLogin(result);

      // Verificar si hay una redirección pendiente después del login
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin"); // Limpiar después de usar
        router.push(redirectPath);
      } else {
        router.push("/inicio");
      }
    } catch (error) {
      console.error("Error in login:", error);
      // Handle specific error cases
      let errorMessage = "Credenciales inválidas";

      if (error.message === "Account is inactive") {
        errorMessage =
          "Tu cuenta no está verificada. Por favor, revisá tu email y verificá tu cuenta antes de continuar.";
      }
      if (error.message === "Account is blocked") {
        errorMessage = "Su cuenta ha sido bloqueada por un administrador";
      }
      if (error.message === "Account has been deleted") {
        errorMessage = "Tu cuenta ha sido eliminada por un administrador";
      }
      // Set a general error message
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setIsSubmitting(true);
      const result = await loginActionGoogle(idToken);
      if (!result) {
        throw new Error("Error en autenticación con Google");
      }

      setSyncAuthLoading(true);
      await handleLogin(result);

      // Verificar si hay una redirección pendiente después del login
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin"); // Limpiar después de usar
        router.push(redirectPath);
      } else {
        router.push("/inicio");
      }
    } catch (error) {
      console.error("Error in Google login:", error);

      // Si el error contiene datos de Google, guardar en sessionStorage y redirigir
      if (error.needsRegistration && error.googleUserData) {
        saveGoogleData(error.googleUserData);
        router.push("/crear-cuenta/persona");
      } else {
        router.push("/crear-cuenta/persona");
      }

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

  const handleGoogleError = (error) => {
    console.error("Google Auth Error:", error);
    setErrors((prev) => ({
      ...prev,
      general: "Error al cargar Google Sign-In",
    }));
  };

  useGoogleAuth(handleGoogleSuccess, handleGoogleError, "google-signin-button");

  return (
    <div className={styles.container}>
      {/* Desktop Left Side */}
      <div className={styles.leftSide}>
        <div className={styles.content}>
          <div className={styles.logoTop}>
            <Image
              src={logoRoundedUrl}
              alt="Comunidad APIA"
              width={180}
              height={60}
              priority
              fetchPriority="high"
            />
          </div>

          <h1 className={styles.title}>
            Accedé a la
            <br />
            comunidad industrial
            <br />
            más grande del país.
          </h1>

          <div className={styles.accentLine} />

          <p className={styles.subtitle}>
            Una plataforma digital que conecta
            <br />
            parques industriales, empresas
            <br />y proveedores de la Argentina.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          {/* Mobile Logo */}
          <div className={styles.mobileLogo}>
            <div className={styles.logoOval}>
              <Image
                src={"/images/apia-logo.png"}
                alt="Logo APIA"
                width={200}
                height={70}
              />
            </div>
          </div>

          {/* Mobile Title */}
          <div className={styles.mobileTitle}>
            <h3>
              CONOCÉ UNA
              <span className={styles.highlight}> COMUNIDAD ÚNICA</span>,<br />
              CONECTÁ CON REPRESENTANTES
              <br />Y POTENCIÁ TU EMPRESA
            </h3>
          </div>

          <div className={styles.formWrapper}>
            <h2 className={styles.formTitle}>INICIAR SESIÓN</h2>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="Ingresá tu correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear error when user starts typing
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: null }));
                  }
                }}
                error={errors.email}
                autocomplete="email"
                labelWhite
              />

              <Input
                id="password"
                label="Contraseña"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear error when user starts typing
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                error={errors.password}
                showPasswordToggle
                autocomplete="current-password"
                labelWhite
              />

              {/* General error message */}
              {errors.general && (
                <div className={styles.generalError}>
                  <p>{errors.general}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push("/recuperar-contrasena")}
                className={styles.forgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <div className={styles.buttonGroup}>
                <Button
                  style={{ maxWidth: "340px", width: "100%" }}
                  type="submit"
                  variant="default"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      Ingresando <Spinner color="white" size="small" />
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
                <Button
                  style={{ maxWidth: "340px", width: "100%" }}
                  onClick={() => router.push("/crear-cuenta/persona")}
                  type="button"
                  variant="secondary"
                  rounded="medium"
                >
                  Crear Cuenta
                </Button>
              </div>
            </form>
            <div className={styles.buttonGroup}>
              <div id="google-signin-button" className={styles.googleButton} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
