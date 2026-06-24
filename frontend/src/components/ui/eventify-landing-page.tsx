import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'

interface SoftButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  onClick?: () => void
}

import { BackgroundCarousel } from '../../shared/components/BackgroundCarousel'


const navItems = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'Vendors', href: '#vendors' },
  { label: 'Events', href: '#events' },
  { label: 'How It Works', href: '#how-it-works' },
]

const statItems = [
  { value: '120+', label: 'Large Events Managed' },
  { value: '40+', label: 'Vendor Categories' },
]

const trustedBrands = ['ExpoHub', 'VenuePro', 'Gatherly']

const currentYear = new Date().getFullYear()

function SoftButton({ children, variant = 'primary', onClick }: SoftButtonProps) {
  const base =
    'inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow cursor-pointer'
  const styles = {
    primary:
      'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 shadow-brand-500/10',
    outline:
      'border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600 bg-white hover:bg-slate-50',
  }

  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  )
}

function PlanetOrbitSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 text-white/80">
      <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
      <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <circle cx="60" cy="60" r="7" fill="currentColor" opacity="0.9" />
      <circle cx="60" cy="12" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="94" cy="60" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

function AnimatedBars() {
  const bars = [40, 65, 45, 80, 55, 70, 50]

  return (
    <div className="flex items-end gap-1.5 h-24">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: h }}
          transition={{
            duration: 0.6,
            delay: 0.2 + i * 0.08,
            ease: 'easeOut' as const,
          }}
          className="w-3 rounded-t"
          style={{
            backgroundColor: i === 3 ? '#2563eb' : '#bfdbfe',
          }}
        />
      ))}
    </div>
  )
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Eventify</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 border border-brand-200 rounded px-1.5 py-0.5">
              B2B
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block text-sm text-gray-600 hover:text-brand-600"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Eventify</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 border border-brand-700 rounded px-1.5 py-0.5">
              B2B
            </span>
          </div>
          <p className="text-sm">
            &copy; {currentYear} Eventify. Organizer Vendor Procurement Platform.
          </p>
        </div>
      </div>
    </footer>
  )
}

interface EventifyLandingPageProps {
  onStartPlanning?: () => void
  onBrowseVendors?: () => void
  demoPanel?: React.ReactNode
}

const spr = { ease: 'easeOut' as const }

export default function EventifyLandingPage({
  onStartPlanning,
  onBrowseVendors,
  demoPanel,
}: EventifyLandingPageProps) {
  return (
    <div className="min-h-screen bg-transparent font-sans relative overflow-hidden">
      <BackgroundCarousel />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <Navbar />

      <main className="relative z-10">
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0, ...spr }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight"
                >
                  Procure vendors for{' '}
                  <span className="text-brand-600">large events</span> with
                  clarity.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ...spr }}
                  className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg"
                >
                  Eventify helps organizers plan large-scale events, define
                  requirements, discover verified vendors, and manage B2B
                  booking requests in one organized workspace.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ...spr }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <SoftButton onClick={onStartPlanning}>
                    Start Planning
                    <ArrowRight size={16} />
                  </SoftButton>
                  <SoftButton variant="outline" onClick={onBrowseVendors}>
                    Browse Vendors
                  </SoftButton>
                </motion.div>
                {demoPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.28, ...spr }}
                    className="mt-6"
                  >
                    {demoPanel}
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, ...spr }}
                  className="rounded-2xl p-5 text-white bg-gradient-to-br from-brand-950 via-brand-900 to-brand-850 border border-brand-850/30 shadow-md hover:shadow-xl hover:shadow-brand-950/10 hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col"
                >
                  <ShieldCheck size={28} className="mb-3 text-brand-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 mb-1">
                    Verified Workflow
                  </span>
                  <p className="text-sm text-brand-100/90 leading-relaxed">
                    Secure vendor requests and organized procurement tracking.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.42, ...spr }}
                  className="rounded-2xl p-5 text-white bg-gradient-to-br from-brand-600 to-brand-500 border border-brand-500/20 shadow-md hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col items-center justify-center"
                >
                  <PlanetOrbitSVG />
                  <p className="text-sm text-brand-50 leading-relaxed text-center mt-3">
                    Discover vendors across categories in one workspace.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.54, ...spr }}
                  className="rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Budget Overview
                    </span>
                    <BarChart3 size={18} className="text-brand-500" />
                  </div>
                  <AnimatedBars />
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    ₱240,000
                  </p>
                  <p className="text-xs text-gray-450">
                    Estimated event allocation
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.66, ...spr }}
                  className="rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col"
                >
                  <ClipboardCheck size={24} className="text-brand-500 mb-3" />
                  <span className="text-xs font-semibold text-gray-450 uppercase tracking-wider mb-1">
                    Event Requirements
                  </span>
                  <ul className="space-y-2 mt-1">
                    {['Catering', 'Lights & Sound', 'Venue', 'Staff'].map(
                      (item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-gray-600 font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statItems.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1, ...spr }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-extrabold text-brand-600">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">
              Trusted by Organizers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {trustedBrands.map((brand, i) => (
                <motion.span
                  key={brand}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ...spr }}
                  className="text-lg md:text-xl font-bold text-gray-300 tracking-wide"
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
