import { useState, useCallback } from 'react'
import { NAVBAR_STORAGE_KEY } from '../models/navbar.model'
import type { NavbarState } from '../models/navbar.model'

/**
 * Navbar ViewModel
 * Manages sidebar open/closed state with localStorage persistence.
 * State survives route changes and page refreshes.
 * Only the explicit toggle action changes the state.
 */

function readPersistedState(): boolean {
  try {
    const stored = localStorage.getItem(NAVBAR_STORAGE_KEY)
    if (stored === null) return false
    return stored === 'true'
  } catch {
    return false
  }
}

function persistState(isOpen: boolean): void {
  try {
    localStorage.setItem(NAVBAR_STORAGE_KEY, String(isOpen))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function useNavbarViewModel() {
  const [state, setState] = useState<NavbarState>(() => ({
    isOpen: readPersistedState(),
  }))

  const toggle = useCallback(() => {
    setState((prev) => {
      const next = !prev.isOpen
      persistState(next)
      return { isOpen: next }
    })
  }, [])

  const close = useCallback(() => {
    persistState(false)
    setState({ isOpen: false })
  }, [])

  const open = useCallback(() => {
    persistState(true)
    setState({ isOpen: true })
  }, [])

  return {
    isOpen: state.isOpen,
    toggle,
    close,
    open,
  } as const
}
