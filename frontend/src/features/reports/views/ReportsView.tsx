import { DashboardShell } from '../../../shared/components/DashboardShell'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
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
      <PageHeader
        title={`${role.charAt(0).toUpperCase()}${role.slice(1)} Reports`}
        subtitle="Frontend MVP reporting with CSV export and print support"
        action={<ExportActionBar onCsv={vm.exportCsv} onPrint={vm.printReport} onPdf={vm.showPdfPlaceholder} />}
      />
      <div className="mb-4">
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
          <ReportTables report={vm.report} />
        </div>
      ) : (
        <EmptyState title="No report data" description="Report data will appear after the service responds." />
      )}
    </DashboardShell>
  )
}
