export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://signova-backend.onrender.com/api'

console.log('API_BASE_URL', API_BASE_URL)

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
  TRANSCRIPTS: {
    LIST: '/transcripts',
    BY_ID: (id: string) => `/transcripts/${id}`,
  },
  NOTES: {
    LIST: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
    FROM_RECORDING: '/notes/from-recording',
  },
  GROUPS: {
    LIST: '/groups',
    JOIN: '/groups/join',
    BY_ID: (id: string) => `/groups/${id}`,
    MESSAGES: (id: string) => `/groups/${id}/messages`,
    VOICE_MESSAGE: (id: string) => `/groups/${id}/messages/voice`,
  },
  LEARNING: {
    COURSES: '/learning/courses',
    COURSE: (id: string) => `/learning/courses/${id}`,
    LESSON: (courseId: string, lessonId: string) =>
      `/learning/courses/${courseId}/lessons/${lessonId}`,
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    USER_SUBSCRIPTION: '/admin/users',
    USER_ADMIN: '/admin/users',
    SIGNS: '/admin/signs',
    COURSES: '/admin/courses',
  },
  PROGRESS: {
    GET: '/progress',
  },
} as const
