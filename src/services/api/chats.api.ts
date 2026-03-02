import { apiClient } from './client'
import { API_BASE_URL } from '@/config/api'

export interface ChatParticipant {
  id: string
  user: { id: string; name: string; email: string; image?: string }
}

export interface ChatSummary {
  id: string
  otherUser?: { id: string; name: string; email: string; image?: string }
  lastMessage?: {
    content: string
    createdAt: string
    fromUser: { id: string; name: string }
  }
  joinedAt: string
  totalCount?: number
  unreadCount?: number
}

export interface ChatMessage {
  id: string
  content: string
  rawContent?: string | null
  type: string
  createdAt: string
  user: { id: string; name: string; email: string }
}

export const chatsApi = {
  getMyChats: async (): Promise<ChatSummary[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ChatSummary[] }>(
      `${API_BASE_URL}/chats`
    )
    if (data.success) return data.data || []
    throw new Error('Failed to fetch chats')
  },

  searchUsers: async (q: string): Promise<{ id: string; name: string; email: string; image?: string }[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: any[] }>(
      `${API_BASE_URL}/chats/search-users?q=${encodeURIComponent(q)}`
    )
    if (data.success) return data.data || []
    throw new Error('Failed to search users')
  },

  getOrCreateChat: async (userId: string) => {
    const { data } = await apiClient.post<{ success: boolean; data: any }>(
      `${API_BASE_URL}/chats/with/${userId}`
    )
    if (data.success) return data.data
    throw new Error('Failed to get or create chat')
  },

  getChat: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: any }>(
      `${API_BASE_URL}/chats/${id}`
    )
    if (data.success) return data.data
    throw new Error('Failed to fetch chat')
  },

  getMessages: async (id: string, page = 1) => {
    const { data } = await apiClient.get<{
      success: boolean
      data: ChatMessage[]
      pagination?: { total: number }
    }>(`${API_BASE_URL}/chats/${id}/messages?page=${page}`)
    if (data.success) return { messages: data.data || [], total: data.pagination?.total ?? data.data?.length ?? 0 }
    throw new Error('Failed to fetch messages')
  },

  sendMessage: async (chatId: string, content: string) => {
    const { data } = await apiClient.post<{ success: boolean; data: ChatMessage }>(
      `${API_BASE_URL}/chats/${chatId}/messages`,
      { content }
    )
    if (data.success) return data.data
    throw new Error('Failed to send message')
  },
}
