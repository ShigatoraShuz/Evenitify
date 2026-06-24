import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NotFoundPage } from '../shared/components/NotFoundPage'
import { UnauthorizedPage } from '../shared/components/UnauthorizedPage'
import type { UserProfile, UserRole } from '../services/authService'

const LandingView = lazy(() => import('../features/landing/views/LandingView'))
const LoginView = lazy(() => import('../features/auth/views/LoginViewWrapper'))
const RegisterView = lazy(() => import('../features/auth/views/RegisterViewWrapper'))
const ChooseRoleView = lazy(() => import('../features/auth/views/ChooseRoleViewWrapper'))
const OrganizerDashboardView = lazy(() => import('../features/organizer-dashboard/views/OrganizerDashboardViewWrapper'))
const OrganizerPlanEventView = lazy(() => import('../features/organizer/plan-event/views/OrganizerPlanEventViewWrapper'))
const VendorMarketplaceView = lazy(() => import('../features/organizer/vendor-marketplace/views/VendorMarketplaceViewWrapper'))
const VendorB2BDashboardView = lazy(() => import('../features/vendor-b2b-dashboard/views/VendorB2BDashboardViewWrapper'))
const EventPortfolioView = lazy(() => import('../features/contract-booking/views/EventPortfolioViewWrapper'))
const AdminDashboardView = lazy(() => import('../features/admin-operations/views/AdminDashboardViewWrapper'))
const NotificationsView = lazy(() => import('../features/notifications/views/NotificationsViewWrapper'))
const OnboardingView = lazy(() => import('../features/onboarding/views/OnboardingViewWrapper'))
const VendorComparisonView = lazy(() => import('../features/vendor-comparison/views/VendorComparisonViewWrapper'))
const OrganizerVendorStatusView = lazy(() => import('../features/organizer/vendor-status/views/OrganizerVendorStatusViewWrapper'))
const OrganizerProfileView = lazy(() => import('../features/user-settings/views/OrganizerProfileViewWrapper'))
const VendorProfileView = lazy(() => import('../features/user-settings/views/VendorProfileViewWrapper'))
const AdminSettingsView = lazy(() => import('../features/user-settings/views/AdminSettingsViewWrapper'))
const OrganizerReportsView = lazy(() => import('../features/reports/views/OrganizerReportsViewWrapper'))
const VendorReportsView = lazy(() => import('../features/reports/views/VendorReportsViewWrapper'))
const AdminReportsView = lazy(() => import('../features/reports/views/AdminReportsViewWrapper'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
}

interface RouteGuardProps {
  authenticated: boolean
  role: UserRole | null
  roles: UserRole[]
  roleChosen: boolean
  requiredRole: UserRole[]
  profileComplete: boolean
  loading: boolean
  children: React.ReactNode
}

function RouteGuard({ authenticated, role, roles, roleChosen, requiredRole, profileComplete, loading, children }: RouteGuardProps) {
  if (loading) return <LoadingFallback />
  if (!authenticated) return <Navigate to="/login" replace />
  if (!roleChosen) return <Navigate to="/choose-role" replace />
  if (!role) return <Navigate to="/choose-role" replace />
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (!roles.some((userRole) => requiredRole.includes(userRole))) return <UnauthorizedPage />
  return <>{children}</>
}

export function AppRoutes({
  user,
  activeRole,
  userRoles,
  roleChosen,
  profileComplete,
  loading
}: {
  user: UserProfile | null
  activeRole: UserRole | null
  userRoles: UserRole[]
  roleChosen: boolean
  profileComplete: boolean
  loading: boolean
}) {
  const location = useLocation()
  const userRole = activeRole
  const publicAuthEntry = new URLSearchParams(location.search).get('entry') === 'landing'
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <SuspenseWrapper>
            <PageTransition><LandingView /></PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/login" element={
          <SuspenseWrapper>
            <PageTransition>{user && !publicAuthEntry ? <RoleRedirect role={userRole} roleChosen={roleChosen} profileComplete={profileComplete} /> : <LoginView />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/register" element={
          <SuspenseWrapper>
            <PageTransition>{user && !publicAuthEntry ? <RoleRedirect role={userRole} roleChosen={roleChosen} profileComplete={profileComplete} /> : <RegisterView />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/choose-role" element={
          <SuspenseWrapper>
            <PageTransition>{user ? <ChooseRoleView /> : <Navigate to="/login" replace />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/onboarding" element={
          <SuspenseWrapper>
            <PageTransition>{user ? (roleChosen ? <OnboardingView /> : <Navigate to="/choose-role" replace />) : <Navigate to="/login" replace />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/organizer" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerDashboardView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/plan-event" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerPlanEventView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/procurement" element={<Navigate to="/organizer/vendor-marketplace" replace />} />
        <Route path="/organizer/procurement/marketplace" element={<Navigate to="/organizer/vendor-marketplace" replace />} />
        <Route path="/organizer/vendor-marketplace" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><VendorMarketplaceView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/vendor-status" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerVendorStatusView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/portfolio" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><EventPortfolioView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/compare" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><VendorComparisonView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/reports" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerReportsView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/admin" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['admin']} profileComplete={profileComplete}>
              <PageTransition><AdminDashboardView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/admin/reports" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['admin']} profileComplete={profileComplete}>
              <PageTransition><AdminReportsView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/notifications" element={
          <SuspenseWrapper>
            <PageTransition>{user ? (roleChosen ? <NotificationsView /> : <Navigate to="/choose-role" replace />) : <Navigate to="/login" replace />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/profile" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerProfileView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/vendor/profile" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['vendor']} profileComplete={profileComplete}>
              <PageTransition><VendorProfileView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/vendor/reports" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['vendor']} profileComplete={profileComplete}>
              <PageTransition><VendorReportsView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/admin/settings" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['admin']} profileComplete={profileComplete}>
              <PageTransition><AdminSettingsView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/vendor" element={
          <SuspenseWrapper>
            <RouteGuard loading={loading} authenticated={!!user} role={userRole} roles={userRoles} roleChosen={roleChosen} requiredRole={['vendor']} profileComplete={profileComplete}>
              <PageTransition><VendorB2BDashboardView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/404" element={
          <SuspenseWrapper>
            <PageTransition><NotFoundPage /></PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="*" element={
          loading ? <LoadingFallback /> : <PageTransition><NotFoundPage /></PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function RoleRedirect({ role, roleChosen, profileComplete }: { role: UserRole | null; roleChosen: boolean; profileComplete: boolean }) {
  if (!roleChosen) return <Navigate to="/choose-role" replace />
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (role === 'vendor') return <Navigate to="/vendor" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/organizer" replace />
}
