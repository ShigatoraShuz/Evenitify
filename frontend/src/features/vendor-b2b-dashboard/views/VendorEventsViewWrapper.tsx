import { VendorEventsView } from './VendorEventsView'
import { useVendorEventsViewModel } from '../viewmodels/useVendorEventsViewModel'

export default function VendorEventsViewWrapper() {
  const vm = useVendorEventsViewModel()

  return (
    <VendorEventsView
      events={vm.events}
      loading={vm.loading}
      refreshing={vm.refreshing}
      submitting={vm.submitting}
      error={vm.error}
      loadedOnce={vm.loadedOnce}
      finishingEventId={vm.finishingEventId}
      onRefreshEvents={vm.loadEvents}
      onCompleteEvent={vm.completeEvent}
      onClearError={vm.clearError}
    />
  )
}
