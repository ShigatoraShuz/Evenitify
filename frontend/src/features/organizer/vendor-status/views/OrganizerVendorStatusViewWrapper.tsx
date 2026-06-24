import { useState, useMemo, useCallback } from 'react'
import { OrganizerVendorStatusView } from './OrganizerVendorStatusView'
import type { VendorRequest } from './OrganizerVendorStatusView'

// Placeholder data – replace with real API integration
const mockRequests: VendorRequest[] = []

export default function OrganizerVendorStatusViewWrapper() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRequests = useMemo(() => {
    return mockRequests.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.eventName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const handleViewDetails = useCallback((requestId: string) => {
    console.log('View details for request:', requestId)
  }, [])

  return (
    <OrganizerVendorStatusView
      requests={filteredRequests}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      onViewDetails={handleViewDetails}
    />
  )
}
