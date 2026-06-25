import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Clock3, ShieldCheck } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../lib/utils'
import type {
  AvailabilityStatus,
  BlockedDate,
  VendorAvailabilityPreview,
} from '../../services/availabilityService'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_STYLES: Record<AvailabilityStatus, { label: string; badge: string; dot: string; panel: string }> = {
  available: {
    label: 'Available',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    panel: 'border-emerald-100 bg-emerald-50/60',
  },
  limited: {
    label: 'Limited',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    panel: 'border-amber-100 bg-amber-50/60',
  },
  unavailable: {
    label: 'Unavailable',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    panel: 'border-rose-100 bg-rose-50/60',
  },
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateInput(value: string) {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoDate) {
    const [, year, month, day] = isoDate
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + amount)
  return next
}

function addYears(date: Date, amount: number) {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + amount)
  return next
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function formatLongDate(value: string) {
  return parseDateInput(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMonthYearShort(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function formatUpdatedAt(value: string) {
  const date = parseDateInput(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildMonthCells(baseMonth: Date) {
  const first = startOfMonth(baseMonth)
  const last = endOfMonth(baseMonth)
  const cells: Array<Date | null> = []

  for (let i = 0; i < first.getDay(); i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(new Date(baseMonth.getFullYear(), baseMonth.getMonth(), day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function getAvailabilityEntry(preview: VendorAvailabilityPreview | null, date: Date) {
  if (!preview) return null
  const key = toDateKey(date)
  return preview.days.find((item) => item.date.slice(0, 10) === key) ?? null
}

function getOverrideEntry(
  overrides: Record<string, AvailabilityStatus>,
  date: Date
) {
  return overrides[toDateKey(date)] ?? null
}

export function AvailabilityStatusPill({ status }: { status: AvailabilityStatus }) {
  const meta = STATUS_STYLES[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
        meta.badge
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

export function DateConflictBanner({ preview }: { preview: VendorAvailabilityPreview | null }) {
  if (!preview?.conflictDate) return null

  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <CircleAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-rose-900">Conflict detected</p>
          <p className="mt-1 text-sm text-rose-700">
            {formatLongDate(preview.conflictDate)}
            {preview.conflictReason ? ` - ${preview.conflictReason}` : ' overlaps with an existing booking.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function DayCell({
  date,
  preview,
  editable,
  status,
  onSetStatus,
}: {
  date: Date
  preview: VendorAvailabilityPreview | null
  editable: boolean
  status: AvailabilityStatus | null
  onSetStatus: (dateKey: string, nextStatus: AvailabilityStatus) => void
}) {
  const clickTimerRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const isToday = toDateKey(date) === toDateKey(new Date())
  const dateKey = toDateKey(date)
  const entry = getAvailabilityEntry(preview, date)
  const displayStatus = status ?? entry?.status ?? null

  const clearTimers = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const setStatus = (nextStatus: AvailabilityStatus) => {
    onSetStatus(dateKey, nextStatus)
  }

  const handleClick = () => {
    if (!editable) return
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    clearTimers()
    clickTimerRef.current = window.setTimeout(() => {
      setStatus('available')
      clickTimerRef.current = null
    }, 240)
  }

  const handleDoubleClick = () => {
    if (!editable) return
    clearTimers()
    setStatus('limited')
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!editable || event.button !== 0) return
    clearTimers()
    suppressClickRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true
      setStatus('unavailable')
      longPressTimerRef.current = null
    }, 520)
  }

  const handlePointerUp = () => {
    clearTimers()
  }

  const handlePointerLeave = () => {
    clearTimers()
  }

  const baseClasses = cn(
    'group flex aspect-square min-h-[84px] flex-col rounded-3xl border p-3 text-left transition-all',
    editable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'
  )

  if (!displayStatus) {
    const emptyCell = (
      <>
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold">{date.getDate()}</span>
          {isToday && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Today</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className={cn('h-2 w-2 rounded-full', editable ? 'bg-brand-300' : 'bg-slate-300')} />
          {editable && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">
              Set
            </span>
          )}
        </div>
      </>
    )

    if (!editable) {
      return (
        <div className={cn(baseClasses, 'border-dashed border-slate-200 bg-white/80 text-slate-400', isToday && 'border-brand-200 bg-brand-50/40 text-brand-700')}>
          {emptyCell}
        </div>
      )
    }

    return (
      <button
        type="button"
        className={cn(baseClasses, 'border-dashed border-slate-200 bg-white/80 text-slate-400', isToday && 'border-brand-200 bg-brand-50/40 text-brand-700')}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        onContextMenu={(event) => event.preventDefault()}
      >
        {emptyCell}
      </button>
    )
  }

  const meta = STATUS_STYLES[displayStatus]

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{date.getDate()}</span>
        {isToday && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm">Today</span>}
      </div>
      <div className="mt-auto space-y-2">
        <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
      </div>
    </>
  )

  if (!editable) {
    return (
      <div
        className={cn(
          baseClasses,
          meta.panel,
          displayStatus === 'unavailable' && 'ring-1 ring-rose-200',
          displayStatus === 'limited' && 'ring-1 ring-amber-200',
          displayStatus === 'available' && 'ring-1 ring-emerald-200',
          isToday && 'shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        meta.panel,
        displayStatus === 'unavailable' && 'ring-1 ring-rose-200',
        displayStatus === 'limited' && 'ring-1 ring-amber-200',
        displayStatus === 'available' && 'ring-1 ring-emerald-200',
        isToday && 'shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onContextMenu={(event) => event.preventDefault()}
    >
      {content}
    </button>
  )
}

function MonthPanel({
  month,
  preview,
  editable,
  overrides,
  onSetStatus,
}: {
  month: Date
  preview: VendorAvailabilityPreview | null
  editable: boolean
  overrides: Record<string, AvailabilityStatus>
  onSetStatus: (dateKey: string, nextStatus: AvailabilityStatus) => void
}) {
  const cells = buildMonthCells(month)
  const previewCount = preview?.days.length ?? 0

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Month</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">{formatMonthLabel(month)}</h3>
          <p className="mt-1 text-xs text-slate-500">{previewCount} previewed days loaded</p>
        </div>
        <AvailabilityStatusPill status={preview?.status ?? 'available'} />
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="px-2 text-center">
            {weekday}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {cells.map((cell, index) =>
          cell ? (
            <DayCell
              key={toDateKey(cell)}
              date={cell}
              preview={preview}
              editable={editable}
              status={getOverrideEntry(overrides, cell)}
              onSetStatus={onSetStatus}
            />
          ) : (
            <div key={`pad-${index}`} className="aspect-square min-h-[84px] rounded-3xl border border-transparent bg-transparent" />
          )
        )}
      </div>
    </div>
  )
}

function YearGrid({
  cursor,
  onSelectYear,
  yearRange,
}: {
  cursor: Date
  onSelectYear: (year: number) => void
  yearRange: [number, number]
}) {
  const center = cursor.getFullYear()
  const blockStart = Math.max(yearRange[0], Math.floor((center - yearRange[0]) / 12) * 12 + yearRange[0])
  const years = Array.from({ length: 12 }, (_, index) => blockStart + index).filter(
    (year) => year >= yearRange[0] && year <= yearRange[1]
  )

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Year view</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Choose a year</h3>
        </div>
        <AvailabilityStatusPill status="available" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {years.map((year) => {
          const active = year === center
          return (
            <button
              key={year}
              type="button"
              onClick={() => onSelectYear(year)}
              className={cn(
                'rounded-2xl border px-4 py-5 text-left transition-all',
                active
                  ? 'border-brand-300 bg-brand-50 text-brand-800 shadow-sm'
                  : 'border-slate-200 bg-slate-50/40 text-slate-700 hover:border-brand-200 hover:bg-white'
              )}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {active ? 'Selected' : 'Year'}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{year}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AvailabilityCalendar({
  preview,
  className,
  yearRange = [2000, 2040],
  editable = false,
  onDateStatusChange,
}: {
  preview: VendorAvailabilityPreview | null
  className?: string
  yearRange?: [number, number]
  editable?: boolean
  onDateStatusChange?: (dateKey: string, nextStatus: AvailabilityStatus) => void
}) {
  const initialCursor = useMemo(() => {
    if (preview?.days?.length) {
      return parseDateInput(preview.days[0].date)
    }
    return new Date()
  }, [preview])

  const [mode, setMode] = useState<'month' | 'year'>('month')
  const [cursor, setCursor] = useState<Date>(initialCursor)
  const [overrides, setOverrides] = useState<Record<string, AvailabilityStatus>>({})

  useEffect(() => {
    setCursor(initialCursor)
  }, [initialCursor])

  const monthLabels = useMemo(() => {
    const current = startOfMonth(cursor)
    return [current, addMonths(current, 1)]
  }, [cursor])

  const previewRange = useMemo(() => {
    if (!preview?.days?.length) return null
    const dates = preview.days.map((day) => parseDateInput(day.date)).sort((a, b) => a.getTime() - b.getTime())
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    }
  }, [preview])

  const movePrevious = () => {
    setCursor(mode === 'month' ? addMonths(cursor, -1) : addYears(cursor, -12))
  }

  const moveNext = () => {
    setCursor(mode === 'month' ? addMonths(cursor, 1) : addYears(cursor, 12))
  }

  const handleSetDateStatus = (dateKey: string, nextStatus: AvailabilityStatus) => {
    setOverrides((current) => ({ ...current, [dateKey]: nextStatus }))
    onDateStatusChange?.(dateKey, nextStatus)
  }

  return (
    <div className={cn('rounded-[34px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6', className)}>
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-600">Availability Planner</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {mode === 'month' ? formatMonthLabel(cursor) : `Planning ${cursor.getFullYear()}`}
              </h2>
              {preview?.status && <AvailabilityStatusPill status={preview.status} />}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <Clock3 className="h-4 w-4 text-slate-400" />
                {preview?.updatedAt ? `Updated ${formatUpdatedAt(preview.updatedAt)}` : 'No recent update'}
              </span>
              {previewRange && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatMonthYearShort(previewRange.start)} to {formatMonthYearShort(previewRange.end)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 px-0 py-0"
              onClick={movePrevious}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === 'month' ? 'year' : 'month')}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              {mode === 'month' ? 'Month view' : 'Year view'}
            </button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 px-0 py-0"
              onClick={moveNext}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
          <DateConflictBanner preview={preview} />
          {!preview?.conflictDate && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {preview ? 'Availability loaded' : 'No availability preview yet'}
              </span>
              <span className="text-xs text-slate-500">
                Use the planner to review the current month and the next month at a glance.
              </span>
            </div>
          )}
        </div>

        {mode === 'month' ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <MonthPanel month={monthLabels[0]} preview={preview} editable={editable} overrides={overrides} onSetStatus={handleSetDateStatus} />
            <MonthPanel month={monthLabels[1]} preview={preview} editable={editable} overrides={overrides} onSetStatus={handleSetDateStatus} />
          </div>
        ) : (
          <YearGrid cursor={cursor} onSelectYear={(year) => {
            const next = new Date(cursor)
            next.setFullYear(year)
            setCursor(next)
            setMode('month')
          }} yearRange={yearRange} />
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Legend</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['available', 'limited', 'unavailable'] as AvailabilityStatus[]).map((status) => (
              <AvailabilityStatusPill key={status} status={status} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BlockedDateList({ dates }: { dates: BlockedDate[] }) {
  if (!dates.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        No blocked dates yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dates.map((date) => (
        <div key={date.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{formatLongDate(date.date)}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{date.reason}</p>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              Blocked
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AvailabilityQuickUpdate({
  status,
  updating,
  onUpdate,
}: {
  status: AvailabilityStatus
  updating: boolean
  onUpdate: (status: AvailabilityStatus) => void
}) {
  return (
    <div className="space-y-4">
      <div className={cn('rounded-3xl border p-4', STATUS_STYLES[status].panel)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Current status</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{STATUS_STYLES[status].label}</p>
          </div>
          <AvailabilityStatusPill status={status} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(['available', 'limited', 'unavailable'] as AvailabilityStatus[]).map((nextStatus) => {
          const active = status === nextStatus
          return (
            <Button
              key={nextStatus}
              type="button"
              variant={active ? 'primary' : 'secondary'}
              loading={updating && active}
              disabled={updating && !active}
              onClick={() => onUpdate(nextStatus)}
              className={cn(
                'w-full rounded-2xl py-3 text-sm font-semibold',
                active && 'shadow-lg shadow-brand-500/10'
              )}
            >
              {STATUS_STYLES[nextStatus].label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
