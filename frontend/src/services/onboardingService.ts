export interface OrganizerOnboardingData {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export interface VendorOnboardingData {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export interface OnboardingStatus {
  completed: boolean
  role: 'organizer' | 'vendor' | 'admin'
}

function getStoredRole(): 'organizer' | 'vendor' | 'admin' {
  try {
    const raw = localStorage.getItem('supabase.auth.token')
    if (!raw) return 'organizer'
    const parsed = JSON.parse(raw)
    const user = parsed?.user ?? parsed
    const role = user?.role ?? (user?.email ? 'organizer' : 'organizer')
    if (role === 'vendor' || role === 'admin') return role
    return 'organizer'
  } catch {
    return 'organizer'
  }
}

const STORAGE_KEY = 'onboarding_data'
const COMPLETE_KEY = 'onboarding_complete'

export const onboardingService = {
  getStatus: async (): Promise<OnboardingStatus> => {
    await new Promise((r) => setTimeout(r, 200))
    const completed = localStorage.getItem(COMPLETE_KEY) === 'true'
    return { completed, role: getStoredRole() }
  },

  completeOrganizerProfile: async (data: OrganizerOnboardingData): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, role: 'organizer' }))
    localStorage.setItem(COMPLETE_KEY, 'true')
  },

  completeVendorProfile: async (data: VendorOnboardingData): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, role: 'vendor' }))
    localStorage.setItem(COMPLETE_KEY, 'true')
  }
}
