export interface ReportMetric {
  label: string
  value: string | number
  helper?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface ReportTable {
  title: string
  columns: string[]
  rows: Array<Record<string, string | number | null>>
}

export interface ReportBundle {
  title: string
  subtitle: string
  generatedAt: string
  metrics: ReportMetric[]
  tables: ReportTable[]
}

function escapeCsvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function reportToCsv(report: ReportBundle) {
  const lines = [`${escapeCsvCell(report.title)}`, `${escapeCsvCell(report.subtitle)}`, `Generated,${report.generatedAt}`, '']
  report.metrics.forEach((metric) => {
    lines.push(`${escapeCsvCell(metric.label)},${escapeCsvCell(metric.value)},${escapeCsvCell(metric.helper)}`)
  })
  report.tables.forEach((table) => {
    lines.push('', table.title, table.columns.map(escapeCsvCell).join(','))
    table.rows.forEach((row) => {
      lines.push(table.columns.map((column) => escapeCsvCell(row[column])).join(','))
    })
  })
  return lines.join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
