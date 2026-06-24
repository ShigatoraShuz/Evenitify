import { useState } from 'react'
import { CalendarDays, Plus, Package } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { Modal } from '../../../shared/components/Modal'
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
  onClearError: () => void
}

export function VendorServicesView({
  services,
  loading,
  submitting,
  onCreateServicePackage,
}: VendorServicesViewProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)

  const handleCreate = async (data: Parameters<typeof onCreateServicePackage>[0], imageFile?: File) => {
    // Call viewmodel – any error will be thrown back for the form to handle
    await onCreateServicePackage(data, imageFile)
    // Success: close modal after the short success animation in the form
    // (the form does setTimeout 1200ms then calls onCancel itself)
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <PageHeader
          title="Create Event"
          subtitle="Manage the services and packages you offer to organizers."
          action={
            <Button onClick={() => setIsServiceModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Service Package
            </Button>
          }
        />

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                let parsedDesc: { text: string; image: string | null } = { text: service.description || '', image: null }
                try {
                  if (service.description?.startsWith('{')) {
                    parsedDesc = JSON.parse(service.description)
                  }
                } catch (e) { }

                const statusColorMap: Record<string, string> = {
                  available: 'bg-emerald-50 border-emerald-100',
                  limited: 'bg-amber-50 border-amber-100',
                  unavailable: 'bg-rose-50 border-rose-100',
                }
                const cardAccent = statusColorMap[service.availability_status] || 'bg-white border-slate-100'

                return (
                  <div
                    key={service.id}
                    className="group rounded-[28px] border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  >
                    {parsedDesc.image ? (
                      <div className="w-full h-52 bg-slate-100 relative overflow-hidden">
                        <img
                          src={parsedDesc.image}
                          alt={service.service_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-full h-52 flex flex-col items-center justify-center border-b ${cardAccent} transition-colors group-hover:bg-brand-50`}>
                        <Package className="w-14 h-14 text-slate-200 group-hover:text-brand-200 transition-colors mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand-400 transition-colors">
                          {service.category}
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{service.service_name}</h3>
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap border border-emerald-100 shrink-0">
                          ₱{service.base_price?.toLocaleString() || '0'}
                        </span>
                      </div>

                      {parsedDesc.text ? (
                        <p className="text-sm text-slate-500 mb-5 flex-1 line-clamp-2 leading-relaxed">
                          {parsedDesc.text}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-300 italic mb-5 flex-1">No description provided.</p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        {!parsedDesc.image && (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            {service.category}
                          </span>
                        )}
                        <div className={!parsedDesc.image ? '' : 'ml-auto'}>
                          <StatusBadge status={service.availability_status} size="sm" />
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
