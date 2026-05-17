

export async function loginAction(email, password) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      const message = errorData?.message || errorData?.error || 'Login fallido'
      throw new Error(message)
    }
    
    // Return the response data when successful
    return await response.json()
    
  } catch (error) {
    // Preserve the original error message from the backend
    const message = error.message || 'Login fallido, por favor intentá nuevamente';
    throw new Error(message);
  }
}

export async function loginActionGoogle(idToken) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
      credentials: 'include', // IMPORTANTE: para recibir y guardar cookies
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      
      // Si es error 404 con datos de Google, crear error especial
      if (response.status === 404 && errorData.googleUserData) {
        const error = new Error(errorData.message || 'Usuario no encontrado')
        error.googleUserData = errorData.googleUserData
        error.needsRegistration = true
        throw error
      }
      
      const message = errorData?.message || errorData?.error || 'Login con Google fallido'
      throw new Error(message)
    }
    
    return await response.json()
  } catch (error) {
    // Si el error ya tiene datos de Google, re-lanzarlo
    if (error.googleUserData) {
      throw error
    }
    
    const message = error.message || 'Login con Google fallido, por favor intentá nuevamente';
    throw new Error(message);
  }
}