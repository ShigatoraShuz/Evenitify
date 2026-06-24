import { type VendorMessage } from '../models/vendorStatus.model'

interface Props {
  message: VendorMessage
}

export function VendorChatMessage({ message }: Props) {
  const isOrganizer = message.senderRole === 'organizer'
  const isSystem = message.senderRole === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-full">
          {message.message}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOrganizer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isOrganizer
            ? 'bg-navy-700 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-800 rounded-bl-md'
        }`}
      >
        <p>{message.message}</p>
        <p className={`text-xs mt-1 ${isOrganizer ? 'text-white/60' : 'text-slate-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      </div>
    </div>
  )
}
