export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://signova-backend.onrender.com/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/users/me',
  },
  SIGNS: {
    LIST: '/signs',
    SEARCH: '/signs/search',
    FAVORITES: '/signs/favorites',
  },
  TRANSLATE: {
    TEXT_TO_SIGN: '/translate/text-to-sign',
    TRANSCRIBE: '/translate/transcribe',
    HISTORY: '/translate/history',
  },
  PROGRESS: {
    GET: '/progress',
  },
} as const
