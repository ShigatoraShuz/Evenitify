import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { BookingMessage } from '../../services/communicationService'

const avatarColors: Record<string, string> = {
  organizer_message: 'bg-indigo-500',
  vendor_message: 'bg-emerald-500',
  admin_note: 'bg-amber-500',
  system_update: 'bg-slate-500'
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function MessageBubble({ message, userRole }: { message: BookingMessage; userRole?: string | null }) {
  const isOwn = (message.type === 'vendor_message' && userRole === 'vendor')
    || (message.type === 'organizer_message' && userRole === 'organizer')

  if (message.type === 'system_update') {
    return (
      <div className="flex justify-center py-1">
        <p className="text-[11px] text-slate-400 italic text-center max-w-[80%]">{message.body}</p>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColors[message.type] || 'bg-slate-500'}`}>
          {getInitials(message.authorName)}
        </div>
      )}
      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-[11px] font-medium text-slate-500 mb-0.5 px-1">{message.authorName}</p>
        )}
        <div className={`px-3.5 py-2 text-sm leading-relaxed ${
          isOwn
            ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm'
        }`}>
          {message.body}
        </div>
        <p className={`text-[10px] text-slate-400 mt-0.5 ${isOwn ? 'text-right' : 'text-left'} px-1`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export function MessageComposer({ onSend }: { onSend?: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [body])

  const handleSend = async () => {
    if (!body.trim() || !onSend) return
    setSending(true)
    try {
      await onSend(body.trim())
      setBody('')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 resize-none rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function InternalNoteCard({ message }: { message: BookingMessage }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-semibold">{message.authorName}</p>
      <p className="mt-1">{message.body}</p>
    </div>
  )
}

export function BookingMessageThread({ messages, onSendMessage, userRole }: {
  messages: BookingMessage[]
  onSendMessage?: (body: string) => Promise<void>
  userRole?: string | null
}) {
  const notes = messages.filter((message) => message.type === 'admin_note')
  const visibleMessages = messages.filter((message) => message.type !== 'admin_note')

  return (
    <section className="flex flex-col">
      <div className="space-y-2 overflow-y-auto max-h-[400px] p-4">
        {visibleMessages.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No messages yet</p>
        )}
        {visibleMessages.map((message) => (
          <MessageBubble key={message.id} message={message} userRole={userRole} />
        ))}
        {notes.length > 0 && (
          <div className="mt-4 space-y-2">
            {notes.map((message) => (
              <InternalNoteCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
      {onSendMessage && <MessageComposer onSend={onSendMessage} />}
    </section>
  )
}
