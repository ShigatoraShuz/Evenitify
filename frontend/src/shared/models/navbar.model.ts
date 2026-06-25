/**
 * Navbar Model
 * Pure TypeScript interfaces/types for the navbar visibility state.
 * No hooks, no logic, no side effects.
 */

export interface NavbarState {
  /** Whether the sidebar is currently visible */
  isOpen: boolean
}

/** Key used to persist navbar state in localStorage */
export const NAVBAR_STORAGE_KEY = 'eventify:navbar-open' as const
