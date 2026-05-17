const GOOGLE_DATA_KEY = 'googleUserData'

export const saveGoogleData = (userData) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(GOOGLE_DATA_KEY, JSON.stringify(userData))
  }
}

export const getGoogleData = () => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem(GOOGLE_DATA_KEY)
    return data ? JSON.parse(data) : null
  }
  return null
}

export const clearGoogleData = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(GOOGLE_DATA_KEY)
  }
}

export const hasGoogleData = () => {
  return getGoogleData() !== null
}

// Clear Google data after successful registration
export const clearGoogleDataAfterRegistration = () => {
  // Only clear if the user has successfully completed registration
  // This prevents clearing data if user navigates away before completing
  if (typeof window !== 'undefined') {
    // Add a small delay to ensure the success state is shown
    setTimeout(() => {
      sessionStorage.removeItem(GOOGLE_DATA_KEY)
    }, 2000)
  }
}
