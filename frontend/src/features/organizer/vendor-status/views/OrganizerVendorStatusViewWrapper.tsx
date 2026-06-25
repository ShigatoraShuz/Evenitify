import { useVendorStatusViewModel } from '../viewmodels/useVendorStatusViewModel'
import { OrganizerVendorStatusView } from './OrganizerVendorStatusView'
import type { VendorRequestStatus } from '../models/vendorStatus.model'

export default function OrganizerVendorStatusViewWrapper() {
  const vm = useVendorStatusViewModel()

  return (
    <OrganizerVendorStatusView
      requests={vm.requests}
      searchQuery={vm.searchQuery}
      activeTab={vm.activeTab}
      showDetailDrawer={vm.showDetailDrawer}
      summaryCounts={vm.summaryCounts}
      selectedRequest={vm.selectedRequest}
      messages={vm.messages}
      timelineItems={vm.timelineItems}
      empty={vm.isEmpty}
      userRole={vm.userRole}
      onSearchChange={vm.setSearchQuery}
      onTabChange={vm.setActiveTab}
      onRequestClick={vm.openRequestDetail}
      onCloseDrawer={vm.closeRequestDetail}
      onSendMessage={vm.sendMessage}
      onStatusUpdate={(id, status: VendorRequestStatus) => vm.updateRequestStatus(id, status)}
    />
  )
}
