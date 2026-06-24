import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { VendorAvailability } from '../models/vendorMarketplace.model'

interface VendorAvailabilityCalendarProps {
  availability: VendorAvailability
  selectedDate: string | null
  eventDate: string | null
  onSelectDate: (date: string) => void
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function VendorAvailabilityCalendar({
  availability,
  selectedDate,
  eventDate,
  onSelectDate,
}: VendorAvailabilityCalendarProps) {
  const [viewMonth, setViewMonth] = useState(availability.month)
  const [viewYear, setViewYear] = useState(availability.year)

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate()
  }, [viewYear, viewMonth])

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).getDay()
  }, [viewYear, viewMonth])

  const monthDays = useMemo(() => {
    const days = availability.days.filter((d) => {
      const date = new Date(d.date)
      return date.getMonth() + 1 === viewMonth && date.getFullYear() === viewYear
    })
    const calendar: Array<{ date: string; day: number; status: string; isCurrentMonth: boolean }> = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push({ date: '', day: 0, status: '', isCurrentMonth: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayData = days.find((day) => day.date === dateStr)
      calendar.push({
        date: dateStr,
        day: d,
        status: dayData?.status || 'available',
        isCurrentMonth: true,
      })
    }

    return calendar
  }, [availability.days, viewMonth, viewYear, daysInMonth, firstDayOfWeek])

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const statusColor = (status: string, date: string) => {
    if (date === selectedDate) return 'bg-brand-600 text-white ring-2 ring-brand-300'
    if (date === eventDate) return 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      case 'occupied': return 'bg-red-50 text-red-400 cursor-not-allowed'
      case 'partial': return 'bg-amber-50 text-amber-700 hover:bg-amber-100'
      case 'booked': return 'bg-slate-100 text-slate-400 cursor-not-allowed'
      default: return 'bg-slate-50 text-slate-400'
    }
  }

  const statusLabel: Record<string, string> = {
    available: 'Available',
    occupied: 'Occupied',
    partial: 'Partially booked',
    booked: 'Booked',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {new Date(viewYear, viewMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_HEADERS.map((header) => (
          <div key={header} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1">
            {header}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((cell, idx) => (
          <div key={idx} className="aspect-square">
            {cell.isCurrentMonth ? (
              <button
                onClick={() => {
                  if (cell.status !== 'occupied' && cell.status !== 'booked') {
                    onSelectDate(cell.date)
                  }
                }}
                disabled={cell.status === 'occupied' || cell.status === 'booked'}
                className={`w-full h-full flex items-center justify-center text-xs font-medium rounded-lg transition-all ${statusColor(cell.status, cell.date)}`}
                title={`${cell.date}: ${statusLabel[cell.status] || cell.status}`}
              >
                {cell.day}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" /> Partial</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-50 border border-red-200" /> Occupied</span>
      </div>
    </div>
  )
}
