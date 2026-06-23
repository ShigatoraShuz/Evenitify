import { useCallback, useEffect, useState } from 'react'
import { commandService, type CommandSearchResult, type QuickAction } from '../../services/commandService'

export function useCommandPalette(role: string | null) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CommandSearchResult[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])

  useEffect(() => {
    let active = true
    commandService.getQuickActions(role).then((actions) => {
      if (active) setQuickActions(actions)
    })
    return () => { active = false }
  }, [role])

  useEffect(() => {
    let active = true
    commandService.search(query).then((items) => {
      if (active) setResults(items)
    })
    return () => { active = false }
  }, [query])

  const openPalette = useCallback(() => setOpen(true), [])
  const closePalette = useCallback(() => setOpen(false), [])
  const updateQuery = useCallback((value: string) => setQuery(value), [])

  return {
    open,
    query,
    results,
    quickActions,
    openPalette,
    closePalette,
    updateQuery
  }
}

