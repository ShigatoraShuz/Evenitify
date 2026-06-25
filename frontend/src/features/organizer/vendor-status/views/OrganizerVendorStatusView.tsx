import { type VendorMessage, type VendorRequest, type VendorRequestStatus, type VendorStatusTimelineItem, type StatusFilterTab } from '../models/vendorStatus.model'
import { VendorStatusSummaryCards } from '../components/VendorStatusSummaryCards'
import { VendorStatusTabs } from '../components/VendorStatusTabs'
import { VendorRequestCard } from '../components/VendorRequestCard'
import { VendorRequestDetailDrawer } from '../components/VendorRequestDetailDrawer'
import { DashboardShell } from '../../../../shared/components/DashboardShell'
import { Button } from '../../../../shared/components/Button'
import { Input } from '../../../../shared/components/Input'
import { EmptyStateCard, OrganizerCard, OrganizerPage, OrganizerPageHeader } from '../../../../shared/components/OrganizerUI'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  requests: VendorRequest[]
  searchQuery: string
  activeTab: StatusFilterTab
  showDetailDrawer: boolean
  summaryCounts: { pending: number; negotiating: number; accepted: number; rejected: number; confirmed: number }
  onSearchChange: (q: string) => void
  onTabChange: (tab: StatusFilterTab) => void
  onRequestClick: (id: string) => void
  onCloseDrawer: () => void
  selectedRequest: VendorRequest | null
  messages: VendorMessage[]
  onSendMessage: (body: string) => Promise<void>
  onStatusUpdate: (requestId: string, newStatus: VendorRequestStatus) => void
  timelineItems: VendorStatusTimelineItem[]
  empty: boolean
  userRole?: string | null
}

export function OrganizerVendorStatusView({
  requests,
  searchQuery,
  activeTab,
  showDetailDrawer,
  summaryCounts,
  onSearchChange,
  onTabChange,
  onRequestClick,
  onCloseDrawer,
  selectedRequest,
  messages,
  onSendMessage,
  onStatusUpdate,
  timelineItems,
  empty,
  userRole,
}: Props) {
  const navigate = useNavigate()

  return (
    <DashboardShell>
      <OrganizerPage>
        <OrganizerPageHeader
          title="Track Vendors"
          description="Track request status, vendor replies, proposed schedules, and booking confirmations across your events."
        />

        <VendorStatusSummaryCards counts={summaryCounts} />

        <OrganizerCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-brand-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by vendor, event, or category..."
              className="pl-10"
            />
          </div>
        </OrganizerCard>

        <VendorStatusTabs activeTab={activeTab} onTabChange={onTabChange} counts={summaryCounts} />

        <div className="space-y-3">
          {requests.map((req) => (
            <VendorRequestCard
              key={req.id}
              request={req}
              onClick={() => onRequestClick(req.id)}
            />
          ))}
        </div>

        {empty && (
          <EmptyStateCard
            title="No vendor requests yet"
            description="Send requests from the Vendor Marketplace and track responses, messages, and confirmations here."
            action={<Button onClick={() => navigate('/organizer/vendor-marketplace')}>Browse Vendor Marketplace</Button>}
          />
        )}
      </OrganizerPage>

      {showDetailDrawer && selectedRequest && (
        <VendorRequestDetailDrawer
          request={selectedRequest}
          messages={messages}
          onSendMessage={onSendMessage}
          onClose={onCloseDrawer}
          onStatusUpdate={onStatusUpdate}
          timelineItems={timelineItems}
          userRole={userRole}
        />
      )}
    </DashboardShell>
  )
}
