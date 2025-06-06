import { apiClient } from '@/shared/api/client'
import type { 
  CrosswordData, 
  CreateCrosswordRequest, 
  GameSession,
  CrosswordApiResponse 
} from '@/entities/crossword/types'

export const crosswordApi = {
  async getCrossword(id: string): Promise<CrosswordApiResponse> {
    return apiClient.get<CrosswordApiResponse>(`/crosswords/${id}`)
  },

  async getRandomCrossword(difficulty?: string): Promise<CrosswordApiResponse> {
    const params = difficulty ? `?difficulty=${difficulty}` : ''
    return apiClient.get<CrosswordApiResponse>(`/crosswords/random${params}`)
  },

  async createCrossword(data: CreateCrosswordRequest): Promise<CrosswordData> {
    return apiClient.post<CrosswordData>('/crosswords', data)
  },

  async getCrosswords(page = 1, limit = 10): Promise<{
    crosswords: CrosswordData[]
    total: number
    page: number
    totalPages: number
  }> {
    return apiClient.get(`/crosswords?page=${page}&limit=${limit}`)
  },

  async startGameSession(crosswordId: string): Promise<GameSession> {
    return apiClient.post<GameSession>('/game-sessions', { crosswordId })
  },

  async updateGameSession(
    sessionId: string, 
    data: Partial<Pick<GameSession, 'score' | 'completed' | 'endTime'>>
  ): Promise<GameSession> {
    return apiClient.put<GameSession>(`/game-sessions/${sessionId}`, data)
  },

  async getPlayerStats(userId?: string): Promise<{
    totalGames: number
    completedGames: number
    averageScore: number
    bestScore: number
  }> {
    const params = userId ? `?userId=${userId}` : ''
    return apiClient.get(`/stats${params}`)
  }
}
