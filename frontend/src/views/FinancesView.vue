<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import MetricCard from '@/components/common/MetricCard.vue'
import Button from '@/components/common/Button.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import FormInput from '@/components/common/FormInput.vue'
import FormSelect from '@/components/common/FormSelect.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { api } from '@/services/apiClient'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import {
  subscribeVendors,
  addPayment,
  updatePayment,
  deletePayment
} from '@/services/vendorService'
import { updateTargetBudget, calculateFinanceMetrics } from '@/services/financeService'
import type { FinancialSummary, VendorPayment, Vendor } from '@/types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const summary = ref<FinancialSummary | null>(null)
const payments = ref<VendorPayment[]>([])
const vendors = ref<Vendor[]>([])
const isLoading = ref(true)
const statusFilter = ref<'all' | 'pending' | 'paid'>('all')

// Modal Ubah Budget
const isBudgetModalOpen = ref(false)
const targetBudgetInput = ref<number>(150000000)
const budgetError = ref('')

// Modal Catat Termin
const isPaymentModalOpen = ref(false)
const selectedVendorId = ref<string>('')
const newPayTitle = ref('')
const newPayAmount = ref<number | string>('')
const newPayDate = ref('')
const newPayStatus = ref<'pending' | 'paid'>('pending')
const paymentError = ref('')

// Modal Hapus Pembayaran
const isDeleteModalOpen = ref(false)
const paymentToDelete = ref<VendorPayment | null>(null)

let unsubscribe: (() => void) | null = null

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function setupFinancesSubscription() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  isLoading.value = true

  try {
    await authStore.waitUntilReady()
  } catch (err) {
    console.error('Auth ready error:', err)
  }

  const profileId = authStore.profile?.id
  if (profileId) {
    const currentTarget = authStore.profile?.target_budget || targetBudgetInput.value || 150000000
    targetBudgetInput.value = currentTarget

    unsubscribe = subscribeVendors(
      profileId,
      (realtimeVendors) => {
        vendors.value = realtimeVendors
        if (!selectedVendorId.value && realtimeVendors.length > 0) {
          selectedVendorId.value = realtimeVendors[0].id
        }

        // Gabungkan seluruh pembayaran dari seluruh vendor
        const allPayments: VendorPayment[] = []
        realtimeVendors.forEach((v) => {
          if (Array.isArray(v.payments)) {
            v.payments.forEach((p: VendorPayment) => {
              allPayments.push({ ...p, vendor_id: v.id })
            })
          }
        })
        payments.value = allPayments

        // Hitung metrik ringkasan
        summary.value = calculateFinanceMetrics(targetBudgetInput.value, realtimeVendors)
        isLoading.value = false
      },
      (err) => {
        console.warn('Gagal sinkronisasi data realtime keuangan, beralih ke data lokal:', err)
        isLoading.value = false
        if (import.meta.env.VITE_USE_MOCK !== 'false') {
          loadMockFinancesData()
        }
      }
    )
  } else {
    if (authStore.token === 'mock-jwt-token-wedding-catin' || import.meta.env.VITE_USE_MOCK !== 'false') {
      loadMockFinancesData()
    } else {
      isLoading.value = false
    }
  }
}

async function loadMockFinancesData() {
  isLoading.value = true
  try {
    const [sumRes, payRes, venRes] = await Promise.all([
      api.get<FinancialSummary>('/finances/summary'),
      api.get<VendorPayment[]>('/payments'),
      api.get<Vendor[]>('/vendors'),
    ])
    summary.value = sumRes.data
    targetBudgetInput.value = sumRes.data.target_budget
    payments.value = payRes.data
    vendors.value = venRes.data
    if (vendors.value.length > 0) {
      selectedVendorId.value = vendors.value[0].id
    }
  } catch (err: any) {
    console.error('Gagal mengambil data keuangan', err)
    notificationStore.showError(err?.message || 'Gagal mengambil data keuangan.', 'Gagal Memuat Finansial')
  } finally {
    isLoading.value = false
  }
}

async function handleUpdateBudget() {
  budgetError.value = ''
  if (!targetBudgetInput.value || Number(targetBudgetInput.value) <= 0) {
    budgetError.value = 'Target anggaran harus lebih besar dari Rp 0.'
    notificationStore.showError('Target anggaran harus lebih besar dari Rp 0.', 'Nominal Tidak Valid')
    return
  }

  const profileId = authStore.profile?.id
  const newBudget = Number(targetBudgetInput.value)

  try {
    if (profileId) {
      await updateTargetBudget(profileId, newBudget)
      if (summary.value) {
        summary.value = calculateFinanceMetrics(newBudget, vendors.value)
      }
    } else {
      const res = await api.put<{ target_budget: number }>('/finances/target-budget', {
        target_budget: newBudget,
      })
      if (summary.value) {
        summary.value.target_budget = res.data.target_budget
      }
    }
    isBudgetModalOpen.value = false
    notificationStore.showToast('Target anggaran pernikahan berhasil diperbarui.', 'Anggaran Diperbarui')
  } catch (err: any) {
    budgetError.value = err?.message || 'Gagal mengubah target bujet.'
    notificationStore.showError(err?.message || 'Gagal mengubah target bujet.', 'Gagal Mengubah Anggaran')
  }
}

function openAddPaymentModal() {
  newPayTitle.value = ''
  newPayAmount.value = ''
  newPayDate.value = ''
  newPayStatus.value = 'pending'
  paymentError.value = ''
  if (!selectedVendorId.value && vendors.value.length > 0) {
    selectedVendorId.value = vendors.value[0].id
  }
  isPaymentModalOpen.value = true
}

async function handleAddPayment() {
  paymentError.value = ''
  if (!newPayTitle.value.trim()) {
    paymentError.value = 'Keterangan termin pembayaran wajib diisi.'
    notificationStore.showError('Keterangan termin pembayaran wajib diisi.', 'Formulir Belum Lengkap')
    return
  }
  if (!newPayAmount.value || Number(newPayAmount.value) <= 0) {
    paymentError.value = 'Nominal pembayaran harus lebih besar dari Rp 0.'
    notificationStore.showError('Nominal pembayaran harus lebih besar dari Rp 0.', 'Nominal Tidak Valid')
    return
  }

  const profileId = authStore.profile?.id
  const payload = {
    title: newPayTitle.value.trim(),
    amount: Number(newPayAmount.value),
    payment_date: newPayDate.value || null,
    status: newPayStatus.value,
  }

  try {
    if (profileId) {
      await addPayment(profileId, selectedVendorId.value, payload)
    } else {
      const res = await api.post<VendorPayment>('/payments', {
        vendor_id: selectedVendorId.value,
        ...payload
      })
      payments.value.unshift(res.data)
      await refreshSummary()
    }
    isPaymentModalOpen.value = false
    notificationStore.showToast('Termin pembayaran baru berhasil dicatat.', 'Pembayaran Dicatat')
  } catch (err: any) {
    paymentError.value = err?.message || 'Gagal mencatat pembayaran.'
    notificationStore.showError(err?.message || 'Gagal mencatat pembayaran.', 'Gagal Mencatat Pembayaran')
  }
}

async function handleToggleStatus(pay: VendorPayment) {
  const profileId = authStore.profile?.id
  const nextStatus = pay.status === 'paid' ? 'pending' : 'paid'

  try {
    if (profileId) {
      const parentVendor = vendors.value.find((v) =>
        v.id === pay.vendor_id || (Array.isArray(v.payments) && v.payments.some((p: VendorPayment) => p.id === pay.id))
      )
      if (parentVendor) {
        await updatePayment(profileId, parentVendor.id, pay.id, { status: nextStatus })
      }
    } else {
      const res = await api.patch<VendorPayment>(`/payments/${pay.id}/status`, { status: nextStatus })
      const idx = payments.value.findIndex((p) => p.id === pay.id)
      if (idx !== -1) {
        payments.value[idx] = res.data
      }
      await refreshSummary()
    }
    notificationStore.showToast(
      `Status termin "${pay.title}" diubah menjadi ${nextStatus === 'paid' ? 'Lunas' : 'Menunggu'}.`,
      'Status Diperbarui'
    )
  } catch (err: any) {
    console.error('Gagal mengubah status termin', err)
    notificationStore.showError(err?.message || 'Gagal mengubah status termin.', 'Gagal Mengubah Status')
  }
}

function confirmDelete(pay: VendorPayment) {
  paymentToDelete.value = pay
  isDeleteModalOpen.value = true
}

async function handleDeletePayment() {
  if (!paymentToDelete.value) return
  const profileId = authStore.profile?.id
  const targetId = paymentToDelete.value.id
  const deletedTitle = paymentToDelete.value.title

  try {
    if (profileId) {
      const parentVendor = vendors.value.find((v) =>
        v.id === paymentToDelete.value!.vendor_id || (Array.isArray(v.payments) && v.payments.some((p: VendorPayment) => p.id === targetId))
      )
      if (parentVendor) {
        await deletePayment(profileId, parentVendor.id, targetId)
      }
    } else {
      await api.delete(`/payments/${targetId}`)
      payments.value = payments.value.filter((p) => p.id !== targetId)
      await refreshSummary()
    }
    isDeleteModalOpen.value = false
    paymentToDelete.value = null
    notificationStore.showToast(`Catatan pembayaran "${deletedTitle}" berhasil dihapus.`, 'Pembayaran Dihapus')
  } catch (err: any) {
    notificationStore.showError(err?.message || 'Gagal menghapus pembayaran.', 'Gagal Menghapus Pembayaran')
  }
}

async function refreshSummary() {
  try {
    const res = await api.get<FinancialSummary>('/finances/summary')
    summary.value = res.data
  } catch (err) {
    console.error('Gagal memperbarui ringkasan finansial', err)
  }
}

function getVendorName(vendorId: string): string {
  const v = vendors.value.find((item) => item.id === vendorId)
  return v ? v.name : 'Vendor Acara'
}

const vendorSelectOptions = computed(() => {
  return vendors.value.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.category})`,
  }))
})

const paidAmount = computed(() => {
  return payments.value
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

const budgetPercentage = computed(() => {
  if (!summary.value || summary.value.target_budget <= 0) return 0
  return Math.min(100, Math.round((paidAmount.value / summary.value.target_budget) * 100))
})

const filteredPayments = computed(() => {
  if (statusFilter.value === 'all') return payments.value
  return payments.value.filter((p) => p.status === statusFilter.value)
})

watch(
  () => authStore.profile?.id,
  () => {
    setupFinancesSubscription()
  }
)

onMounted(() => {
  setupFinancesSubscription()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-5xl mx-auto text-left font-sans">
      <!-- Header Module -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink">
            Pelacak Keuangan &amp; Termin Pembayaran
          </h1>
          <p class="text-sm text-ink-muted mt-1">
            Pantau arus kas pernikahan, alokasi pagu anggaran, dan jatuh tempo termin vendor.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="isBudgetModalOpen = true">
            Ubah Pagu Anggaran
          </Button>
          <Button variant="primary" size="sm" @click="openAddPaymentModal">
            + Catat Termin Baru
          </Button>
        </div>
      </div>



      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Metric Cards Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="n in 4"
            :key="n"
            class="p-5 bg-surface rounded-2xl border border-border shadow-sm animate-pulse space-y-3"
          >
            <div class="h-3 bg-stone-200 rounded w-28"></div>
            <div class="h-7 bg-stone-200 rounded w-36"></div>
            <div class="h-3 bg-stone-200 rounded w-24"></div>
          </div>
        </div>

        <!-- Budget Utilization Skeleton -->
        <div class="p-5 bg-surface rounded-2xl border border-border shadow-sm animate-pulse space-y-3">
          <div class="flex justify-between">
            <div class="h-3 bg-stone-200 rounded w-40"></div>
            <div class="h-3 bg-stone-200 rounded w-32"></div>
          </div>
          <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-border">
            <div class="h-full bg-stone-200 rounded-full w-2/5"></div>
          </div>
        </div>

        <!-- Payments Table Skeleton -->
        <div class="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden animate-pulse">
          <div class="p-5 border-b border-border flex justify-between items-center">
            <div class="space-y-2">
              <div class="h-4 bg-stone-200 rounded w-48"></div>
              <div class="h-3 bg-stone-200 rounded w-64"></div>
            </div>
            <div class="h-8 bg-stone-200 rounded-lg w-48"></div>
          </div>
          <div class="p-5 space-y-4">
            <div v-for="n in 4" :key="n" class="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div class="space-y-1.5 w-1/3">
                <div class="h-4 bg-stone-200 rounded w-3/4"></div>
                <div class="h-3 bg-stone-200 rounded w-1/2"></div>
              </div>
              <div class="h-5 bg-stone-200 rounded w-24"></div>
              <div class="h-4 bg-stone-200 rounded w-20"></div>
              <div class="h-6 bg-stone-200 rounded-full w-16"></div>
              <div class="h-7 bg-stone-200 rounded-lg w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Financial Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Target Pagu Anggaran"
            :value="formatRupiah(summary?.target_budget ?? 0)"
            helper-text="Batas maksimal bujet gabungan"
          />

          <MetricCard
            title="Total Biaya Terkontrak"
            :value="formatRupiah(summary?.total_contracted ?? 0)"
            helper-text="Estimasi komitmen vendor aktif"
          />

          <MetricCard
            title="Sudah Dibayarkan"
            :value="formatRupiah(paidAmount)"
            trend="Realisasi Kas"
            helper-text="Total DP & pelunasan selesai"
          />

          <MetricCard
            title="Sisa Kewajiban Hutang"
            :value="formatRupiah(Math.max(0, (summary?.total_contracted ?? 0) - paidAmount))"
            helper-text="Menunggu jatuh tempo pelunasan"
          />
        </div>

        <!-- Budget Utilization Progress -->
        <div class="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <div class="flex items-center justify-between text-xs font-semibold text-ink mb-2">
            <span>Realisasi Pengeluaran Kas: {{ budgetPercentage }}%</span>
            <span class="text-ink-muted">
              {{ formatRupiah(paidAmount) }} dari {{ formatRupiah(summary?.target_budget ?? 0) }}
            </span>
          </div>
          <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-border">
            <div
              class="h-full bg-primary transition-all duration-300 ease-out"
              :style="{ width: `${budgetPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Payments Table Section -->
        <div class="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <!-- Table Header & Status Filter Tabs -->
          <div class="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-ink">
                Rincian Termin Pembayaran Vendor
              </h2>
              <p class="text-xs text-ink-muted mt-0.5">
                Kelola pembayaran bertahap (DP, termin lanjutan, pelunasan).
              </p>
            </div>

            <!-- Status Tabs -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target',
                  statusFilter === 'all'
                    ? 'bg-ink text-white font-semibold'
                    : 'bg-surface-subtle text-ink-muted hover:text-ink'
                ]"
                @click="statusFilter = 'all'"
              >
                Semua ({{ payments.length }})
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target',
                  statusFilter === 'pending'
                    ? 'bg-ink text-white font-semibold'
                    : 'bg-surface-subtle text-ink-muted hover:text-ink'
                ]"
                @click="statusFilter = 'pending'"
              >
                Menunggu ({{ payments.filter(p => p.status === 'pending').length }})
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target',
                  statusFilter === 'paid'
                    ? 'bg-ink text-white font-semibold'
                    : 'bg-surface-subtle text-ink-muted hover:text-ink'
                ]"
                @click="statusFilter = 'paid'"
              >
                Lunas ({{ payments.filter(p => p.status === 'paid').length }})
              </button>
            </div>
          </div>

          <!-- Table Data -->
          <div v-if="filteredPayments.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-surface-subtle border-b border-border text-xs font-semibold uppercase text-ink-muted">
                <tr>
                  <th class="py-3 px-5">Rincian Termin</th>
                  <th class="py-3 px-4">Nama Rekanan Vendor</th>
                  <th class="py-3 px-4">Nominal</th>
                  <th class="py-3 px-4">Rencana Bayar</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="pay in filteredPayments"
                  :key="pay.id"
                  class="hover:bg-surface-subtle/50 transition-colors"
                >
                  <td class="py-4 px-5">
                    <div class="font-bold text-ink">
                      {{ pay.title }}
                    </div>
                  </td>
                  <td class="py-4 px-4 text-xs font-medium text-ink">
                    {{ getVendorName(pay.vendor_id) }}
                  </td>
                  <td class="py-4 px-4 font-bold text-ink">
                    {{ formatRupiah(pay.amount) }}
                  </td>
                  <td class="py-4 px-4 text-xs text-ink-muted">
                    {{ pay.payment_date || '-' }}
                  </td>
                  <td class="py-4 px-4">
                    <StatusBadge :variant="pay.status === 'paid' ? 'success' : 'warning'" size="sm">
                      {{ pay.status === 'paid' ? 'Lunas' : 'Menunggu' }}
                    </StatusBadge>
                  </td>
                  <td class="py-4 px-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        :class="[
                          'px-2.5 py-1 text-xs rounded font-medium transition-colors tap-target cursor-pointer',
                          pay.status === 'paid'
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            : 'bg-sage-light text-sage hover:bg-sage/20'
                        ]"
                        @click="handleToggleStatus(pay)"
                      >
                        {{ pay.status === 'paid' ? 'Buka Kembali' : 'Tandai Lunas' }}
                      </button>

                      <button
                        type="button"
                        class="p-1 inline-flex items-center justify-center text-ink-light hover:text-red-700 rounded hover:bg-red-50 transition-colors tap-target cursor-pointer"
                        title="Hapus catatan termin"
                        @click="confirmDelete(pay)"
                        aria-label="Hapus termin"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State (Antislop R-27) -->
          <EmptyState
            v-else
            title="Belum ada transaksi termin pada kategori ini"
            description="Tambahkan jadwal termin pembayaran vendor untuk mencatat komitmen keuangan."
            action-label="+ Catat Termin Pembayaran"
            @action="openAddPaymentModal"
          />
        </div>
      </template>

      <!-- Modal Ubah Target Budget -->
      <ModalDialog
        :is-open="isBudgetModalOpen"
        title="Ubah Target Pagu Anggaran"
        description="Tetapkan pagu maksimal biaya pernikahan untuk mengontrol arus kas."
        @close="isBudgetModalOpen = false"
      >
        <div class="space-y-4">
          <FormInput
            id="target-budget"
            v-model="targetBudgetInput"
            type="number"
            label="Total Target Anggaran (Rupiah)"
            placeholder="150000000"
            :error="budgetError"
            helper="Contoh: 150000000 untuk pagu Rp 150 Juta."
            required
          />
        </div>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isBudgetModalOpen = false">
            Batal
          </Button>
          <Button variant="primary" size="sm" @click="handleUpdateBudget">
            Simpan Anggaran
          </Button>
        </template>
      </ModalDialog>

      <!-- Modal Catat Termin -->
      <ModalDialog
        :is-open="isPaymentModalOpen"
        title="Catat Termin Pembayaran Baru"
        description="Masukkan rincian down payment (DP) atau pelunasan tagihan vendor."
        @close="isPaymentModalOpen = false"
      >
        <div class="space-y-4">
          <FormSelect
            id="pay-vendor"
            v-model="selectedVendorId"
            :options="vendorSelectOptions"
            label="Mitra Vendor Terkait"
            required
          />

          <FormInput
            id="pay-title"
            v-model="newPayTitle"
            label="Keterangan Termin"
            placeholder="Contoh: DP 1 Booking Gedung / Termin 2 (50%)"
            :error="paymentError"
            required
          />

          <FormInput
            id="pay-amount"
            v-model="newPayAmount"
            type="number"
            label="Nominal Pembayaran (Rp)"
            placeholder="15000000"
            required
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="pay-date"
              v-model="newPayDate"
              type="date"
              label="Target Tanggal Bayar"
            />

            <FormSelect
              id="pay-status"
              v-model="newPayStatus"
              :options="[
                { value: 'pending', label: 'Menunggu Pembayaran' },
                { value: 'paid', label: 'Sudah Lunas Dibayar' }
              ]"
              label="Status Pembayaran"
              required
            />
          </div>
        </div>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isPaymentModalOpen = false">
            Batal
          </Button>
          <Button variant="primary" size="sm" @click="handleAddPayment">
            Simpan Termin
          </Button>
        </template>
      </ModalDialog>

      <!-- Modal Konfirmasi Hapus Termin -->
      <ModalDialog
        :is-open="isDeleteModalOpen"
        title="Hapus Catatan Termin"
        description="Apakah Anda yakin ingin menghapus catatan termin pembayaran ini?"
        @close="isDeleteModalOpen = false"
      >
        <p class="text-sm text-ink font-semibold">
          "{{ paymentToDelete?.title }} ({{ formatRupiah(paymentToDelete?.amount ?? 0) }})"
        </p>
        <p class="text-xs text-ink-muted mt-1">
          Kalkulasi realisasi keuangan akan otomatis disesuaikan kembali.
        </p>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isDeleteModalOpen = false">
            Batal
          </Button>
          <Button variant="danger" size="sm" @click="handleDeletePayment">
            Ya, Hapus Termin
          </Button>
        </template>
      </ModalDialog>
    </div>
  </AppLayout>
</template>
