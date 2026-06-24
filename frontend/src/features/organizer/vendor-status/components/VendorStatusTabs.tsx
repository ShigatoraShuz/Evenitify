import { type StatusFilterTab } from '../models/vendorStatus.model'

interface Props {
  activeTab: StatusFilterTab
  onTabChange: (tab: StatusFilterTab) => void
  counts: Record<string, number>
}

const tabs: { key: StatusFilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'confirmed', label: 'Confirmed' },
]

export function VendorStatusTabs({ activeTab, onTabChange, counts }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        const count = tab.key === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[tab.key] ?? 0

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-navy-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
