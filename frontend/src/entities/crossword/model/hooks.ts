import { useState, useCallback, useEffect } from 'react'
import { crosswordApi } from '../api'
import { useAsync } from '@/shared/hooks/useAsync'
import type { GameSession } from '@/shared/types'

export function useCrossword(crosswordId?: string) {
  const {
    data: crossword,
    loading,
    error,
    execute: fetchCrossword
  } = useAsync(crosswordApi.getCrossword)

  const {
    data: randomCrossword,
    loading: randomLoading,
    error: randomError,
    execute: fetchRandomCrossword
  } = useAsync(crosswordApi.getRandomCrossword)

  useEffect(() => {
    if (crosswordId) {
      fetchCrossword(crosswordId)
    }
  }, [crosswordId, fetchCrossword])

  const getRandomCrossword = useCallback((difficulty?: string) => {
    return fetchRandomCrossword(difficulty)
  }, [fetchRandomCrossword])

  return {
    crossword: crossword || randomCrossword,
    loading: loading || randomLoading,
    error: error || randomError,
    refetch: crosswordId ? () => fetchCrossword(crosswordId) : undefined,
    getRandomCrossword,
  }
}

export function useGameSession() {
  const [session, setSession] = useState<GameSession | null>(null)
  
  const {
    loading: startLoading,
    error: startError,
    execute: executeStartSession
  } = useAsync(crosswordApi.startGameSession)

  const {
    loading: updateLoading,
    error: updateError,
    execute: executeUpdateSession
  } = useAsync(crosswordApi.updateGameSession)

  const startSession = useCallback(async (crosswordId: string) => {
    try {
      await executeStartSession(crosswordId)
      const newSession = await crosswordApi.startGameSession(crosswordId)
      if (newSession) {
        setSession(newSession)
      }
      return newSession
    } catch (error) {
      console.error('Failed to start session:', error)
      return null
    }
  }, [executeStartSession])

  const updateSession = useCallback(async (
    data: Partial<Pick<GameSession, 'score' | 'completed' | 'endTime'>>
  ) => {
    if (!session) return null
    
    try {
      await executeUpdateSession(session.id, data)
      const updatedSession = await crosswordApi.updateGameSession(session.id, data)
      if (updatedSession) {
        setSession(updatedSession)
      }
      return updatedSession
    } catch (error) {
      console.error('Failed to update session:', error)
      return null
    }
  }, [session, executeUpdateSession])

  const endSession = useCallback(async (score: number): Promise<GameSession | null> => {
    return await updateSession({
      score,
      completed: true,
      endTime: new Date().toISOString()
    })
  }, [updateSession])

  return {
    session,
    startSession,
    updateSession,
    endSession,
    loading: startLoading || updateLoading,
    error: startError || updateError,
  }
}
