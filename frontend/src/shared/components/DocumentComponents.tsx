import { useState, useRef } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'
import type { DocumentMetadata } from '../../services/documentService'

export function ContractDocumentCard({ document, onPreview }: { document: DocumentMetadata; onPreview: (document: DocumentMetadata) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{document.title}</h3>
          <p className="text-sm text-slate-500">{document.fileName}</p>
          {document.uploadedAt && <p className="mt-1 text-xs text-slate-400">Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</p>}
        </div>
        <StatusBadge status={document.state} size="sm" />
      </div>
      <Button variant="ghost" onClick={() => onPreview(document)} className="mt-3">Preview metadata</Button>
    </div>
  )
}

export function UploadDocumentDropzone({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Upload document</p>
      <p className="mt-1 text-xs text-slate-500">Attach files to this event portfolio.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          ref={fileRef}
          type="file"
          onChange={handleFile}
          className={[
            'min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm',
            'file:mr-3 file:rounded file:border-0 file:bg-brand-50',
            'file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-700',
          ].join(' ')}
        />
        {uploading && <span className="text-sm text-slate-500">Uploading...</span>}
      </div>
    </div>
  )
}

export function AttachmentList({ documents, onPreview }: { documents: DocumentMetadata[]; onPreview: (document: DocumentMetadata) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {documents.map((document) => <ContractDocumentCard key={document.id} document={document} onPreview={onPreview} />)}
    </div>
  )
}

export function DocumentPreviewModal({ document, onClose }: { document: DocumentMetadata | null; onClose: () => void }) {
  return (
    <Modal open={!!document} onClose={onClose} title="Document metadata">
      {document && (
        <div className="space-y-3 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">Title:</span> {document.title}</p>
          <p><span className="font-medium text-slate-900">File:</span> {document.fileName}</p>
          <p><span className="font-medium text-slate-900">State:</span> {document.state}</p>
          <p><span className="font-medium text-slate-900">Notes:</span> {document.notes || 'No notes'}</p>
        </div>
      )}
    </Modal>
  )
}
