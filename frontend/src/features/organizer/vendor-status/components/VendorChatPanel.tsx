import { Send } from 'lucide-react'
import { type VendorMessage } from '../models/vendorStatus.model'
import { VendorChatMessage } from './VendorChatMessage'

interface Props {
  messages: VendorMessage[]
  messageInput: string
  onMessageInputChange: (v: string) => void
  onSendMessage: () => void
}

export function VendorChatPanel({ messages, messageInput, onMessageInputChange, onSendMessage }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Messages</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No messages yet</p>
        )}
        {messages.map((msg) => (
          <VendorChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
          />
          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-navy-700 text-white flex items-center justify-center hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
