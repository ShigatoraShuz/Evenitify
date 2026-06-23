export interface AppNotification {
  id: string
  user_id: string
  booking_id: string | null
  title: string
  message: string
  notification_type: string
  priority: 'low' | 'normal' | 'high'
  action_url: string | null
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
  read_at: string | null
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700'
}
