import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NotFoundPage } from '../shared/components/NotFoundPage'
import { UnauthorizedPage } from '../shared/components/UnauthorizedPage'

const LandingView = lazy(() => import('../features/landing/views/LandingView'))
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

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
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
  if (!requiredRole.includes(role)) return <UnauthorizedPage />
  return <>{children}</>
}

export function AppRoutes({ userRole, profileComplete, loading }: { userRole: string | null; profileComplete: boolean; loading: boolean }) {
  const location = useLocation()
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
            <PageTransition>{userRole ? <RoleRedirect role={userRole} profileComplete={profileComplete} /> : <LoginView />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/register" element={
          <SuspenseWrapper>
            <PageTransition>{userRole ? <RoleRedirect role={userRole} profileComplete={profileComplete} /> : <RegisterView />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/onboarding" element={
          <SuspenseWrapper>
            <PageTransition>{userRole ? <OnboardingView /> : <Navigate to="/login" replace />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/organizer" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerDashboardView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/procurement" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><VendorProcurementView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/portfolio" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><EventPortfolioView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/compare" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><VendorComparisonView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/admin" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['admin']} profileComplete={profileComplete}>
              <PageTransition><AdminDashboardView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/notifications" element={
          <SuspenseWrapper>
            <PageTransition>{userRole ? <NotificationsView /> : <Navigate to="/login" replace />}</PageTransition>
          </SuspenseWrapper>
        } />
        <Route path="/organizer/profile" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['organizer', 'admin']} profileComplete={profileComplete}>
              <PageTransition><OrganizerProfileView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/vendor/profile" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['vendor']} profileComplete={profileComplete}>
              <PageTransition><VendorProfileView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/admin/settings" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['admin']} profileComplete={profileComplete}>
              <PageTransition><AdminSettingsView /></PageTransition>
            </RouteGuard>
          </SuspenseWrapper>
        } />
        <Route path="/vendor" element={
          <SuspenseWrapper>
            <RouteGuard role={userRole} requiredRole={['vendor']} profileComplete={profileComplete}>
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

function RoleRedirect({ role, profileComplete }: { role: string; profileComplete: boolean }) {
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (role === 'vendor') return <Navigate to="/vendor" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/organizer" replace />
}
