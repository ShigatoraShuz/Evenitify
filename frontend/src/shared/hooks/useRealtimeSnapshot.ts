import { useCallback, useEffect, useState } from 'react'
import { realtimeService, type RealtimeSnapshot } from '../../services/realtimeService'

export function useRealtimeSnapshot(channel: string) {
  const [snapshot, setSnapshot] = useState<RealtimeSnapshot | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      setSnapshot(await realtimeService.getSnapshot(channel))
    } finally {
      setRefreshing(false)
    }
  }, [channel])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  return { snapshot, refreshing, refresh }
}
