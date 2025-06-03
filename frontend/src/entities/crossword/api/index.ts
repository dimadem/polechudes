import { apiClient } from '@/shared/api/client'
import type { 
  CrosswordData, 
  CreateCrosswordRequest, 
  GameSession 
} from '@/shared/types'

export const crosswordApi = {
  // Получить кроссворд по ID
  async getCrossword(id: string): Promise<CrosswordData> {
    return apiClient.get<CrosswordData>(`/crosswords/${id}`)
  },

  // Получить случайный кроссворд
  async getRandomCrossword(difficulty?: string): Promise<CrosswordData> {
    const params = difficulty ? `?difficulty=${difficulty}` : ''
    return apiClient.get<CrosswordData>(`/crosswords/random${params}`)
  },

  // Создать новый кроссворд
  async createCrossword(data: CreateCrosswordRequest): Promise<CrosswordData> {
    return apiClient.post<CrosswordData>('/crosswords', data)
  },

  // Получить список доступных кроссвордов
  async getCrosswords(page = 1, limit = 10): Promise<{
    crosswords: CrosswordData[]
    total: number
    page: number
    totalPages: number
  }> {
    return apiClient.get(`/crosswords?page=${page}&limit=${limit}`)
  },

  // Начать игровую сессию
  async startGameSession(crosswordId: string): Promise<GameSession> {
    return apiClient.post<GameSession>('/game-sessions', { crosswordId })
  },

  // Обновить игровую сессию
  async updateGameSession(
    sessionId: string, 
    data: Partial<Pick<GameSession, 'score' | 'completed' | 'endTime'>>
  ): Promise<GameSession> {
    return apiClient.put<GameSession>(`/game-sessions/${sessionId}`, data)
  },

  // Получить статистику игрока
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
