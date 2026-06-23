import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const LandingView = lazy(() => import('../features/landing/view/LandingView'))
const LoginView = lazy(() => import('../features/auth/views/LoginViewWrapper'))
const RegisterView = lazy(() => import('../features/auth/views/RegisterViewWrapper'))
const OrganizerDashboardView = lazy(() => import('../features/organizer-dashboard/views/OrganizerDashboardViewWrapper'))
const VendorProcurementView = lazy(() => import('../features/vendor-procurement/views/VendorProcurementViewWrapper'))
const VendorB2BDashboardView = lazy(() => import('../features/vendor-b2b-dashboard/views/VendorB2BDashboardViewWrapper'))
const EventPortfolioView = lazy(() => import('../features/contract-booking/views/EventPortfolioViewWrapper'))
const AdminDashboardView = lazy(() => import('../features/admin-operations/views/AdminDashboardViewWrapper'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

interface RouteGuardProps {
  role: string | null
  requiredRole: string[]
  children: React.ReactNode
}

function RouteGuard({ role, requiredRole, children }: RouteGuardProps) {
  if (!role) return <Navigate to="/login" replace />
  if (!requiredRole.includes(role)) {
    if (role === 'organizer') return <Navigate to="/organizer" replace />
    if (role === 'vendor') return <Navigate to="/vendor" replace />
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRoutes({ userRole, loading }: { userRole: string | null; loading: boolean }) {
  return (
    <Routes>
      <Route path="/" element={
        <SuspenseWrapper>
          <LandingView />
        </SuspenseWrapper>
      } />
      <Route path="/login" element={
        <SuspenseWrapper>
          {userRole ? <RoleRedirect role={userRole} /> : <LoginView />}
        </SuspenseWrapper>
      } />
      <Route path="/register" element={
        <SuspenseWrapper>
          {userRole ? <RoleRedirect role={userRole} /> : <RegisterView />}
        </SuspenseWrapper>
      } />
      <Route path="/organizer" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']}>
            <OrganizerDashboardView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/organizer/procurement" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']}>
            <VendorProcurementView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/organizer/portfolio" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']}>
            <EventPortfolioView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/admin" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['admin']}>
            <AdminDashboardView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/vendor" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['vendor']}>
            <VendorB2BDashboardView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="*" element={
        loading ? <LoadingFallback /> : <Navigate to={userRole ? (userRole === 'vendor' ? '/vendor' : userRole === 'admin' ? '/admin' : '/organizer') : '/login'} replace />
      } />
    </Routes>
  )
}

function RoleRedirect({ role }: { role: string }) {
  if (role === 'vendor') return <Navigate to="/vendor" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/organizer" replace />
}
