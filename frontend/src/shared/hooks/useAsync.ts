import { useState, useCallback } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncReturn<T, TArgs extends readonly unknown[]> extends UseAsyncState<T> {
  execute: (...args: TArgs) => Promise<void>
  reset: () => void
}

export function useAsync<T, TArgs extends readonly unknown[] = []>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, TArgs> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ data: null, loading: true, error: null })
      
      try {
        const result = await asyncFunction(...args)
        setState({ data: result, loading: false, error: null })
      } catch (error) {
        setState({ 
          data: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
