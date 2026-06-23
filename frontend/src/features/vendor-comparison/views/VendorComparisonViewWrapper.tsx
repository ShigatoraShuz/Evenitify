import { useVendorComparison } from '../viewmodels/useVendorComparison'
import { VendorComparisonView } from './VendorComparisonView'

export default function VendorComparisonViewWrapper() {
  const vm = useVendorComparison()

  return (
    <VendorComparisonView
      compareVendors={vm.compareVendors}
      shortlist={vm.shortlist}
      loading={vm.loading}
      error={vm.error}
      onRemoveFromCompare={vm.removeFromCompare}
      onClearComparison={vm.clearComparison}
      onAddToShortlist={vm.addToShortlist}
      onRemoveFromShortlist={vm.removeFromShortlist}
      isInShortlist={vm.isInShortlist}
      onClearError={vm.clearError}
    />
  )
}
