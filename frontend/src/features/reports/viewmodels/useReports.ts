import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminService } from '../../../services/adminService'
import { bookingService } from '../../../services/bookingService'
import { eventService } from '../../../services/eventService'
import { downloadCsv, reportToCsv, type ReportBundle } from '../../../services/reportService'

type ReportRole = 'organizer' | 'vendor' | 'admin'

interface ReportsState {
  report: ReportBundle | null
  loading: boolean
  error: string | null
  pdfNotice: string | null
}

function money(value: number | null | undefined) {
  return `$${Number(value || 0).toLocaleString()}`
}

export function useReports(role: ReportRole) {
  const [state, setState] = useState<ReportsState>({ report: null, loading: false, error: null, pdfNotice: null })

  const loadReport = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null, pdfNotice: null }))
    try {
      if (role === 'organizer') {
        const [events, summary] = await Promise.all([eventService.listEvents(), eventService.getDashboardSummary()])
        const report: ReportBundle = {
          title: 'Organizer reports',
          subtitle: 'Event, booking, requirement, and budget overview',
          generatedAt: new Date().toISOString(),
          metrics: [
            { label: 'Events', value: events.length },
            { label: 'Large events', value: summary.eventStatusSummary.total, helper: 'All event statuses' },
            { label: 'Open requirements', value: summary.requirementSummary.open, tone: 'warning' },
            { label: 'Confirmed bookings', value: summary.bookingSummary.confirmed, tone: 'success' }
          ],
          tables: [{
            title: 'Events',
            columns: ['Title', 'Date', 'Venue', 'Budget', 'Guests', 'Status'],
            rows: events.map((event) => ({
              Title: event.title,
              Date: new Date(event.event_date).toLocaleDateString(),
              Venue: event.venue,
              Budget: money(event.budget),
              Guests: event.expected_guests,
              Status: event.status
            }))
          }]
        }
        setState((s) => ({ ...s, report, loading: false }))
        return
      }

      if (role === 'vendor') {
        const bookings = await bookingService.listVendorB2BBookings()
        const report: ReportBundle = {
          title: 'Vendor reports',
          subtitle: 'Booking pipeline and contract readiness overview',
          generatedAt: new Date().toISOString(),
          metrics: [
            { label: 'Bookings', value: bookings.length },
            { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, tone: 'warning' },
            { label: 'Accepted', value: bookings.filter((b) => b.status === 'accepted').length, tone: 'success' },
            { label: 'Requested value', value: money(bookings.reduce((sum, b) => sum + Number(b.requested_budget || 0), 0)) }
          ],
          tables: [{
            title: 'Bookings',
            columns: ['Event', 'Organizer', 'Category', 'Budget', 'Status'],
            rows: bookings.map((booking) => ({
              Event: booking.large_events?.title || 'Event',
              Organizer: booking.organizer_profiles?.organization_name || 'Organizer',
              Category: booking.event_requirements?.category || 'Category',
              Budget: money(booking.requested_budget),
              Status: booking.status
            }))
          }]
        }
        setState((s) => ({ ...s, report, loading: false }))
        return
      }

      const [summary, users, events, bookings, vendors] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getUsers(),
        adminService.getEvents(),
        adminService.getBookings(),
        adminService.getVendors()
      ])
      const report: ReportBundle = {
        title: 'Admin reports',
        subtitle: 'Platform operations, verification, and booking controls',
        generatedAt: new Date().toISOString(),
        metrics: [
          { label: 'Users', value: users.length || summary.total_organizers + summary.total_vendors },
          { label: 'Events', value: events.length || summary.total_events },
          { label: 'Pending bookings', value: summary.pending_bookings, tone: 'warning' },
          { label: 'Pending verifications', value: summary.pending_verifications, tone: 'danger' }
        ],
        tables: [
          {
            title: 'Recent bookings',
            columns: ['Event', 'Organizer', 'Vendor', 'Category', 'Status'],
            rows: bookings.map((booking) => ({
              Event: booking.large_events?.title || 'Event',
              Organizer: booking.organizer_profiles?.organization_name || 'Organizer',
              Vendor: booking.vendor_profiles?.business_name || 'Vendor',
              Category: booking.event_requirements?.category || 'Category',
              Status: booking.status
            }))
          },
          {
            title: 'Vendors',
            columns: ['Business', 'Area', 'Rating', 'Verification'],
            rows: vendors.map((vendor) => ({
              Business: vendor.business_name,
              Area: vendor.service_area || 'N/A',
              Rating: vendor.rating,
              Verification: vendor.verification_status
            }))
          }
        ]
      }
      setState((s) => ({ ...s, report, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [role])

  useEffect(() => {
    void loadReport()
  }, [loadReport])

  const filename = useMemo(() => `${role}-report.csv`, [role])

  const exportCsv = useCallback(() => {
    if (state.report) downloadCsv(filename, reportToCsv(state.report))
  }, [filename, state.report])

  const printReport = useCallback(() => window.print(), [])

  const showPdfPlaceholder = useCallback(() => {
    setState((s) => ({ ...s, pdfNotice: 'PDF export is reserved for backend document generation. Use print or CSV for this frontend MVP.' }))
  }, [])

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null, pdfNotice: null })), [])

  return { ...state, loadReport, exportCsv, printReport, showPdfPlaceholder, clearError }
}
