import { api } from './apiClient'
import type { AdminDashboardSummary, AdminUser, AdminEvent, AdminBooking, AdminVendor } from '../features/admin-operations/models/admin-operations.model'

export const adminService = {
  getDashboardSummary: () =>
    api.get<AdminDashboardSummary>('/admin/dashboard/summary'),

  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.role) qs.set('role', params.role)
    if (params?.search) qs.set('search', params.search)
    return api.get<AdminUser[]>(`/admin/users${qs.toString() ? `?${qs.toString()}` : ''}`)
  },

  getEvents: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return api.get<AdminEvent[]>(`/admin/events${qs.toString() ? `?${qs.toString()}` : ''}`)
  },

  getBookings: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return api.get<AdminBooking[]>(`/admin/bookings${qs.toString() ? `?${qs.toString()}` : ''}`)
  },

  getVendors: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return api.get<AdminVendor[]>(`/admin/vendors${qs.toString() ? `?${qs.toString()}` : ''}`)
  },

  updateVendorVerification: (vendorId: string, payload: { verificationStatus: string; reason?: string | null }) =>
    api.patch<AdminVendor>(`/admin/vendors/${vendorId}/verification`, payload),

  overrideBookingStatus: (bookingId: string, payload: { status: string; reason: string }) =>
    api.patch<AdminBooking>(`/admin/bookings/${bookingId}/override-status`, payload)
}
