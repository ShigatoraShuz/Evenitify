import { CheckCircle2, Clock, Send, Eye, FileText, MessageSquare, ThumbsUp, FileSignature, CheckCheck } from 'lucide-react'
import { type VendorStatusTimelineItem } from '../models/vendorStatus.model'

interface Props {
  items: VendorStatusTimelineItem[]
}

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  draft: Clock,
  sent: Send,
  viewed: Eye,
  quoted: FileText,
  negotiating: MessageSquare,
  accepted: ThumbsUp,
  contract_pending: FileSignature,
  confirmed: CheckCheck,
}

export function VendorStatusTimeline({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Timeline</h3>
      <div className="relative">
        {items.map((item, idx) => {
          const Icon = statusIcons[item.status] || CheckCircle2
          const isLast = idx === items.length - 1
          const isActive = idx === items.length - 1

          return (
            <div key={item.id} className="flex gap-3 pb-4 relative">
              {!isLast && (
                <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-slate-200" />
              )}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${isActive ? 'text-brand-700' : 'text-slate-600'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
