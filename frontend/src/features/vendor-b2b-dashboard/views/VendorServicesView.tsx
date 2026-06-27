import { useState } from 'react'
import { Plus, Package, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { Modal } from '../../../shared/components/Modal'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ServicePackageForm } from '../components/ServicePackageForm'
import type { VendorService } from '../../../services/vendorService'

interface VendorServicesViewProps {
  services: VendorService[]
  loading: boolean
  submitting: boolean
  error: string | null
  onCreateServicePackage: (data: {
    category: string
    serviceName: string
    description: string
    basePrice: number
    availabilityStatus: string
  }, imageFile?: File) => Promise<void>
  onDeleteServicePackage: (serviceId: string) => Promise<void>
  onClearError: () => void
}

export function VendorServicesView({
  services,
  loading,
  submitting,
  error,
  onCreateServicePackage,
  onDeleteServicePackage,
  onClearError,
}: VendorServicesViewProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<VendorService | null>(null)

  const handleCreate = async (data: Parameters<typeof onCreateServicePackage>[0], imageFile?: File) => {
    await onCreateServicePackage(data, imageFile)
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return
    await onDeleteServicePackage(serviceToDelete.id)
    setServiceToDelete(null)
  }

  return (
    <DashboardShell>
      <ConfirmDialog
        open={!!serviceToDelete}
        title="Delete service"
        message={`Delete "${serviceToDelete?.service_name || 'this service'}"? This will remove it from your vendor profile.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setServiceToDelete(null)}
      />

      <div className="space-y-8">
        <PageHeader
          title="Services"
          subtitle="Manage the services and packages you offer to organizers."
          action={
            <Button onClick={() => setIsServiceModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Service Package
            </Button>
          }
        />

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="font-medium text-rose-500 hover:text-rose-700">
              Dismiss
            </button>
          </div>
        )}

        <section>
          {loading && services.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              title="No services created yet"
              description="Create your first service package to start receiving bookings from organizers."
              action={
                <Button onClick={() => setIsServiceModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Create Service Package
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {services.map((service) => {
                let parsedDesc: { text: string; image: string | null } = { text: service.description || '', image: null }
                try {
                  if (service.description?.startsWith('{')) {
                    parsedDesc = JSON.parse(service.description)
                  }
                } catch {
                  parsedDesc = { text: service.description || '', image: null }
                }

                const statusColorMap: Record<string, string> = {
                  available: 'bg-emerald-50 border-emerald-100',
                  limited: 'bg-amber-50 border-amber-100',
                  unavailable: 'bg-rose-50 border-rose-100',
                }
                const cardAccent = statusColorMap[service.availability_status] || 'bg-white border-slate-100'

                return (
                  <div
                    key={service.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {parsedDesc.image ? (
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <img
                          src={parsedDesc.image}
                          alt={service.service_name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex aspect-[16/10] flex-col items-center justify-center border-b ${cardAccent} transition-colors group-hover:bg-brand-50`}
                      >
                        <Package className="mb-1.5 h-10 w-10 text-slate-200 transition-colors group-hover:text-brand-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-brand-400">
                          {service.category}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{service.service_name}</h3>
                          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                            Service package
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-emerald-700">
                          PHP {service.base_price?.toLocaleString() || '0'}
                        </span>
                      </div>

                      {parsedDesc.text ? (
                        <p className="mb-4 flex-1 text-[13px] leading-5 text-slate-500 line-clamp-2">
                          {parsedDesc.text}
                        </p>
                      ) : (
                        <p className="mb-4 flex-1 text-[13px] italic text-slate-300">No description provided.</p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
                        <div className="min-w-0">
                          {!parsedDesc.image && (
                            <span className="inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                              {service.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={service.availability_status} size="sm" />
                          <button
                            type="button"
                            onClick={() => setServiceToDelete(service)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete ${service.service_name}`}
                            title={`Delete ${service.service_name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title=""
      >
        <ServicePackageForm
          onSubmit={handleCreate}
          loading={submitting}
          onCancel={() => setIsServiceModalOpen(false)}
        />
      </Modal>
    </DashboardShell>
  )
}
