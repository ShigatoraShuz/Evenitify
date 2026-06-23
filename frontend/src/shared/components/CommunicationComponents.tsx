import type { BookingMessage } from '../../services/communicationService'
import { Button } from './Button'

const bubbleStyles: Record<BookingMessage['type'], string> = {
  organizer_message: 'bg-indigo-50 border-indigo-100 text-indigo-950',
  vendor_message: 'bg-emerald-50 border-emerald-100 text-emerald-950',
  admin_note: 'bg-amber-50 border-amber-100 text-amber-950',
  system_update: 'bg-gray-50 border-gray-100 text-gray-700'
}

export function MessageBubble({ message }: { message: BookingMessage }) {
  return (
    <article className={`rounded-xl border p-3 ${bubbleStyles[message.type]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">{message.authorName}</p>
        <p className="text-xs opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
      </div>
      <p className="mt-1 text-sm leading-6">{message.body}</p>
    </article>
  )
}

export function MessageComposer() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
      <label className="text-xs font-semibold text-gray-500" htmlFor="disabled-message-composer">Message composer</label>
      <textarea
        id="disabled-message-composer"
        disabled
        value="Messaging backend is not connected yet."
        className="mt-2 min-h-20 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500"
        readOnly
      />
      <div className="mt-2 flex justify-end">
        <Button disabled>Send message</Button>
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

export function BookingMessageThread({ messages }: { messages: BookingMessage[] }) {
  const notes = messages.filter((message) => message.type === 'admin_note')
  const visibleMessages = messages.filter((message) => message.type !== 'admin_note')

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-950">Booking conversation</h3>
        <p className="text-sm text-gray-500">Frontend placeholder for organizer, vendor, system, and admin message types.</p>
      </div>
      <div className="space-y-3">
        {visibleMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {notes.map((message) => (
            <InternalNoteCard key={message.id} message={message} />
          ))}
        </div>
      )}
      <div className="mt-4">
        <MessageComposer />
      </div>
    </section>
  )
}

