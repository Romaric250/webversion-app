export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://signova-backend.onrender.com/api'

console.log('API_BASE_URL', API_BASE_URL)

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_VERIFICATION_EMAIL: '/auth/send-verification-email',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_VERIFICATION_CODE: '/auth/resend-verification-code',
  },
  CHATS: {
    LIST: '/chats',
    SEARCH_USERS: '/chats/search-users',
    WITH_USER: (userId: string) => `/chats/with/${userId}`,
    BY_ID: (id: string) => `/chats/${id}`,
    MESSAGES: (id: string) => `/chats/${id}/messages`,
  },
  FEEDBACK: '/feedback',
  USER: {
    PROFILE: '/users/me',
  },
  SIGNS: {
    LIST: '/signs',
    SEARCH: '/signs/search',
    BY_ID: (id: string) => `/signs/${id}`,
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
    ENROLLMENTS: '/learning/enrollments',
    ENROLL: (courseId: string) => `/learning/courses/${courseId}/enroll`,
    UNENROLL: (courseId: string) => `/learning/courses/${courseId}/enroll`,
    MY_COURSE: (id: string) => `/learning/my-courses/${id}`,
    LESSON_COMPLETE: (lessonId: string) => `/learning/lessons/${lessonId}/complete`,
    LESSON_PROGRESS: (lessonId: string) => `/learning/lessons/${lessonId}/progress`,
  },
  PLANS: '/plans',
  ADMIN: {
    STATS: '/admin/stats',
    CHART_DATA: '/admin/chart-data',
    USERS: '/admin/users',
    USER_SUBSCRIPTION: (id: string) => `/admin/users/${id}/subscription`,
    USER_ADMIN: (id: string) => `/admin/users/${id}/admin`,
    SIGNS: '/admin/signs',
    SIGN: (id: string) => `/admin/signs/${id}`,
    COURSES: '/admin/courses',
    COURSE: (id: string) => `/admin/courses/${id}`,
    COURSE_LESSONS: (courseId: string) => `/admin/courses/${courseId}/lessons`,
    COURSE_LESSONS_REORDER: (courseId: string) => `/admin/courses/${courseId}/lessons/reorder`,
    COURSE_ENROLLMENTS: (courseId: string) => `/admin/courses/${courseId}/enrollments`,
    FEEDBACK: '/admin/feedback',
    PLANS: '/admin/plans',
    PLAN: (id: string) => `/admin/plans/${id}`,
  },
  PROGRESS: {
    GET: '/progress',
  },
} as const
