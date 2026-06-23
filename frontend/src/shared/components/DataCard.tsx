interface DataCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  selected?: boolean
  onClick?: () => void
}

export function DataCard({ children, className = '', hover = false, selected = false, onClick }: DataCardProps) {
  const base = 'bg-white rounded-xl border p-4 md:p-5'
  const border = selected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
  const hoverClass = hover ? 'hover:shadow-md hover:border-brand-300 transition-all cursor-pointer' : ''

  return (
    <div className={`${base} ${border} ${hoverClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
