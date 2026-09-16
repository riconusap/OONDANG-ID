<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { api } from '@/services/apiClient'
import { useAuthStore } from '@/stores/auth'
import { subscribeRequirements } from '@/services/requirementService'
import { subscribeVendors } from '@/services/vendorService'
import { calculateFinanceMetrics } from '@/services/financeService'
import type { DashboardOverview, RequirementItem, Vendor } from '@/types'

const authStore = useAuthStore()
const overview = ref<DashboardOverview | null>(null)
const isLoading = ref(true)

let unsubReqs: (() => void) | null = null
let unsubVendors: (() => void) | null = null

const realtimeReqs = ref<RequirementItem[]>([])
const realtimeVendors = ref<Vendor[]>([])

function calculateDaysRemaining(eventDateStr?: string): number {
  if (!eventDateStr) return 0
  const target = new Date(eventDateStr).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function updateAggregatedOverview() {
  if (!authStore.profile) return

  const reqs = realtimeReqs.value
  const reqTotal = reqs.length
  const reqCompleted = reqs.filter((r) => r.is_completed).length
  const reqPercentage = reqTotal > 0 ? Math.round((reqCompleted / reqTotal) * 100) : 0

  const vens = realtimeVendors.value
  const venTotal = vens.length
  const venContracted = vens.filter((v) => v.status === 'terkontrak' || v.status === 'selesai').length
  const venInDiscussion = vens.filter((v) => v.status === 'riset' || v.status === 'dealing').length

  const targetBudget = authStore.profile.target_budget || 150000000
  const finances = calculateFinanceMetrics(targetBudget, vens)

  overview.value = {
    profile: authStore.profile,
    days_remaining: calculateDaysRemaining(authStore.profile.event_date),
    requirements_summary: {
      total: reqTotal,
      completed: reqCompleted,
      percentage: reqPercentage,
    },
    vendors_summary: {
      total: venTotal,
      contracted: venContracted,
      in_discussion: venInDiscussion,
    },
    financial_summary: {
      target_budget: finances.target_budget,
      total_contracted: finances.total_contracted,
      total_paid: finances.total_paid,
      remaining_debt: finances.remaining_debt,
    },
  }
}

let dashboardTimeout: ReturnType<typeof setTimeout> | null = null

function cleanupSubscriptions() {
  if (dashboardTimeout) {
    clearTimeout(dashboardTimeout)
    dashboardTimeout = null
  }
  if (unsubReqs) {
    unsubReqs()
    unsubReqs = null
  }
  if (unsubVendors) {
    unsubVendors()
    unsubVendors = null
  }
}

async function setupDashboardSubscription() {
  cleanupSubscriptions()
  isLoading.value = true

  // Tunggu hingga sesi otentikasi dan profil pernikahan selesai diperiksa
  await authStore.waitUntilReady()

  const profileId = authStore.profile?.id
  if (profileId) {
    let reqsLoaded = false
    let vensLoaded = false

    const handleSubError = (err: any) => {
      console.warn('Gagal sinkronisasi data realtime dashboard:', err)
      updateAggregatedOverview()
      isLoading.value = false
    }

    // Batas pengaman agar tidak menunggu selamanya jika koneksi lambat
    dashboardTimeout = setTimeout(() => {
      if (isLoading.value) {
        updateAggregatedOverview()
        isLoading.value = false
      }
    }, 5000)

    unsubReqs = subscribeRequirements(
      profileId,
      (items) => {
        realtimeReqs.value = items
        reqsLoaded = true
        if (reqsLoaded && vensLoaded) {
          if (dashboardTimeout) clearTimeout(dashboardTimeout)
          updateAggregatedOverview()
          isLoading.value = false
        }
      },
      handleSubError
    )

    unsubVendors = subscribeVendors(
      profileId,
      (items) => {
        realtimeVendors.value = items
        vensLoaded = true
        if (reqsLoaded && vensLoaded) {
          if (dashboardTimeout) clearTimeout(dashboardTimeout)
          updateAggregatedOverview()
          isLoading.value = false
        }
      },
      handleSubError
    )
  } else if (authStore.user) {
    // Pengguna login namun belum mengisi profil acara pernikahan (onboarding)
    isLoading.value = false
  } else if (authStore.token === 'mock-jwt-token-wedding-catin' || import.meta.env.VITE_USE_MOCK !== 'false') {
    // Mode demo lokal
    await loadMockDashboard()
  } else {
    isLoading.value = false
  }
}

async function loadMockDashboard() {
  isLoading.value = true
  try {
    const res = await api.get<DashboardOverview>('/dashboard/overview')
    overview.value = res.data
  } catch (err) {
    console.error('Gagal mengambil data dashboard', err)
  } finally {
    isLoading.value = false
  }
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const catinInitials = computed(() => {
  if (overview.value?.profile) {
    const g = overview.value.profile.groom_name.charAt(0) || 'P'
    const b = overview.value.profile.bride_name.charAt(0) || 'W'
    return `${g} & ${b}`
  }
  return 'Catin'
})

const budgetPercentage = computed(() => {
  if (!overview.value?.financial_summary || overview.value.financial_summary.target_budget <= 0) return 0
  return Math.min(
    100,
    Math.round((overview.value.financial_summary.total_paid / overview.value.financial_summary.target_budget) * 100)
  )
})

watch(
  () => authStore.profile?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      setupDashboardSubscription()
    }
  }
)

onMounted(() => {
  setupDashboardSubscription()
})

onUnmounted(() => {
  cleanupSubscriptions()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-5xl mx-auto text-left font-sans">
      <!-- Loading Skeleton (Antislop R-27) -->
      <div v-if="isLoading" class="space-y-6 transition-opacity duration-200">
        <!-- Banner Skeleton -->
        <div class="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 animate-pulse">
          <div class="flex items-start gap-4 sm:gap-5 w-full">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-200 shrink-0"></div>
            <div class="space-y-2.5 w-full max-w-md">
              <div class="h-4 bg-stone-200 rounded w-1/3"></div>
              <div class="h-8 bg-stone-200 rounded w-2/3"></div>
              <div class="h-3 bg-stone-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="bg-surface-subtle p-4 sm:p-5 rounded-xl border border-border w-full lg:w-44 h-24 shrink-0 flex flex-col items-center justify-center space-y-2">
            <div class="h-3 bg-stone-200 rounded w-20"></div>
            <div class="h-8 bg-stone-200 rounded w-14"></div>
          </div>
        </div>

        <!-- 3 Executive Widgets Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="n in 3"
            :key="n"
            class="p-6 bg-surface rounded-2xl border border-border shadow-sm animate-pulse space-y-4"
          >
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="h-3 bg-stone-200 rounded w-24"></div>
              <div class="h-5 bg-stone-200 rounded-full w-20"></div>
            </div>
            <div class="space-y-2">
              <div class="h-8 bg-stone-200 rounded w-20"></div>
              <div class="h-3 bg-stone-200 rounded w-3/4"></div>
            </div>
            <div class="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-border">
              <div class="h-full bg-stone-200 rounded-full w-1/2"></div>
            </div>
            <div class="pt-4 border-t border-border">
              <div class="h-8 bg-stone-200 rounded-lg w-full"></div>
            </div>
          </div>
        </div>

        <!-- Quick Action Grid Skeleton -->
        <div class="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-sm animate-pulse space-y-4">
          <div class="space-y-2">
            <div class="h-5 bg-stone-200 rounded w-48"></div>
            <div class="h-3 bg-stone-200 rounded w-72"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div
              v-for="n in 4"
              :key="n"
              class="p-4 bg-surface-subtle rounded-xl border border-border space-y-2"
            >
              <div class="w-9 h-9 rounded-lg bg-stone-200"></div>
              <div class="h-4 bg-stone-200 rounded w-28"></div>
              <div class="h-3 bg-stone-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- State Belum Onboarding untuk Pengguna Terdaftar -->
      <div
        v-else-if="!overview && authStore.user && !authStore.profile"
        class="bg-surface rounded-2xl p-8 sm:p-10 border border-border text-center space-y-4 shadow-sm transition-opacity duration-200"
      >
        <div class="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto border border-primary/20">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="space-y-1.5">
          <h2 class="text-xl sm:text-2xl font-bold text-ink">
            Selamat Datang, {{ authStore.user.name }}
          </h2>
          <p class="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            Ruang rencana pernikahan Anda telah aktif. Silakan lengkapi persiapan awal untuk mengaktifkan ceklist berkas resmi, rekanan vendor, dan pelacak keuangan.
          </p>
        </div>
        <div class="pt-2">
          <router-link to="/onboarding" class="inline-block">
            <Button variant="primary">
              <span>Mulai Persiapan Awal</span>
              <span class="ml-1.5">&rarr;</span>
            </Button>
          </router-link>
        </div>
      </div>

      <!-- Dashboard Content -->
      <template v-else>
        <!-- Welcome Banner & Dynamic Countdown (Sub-Fase 1.6) -->
        <div
          class="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div class="flex items-start gap-4 sm:gap-5">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold text-lg sm:text-xl border border-primary/20 shrink-0">
              {{ catinInitials }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <StatusBadge variant="info">
                  {{ overview?.profile.wedding_type === 'muslim' ? 'Akad KUA Muslim' : 'Catatan Sipil' }}
                </StatusBadge>
                <span class="text-xs text-ink-muted flex items-center gap-1">
                  <span>Kota Acara:</span>
                  <strong class="text-ink font-semibold">{{ overview?.profile.location_city || 'Indonesia' }}</strong>
                </span>
              </div>

              <h1 class="text-2xl sm:text-3xl font-bold text-ink mt-2">
                {{ overview?.profile.groom_name }} &amp; {{ overview?.profile.bride_name }}
              </h1>

              <p class="text-xs sm:text-sm text-ink-muted mt-1 flex items-center gap-2">
                <span>Target Tanggal: <strong class="text-ink">{{ overview?.profile.event_date }}</strong></span>
                <router-link to="/profile" class="text-primary font-medium hover:underline text-xs">
                  (Ubah Profil Acara)
                </router-link>
              </p>
            </div>
          </div>

          <!-- Dynamic Countdown Card -->
          <div class="bg-surface-subtle p-4 sm:p-5 rounded-xl border border-border text-center min-w-[170px] w-full lg:w-auto shadow-inner">
            <span class="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Hitung Mundur Acara
            </span>
            <div class="text-3xl sm:text-4xl font-extrabold text-primary mt-1 tracking-tight">
              {{ overview?.days_remaining ?? 0 }}
            </div>
            <span class="text-xs font-medium text-ink-muted mt-0.5 block">
              Hari Menuju Hari H
            </span>
          </div>
        </div>

        <!-- 3 Core Executive Widgets (The 3 Pillars of Wedding Planning) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Widget 1: Kelengkapan Dokumen -->
          <div class="p-6 bg-surface rounded-2xl border border-border shadow-sm flex flex-col justify-between transition-all hover:border-stone-400/60">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <span class="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  1. Dokumen Legal
                </span>
                <StatusBadge :variant="(overview?.requirements_summary.percentage ?? 0) >= 100 ? 'success' : 'neutral'" size="sm">
                  {{ (overview?.requirements_summary.percentage ?? 0) >= 100 ? 'Lengkap' : 'Dalam Proses' }}
                </StatusBadge>
              </div>

              <div class="mt-4">
                <div class="text-3xl font-extrabold text-ink tracking-tight">
                  {{ overview?.requirements_summary.percentage ?? 0 }}%
                </div>
                <p class="text-xs text-ink-muted mt-1">
                  {{ overview?.requirements_summary.completed ?? 0 }} dari {{ overview?.requirements_summary.total ?? 0 }} berkas resmi selesai diurus.
                </p>
              </div>

              <div class="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-border mt-4">
                <div
                  class="h-full bg-sage transition-all duration-300 ease-out"
                  :style="{ width: `${overview?.requirements_summary.percentage ?? 0}%` }"
                ></div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-border">
              <router-link to="/requirements" class="block">
                <Button variant="secondary" size="sm" class="w-full justify-between">
                  <span>Periksa Ceklist Dokumen</span>
                  <span>&rarr;</span>
                </Button>
              </router-link>
            </div>
          </div>

          <!-- Widget 2: Progres Vendor -->
          <div class="p-6 bg-surface rounded-2xl border border-border shadow-sm flex flex-col justify-between transition-all hover:border-stone-400/60">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <span class="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  2. Rekanan Vendor
                </span>
                <StatusBadge variant="info" size="sm">
                  {{ overview?.vendors_summary.contracted ?? 0 }} Terkontrak
                </StatusBadge>
              </div>

              <div class="mt-4">
                <div class="text-3xl font-extrabold text-ink tracking-tight">
                  {{ overview?.vendors_summary.total ?? 0 }} Mitra
                </div>
                <p class="text-xs text-ink-muted mt-1">
                  {{ overview?.vendors_summary.contracted ?? 0 }} deal terkontrak, {{ overview?.vendors_summary.in_discussion ?? 0 }} dalam tahap riset/dealing.
                </p>
              </div>

              <div class="p-2.5 mt-3 rounded-lg bg-surface-subtle border border-border text-[11px] text-ink-muted flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                <span>Undangan Digital oondang.id (Phase 2)</span>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-border">
              <router-link to="/vendors" class="block">
                <Button variant="secondary" size="sm" class="w-full justify-between">
                  <span>Kelola Rekanan Vendor</span>
                  <span>&rarr;</span>
                </Button>
              </router-link>
            </div>
          </div>

          <!-- Widget 3: Snapshot Finansial -->
          <div class="p-6 bg-surface rounded-2xl border border-border shadow-sm flex flex-col justify-between transition-all hover:border-stone-400/60">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <span class="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  3. Arus Kas Keluar
                </span>
                <StatusBadge variant="warning" size="sm">
                  {{ budgetPercentage }}% Pagu
                </StatusBadge>
              </div>

              <div class="mt-4">
                <div class="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {{ formatRupiah(overview?.financial_summary.total_paid ?? 0) }}
                </div>
                <p class="text-xs text-ink-muted mt-1">
                  Dari target bujet {{ formatRupiah(overview?.financial_summary.target_budget ?? 0) }}.
                </p>
              </div>

              <div class="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-border mt-4">
                <div
                  class="h-full bg-primary transition-all duration-300 ease-out"
                  :style="{ width: `${budgetPercentage}%` }"
                ></div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-border">
              <router-link to="/finances" class="block">
                <Button variant="secondary" size="sm" class="w-full justify-between">
                  <span>Buka Pelacak Keuangan</span>
                  <span>&rarr;</span>
                </Button>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Quick Action Navigation Section -->
        <div class="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <h2 class="text-base font-bold text-ink">
                Pusat Aksi Persiapan Catin
              </h2>
              <p class="text-xs text-ink-muted mt-0.5">
                Akses instan ke seluruh modul persiapan pernikahan terintegrasi.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <router-link to="/requirements" class="p-4 bg-surface-subtle/70 hover:bg-stone-200/50 rounded-xl border border-border transition-colors group block">
              <div class="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-sage mb-2.5 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                Berkas Persyaratan KUA
              </h3>
              <p class="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Ceklist N1-N4, pas foto, dan surat pengantar kelurahan.
              </p>
            </router-link>

            <router-link to="/vendors" class="p-4 bg-surface-subtle/70 hover:bg-stone-200/50 rounded-xl border border-border transition-colors group block">
              <div class="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary mb-2.5 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                Kelola Rekanan Vendor
              </h3>
              <p class="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Pantau dealing catering, venue, rias, dan dokumentasi.
              </p>
            </router-link>

            <router-link to="/finances" class="p-4 bg-surface-subtle/70 hover:bg-stone-200/50 rounded-xl border border-border transition-colors group block">
              <div class="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-amber mb-2.5 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                Pencatatan Keuangan
              </h3>
              <p class="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Jadwal jatuh tempo termin DP dan sisa komitmen kas.
              </p>
            </router-link>

            <router-link to="/profile" class="p-4 bg-surface-subtle/70 hover:bg-stone-200/50 rounded-xl border border-border transition-colors group block">
              <div class="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-ink mb-2.5 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                Profil Acara Catin
              </h3>
              <p class="text-[11px] text-ink-muted mt-1 leading-relaxed">
                Sesuaikan identitas catin, tanggal acara, dan kota lokasi.
              </p>
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
