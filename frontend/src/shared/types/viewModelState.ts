export type ViewModelStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'submitting'
  | 'refreshing'

export interface ViewModelStateMeta {
  status: ViewModelStatus
  isIdle: boolean
  isLoading: boolean
  isSuccess: boolean
  isEmpty: boolean
  isError: boolean
  isSubmitting: boolean
  isRefreshing: boolean
}

export function buildViewModelStateMeta(input: {
  loading?: boolean
  submitting?: boolean
  refreshing?: boolean
  error?: string | null
  empty?: boolean
  loaded?: boolean
}): ViewModelStateMeta {
  let status: ViewModelStatus = 'idle'
  if (input.error) status = 'error'
  else if (input.submitting) status = 'submitting'
  else if (input.refreshing) status = 'refreshing'
  else if (input.loading) status = 'loading'
  else if (input.empty) status = 'empty'
  else if (input.loaded) status = 'success'

  return {
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isEmpty: status === 'empty',
    isError: status === 'error',
    isSubmitting: status === 'submitting',
    isRefreshing: status === 'refreshing'
  }
}

export interface MutationStateMeta {
  mutationStatus: Extract<ViewModelStatus, 'idle' | 'submitting' | 'success' | 'error'>
  mutationError: string | null
  mutationSuccess: boolean
}
