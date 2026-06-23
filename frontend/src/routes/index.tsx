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
const NotificationsView = lazy(() => import('../features/notifications/views/NotificationsViewWrapper'))
const OnboardingView = lazy(() => import('../features/onboarding/views/OnboardingViewWrapper'))
const VendorComparisonView = lazy(() => import('../features/vendor-comparison/views/VendorComparisonViewWrapper'))
const OrganizerProfileView = lazy(() => import('../features/user-settings/views/OrganizerProfileViewWrapper'))
const VendorProfileView = lazy(() => import('../features/user-settings/views/VendorProfileViewWrapper'))
const AdminSettingsView = lazy(() => import('../features/user-settings/views/AdminSettingsViewWrapper'))

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
  profileComplete: boolean
  children: React.ReactNode
}

function RouteGuard({ role, requiredRole, profileComplete, children }: RouteGuardProps) {
  if (!role) return <Navigate to="/login" replace />
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (!requiredRole.includes(role)) {
    if (role === 'organizer') return <Navigate to="/organizer" replace />
    if (role === 'vendor') return <Navigate to="/vendor" replace />
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRoutes({ userRole, profileComplete, loading }: { userRole: string | null; profileComplete: boolean; loading: boolean }) {
  return (
    <Routes>
      <Route path="/" element={
        <SuspenseWrapper>
          <LandingView />
        </SuspenseWrapper>
      } />
      <Route path="/login" element={
        <SuspenseWrapper>
          {userRole ? <RoleRedirect role={userRole} profileComplete={profileComplete} /> : <LoginView />}
        </SuspenseWrapper>
      } />
      <Route path="/register" element={
        <SuspenseWrapper>
          {userRole ? <RoleRedirect role={userRole} profileComplete={profileComplete} /> : <RegisterView />}
        </SuspenseWrapper>
      } />
      <Route path="/onboarding" element={
        <SuspenseWrapper>
          {userRole ? <OnboardingView /> : <Navigate to="/login" replace />}
        </SuspenseWrapper>
      } />
      <Route path="/organizer" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
            <OrganizerDashboardView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/organizer/procurement" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
            <VendorProcurementView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/organizer/portfolio" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
            <EventPortfolioView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/organizer/compare" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
            <VendorComparisonView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/admin" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['admin']} profileComplete={profileComplete}>
            <AdminDashboardView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/notifications" element={
        <SuspenseWrapper>
          {userRole ? <NotificationsView /> : <Navigate to="/login" replace />}
        </SuspenseWrapper>
      } />
      <Route path="/organizer/profile" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
            <OrganizerProfileView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/vendor/profile" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['vendor']} profileComplete={profileComplete}>
            <VendorProfileView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/admin/settings" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['admin']} profileComplete={profileComplete}>
            <AdminSettingsView />
          </RouteGuard>
        </SuspenseWrapper>
      } />
      <Route path="/vendor" element={
        <SuspenseWrapper>
          <RouteGuard role={userRole} requiredRole={['vendor']} profileComplete={profileComplete}>
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

function RoleRedirect({ role, profileComplete }: { role: string; profileComplete: boolean }) {
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (role === 'vendor') return <Navigate to="/vendor" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/organizer" replace />
}


