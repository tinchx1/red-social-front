import axios from 'axios';
import { ADS_API_URL, ADS_API_KEY } from '@/constants/ads';

const baseConfig = {
  baseURL: ADS_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': ADS_API_KEY,
  },
  withCredentials: true,
};

const serverAdsApi = axios.create({ ...baseConfig });
const clientAdsApi = axios.create({ ...baseConfig });

export const getAdsApi = () =>
  typeof window === 'undefined' ? serverAdsApi : clientAdsApi;

export default getAdsApi();

