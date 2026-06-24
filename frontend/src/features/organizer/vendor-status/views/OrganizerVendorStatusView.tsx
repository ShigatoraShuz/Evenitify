import { type VendorRequest, type StatusFilterTab } from '../models/vendorStatus.model'
import { VendorStatusSummaryCards } from '../components/VendorStatusSummaryCards'
import { VendorStatusTabs } from '../components/VendorStatusTabs'
import { VendorRequestCard } from '../components/VendorRequestCard'
import { VendorRequestDetailDrawer } from '../components/VendorRequestDetailDrawer'
import { DashboardShell } from '../../../../shared/components/DashboardShell'
import { PageHeader } from '../../../../shared/components/PageHeader'
import { Input } from '../../../../shared/components/Input'
import { EmptyState } from '../../../../shared/components/EmptyState'
import { Search } from 'lucide-react'

interface Props {
  requests: VendorRequest[]
  searchQuery: string
  activeTab: StatusFilterTab
  showDetailDrawer: boolean
  summaryCounts: { pending: number; accepted: number; rejected: number; confirmed: number }
  onSearchChange: (q: string) => void
  onTabChange: (tab: StatusFilterTab) => void
  onRequestClick: (id: string) => void
  onCloseDrawer: () => void
  selectedRequest: VendorRequest | null
  messages: any[]
  messageInput: string
  onMessageInputChange: (v: string) => void
  onSendMessage: () => void
  onStatusUpdate: (requestId: string, newStatus: string) => void
  timelineItems: any[]
  empty: boolean
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
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onStatusUpdate,
  timelineItems,
  empty,
}: Props) {
  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader
          title="Vendor Requests"
          subtitle="Track and manage all vendor requests across your events"
        />

        <VendorStatusSummaryCards counts={summaryCounts} />

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by vendor, event, or category..."
            className="pl-10"
          />
        </div>

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
          <EmptyState
            title="No requests found"
            description="Try adjusting your search or filter criteria"
          />
        )}
      </div>

      {showDetailDrawer && selectedRequest && (
        <VendorRequestDetailDrawer
          request={selectedRequest}
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
          onClose={onCloseDrawer}
          onStatusUpdate={onStatusUpdate}
          timelineItems={timelineItems}
        />
      )}
    </DashboardShell>
  )
}
