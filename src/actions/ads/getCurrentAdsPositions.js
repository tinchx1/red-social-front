"use server";

import adsApi from '@/lib/adsApi';

export async function getCurrentAdsPositions() {
  try {
    const response = await adsApi.get('/ads/all-positions/now');
    return response.data?.positions ?? [];
  } catch (error) {
    console.error('Error fetching current ads positions', error?.response?.data || error);
    return [];
  }
}



