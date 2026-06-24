import { DashboardShell } from '../../../shared/components/DashboardShell'
import { EmptyStateCard, OrganizerCard, OrganizerPage, OrganizerPageHeader, SectionHeader } from '../../../shared/components/OrganizerUI'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { ExportActionBar, ReportMetricGrid, ReportTables } from '../../../shared/components/ReportBlocks'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'
import { useReports } from '../viewmodels/useReports'

interface ReportsViewProps {
  role: 'organizer' | 'vendor' | 'admin'
}

export default function ReportsView({ role }: ReportsViewProps) {
  const vm = useReports(role)
  const realtime = useRealtimeSnapshot(`${role}:reports`)

  return (
    <DashboardShell>
      <OrganizerPage>
      <OrganizerPageHeader
        title={`${role.charAt(0).toUpperCase()}${role.slice(1)} Reports`}
        description="Review backend-backed event, vendor request, booking, budget, and contract reporting."
        action={vm.report ? <ExportActionBar onCsv={vm.exportCsv} onPrint={vm.printReport} onPdf={vm.showPdfPlaceholder} /> : undefined}
      />
      <div>
        <RealtimeIndicator snapshot={realtime.snapshot} refreshing={realtime.refreshing || vm.loading} onRefresh={() => { void realtime.refresh(); void vm.loadReport() }} />
      </div>

      {(vm.error || vm.pdfNotice) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm ${vm.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
          <div className="flex items-center justify-between gap-3">
            <span>{vm.error || vm.pdfNotice}</span>
            <button onClick={vm.clearError} className="font-medium">Dismiss</button>
          </div>
        </div>
      )}

      {vm.loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-slate-100" />)}</div>
          <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : vm.report ? (
        <div className="space-y-6">
          <ReportMetricGrid metrics={vm.report.metrics} />
          <div className="grid gap-4 lg:grid-cols-3">
            {['Booking status breakdown', 'Vendor category usage', 'Monthly event activity'].map((title) => (
              <OrganizerCard key={title}>
                <SectionHeader title={title} description="Chart renders when backend aggregation data is available." />
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
                  No chart data available yet
                </div>
              </OrganizerCard>
            ))}
          </div>
          <ReportTables report={vm.report} />
        </div>
      ) : (
        <EmptyStateCard title="No report data" description="Report cards and charts will appear after backend services return real organizer data." />
      )}
      </OrganizerPage>
    </DashboardShell>
  )
}
