import type { CommandSearchResult, QuickAction } from '../../services/commandService'
import { Button } from './Button'
import { Modal } from './Modal'

export function GlobalSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search events, vendors, bookings, contracts, notifications..."
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
      autoFocus
    />
  )
}

export function SearchResultItem({ item, onSelect }: { item: CommandSearchResult; onSelect: (path: string) => void }) {
  return (
    <button onClick={() => onSelect(item.path)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-cyan-300/30 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] capitalize text-slate-300">{item.type}</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
    </button>
  )
}

export function QuickActionItem({ action, onSelect }: { action: QuickAction; onSelect: (path: string) => void }) {
  return (
    <button onClick={() => onSelect(action.path)} className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-3 text-left transition-colors hover:border-cyan-300/30 hover:bg-white/10">
      <p className="text-sm font-semibold text-white">{action.label}</p>
      <p className="mt-1 text-xs text-slate-400">{action.description}</p>
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
            <h3 className="text-sm font-semibold text-white">Results</h3>
            <span className="text-xs text-slate-400">{results.length} found</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {results.map((item) => (
              <SearchResultItem key={item.id} item={item} onSelect={onSelect} />
            ))}
            {results.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">No results found.</p>}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Quick actions</h3>
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
