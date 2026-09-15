export type WeddingType = 'muslim' | 'non_muslim'

export interface User {
  id: string
  email: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface WeddingProfile {
  id: string
  user_id: string
  groom_name: string
  bride_name: string
  event_date: string
  wedding_type: WeddingType
  location_city: string | null
  target_budget?: number
  created_at?: string
  updated_at?: string
}

export type RequirementCategory = 'kua' | 'civil_registry' | 'custom'

export interface RequirementItem {
  id: string
  wedding_profile_id: string
  title: string
  category: RequirementCategory
  is_completed: boolean
  due_date: string | null
  notes: string | null
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export type VendorCategory = 'catering' | 'venue' | 'mua' | 'wo' | 'invitation' | 'decor' | 'photo_video' | 'attire' | 'entertainment' | 'other'
export type VendorStatus = 'riset' | 'dealing' | 'terkontrak' | 'selesai'

export interface Vendor {
  id: string
  wedding_profile_id: string
  name: string
  category: VendorCategory
  contact_person: string | null
  contact_phone: string | null
  status: VendorStatus
  is_locked: boolean
  notes: string | null
  payments?: VendorPayment[]
  created_at?: string
  updated_at?: string
}

export interface WeddingBudget {
  id: string
  wedding_profile_id: string
  target_budget: number
  notes: string | null
  created_at?: string
  updated_at?: string
}

export type PaymentStatus = 'pending' | 'paid'

export interface VendorPayment {
  id: string
  vendor_id: string
  title: string
  amount: number
  payment_date: string | null
  status: PaymentStatus
  proof_file_url: string | null
  created_at?: string
  updated_at?: string
}

export interface FinancialSummary {
  target_budget: number
  total_contracted: number
  total_paid: number
  remaining_debt: number
}

export interface BudgetSummary extends FinancialSummary {
  remaining_budget: number
  percentage_used: number
}

export interface DashboardOverview {
  profile: WeddingProfile
  days_remaining: number
  requirements_summary: {
    total: number
    completed: number
    percentage: number
  }
  vendors_summary: {
    total: number
    contracted: number
    in_discussion: number
  }
  financial_summary: FinancialSummary
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type RecommendationCategory = 'legal' | 'vendor' | 'finance' | 'event'

export interface OnboardingRecommendationItem {
  id: string
  category: RecommendationCategory
  title: string
  description: string
  badgeText?: string
  isRecommended?: boolean
  targetDeadline?: string
  isCustom?: boolean
}

export interface OnboardingSetupPayload {
  groom_name: string
  bride_name: string
  wedding_type: WeddingType
  event_date: string
  location_city: string
  initial_budget: number
  selected_recommendation_ids: string[]
  custom_items?: OnboardingRecommendationItem[]
}

