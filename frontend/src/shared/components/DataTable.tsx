import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { TABLE_BASE, TABLE_CELL, TABLE_HEAD } from '../constants/cardStyles'

export interface Column<T> {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  filterOptions?: { value: string; label: string }[]
  filterValue?: string
  onFilterChange?: (value: string) => void
  onSearch?: (term: string) => void
  pageSize?: number
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchable,
  searchPlaceholder = 'Search…',
  filterOptions,
  filterValue = '',
  onFilterChange,
  onSearch,
  pageSize = 10,
  loading,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filters.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortKey] ?? '')
      const bVal = String((b as Record<string, unknown>)[sortKey] ?? '')
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const handleSearch = () => {
    onSearch?.(searchTerm)
  }

  if (loading) {
    return (
      <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {(searchable || filterOptions) && (
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.3fr)_auto]">
          {searchable && (
            <Input
              label="Search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              hint="Press search to update the table."
            />
          )}
          {filterOptions && onFilterChange && (
            <Select
              label="Filter"
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              options={filterOptions}
              placeholder="All"
            />
          )}
          {searchable && (
            <div className="flex items-end">
              <Button onClick={handleSearch} fullWidth>
                Search
              </Button>
            </div>
          )}
        </div>
      )}

      {paginated.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className={TABLE_BASE}>
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={TABLE_HEAD}
                    aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 text-left font-semibold text-slate-500 transition hover:text-slate-950"
                      >
                        <span>{col.label}</span>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] text-slate-300">↕</span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((row) => (
                <tr key={keyExtractor(row)} className="transition-colors hover:bg-slate-50/80">
                  {columns.map((col) => (
                    <td key={col.key} className={`${TABLE_CELL} align-top`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
