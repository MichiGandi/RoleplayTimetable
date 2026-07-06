import { useState, useEffect, useCallback } from 'react'

// Debounce helper
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export type LoadState = 'loading' | 'ready' | 'error'

export function useServerData<T>(defaultValue: T) {
  const [data, setDataState] = useState<T>(defaultValue)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  // Load on mount
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(json => {
        // If server returns empty object, use default
        if (json && Object.keys(json).length > 0) {
          setDataState(json as T)
        }
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [])

  // Debounced save
  const save = useCallback(
    debounce((value: T) => {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      }).catch(err => console.error('Save failed:', err))
    }, 500),
    []
  )

  const setData = useCallback((updater: T | ((prev: T) => T)) => {
    setDataState(prev => {
      const next = typeof updater === 'function'
        ? (updater as (prev: T) => T)(prev)
        : updater
      save(next)
      return next
    })
  }, [save])

  return { data, setData, loadState }
}
