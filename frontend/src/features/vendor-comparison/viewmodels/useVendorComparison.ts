import { useState, useCallback } from 'react'
import { vendorService } from '../../../services/vendorService'
import type { CompareVendor, ShortlistEntry } from '../models/vendor-comparison.model'
import { buildCompareVendors } from '../models/vendor-comparison.model'

interface VendorComparisonState {
  compareVendors: CompareVendor[]
  shortlist: ShortlistEntry[]
  loading: boolean
  error: string | null
}

export function useVendorComparison() {
  const [state, setState] = useState<VendorComparisonState>({
    compareVendors: [],
    shortlist: [],
    loading: false,
    error: null
  })

  const loadVendorDetails = useCallback(async (vendorIds: string[]) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const results = await Promise.all(
        vendorIds.map((id) => vendorService.searchVendors({ businessName: id }))
      )
      const vendors = buildCompareVendors(results.flat())
      setState((s) => ({ ...s, compareVendors: vendors, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const setCompareVendors = useCallback((vendors: CompareVendor[]) => {
    setState((s) => ({ ...s, compareVendors: vendors }))
  }, [])

  const removeFromCompare = useCallback((vendorId: string) => {
    setState((s) => ({ ...s, compareVendors: s.compareVendors.filter((v) => v.id !== vendorId) }))
  }, [])

  const clearComparison = useCallback(() => {
    setState((s) => ({ ...s, compareVendors: [] }))
  }, [])

  const addToShortlist = useCallback((vendorId: string) => {
    setState((s) => ({
      ...s,
      shortlist: [...s.shortlist, { vendorId, addedAt: new Date().toISOString(), notes: '' }]
    }))
  }, [])

  const removeFromShortlist = useCallback((vendorId: string) => {
    setState((s) => ({ ...s, shortlist: s.shortlist.filter((e) => e.vendorId !== vendorId) }))
  }, [])

  const isInShortlist = useCallback((vendorId: string) => {
    return state.shortlist.some((e) => e.vendorId === vendorId)
  }, [state.shortlist])

  const updateShortlistNotes = useCallback((vendorId: string, notes: string) => {
    setState((s) => ({
      ...s,
      shortlist: s.shortlist.map((e) => e.vendorId === vendorId ? { ...e, notes } : e)
    }))
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    compareVendors: state.compareVendors,
    shortlist: state.shortlist,
    loading: state.loading,
    error: state.error,
    loadVendorDetails,
    setCompareVendors,
    removeFromCompare,
    clearComparison,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
    updateShortlistNotes,
    clearError
  }
}
