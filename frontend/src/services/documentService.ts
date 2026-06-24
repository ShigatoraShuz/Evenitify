import { api } from './apiClient'
import { getApiBaseUrl } from '../config/apiConfig'

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

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('supabase.auth.token')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.access_token || null
  } catch {
    return null
  }
}

async function uploadDocumentFile(
  ownerId: string,
  file: File,
  title?: string
): Promise<DocumentMetadata> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('ownerId', ownerId)
  if (title) formData.append('title', title)

  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${getApiBaseUrl()}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData
  })

  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error?.message || 'Upload failed')
  }
  return json.data
}

export const documentService = {
  listDocuments: async (ownerId = 'system'): Promise<DocumentMetadata[]> =>
    api.get<DocumentMetadata[]>(`/documents?ownerId=${encodeURIComponent(ownerId)}`),

  uploadDocument: uploadDocumentFile,

  listByOwner: async (ownerId: string): Promise<DocumentMetadata[]> =>
    api.get<DocumentMetadata[]>(`/documents?ownerId=${encodeURIComponent(ownerId)}`)
}
