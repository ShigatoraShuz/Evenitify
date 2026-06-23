import { useState, useCallback, useEffect } from 'react'
import { profileService } from '../../../services/profileService'
import type { AdminSettingsForm } from '../models/user-settings.model'
import { DEFAULT_ADMIN_SETTINGS } from '../models/user-settings.model'

interface AdminSettingsState {
  settings: AdminSettingsForm
  originalSettings: AdminSettingsForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
}

export function useAdminSettings() {
  const [state, setState] = useState<AdminSettingsState>({
    settings: DEFAULT_ADMIN_SETTINGS,
    originalSettings: DEFAULT_ADMIN_SETTINGS,
    loading: false,
    submitting: false,
    error: null,
    saved: false
  })

  const loadSettings = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await profileService.getAdminSettings()
      const settings: AdminSettingsForm = {
        displayName: data.displayName,
        email: data.email
      }
      setState((s) => ({ ...s, settings, originalSettings: { ...settings }, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const updateSettings = useCallback((next: Partial<AdminSettingsForm>) => {
    setState((s) => ({ ...s, saved: false, settings: { ...s.settings, ...next } }))
  }, [])

  const saveSettings = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await profileService.updateAdminSettings(state.settings)
      setState((s) => ({ ...s, submitting: false, originalSettings: { ...s.settings }, saved: true }))
      setTimeout(() => setState((s) => ({ ...s, saved: false })), 3000)
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.settings])

  const hasChanges = JSON.stringify(state.settings) !== JSON.stringify(state.originalSettings)

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    settings: state.settings,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,
    saved: state.saved,
    hasChanges,
    updateSettings,
    saveSettings,
    clearError
  }
}
