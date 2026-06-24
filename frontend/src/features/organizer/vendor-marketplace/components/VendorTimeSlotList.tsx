import type { TimeSlotType } from '../models/vendorMarketplace.model'

const DEFAULT_SLOTS = [
  { label: 'Morning (8AM - 12PM)', value: 'morning' as TimeSlotType },
  { label: 'Afternoon (12PM - 5PM)', value: 'afternoon' as TimeSlotType },
  { label: 'Evening (5PM - 10PM)', value: 'evening' as TimeSlotType },
  { label: 'Full Day', value: 'full_day' as TimeSlotType },
]

interface VendorTimeSlotListProps {
  slots: Array<{ label: string; value: TimeSlotType; isOccupied: boolean }>
  selectedSlot: TimeSlotType | null
  onSelectSlot: (slot: TimeSlotType) => void
}

export function VendorTimeSlotList({ slots, selectedSlot, onSelectSlot }: VendorTimeSlotListProps) {
  if (slots.length === 0) {
    slots = DEFAULT_SLOTS.map((s) => ({ ...s, isOccupied: false }))
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.value}
          onClick={() => !slot.isOccupied && onSelectSlot(slot.value)}
          disabled={slot.isOccupied}
          className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
            slot.isOccupied
              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
              : selectedSlot === slot.value
              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200'
              : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <span className="block">{slot.label}</span>
          {slot.isOccupied && <span className="block text-[10px] text-slate-300 mt-0.5">Occupied</span>}
        </button>
      ))}
    </div>
  )
}
