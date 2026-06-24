import { useVendorStatusViewModel } from '../viewmodels/useVendorStatusViewModel'
import { OrganizerVendorStatusView } from './OrganizerVendorStatusView'

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
      messageInput={vm.messageInput}
      timelineItems={vm.timelineItems}
      empty={vm.isEmpty}
      onSearchChange={vm.setSearchQuery}
      onTabChange={vm.setActiveTab}
      onRequestClick={vm.openRequestDetail}
      onCloseDrawer={vm.closeRequestDetail}
      onMessageInputChange={vm.setMessageInput}
      onSendMessage={vm.sendMessage}
      onStatusUpdate={(id, status) => vm.updateRequestStatus(id, status as any)}
    />
  )
}
