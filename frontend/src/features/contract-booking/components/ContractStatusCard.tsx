import { StatusBadge } from '../../../shared/components/StatusBadge'
import { Button } from '../../../shared/components/Button'
import type { ContractDetail } from '../../../services/contractService'
import type { ContractStatus } from '../models/contract-booking.model'

interface ContractStatusCardProps {
  contract: ContractDetail | null
  userRole: string | null
  loading?: boolean
  onCreateContract?: () => void
  onSendContract?: () => void
  onSignOrganizer?: () => void
  onSignVendor?: () => void
  onCancelContract?: () => void
}

function canCreate(contract: ContractDetail | null, userRole: string | null): boolean {
  if (!contract) return true
  return false
}

function canSign(contract: ContractDetail | null, userRole: string | null, asOrganizer: boolean): boolean {
  if (!contract) return false
  if (asOrganizer && contract.contract_status === 'sent') return true
  if (!asOrganizer && contract.contract_status === 'organizer_signed') return true
  return false
}

function canSend(contract: ContractDetail | null, userRole: string | null): boolean {
  if (!contract) return false
  return contract.contract_status === 'draft'
}

function canCancel(contract: ContractDetail | null, userRole: string | null): boolean {
  if (!contract) return false
  const cancellable: ContractStatus[] = ['draft', 'sent', 'organizer_signed', 'vendor_signed', 'active']
  return cancellable.includes(contract.contract_status as ContractStatus)
}

export function ContractStatusCard({
  contract,
  userRole,
  loading,
  onCreateContract,
  onSendContract,
  onSignOrganizer,
  onSignVendor,
  onCancelContract
}: ContractStatusCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-5 bg-gray-100 rounded w-1/3 mb-3 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="font-medium text-gray-900 mb-2">Contract</h4>
        <p className="text-sm text-gray-500 mb-4">No contract yet. Create a contract once the booking is accepted.</p>
        <Button onClick={onCreateContract} disabled={!onCreateContract}>
          Create Contract
        </Button>
      </div>
    )
  }

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      organizer_signed: 'bg-purple-100 text-purple-700',
      vendor_signed: 'bg-indigo-100 text-indigo-700',
      active: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          Contract {contract.contract_number ? `#${contract.contract_number}` : ''}
        </h4>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(contract.contract_status)}`}>
          {contract.contract_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {contract.terms_summary && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{contract.terms_summary}</p>
      )}

      {contract.organizer_signed_at && (
        <p className="text-xs text-gray-500 mb-1">
          Organizer signed: {new Date(contract.organizer_signed_at).toLocaleDateString()}
        </p>
      )}
      {contract.vendor_signed_at && (
        <p className="text-xs text-gray-500 mb-3">
          Vendor signed: {new Date(contract.vendor_signed_at).toLocaleDateString()}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {canSend(contract, userRole) && (
          <Button onClick={onSendContract} disabled={!onSendContract}>Send Contract</Button>
        )}
        {canSign(contract, userRole, true) && (
          <Button onClick={onSignOrganizer} disabled={!onSignOrganizer}>Sign as Organizer</Button>
        )}
        {canSign(contract, userRole, false) && (
          <Button onClick={onSignVendor} disabled={!onSignVendor}>Sign as Vendor</Button>
        )}
        {canCancel(contract, userRole) && (
          <Button variant="danger" onClick={onCancelContract} disabled={!onCancelContract}>Cancel</Button>
        )}
      </div>
    </div>
  )
}
