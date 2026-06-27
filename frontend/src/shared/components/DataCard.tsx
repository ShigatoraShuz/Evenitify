interface DataCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  selected?: boolean
  onClick?: () => void
}

export function DataCard({ children, className = '', hover = false, selected = false, onClick }: DataCardProps) {
  const base = 'rounded-[28px] border bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] md:p-5'
  const border = selected ? 'border-cyan-300 ring-2 ring-cyan-100' : 'border-white/10'
  const hoverClass = hover ? 'cursor-pointer transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]' : ''

  return (
    <div className={`${base} ${border} ${hoverClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
