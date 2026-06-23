import type { CommandSearchResult, QuickAction } from '../../services/commandService'
import { Button } from './Button'
import { Modal } from './Modal'

export function GlobalSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search events, vendors, bookings, contracts, notifications..."
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      autoFocus
    />
  )
}

export function SearchResultItem({ item, onSelect }: { item: CommandSearchResult; onSelect: (path: string) => void }) {
  return (
    <button onClick={() => onSelect(item.path)} className="w-full rounded-lg border border-gray-100 bg-white p-3 text-left hover:border-brand-200 hover:bg-brand-50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-950">{item.title}</p>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{item.type}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>
    </button>
  )
}

export function QuickActionItem({ action, onSelect }: { action: QuickAction; onSelect: (path: string) => void }) {
  return (
    <button onClick={() => onSelect(action.path)} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-left hover:border-brand-200 hover:bg-white">
      <p className="text-sm font-semibold text-gray-950">{action.label}</p>
      <p className="mt-1 text-xs text-gray-500">{action.description}</p>
    </button>
  )
}

export function CommandPalette({
  open,
  query,
  results,
  quickActions,
  onQueryChange,
  onClose,
  onSelect
}: {
  open: boolean
  query: string
  results: CommandSearchResult[]
  quickActions: QuickAction[]
  onQueryChange: (value: string) => void
  onClose: () => void
  onSelect: (path: string) => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Search and quick actions">
      <div className="space-y-4">
        <GlobalSearchInput value={query} onChange={onQueryChange} />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-950">Results</h3>
            <span className="text-xs text-gray-500">{results.length} found</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {results.map((item) => (
              <SearchResultItem key={item.id} item={item} onSelect={onSelect} />
            ))}
            {results.length === 0 && <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">No matching mock records.</p>}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-950">Quick actions</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionItem key={action.id} action={action} onSelect={onSelect} />
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

