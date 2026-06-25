import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'

export interface ComboBoxOption<T> {
  value: T
  label: string
}

interface ComboBoxProps<T> {
  multiple?: boolean
  value: T | null | T[]
  onChange: (value: T | null | T[]) => void
  options: ComboBoxOption<T>[]
  placeholder?: string
  searchIcon?: boolean
}

export function ComboBox<T>({ multiple = false, value, onChange, options, placeholder, searchIcon }: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const selectedValues: T[] = multiple ? (value as T[]) : (value !== null ? [value as T] : [])
  const isSelected = (optValue: T) => selectedValues.some((v) => v === optValue)

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setActiveIndex(-1)
    }
  }, [search])

  const handleSingleSelect = useCallback(
    (opt: ComboBoxOption<T>) => {
      const next = isSelected(opt.value) ? null : opt.value
      onChange(next)
      setOpen(false)
      inputRef.current?.blur()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange]
  )

  const handleMultiSelect = useCallback(
    (opt: ComboBoxOption<T>) => {
      const current = value as T[]
      const next = current.includes(opt.value)
        ? current.filter((v) => v !== opt.value)
        : [...current, opt.value]
      onChange(next)
      inputRef.current?.focus()
    },
    [value, onChange]
  )

  const handleSelect = multiple ? handleMultiSelect : handleSingleSelect

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!open) { setOpen(true); return }
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
      } else if (e.key === 'Enter' && open && activeIndex >= 0) {
        e.preventDefault()
        handleSelect(filteredOptions[activeIndex])
      } else if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    },
    [open, activeIndex, filteredOptions, handleSelect]
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const inputDisplay = () => {
    if (open) return search
    if (multiple) {
      const arr = value as T[]
      return arr.length > 0 ? `${arr.length} selected` : ''
    }
    const single = value as T | null
    return options.find((o) => o.value === single)?.label ?? ''
  }

  const hasValue = multiple ? (value as T[]).length > 0 : value !== null

  return (
    <div ref={containerRef} className="relative min-w-[160px]">
      <div className="relative">
        {searchIcon && (
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputDisplay()}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={[
            'h-7 w-full rounded-full border bg-white text-xs font-medium placeholder:text-slate-400',
            searchIcon ? 'pl-8' : 'pl-3',
            'pr-8',
            open || hasValue
              ? 'border-brand-400 text-slate-700'
              : 'border-slate-200 text-slate-700',
            'focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200',
            'cursor-default',
          ].join(' ')}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen(!open); if (!open) inputRef.current?.focus() }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          aria-label={open ? 'Close dropdown' : 'Open dropdown'}
        >
          {hasValue && !open ? (
            <X
              className="h-3.5 w-3.5 hover:text-slate-700"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(multiple ? [] : null)
                setSearch('')
              }}
            />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {open && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filteredOptions.map((opt, idx) => {
            const sel = isSelected(opt.value)
            const act = idx === activeIndex
            return (
              <button
                key={String(opt.value)}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt) }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={[
                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs',
                  act ? 'bg-brand-50 text-brand-700' : 'text-slate-700',
                  'hover:bg-brand-50 hover:text-brand-700',
                ].join(' ')}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-slate-300">
                  {sel && <Check className="h-2.5 w-2.5 text-brand-600" />}
                </span>
                <span className="flex-1">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {open && filteredOptions.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white py-4 text-center text-xs text-slate-400 shadow-lg">
          No results found
        </div>
      )}
    </div>
  )
}
