import { serverApi } from '@/lib/api'
 
export async function logoutAction() {
  try {
    await serverApi.post('/auth/logout');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || 'No se pudo cerrar sesión';
    throw new Error(message);
  }
}



