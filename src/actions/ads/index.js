"use server"

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ADS_API_URL
});

// Interceptor para incluir el token en cada solicitud
api.interceptors.request.use(
    (config) => {
        const token = process.env.MICROSERVICE_ADS_API_KEY;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Obtiene las fechas no disponibles para una posición y dailyMinutes dados
 * @param {{ position: number; dailyMinutes: number; startDate: string; endDate: string }} params
 * @returns {Promise<{ unavailableDates: string[] }>}
 */
export async function getAvailability({ position, dailyMinutes, startDate, endDate }) {
    try {
        const response = await api.get("/user/ads/availability", {
            params: {
                position,
                dailyMinutes,
                startDate,
                endDate,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching availability:", error);
        throw error;
    }
}

/**
 * Calcula los precios para las posiciones dadas
 * @param {{ positions: number[]; dailyMinutes: number; contractDays: number }} params
 * @returns {Promise<{ message: string; pricing: { positions: Array<{ position: number; dailyMinutes: number; pricePerMinute: number; dailyCost: number; totalPrice: number; breakdown: { basePrice: string; calculation: string } }>; dailyMinutes: number; contractDays: number; totalPrice: number } }>}
 */
export async function calculatePricing({ positions, dailyMinutes, contractDays }) {
    try {
        const response = await api.post("/pricing/calculate", {
            positions,
            dailyMinutes,
            contractDays,
        });
        return response.data;
    } catch (error) {
        console.error("Error calculating pricing:", error);
        throw error;
    }
}

/**
 * Crea un anuncio para un usuario final
 * @param {{
 *  clientId: string;
 *  title: string;
 *  assetFile: string;
 *  clickUrl: string;
 *  position: number;
 *  contractDays: number;
 *  dailyMinutes: number;
 *  startDate: string;
 * }} adPayload
 * @returns {Promise<{ message: string; adId: string }>}
 */
export async function createAd(adPayload) {
    try {
        const response = await api.post("/user/ads", adPayload);
        return response.data;
    } catch (error) {
        console.error("Error creating ad:", error?.response?.data || error);
        throw error;
    }
}

/**
 * Obtiene los anuncios de un usuario
 * @param {{ clientId: string; page?: number; limit?: number; dateFrom?: string; dateTo?: string; status?: string; paymentStatus?: string }} params
 * @returns {Promise<{ ads: Array<any>; pagination?: { page: number; limit: number; total: number; pages: number }; total?: number }>}
 */
export async function getUserAds({ clientId, page, limit, dateFrom, dateTo, status, paymentStatus }) {
    try {
        const params = { clientId };
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (status) params.status = status;
        if (paymentStatus) params.paymentStatus = paymentStatus;

        const response = await api.get("/user/ads", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching user ads:", error?.response?.data || error);
        throw error;
    }
}

/**
 * Pausa/cancela un anuncio
 * @param {{ adId: string; clientId: string }} params
 * @returns {Promise<any>}
 */
export async function pauseAd({ adId, clientId }) {
    try {
        const response = await api.delete(`/user/ads/${adId}`, {
            params: {
                clientId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error pausing ad:", error?.response?.data || error);
        throw error;
    }
}

export { api as adsApi };

