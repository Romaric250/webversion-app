const TOKEN_KEY = 'signnova_token'
const USER_KEY = 'signnova_user'

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export const getUserData = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

export const setUserData = (data: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, data)
}

export const removeUserData = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}
