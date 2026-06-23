interface DashboardShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function DashboardShell({ children, sidebar }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-brand-600">Eventify</h1>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">B2B</span>
          </div>
        </div>
      </header>
      <div className="flex max-w-7xl mx-auto">
        {sidebar && (
          <aside className="w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-64px)] p-4 hidden lg:block">
            {sidebar}
          </aside>
        )}
        <main className={`flex-1 p-6 ${sidebar ? 'lg:pl-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
