import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'
import {
  mockUser,
  mockProfile,
  defaultKuaRequirements,
  defaultCivilRegistryRequirements,
  mockVendors,
  mockBudget,
  mockPayments,
  calculateFinancialSummary
} from './mockData'
import { getSystemRecommendations } from './onboardingRecommendations'
import type { RequirementItem } from '@/types'

const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('oondang_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Storage keys for mock persistence
const STORAGE_KEYS = {
  USER: 'oondang_mock_user',
  PROFILE: 'oondang_mock_profile',
  REQUIREMENTS: 'oondang_mock_requirements',
  VENDORS: 'oondang_mock_vendors',
  BUDGET: 'oondang_mock_budget',
  PAYMENTS: 'oondang_mock_payments',
  TOKEN: 'oondang_token',
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to store mock key: ${key}`, err)
  }
}

// Inisialisasi data mock jika belum ada di localStorage
export function initializeMockStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    setStored(STORAGE_KEYS.PROFILE, mockProfile)
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setStored(STORAGE_KEYS.USER, mockUser)
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUIREMENTS)) {
    setStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
  }
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    setStored(STORAGE_KEYS.VENDORS, mockVendors)
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGET)) {
    setStored(STORAGE_KEYS.BUDGET, mockBudget)
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    setStored(STORAGE_KEYS.PAYMENTS, mockPayments)
  }
}

// Mock handlers per endpoint
async function handleMockRequest<T>(url: string, method: string, data?: any): Promise<ApiResponse<T>> {
  initializeMockStorage()
  await new Promise((resolve) => setTimeout(resolve, 200)) // delay realistis

  const cleanUrl = url.replace('/api/v1', '').split('?')[0]

  // 1. Auth & Profile
  if (cleanUrl === '/auth/login' && method === 'POST') {
    const user = getStored(STORAGE_KEYS.USER, mockUser)
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-wedding-catin')
    return {
      success: true,
      message: 'Login berhasil.',
      data: { user, token: 'mock-jwt-token-wedding-catin' } as unknown as T,
    }
  }

  if (cleanUrl === '/auth/register' && method === 'POST') {
    const newUser = {
      id: `usr-${Date.now()}`,
      email: data.email,
      name: data.name,
      created_at: new Date().toISOString(),
    }
    setStored(STORAGE_KEYS.USER, newUser)
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-wedding-catin')
    return {
      success: true,
      message: 'Registrasi berhasil.',
      data: { user: newUser, token: 'mock-jwt-token-wedding-catin' } as unknown as T,
    }
  }

  if (cleanUrl === '/auth/me' && method === 'GET') {
    const user = getStored(STORAGE_KEYS.USER, mockUser)
    const profile = getStored(STORAGE_KEYS.PROFILE, mockProfile)
    return {
      success: true,
      message: 'Data user berhasil diambil.',
      data: { user, profile } as unknown as T,
    }
  }

  if (cleanUrl === '/wedding-profile' && (method === 'POST' || method === 'PUT')) {
    const current = getStored(STORAGE_KEYS.PROFILE, mockProfile)
    const newProfile = {
      id: current?.id || `wed-${Date.now()}`,
      user_id: 'usr-01',
      groom_name: data.groom_name,
      bride_name: data.bride_name,
      event_date: data.event_date,
      wedding_type: data.wedding_type,
      location_city: data.location_city || null,
      created_at: new Date().toISOString(),
    }
    setStored(STORAGE_KEYS.PROFILE, newProfile)

    // Auto seed requirements sesuai wedding_type
    const reqSeeds = data.wedding_type === 'non_muslim'
      ? defaultCivilRegistryRequirements
      : defaultKuaRequirements
    setStored(STORAGE_KEYS.REQUIREMENTS, reqSeeds)

    return {
      success: true,
      message: 'Profil pernikahan berhasil disimpan.',
      data: newProfile as unknown as T,
    }
  }

  if (cleanUrl === '/onboarding/setup' && method === 'POST') {
    const current = getStored(STORAGE_KEYS.PROFILE, mockProfile)
    const newProfile = {
      id: current?.id || `wed-${Date.now()}`,
      user_id: 'usr-01',
      groom_name: data.groom_name,
      bride_name: data.bride_name,
      event_date: data.event_date,
      wedding_type: data.wedding_type,
      location_city: data.location_city || null,
      created_at: new Date().toISOString(),
    }
    setStored(STORAGE_KEYS.PROFILE, newProfile)

    // 1. Seed Requirements from selected recommendations and custom items
    const selectedIds = new Set<string>(data.selected_recommendation_ids || [])
    const allRecs = getSystemRecommendations(data.wedding_type, data.event_date)
    const customItems: import('@/types').OnboardingRecommendationItem[] = data.custom_items || []
    const combinedRecs = [...allRecs, ...customItems]
    const selectedRequirements = combinedRecs.filter((r) => 
      (r.category === 'legal' || r.id.startsWith('custom-') || r.isCustom) && selectedIds.has(r.id)
    )

    const newRequirements: RequirementItem[] = selectedRequirements.map((rec, idx) => ({
      id: rec.id.startsWith('custom-') ? rec.id : `req-onboarding-${idx + 1}`,
      wedding_profile_id: newProfile.id,
      title: rec.title,
      category: (rec.id.startsWith('custom-') || rec.isCustom) ? 'custom' : data.wedding_type === 'non_muslim' ? 'civil_registry' : 'kua',
      is_completed: false,
      due_date: null,
      notes: rec.description,
      is_default: !(rec.id.startsWith('custom-') || rec.isCustom),
      created_at: new Date().toISOString(),
    }))

    if (newRequirements.length === 0) {
      setStored(
        STORAGE_KEYS.REQUIREMENTS,
        data.wedding_type === 'non_muslim' ? defaultCivilRegistryRequirements : defaultKuaRequirements
      )
    } else {
      setStored(STORAGE_KEYS.REQUIREMENTS, newRequirements)
    }

    // 2. Set Initial Budget
    if (data.initial_budget && Number(data.initial_budget) > 0) {
      const budget = getStored(STORAGE_KEYS.BUDGET, mockBudget)
      budget.target_budget = Number(data.initial_budget)
      setStored(STORAGE_KEYS.BUDGET, budget)
    }

    return {
      success: true,
      message: 'Persiapan awal pernikahan dan seluruh modul berhasil diaktifkan.',
      data: newProfile as unknown as T,
    }
  }

  // 2. Requirements Checklist
  if (cleanUrl === '/requirements' && method === 'GET') {
    const items = getStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
    return {
      success: true,
      message: 'Daftar berkas berhasil diambil.',
      data: items as unknown as T,
    }
  }

  if (cleanUrl.match(/\/requirements\/[^/]+\/toggle$/) && method === 'PATCH') {
    const parts = cleanUrl.split('/')
    const reqId = parts[2]
    const items = getStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
    const updated = items.map((it) => (it.id === reqId ? { ...it, is_completed: !it.is_completed } : it))
    setStored(STORAGE_KEYS.REQUIREMENTS, updated)
    const item = updated.find((it) => it.id === reqId)
    return {
      success: true,
      message: 'Status berkas berhasil diubah.',
      data: item as unknown as T,
    }
  }

  if (cleanUrl === '/requirements' && method === 'POST') {
    const items = getStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
    const newItem = {
      id: `req-custom-${Date.now()}`,
      wedding_profile_id: 'wed-01',
      title: data.title,
      category: data.category || 'custom',
      is_completed: false,
      due_date: data.due_date || null,
      notes: data.notes || null,
      is_default: false,
      created_at: new Date().toISOString(),
    }
    const updated = [newItem, ...items]
    setStored(STORAGE_KEYS.REQUIREMENTS, updated)
    return {
      success: true,
      message: 'Berkas baru berhasil ditambahkan.',
      data: newItem as unknown as T,
    }
  }

  if (cleanUrl.match(/\/requirements\/[^/]+$/) && method === 'DELETE') {
    const parts = cleanUrl.split('/')
    const reqId = parts[2]
    const items = getStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
    const target = items.find((it) => it.id === reqId)
    if (target?.is_default) {
      throw new Error('Dokumen persyaratan bawaan resmi tidak dapat dihapus.')
    }
    const updated = items.filter((it) => it.id !== reqId)
    setStored(STORAGE_KEYS.REQUIREMENTS, updated)
    return {
      success: true,
      message: 'Berkas persyaratan berhasil dihapus.',
      data: null as unknown as T,
    }
  }

  // 3. Vendors
  if (cleanUrl === '/vendors' && method === 'GET') {
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    return {
      success: true,
      message: 'Daftar vendor berhasil diambil.',
      data: vendors as unknown as T,
    }
  }

  if (cleanUrl === '/vendors' && method === 'POST') {
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const newVendor = {
      id: `ven-${Date.now()}`,
      wedding_profile_id: 'wed-01',
      name: data.name,
      category: data.category,
      contact_person: data.contact_person || null,
      contact_phone: data.contact_phone || null,
      status: data.status || 'riset',
      is_locked: false,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    }
    const updated = [...vendors, newVendor]
    setStored(STORAGE_KEYS.VENDORS, updated)
    return {
      success: true,
      message: 'Vendor baru berhasil ditambahkan.',
      data: newVendor as unknown as T,
    }
  }

  if (cleanUrl.match(/\/vendors\/[^/]+\/status$/) && method === 'PATCH') {
    const parts = cleanUrl.split('/')
    const vendorId = parts[2]
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const updated = vendors.map((v) => (v.id === vendorId ? { ...v, status: data.status } : v))
    setStored(STORAGE_KEYS.VENDORS, updated)
    const item = updated.find((v) => v.id === vendorId)
    return {
      success: true,
      message: 'Status vendor berhasil diperbarui.',
      data: item as unknown as T,
    }
  }

  if (cleanUrl.match(/\/vendors\/[^/]+$/) && method === 'PUT') {
    const parts = cleanUrl.split('/')
    const vendorId = parts[2]
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const target = vendors.find((v) => v.id === vendorId)
    if (!target) throw new Error('Vendor tidak ditemukan.')
    if (target.is_locked) throw new Error('Vendor bawaan sistem tidak dapat dimodifikasi.')

    const updated = vendors.map((v) =>
      v.id === vendorId
        ? {
            ...v,
            name: data.name ?? v.name,
            category: data.category ?? v.category,
            contact_person: data.contact_person ?? v.contact_person,
            contact_phone: data.contact_phone ?? v.contact_phone,
            status: data.status ?? v.status,
            notes: data.notes ?? v.notes,
          }
        : v
    )
    setStored(STORAGE_KEYS.VENDORS, updated)
    const item = updated.find((v) => v.id === vendorId)
    return {
      success: true,
      message: 'Data vendor berhasil diperbarui.',
      data: item as unknown as T,
    }
  }

  if (cleanUrl.match(/\/vendors\/[^/]+$/) && method === 'DELETE') {
    const parts = cleanUrl.split('/')
    const vendorId = parts[2]
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const target = vendors.find((v) => v.id === vendorId)
    if (target?.is_locked) {
      throw new Error('Vendor bawaan oondang.id tidak dapat dihapus.')
    }
    const updated = vendors.filter((v) => v.id !== vendorId)
    setStored(STORAGE_KEYS.VENDORS, updated)
    return {
      success: true,
      message: 'Vendor berhasil dihapus dari daftar.',
      data: null as unknown as T,
    }
  }

  // 4. Finances
  if (cleanUrl === '/finances/summary' && method === 'GET') {
    const budget = getStored(STORAGE_KEYS.BUDGET, mockBudget)
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    const summary = calculateFinancialSummary(budget.target_budget, vendors, payments)
    return {
      success: true,
      message: 'Ringkasan keuangan berhasil diambil.',
      data: summary as unknown as T,
    }
  }

  if (cleanUrl === '/finances/target-budget' && method === 'PUT') {
    const current = getStored(STORAGE_KEYS.BUDGET, mockBudget)
    const updated = { ...current, target_budget: Number(data.target_budget) }
    setStored(STORAGE_KEYS.BUDGET, updated)
    return {
      success: true,
      message: 'Target anggaran berhasil diperbarui.',
      data: updated as unknown as T,
    }
  }

  if (cleanUrl === '/payments' && method === 'GET') {
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    return {
      success: true,
      message: 'Daftar pembayaran berhasil diambil.',
      data: payments as unknown as T,
    }
  }

  if (cleanUrl.match(/\/vendors\/[^/]+\/payments$/) && method === 'GET') {
    const parts = cleanUrl.split('/')
    const vendorId = parts[2]
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    const filtered = payments.filter((p) => p.vendor_id === vendorId)
    return {
      success: true,
      message: 'Daftar pembayaran vendor berhasil diambil.',
      data: filtered as unknown as T,
    }
  }

  if ((cleanUrl.match(/\/vendors\/[^/]+\/payments$/) || cleanUrl === '/payments') && method === 'POST') {
    const parts = cleanUrl.split('/')
    const vendorId = data.vendor_id || (parts.length >= 3 ? parts[2] : 'ven-02')
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    const newPayment = {
      id: `pay-${Date.now()}`,
      vendor_id: vendorId,
      title: data.title,
      amount: Number(data.amount),
      payment_date: data.payment_date || null,
      status: data.status || 'pending',
      proof_file_url: null,
      created_at: new Date().toISOString(),
    }
    const updated = [newPayment, ...payments]
    setStored(STORAGE_KEYS.PAYMENTS, updated)
    return {
      success: true,
      message: 'Termin pembayaran berhasil dicatat.',
      data: newPayment as unknown as T,
    }
  }

  if (cleanUrl.match(/\/payments\/[^/]+\/status$/) && method === 'PATCH') {
    const parts = cleanUrl.split('/')
    const payId = parts[2]
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    const updated = payments.map((p) =>
      p.id === payId ? { ...p, status: data.status || (p.status === 'paid' ? 'pending' : 'paid') } : p
    )
    setStored(STORAGE_KEYS.PAYMENTS, updated)
    const item = updated.find((p) => p.id === payId)
    return {
      success: true,
      message: 'Status pembayaran berhasil diubah.',
      data: item as unknown as T,
    }
  }

  if (cleanUrl.match(/\/payments\/[^/]+$/) && method === 'DELETE') {
    const parts = cleanUrl.split('/')
    const payId = parts[2]
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)
    const updated = payments.filter((p) => p.id !== payId)
    setStored(STORAGE_KEYS.PAYMENTS, updated)
    return {
      success: true,
      message: 'Catatan pembayaran berhasil dihapus.',
      data: null as unknown as T,
    }
  }

  // 5. Dashboard Overview
  if (cleanUrl === '/dashboard/overview' && method === 'GET') {
    const profile = getStored(STORAGE_KEYS.PROFILE, mockProfile)
    const reqs = getStored(STORAGE_KEYS.REQUIREMENTS, defaultKuaRequirements)
    const vendors = getStored(STORAGE_KEYS.VENDORS, mockVendors)
    const budget = getStored(STORAGE_KEYS.BUDGET, mockBudget)
    const payments = getStored(STORAGE_KEYS.PAYMENTS, mockPayments)

    const completedReqs = reqs.filter((r) => r.is_completed).length
    const percentageReqs = reqs.length > 0 ? Math.round((completedReqs / reqs.length) * 100) : 0

    // Hitung sisa hari pernikahan
    const eventDate = new Date(profile.event_date)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    const summary = calculateFinancialSummary(budget.target_budget, vendors, payments)

    const overview = {
      profile,
      days_remaining: daysRemaining,
      requirements_summary: {
        total: reqs.length,
        completed: completedReqs,
        percentage: percentageReqs,
      },
      vendors_summary: {
        total: vendors.length,
        contracted: vendors.filter((v) => v.status === 'terkontrak').length,
        in_discussion: vendors.filter((v) => v.status === 'dealing' || v.status === 'riset').length,
      },
      financial_summary: summary,
    }

    return {
      success: true,
      message: 'Data dashboard berhasil diambil.',
      data: overview as unknown as T,
    }
  }

  throw new Error(`Endpoint mock belum tersedia: ${method} ${url}`)
}

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (isMock) {
      return handleMockRequest<T>(url, 'GET')
    }
    const res: AxiosResponse<ApiResponse<T>> = await axiosInstance.get(url, config)
    return res.data
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (isMock) {
      return handleMockRequest<T>(url, 'POST', data)
    }
    const res: AxiosResponse<ApiResponse<T>> = await axiosInstance.post(url, data, config)
    return res.data
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (isMock) {
      return handleMockRequest<T>(url, 'PUT', data)
    }
    const res: AxiosResponse<ApiResponse<T>> = await axiosInstance.put(url, data, config)
    return res.data
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (isMock) {
      return handleMockRequest<T>(url, 'PATCH', data)
    }
    const res: AxiosResponse<ApiResponse<T>> = await axiosInstance.patch(url, data, config)
    return res.data
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (isMock) {
      return handleMockRequest<T>(url, 'DELETE')
    }
    const res: AxiosResponse<ApiResponse<T>> = await axiosInstance.delete(url, config)
    return res.data
  },
}
