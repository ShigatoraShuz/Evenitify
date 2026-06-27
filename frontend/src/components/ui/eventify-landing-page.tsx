import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Quote,
} from 'lucide-react'
import CircularTestimonials from './CircularTestimonials'
import AnimatedMarqueeHero from './hero-3'
import Footer7 from './footer-7'
import { BackgroundCarousel } from '../../shared/components/BackgroundCarousel'

interface SoftButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  onClick?: () => void
}

const navItems = [
  { label: 'Platform', href: '#solutions' },
  { label: 'Marketplace', href: '#vendors' },
  { label: 'Booking Flow', href: '#events' },
  { label: 'Workflow', href: '#how-it-works' },
]

const statItems = [
  { value: '120+', label: 'Large events managed' },
  { value: '40+', label: 'Vendor categories' },
  { value: '98%', label: 'Repeat client satisfaction' },
  { value: '24h', label: 'Average response window' },
]

const trustedBrands = ['Manila Expo', 'Cebu Gather', 'Pampanga Live']

const testimonials = [
  {
    quote:
      'We replaced scattered spreadsheets with one control room for sourcing, approvals, and vendor messaging. The team finally works from the same plan for Makati events.',
    name: 'Mara Santos',
    designation: 'Operations Director, Makati Skyline Events',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  },
  {
    quote:
      'Eventify makes procurement feel designed, not improvised. The vendor comparisons are fast, and the event brief stays readable even under pressure during Cebu resort events.',
    name: 'Daniel Reyes',
    designation: 'Head of Events, Cebu Coral Hall',
    src: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1200&auto=format&fit=crop',
  },
  {
    quote:
      'We can move from request to shortlist without losing context. That kind of clarity changes how confidently our team can run Davao conferences and destination weddings.',
    name: 'Priya Nair',
    designation: 'Procurement Lead, Davao Event Studio',
    src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
  },
]

const heroImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
]

const currentYear = new Date().getFullYear()
const sectionCard = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'
const sectionHeading = 'text-sm font-bold uppercase tracking-[0.22em] text-brand-700'
const sectionTitle = 'text-2xl sm:text-3xl font-extrabold text-slate-950'
const sectionBody = 'text-sm sm:text-base leading-6 text-slate-700'
const compactCard = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

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
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-brand-200 bg-white shadow-sm">
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-brand-600" aria-hidden="true">
                <path
                  d="M8 21.5C8 13.5 12.5 9 20.5 9H24v3.5h-3.3c-5.5 0-8.7 3.2-8.7 9v1.2c0 3.1 1.8 4.8 4.9 4.8H24V31H15.2C10 31 8 28.8 8 23.7v-2.2Z"
                  fill="currentColor"
                />
                <circle cx="23" cy="8" r="3" fill="currentColor" opacity="0.9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-brand-600">Eventify</span>
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
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/18 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-amber-400/16 rounded-full blur-[100px] pointer-events-none z-0" />
      <Navbar />

      <main className="relative z-10">
        <AnimatedMarqueeHero
          tagline="Eventify Organizer-Vendor Procurement Platform"
          title={
            <>
              Procure vendors for <span className="text-brand-600">Philippine events</span> with
              clarity and momentum.
            </>
          }
          description={
            'Eventify is a web-based Organizer-Vendor Procurement Platform that helps event organizers find, request, book, and manage vendors for large-scale events. It connects organizers, vendors, and admins in one workspace so event plans, service requests, schedules, booking statuses, and communication stay organized from planning to confirmation.'
          }
          ctaText="Start Planning"
          images={heroImages}
          onCtaClick={onStartPlanning}
          className="pt-28 pb-10 lg:pt-32 lg:pb-16"
        />

        <section id="solutions" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
              <div className="max-w-xl">
                <p className={sectionHeading}>Platform</p>
                <h2 className={`mt-3 ${sectionTitle}`}>One platform for organizers, vendors, and admins.</h2>
                <p className={`mt-3 ${sectionBody}`}>
                  Eventify keeps planning, vendor discovery, request handling, and progress tracking in one connected
                  system.
                </p>
              </div>

              <div id="vendors" className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={sectionHeading}>Marketplace</p>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-950">
                      Vendor discovery and management.
                    </h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-700">
                    Organizers browse categories, compare services, and request bookings from one marketplace.
                    Vendors manage profiles, availability, incoming requests, and event communication in one place.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      title: 'Vendor Marketplace',
                      text: 'Browse vendor categories, compare services, and request bookings from one marketplace.',
                    },
                    {
                      title: 'Vendor Dashboard',
                      text: 'Manage profiles, availability, incoming requests, and event communication in one place.',
                    },
                    {
                      title: 'Admin Oversight',
                      text: 'Oversee users, bookings, and platform activity with a clear view of the system.',
                    },
                  ].map((item) => (
                    <div key={item.title} className={compactCard}>
                      <h4 className="text-base font-bold text-slate-950">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="events" className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-700/20 bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-sm">
                <h3 className="text-xl font-extrabold">Event planning and booking status</h3>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  Organizers create event plans, send booking requests, track vendor responses, and manage
                  requirements from draft to confirmed booking.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-950">Communication and contracts</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Eventify keeps communication, booking review, and contract management in one traceable flow through
                  the procurement cycle.
                </p>
              </div>
            </div>

            <div id="how-it-works" className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Create the event plan',
                  text: 'Draft requirements, budgets, and service needs for the event.',
                },
                {
                  step: '02',
                  title: 'Request and compare vendors',
                  text: 'Browse vendors, send requests, and track responses as they move through the workflow.',
                },
                {
                  step: '03',
                  title: 'Confirm and manage',
                  text: 'Approve bookings, manage schedules, and keep communication aligned until the event is done.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold tracking-[0.28em] text-brand-700">{item.step}</p>
                  <h3 className="mt-2 text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.02, ...spr }}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-sm"
                >
                  <Sparkles size={14} />
                  Designed for Philippine event procurement
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0, ...spr }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 leading-[1.1] tracking-tight"
                >
                  Procure vendors for{' '}
                  <span className="text-brand-600">Philippine events</span> with
                  clarity and momentum.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ...spr }}
                  className="mt-6 text-lg text-slate-700 leading-relaxed max-w-lg"
                >
                  Eventify helps organizers plan corporate functions, fiestas,
                  destination weddings, and venue activations across the
                  Philippines in one organized workspace.
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

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.34, ...spr }}
                  className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
                >
                  {[
                    'Briefs that travel with every vendor review',
                    'Fast shortlist decisions with fewer handoffs',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                    >
                      <Quote size={16} className="text-brand-600 mb-2" />
                      <p className={sectionBody}>{item}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, ...spr }}
                  className={[
                    'rounded-2xl p-5 text-white bg-gradient-to-br',
                    'from-brand-950 via-brand-900 to-brand-850',
                    'border border-brand-850/30 shadow-md',
                    'hover:shadow-xl hover:shadow-brand-950/10',
                    'hover:-translate-y-0.5 transition-all duration-300',
                    'min-h-[180px] flex flex-col',
                  ].join(' ')}
                >
                  <ShieldCheck size={28} className="mb-3 text-brand-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 mb-1">
                    Verified Workflow
                  </span>
                  <p className="text-sm text-brand-100/90 leading-relaxed">
                    Secure vendor requests and organized procurement tracking for Philippine event teams.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.42, ...spr }}
                  className={[
                    'rounded-3xl p-6 text-white bg-gradient-to-br',
                    'from-brand-700 to-brand-500 border',
                    'border-brand-500/20 shadow-sm',
                    'transition-all duration-300 min-h-[180px]',
                    'flex flex-col items-center justify-center',
                  ].join(' ')}
                >
                  <PlanetOrbitSVG />
                  <p className="text-sm text-brand-50 leading-relaxed text-center mt-3">
                    Discover vendors across categories in one workspace for Manila, Cebu, and beyond.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.54, ...spr }}
                  className="rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Budget Overview
                    </span>
                    <BarChart3 size={18} className="text-brand-600" />
                  </div>
                  <AnimatedBars />
                  <p className="text-xl font-bold text-gray-900 mt-2">PHP 240,000</p>
                  <p className="text-xs text-slate-600">
                    Estimated event allocation for a PH event brief
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.66, ...spr }}
                  className="rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-[180px] flex flex-col"
                >
                  <ClipboardCheck size={24} className="text-brand-600 mb-3" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Event Requirements
                  </span>
                  <ul className="space-y-2 mt-1">
                    {['Catering', 'Lights & Sound', 'Venue', 'Fiesta Styling'].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.5, ...spr }}
              >
                <p className="text-xs font-semibold tracking-[0.3em] text-brand-500 uppercase">
                  Social proof
                </p>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Real event teams use Eventify to manage vendor discovery, booking requests, and event operations in one place.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
                  The platform keeps organizer workflows, vendor dashboards, booking status tracking, and communication connected so large events stay moving without scattered handoffs.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {[
                    'Event plans stay attached to every vendor request',
                    'Shortlists stay easy to share with stakeholders',
                  ].map((item) => (
                    <div key={item} className={sectionCard}>
                      <Quote size={16} className="text-brand-600 mb-2" />
                      <p className={sectionBody}>{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.55, ...spr }}
                className="justify-self-end w-full"
              >
                <CircularTestimonials testimonials={testimonials} />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
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
                  <p className="text-3xl md:text-4xl font-extrabold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold tracking-widest text-slate-700 uppercase mb-6">
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
                  className="text-lg md:text-xl font-bold text-slate-900 tracking-wide"
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer7
        description={
          'Eventify is a web-based Organizer-Vendor Procurement Platform that helps organizers find, request, book, and manage vendors for large-scale events. ' +
          'Organizers, vendors, and admins work in one connected system for event planning, booking status tracking, scheduling, and communication.'
        }
        sections={[
          {
            title: 'Product',
            links: [
              { name: 'Overview', href: '#solutions' },
              { name: 'Vendors', href: '#vendors' },
              { name: 'Events', href: '#events' },
              { name: 'How It Works', href: '#how-it-works' },
            ],
          },
          {
            title: 'Company',
            links: [
              { name: 'About Eventify', href: '#' },
              { name: 'Philippines', href: '#' },
              { name: 'Blog', href: '#' },
              { name: 'Careers', href: '#' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { name: 'Help Center', href: '#' },
              { name: 'Vendor Guide', href: '#' },
              { name: 'Privacy', href: '#' },
              { name: 'Terms', href: '#' },
            ],
          },
        ]}
        copyright={`(c) ${currentYear} Eventify. Philippine event procurement platform.`}
        legalLinks={[
          { name: 'Terms and Conditions', href: '#' },
          { name: 'Privacy Policy', href: '#' },
        ]}
      />
    </div>
  )
}

