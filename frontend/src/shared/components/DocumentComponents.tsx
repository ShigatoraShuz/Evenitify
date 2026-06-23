import { useState } from 'react'
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

export function UploadDocumentDropzone({ onMockUpload }: { onMockUpload: (fileName: string) => void }) {
  const [fileName, setFileName] = useState('')
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Mock document upload</p>
      <p className="mt-1 text-xs text-slate-500">Stores metadata only. No files are persisted.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="filename.pdf" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <Button onClick={() => { if (fileName.trim()) { onMockUpload(fileName.trim()); setFileName('') } }}>Add metadata</Button>
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
