export type DocumentState = 'not_uploaded' | 'uploaded' | 'pending_review' | 'approved' | 'rejected'

export interface DocumentMetadata {
  id: string
  ownerId: string
  title: string
  fileName: string
  state: DocumentState
  uploadedAt: string | null
  reviewedAt: string | null
  notes?: string
}

const mockDocuments: DocumentMetadata[] = [
  {
    id: 'doc-contract-template',
    ownerId: 'system',
    title: 'Contract template',
    fileName: 'standard-contract.pdf',
    state: 'approved',
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'Mock metadata only. No file storage is connected.'
  }
]

export const documentService = {
  listDocuments: async (ownerId = 'system'): Promise<DocumentMetadata[]> =>
    mockDocuments.filter((doc) => doc.ownerId === ownerId || doc.ownerId === 'system'),

  mockUpload: async (ownerId: string, fileName: string, title = 'Uploaded document'): Promise<DocumentMetadata> => ({
    id: `doc-${Date.now()}`,
    ownerId,
    title,
    fileName,
    state: 'pending_review',
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
    notes: 'Mock upload metadata only. The file is not persisted.'
  })
}
