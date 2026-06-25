import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/apiClient'
import { realtimeService, type RealtimeSnapshot } from '../../services/realtimeService'

export function useRealtimeSnapshot(channel: string) {
  const [snapshot, setSnapshot] = useState<RealtimeSnapshot | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [disabledUntil, setDisabledUntil] = useState<number | null>(null)
  const inFlightRef = useRef<Promise<void> | null>(null)

  const refresh = useCallback(async () => {
    if (disabledUntil && Date.now() < disabledUntil) return
    if (inFlightRef.current) return inFlightRef.current
    setRefreshing(true)
    inFlightRef.current = (async () => {
      try {
        setSnapshot(await realtimeService.getSnapshot(channel))
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
          setDisabledUntil(Date.now() + 60_000)
          return
        }
        console.error('Failed to refresh realtime snapshot', err)
      } finally {
        setRefreshing(false)
        inFlightRef.current = null
      }
    })()
    return inFlightRef.current
  }, [channel, disabledUntil])

  useEffect(() => {
    if (disabledUntil && Date.now() < disabledUntil) return
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh, disabledUntil])

  return { snapshot, refreshing, refresh }
}
