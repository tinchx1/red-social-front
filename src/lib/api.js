import axios from "axios";

// Configuración base
const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// API para Server (Components y Actions)
export const serverApi = axios.create({
  ...baseConfig,
  withCredentials: true, // Para enviar cookies automáticamente
});

// Endpoints públicos que NO requieren token
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/recover-password",
  "/auth/reset-password",
];

// Interceptor para servidor - funciona tanto en Server Components como Actions
serverApi.interceptors.request.use(
  async (config) => {
    // Verificar si es un endpoint público
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      // Para endpoints públicos, no añadir token
      return config;
    }

    try {
      // Intentar usar next/headers solo si estamos en Server Component
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("accessToken")?.value;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Si no hay token, no lanzar error - dejar que la petición continúe
      // El servidor responderá con 401 si es necesario
    } catch (error) {
      // Si falla al obtener cookies (por ejemplo, en Server Actions),
      // las cookies se envían automáticamente con withCredentials
      // No lanzar error aquí para permitir que la petición continúe
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API para Client Components
export const clientApi = axios.create({
  ...baseConfig,
  withCredentials: true, // Importante para enviar cookies
});

// Interceptor para cliente - usa document.cookie
clientApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cache para evitar logs repetidos del mismo error durante SSR/SSG
const errorCache = new Map();
const CACHE_TTL = 5000; // 5 segundos

// Interceptor de respuesta para manejar errores de auth
const handleAuthError = (error) => {
  const isServer = typeof window === "undefined";
  const errorMessage = error.response?.data?.message;

  // Manejar usuarios suspendidos/eliminados (403)
  if (
    error.response?.status === 403 &&
    (errorMessage === "Account has been suspended" ||
      errorMessage === "Account has been deleted")
  ) {
    if (!isServer) {
      console.log("User account blocked, forcing logout...");
      // Forzar logout limpiando cookies y redirigiendo
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/v1/auth/refresh;";
      window.location.href = "/?logout=forced";
      return; // No rechazar la promesa para evitar más procesamiento
    }
  }

  if (error.response?.status === 401) {
    const isServer = typeof window === "undefined";
    const errorKey = `${error.config?.method || "unknown"}_${
      error.config?.url || "unknown"
    }`;
    const now = Date.now();

    // Durante SSR/SSG, silenciar errores 401 repetidos
    if (isServer) {
      const lastError = errorCache.get(errorKey);
      if (lastError && now - lastError < CACHE_TTL) {
        // Error repetido durante SSR - crear un error silencioso
        const silentError = new Error("Unauthorized");
        silentError.response = error.response;
        silentError.config = error.config;
        silentError.isAxiosError = true;
        // Marcar como silencioso para evitar logs
        silentError.silent = true;
        return Promise.reject(silentError);
      }
      errorCache.set(errorKey, now);
      // Limpiar cache periódicamente
      if (errorCache.size > 100) {
        errorCache.clear();
      }
    }

    // Si estamos en el cliente, redirigir al login
    if (!isServer) {
      window.location.href = "/";
    }
    // En servidor, el middleware se encarga de los redirects
  }
  return Promise.reject(error);
};

serverApi.interceptors.response.use((response) => response, handleAuthError);

clientApi.interceptors.response.use((response) => response, handleAuthError);

// Función helper para detectar el contexto y usar la API correcta
export function getApi() {
  return typeof window === "undefined" ? serverApi : clientApi;
}

export default getApi();
