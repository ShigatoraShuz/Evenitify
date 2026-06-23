import { useState } from 'react'
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

function getDisabledReason(action: string, contract: ContractDetail | null, userRole: string | null): string | null {
  if (!contract) return null
  switch (action) {
    case 'send':
      if (contract.contract_status !== 'draft') return 'Contract must be in draft status to send.'
      if (userRole !== 'organizer') return 'Only the organizer can send the contract.'
      return null
    case 'sign_organizer':
      if (contract.contract_status !== 'sent') return 'Contract must be in "Sent" status to sign as organizer.'
      if (userRole !== 'organizer') return 'Only the organizer can sign at this stage.'
      return null
    case 'sign_vendor':
      if (contract.contract_status !== 'organizer_signed') return 'Organizer must sign first before vendor can sign.'
      if (userRole !== 'vendor') return 'Only the assigned vendor can sign.'
      return null
    case 'cancel': {
      const cancellable: ContractStatus[] = ['draft', 'sent', 'organizer_signed', 'vendor_signed', 'active']
      if (!cancellable.includes(contract.contract_status as ContractStatus)) return 'Contract cannot be cancelled in its current status.'
      return null
    }
    case 'create':
      return null
    default:
      return null
  }
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
  const [expanded, setExpanded] = useState(false)

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

  const sendReason = getDisabledReason('send', contract, userRole)
  const signOrgReason = getDisabledReason('sign_organizer', contract, userRole)
  const signVendorReason = getDisabledReason('sign_vendor', contract, userRole)
  const cancelReason = getDisabledReason('cancel', contract, userRole)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          Contract {contract.contract_number ? `#${contract.contract_number}` : ''}
        </h4>
        <StatusBadge status={contract.contract_status} size="sm" />
      </div>

      {contract.terms_summary && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-left text-gray-600 hover:text-gray-900 w-full"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Terms Summary</span>
              <span className="text-brand-600 text-xs">{expanded ? 'Collapse' : 'Expand'}</span>
            </div>
            <p className={`mt-1 ${expanded ? '' : 'line-clamp-2'}`}>{contract.terms_summary}</p>
          </button>
        </div>
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
        <div className="relative group">
          <Button
            onClick={onSendContract}
            disabled={!onSendContract || !!sendReason}
          >
            Send Contract
          </Button>
          {sendReason && (
            <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {sendReason}
            </div>
          )}
        </div>

        <div className="relative group">
          <Button
            onClick={onSignOrganizer}
            disabled={!onSignOrganizer || !!signOrgReason}
          >
            Sign as Organizer
          </Button>
          {signOrgReason && (
            <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {signOrgReason}
            </div>
          )}
        </div>

        <div className="relative group">
          <Button
            onClick={onSignVendor}
            disabled={!onSignVendor || !!signVendorReason}
          >
            Sign as Vendor
          </Button>
          {signVendorReason && (
            <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {signVendorReason}
            </div>
          )}
        </div>

        <div className="relative group">
          <Button
            variant="danger"
            onClick={onCancelContract}
            disabled={!onCancelContract || !!cancelReason}
          >
            Cancel
          </Button>
          {cancelReason && (
            <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {cancelReason}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
