import { useState, useMemo } from 'react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

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
  searchPlaceholder = 'Search...',
  filterOptions,
  filterValue = '',
  onFilterChange,
  onSearch,
  pageSize = 10,
  loading,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filters',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const handleSearch = () => {
    onSearch?.(searchTerm)
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortKey] ?? '')
      const bVal = String((b as Record<string, unknown>)[sortKey] ?? '')
      const cmp = aVal.localeCompare(bVal)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {(searchable || filterOptions) && (
        <div className="flex gap-3 mb-4">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          )}
          {filterOptions && onFilterChange && (
            <Select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              options={filterOptions}
              className="w-40"
            />
          )}
          {searchable && <Button onClick={handleSearch}>Search</Button>}
        </div>
      )}

      {paginated.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="bg-white rounded-xl border overflow-x-auto" role="table">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`text-left px-4 py-3 font-medium text-gray-600 ${col.sortable ? 'cursor-pointer hover:text-gray-900 select-none' : ''}`}
                    aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <span className="text-xs" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
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
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
