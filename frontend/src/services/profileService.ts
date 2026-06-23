export interface OrganizerProfileData {
  organizationName: string
  organizationType: string
  phone: string
  address: string
}

export interface VendorProfileData {
  businessName: string
  serviceArea: string
  businessDescription: string
  phone: string
}

export interface AdminSettingsData {
  displayName: string
  email: string
}

const KEY_ORG = 'profile_organizer'
const KEY_VEN = 'profile_vendor'
const KEY_ADM = 'profile_admin'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const profileService = {
  getOrganizerProfile: async (): Promise<OrganizerProfileData> => {
    await delay()
    return read<OrganizerProfileData>(KEY_ORG, {
      organizationName: '',
      organizationType: '',
      phone: '',
      address: ''
    })
  },

  updateOrganizerProfile: async (data: Partial<OrganizerProfileData>): Promise<OrganizerProfileData> => {
    await delay()
    const existing = read<OrganizerProfileData>(KEY_ORG, {
      organizationName: '',
      organizationType: '',
      phone: '',
      address: ''
    })
    const merged = { ...existing, ...data }
    localStorage.setItem(KEY_ORG, JSON.stringify(merged))
    return merged
  },

  getVendorProfile: async (): Promise<VendorProfileData> => {
    await delay()
    return read<VendorProfileData>(KEY_VEN, {
      businessName: '',
      serviceArea: '',
      businessDescription: '',
      phone: ''
    })
  },

  updateVendorProfile: async (data: Partial<VendorProfileData>): Promise<VendorProfileData> => {
    await delay()
    const existing = read<VendorProfileData>(KEY_VEN, {
      businessName: '',
      serviceArea: '',
      businessDescription: '',
      phone: ''
    })
    const merged = { ...existing, ...data }
    localStorage.setItem(KEY_VEN, JSON.stringify(merged))
    return merged
  },

  getAdminSettings: async (): Promise<AdminSettingsData> => {
    await delay()
    return read<AdminSettingsData>(KEY_ADM, {
      displayName: '',
      email: ''
    })
  },

  updateAdminSettings: async (data: Partial<AdminSettingsData>): Promise<AdminSettingsData> => {
    await delay()
    const existing = read<AdminSettingsData>(KEY_ADM, { displayName: '', email: '' })
    const merged = { ...existing, ...data }
    localStorage.setItem(KEY_ADM, JSON.stringify(merged))
    return merged
  }
}
