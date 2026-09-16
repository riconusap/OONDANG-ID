<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import FormInput from '@/components/common/FormInput.vue'
import FormSelect from '@/components/common/FormSelect.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import Button from '@/components/common/Button.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import {
  weddingWizardStep1Schema,
  weddingWizardStep2Schema,
} from '@/schemas/auth'
import { getSystemRecommendations } from '@/services/onboardingRecommendations'
import type { WeddingType, RecommendationCategory, OnboardingRecommendationItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const currentStep = ref<1 | 2 | 3 | 4 | 5>(1)

// Step 1: Identitas & Visi
const groomName = ref(authStore.profile?.groom_name || 'Dimas Prasetyo')
const brideName = ref(authStore.profile?.bride_name || 'Anissa Rahmawati')
const visionNote = ref('')

// Step 2: Rencana Acara & Pagu Anggaran
const weddingType = ref<WeddingType>(authStore.profile?.wedding_type || 'muslim')
const eventDate = ref(authStore.profile?.event_date || '2026-12-20')
const locationCity = ref(authStore.profile?.location_city || 'Jakarta Selatan')
const initialBudget = ref<number>(150000000)

// Step 3 & 4: Ceklist & Rekomendasi
const selectedRecommendationIds = ref<string[]>([])

// Ceklist Kustom Tambahan Catin
const customItems = ref<OnboardingRecommendationItem[]>([])
const isAddCustomModalOpen = ref(false)
const customTitle = ref('')
const customCategory = ref<RecommendationCategory>('legal')
const customDescription = ref('')
const customTarget = ref('')
const customError = ref('')

const categoryOptions = [
  { value: 'legal', label: 'Berkas Legal (KUA / Catatan Sipil)' },
  { value: 'vendor', label: 'Vendor Esensial' },
  { value: 'finance', label: 'Finansial & DP' },
]

const errors = ref<Record<string, string>>({})

const budgetPresets = [
  { label: 'Rp 75 Juta', value: 75000000 },
  { label: 'Rp 150 Juta', value: 150000000 },
  { label: 'Rp 250 Juta', value: 250000000 },
  { label: 'Rp 500 Juta', value: 500000000 },
]

const daysRemaining = computed(() => {
  if (!eventDate.value) return 0
  const target = new Date(eventDate.value)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const systemRecommendations = computed<OnboardingRecommendationItem[]>(() => {
  return getSystemRecommendations(weddingType.value, eventDate.value)
})

const allRecommendations = computed<OnboardingRecommendationItem[]>(() => {
  return [...systemRecommendations.value, ...customItems.value]
})

// Step 3: Persyaratan Legal
const legalRecommendations = computed(() => {
  return allRecommendations.value.filter((item) => item.category === 'legal')
})
const totalLegalCount = computed(() => legalRecommendations.value.length)
const selectedLegalCount = computed(() => {
  return legalRecommendations.value.filter((item) => selectedRecommendationIds.value.includes(item.id)).length
})

// Step 4: Ceklist Vendor
const vendorRecommendations = computed(() => {
  return allRecommendations.value.filter((item) => item.category === 'vendor')
})
const totalVendorCount = computed(() => vendorRecommendations.value.length)
const selectedVendorCount = computed(() => {
  return vendorRecommendations.value.filter((item) => selectedRecommendationIds.value.includes(item.id)).length
})

const selectedFinanceCount = computed(() => {
  return allRecommendations.value.filter(
    (item) => item.category === 'finance' && selectedRecommendationIds.value.includes(item.id)
  ).length
})

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function initRecommendations() {
  const existingCustomIds = customItems.value.map((c) => c.id)
  selectedRecommendationIds.value = [
    ...systemRecommendations.value.filter((r) => r.category !== 'finance').map((r) => r.id),
    ...existingCustomIds,
  ]
}

// Re-seed default recommendations if wedding type changes
watch(weddingType, () => {
  initRecommendations()
})

function toggleRecommendation(id: string) {
  if (selectedRecommendationIds.value.includes(id)) {
    selectedRecommendationIds.value = selectedRecommendationIds.value.filter((item) => item !== id)
  } else {
    selectedRecommendationIds.value.push(id)
  }
}

function selectAllLegal() {
  const legalIds = legalRecommendations.value.map((item) => item.id)
  const currentSet = new Set(selectedRecommendationIds.value)
  legalIds.forEach((id) => currentSet.add(id))
  selectedRecommendationIds.value = Array.from(currentSet)
}

function selectOnlyEssentialLegal() {
  const legalIds = legalRecommendations.value.map((item) => item.id)
  const essentialLegalIds = legalRecommendations.value
    .filter((item) => item.badgeText?.includes('Wajib') || item.badgeText?.includes('Utama'))
    .map((item) => item.id)
  selectedRecommendationIds.value = [
    ...selectedRecommendationIds.value.filter((id) => !legalIds.includes(id)),
    ...essentialLegalIds,
  ]
}

function selectAllVendor() {
  const targetIds = vendorRecommendations.value.map((item) => item.id)
  const currentSet = new Set(selectedRecommendationIds.value)
  targetIds.forEach((id) => currentSet.add(id))
  selectedRecommendationIds.value = Array.from(currentSet)
}

function selectOnlyEssentialVendor() {
  const vendorIds = vendorRecommendations.value.map((item) => item.id)
  const essentialIds = vendorRecommendations.value
    .filter((item) => item.badgeText?.includes('Wajib') || item.badgeText?.includes('Utama'))
    .map((item) => item.id)
  selectedRecommendationIds.value = [
    ...selectedRecommendationIds.value.filter((id) => !vendorIds.includes(id)),
    ...essentialIds,
  ]
}

function openAddCustomModal(defaultCategory: RecommendationCategory = 'legal') {
  customTitle.value = ''
  customCategory.value = defaultCategory
  customDescription.value = ''
  customTarget.value = ''
  customError.value = ''
  isAddCustomModalOpen.value = true
}

function handleAddCustomItem() {
  const title = customTitle.value.trim()
  if (!title) {
    customError.value = 'Judul ceklist wajib diisi (minimal 3 karakter).'
    return
  }
  if (title.length < 3) {
    customError.value = 'Judul ceklist minimal 3 karakter.'
    return
  }

  const newItem: OnboardingRecommendationItem = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: customCategory.value,
    title,
    description: customDescription.value.trim() || 'Item ceklist kustom yang ditambahkan oleh calon mempelai.',
    badgeText: 'Kustom Catin',
    targetDeadline: customTarget.value.trim() || undefined,
    isCustom: true,
  }

  customItems.value.push(newItem)
  selectedRecommendationIds.value.push(newItem.id)
  isAddCustomModalOpen.value = false
  notificationStore.showToast(
    `Ceklist "${title}" berhasil ditambahkan ke daftar persiapan Anda.`,
    'Ceklist Kustom Ditambahkan'
  )
}

function removeCustomItem(id: string) {
  customItems.value = customItems.value.filter((item) => item.id !== id)
  selectedRecommendationIds.value = selectedRecommendationIds.value.filter((itemId) => itemId !== id)
  notificationStore.showToast('Item ceklist kustom telah dihapus.', 'Ceklist Dihapus')
}

function validateStep1(): boolean {
  errors.value = {}
  const res = weddingWizardStep1Schema.safeParse({
    groom_name: groomName.value,
    bride_name: brideName.value,
    vision_note: visionNote.value || undefined,
  })
  if (!res.success) {
    res.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!errors.value[field]) errors.value[field] = issue.message
    })
    notificationStore.showError(
      res.error.issues.map((i) => i.message).join('\n'),
      'Lengkapi Data Pasangan'
    )
    return false
  }
  return true
}

function validateStep2(): boolean {
  errors.value = {}
  const res = weddingWizardStep2Schema.safeParse({
    wedding_type: weddingType.value,
    event_date: eventDate.value,
    location_city: locationCity.value,
    initial_budget: Number(initialBudget.value),
  })
  if (!res.success) {
    res.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!errors.value[field]) errors.value[field] = issue.message
    })
    notificationStore.showError(
      res.error.issues.map((i) => i.message).join('\n'),
      'Lengkapi Rencana Acara'
    )
    return false
  }
  return true
}

function validateStep3(): boolean {
  if (selectedLegalCount.value === 0) {
    notificationStore.showError(
      'Pilih minimal 1 berkas persyaratan untuk melanjutkan persiapan administrasi.',
      'Persyaratan Belum Dipilih'
    )
    return false
  }
  return true
}

function validateStep4(): boolean {
  if (selectedVendorCount.value === 0) {
    notificationStore.showError(
      'Pilih minimal 1 vendor rekomendasi untuk memulai persiapan pernikahan Anda.',
      'Vendor Belum Dipilih'
    )
    return false
  }
  return true
}

function handleNext() {
  if (currentStep.value === 1) {
    if (validateStep1()) currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (validateStep2()) currentStep.value = 3
  } else if (currentStep.value === 3) {
    if (validateStep3()) currentStep.value = 4
  } else if (currentStep.value === 4) {
    if (validateStep4()) currentStep.value = 5
  }
}

function handlePrev() {
  if (currentStep.value > 1) {
    currentStep.value = (currentStep.value - 1) as 1 | 2 | 3 | 4
  }
}

async function handleCompleteWizard() {
  const ok = await authStore.completeOnboardingSetup({
    groom_name: groomName.value.trim(),
    bride_name: brideName.value.trim(),
    wedding_type: weddingType.value,
    event_date: eventDate.value,
    location_city: locationCity.value.trim(),
    initial_budget: Number(initialBudget.value),
    selected_recommendation_ids: selectedRecommendationIds.value,
    custom_items: customItems.value.filter((item) =>
      selectedRecommendationIds.value.includes(item.id)
    ),
  })

  if (ok) {
    notificationStore.showToast(
      'Ruang rencana pernikahan Anda berhasil diaktifkan dengan rekomendasi sistem!',
      'Persiapan Resmi Dimulai'
    )
    router.push('/')
  } else {
    notificationStore.showError(
      authStore.error || 'Gagal menyimpan profil dan ceklist awal pernikahan.',
      'Kendala Penyimpanan'
    )
  }
}

onMounted(() => {
  initRecommendations()
})
</script>

<template>
  <div class="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 font-sans text-left">
    <div class="max-w-3xl mx-auto">
      <!-- Brand & Title -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2.5 mb-3 group" aria-label="oondang.id">
          <img src="/icon.png" alt="oondang.id logo" class="w-9 h-9 object-contain" />
          <span class="font-bold text-2xl tracking-tight text-ink">
            oondang<span class="text-primary">.id</span>
          </span>
        </router-link>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          Wizard Persiapan Pernikahan Catin
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5 max-w-lg mx-auto">
          Langkah awal mempersonalisasi profil acara dan kurasi ceklist rekomendasi sistem untuk seluruh modul.
        </p>
      </div>

      <!-- Stepper Progress Bar (Antislop: purposeful, accessible) -->
      <div class="mb-8">
        <div class="grid grid-cols-5 text-center text-[11px] sm:text-xs font-semibold text-ink-muted mb-2 gap-1">
          <span :class="currentStep >= 1 ? 'text-primary font-bold' : ''">1. Calon Mempelai</span>
          <span :class="currentStep >= 2 ? 'text-primary font-bold' : ''">2. Rencana Acara</span>
          <span :class="currentStep >= 3 ? 'text-primary font-bold' : ''">3. Persyaratan</span>
          <span :class="currentStep >= 4 ? 'text-primary font-bold' : ''">4. Ceklist Vendor</span>
          <span :class="currentStep >= 5 ? 'text-primary font-bold' : ''">5. Konfirmasi</span>
        </div>
        <div class="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-300 ease-out"
            :style="{
              width:
                currentStep === 1
                  ? '20%'
                  : currentStep === 2
                    ? '40%'
                    : currentStep === 3
                      ? '60%'
                      : currentStep === 4
                        ? '80%'
                        : '100%'
            }"
          ></div>
        </div>
      </div>

      <!-- Main Card Container -->
      <div class="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
        <!-- STEP 1: Calon Mempelai -->
        <div v-if="currentStep === 1" class="space-y-5">
          <div>
            <h2 class="text-lg font-bold text-ink">
              1. Siapakah Pasangan yang Berbahagia?
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Masukkan nama lengkap kedua calon mempelai sesuai dokumen identitas resmi KTP / Akta Kelahiran.
            </p>
          </div>

          <div class="space-y-4">
            <FormInput
              id="wizard-groom"
              v-model="groomName"
              label="Nama Lengkap Calon Mempelai Pria"
              placeholder="Dimas Prasetyo"
              :error="errors.groom_name"
              required
            />

            <FormInput
              id="wizard-bride"
              v-model="brideName"
              label="Nama Lengkap Calon Mempelai Wanita"
              placeholder="Anissa Rahmawati"
              :error="errors.bride_name"
              required
            />

            <FormInput
              id="wizard-vision"
              v-model="visionNote"
              label="Tema atau Visi Acara (Opsional)"
              placeholder="Contoh: Resepsi hangat dengan konsep intimate nuansa alam"
              :error="errors.vision_note"
              helper="Dapat diperbarui sewaktu-waktu pada halaman profil acara."
            />
          </div>

          <div class="pt-5 border-t border-border flex justify-end">
            <Button variant="primary" @click="handleNext">
              Lanjut ke Rencana Acara &rarr;
            </Button>
          </div>
        </div>

        <!-- STEP 2: Rencana Acara & Pagu Anggaran -->
        <div v-else-if="currentStep === 2" class="space-y-6">
          <div>
            <h2 class="text-lg font-bold text-ink">
              2. Kapan, Di Mana &amp; Berapa Pagu Anggaran Acara?
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Informasi ini digunakan sistem untuk menentukan template berkas resmi dan pos keuangan awal.
            </p>
          </div>

          <!-- Pilihan Jalur Regulasi -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-ink">
              Jalur Prosedur Pernikahan Resmi <span class="text-primary">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                :class="[
                  'p-4 rounded-xl border-2 transition-all cursor-pointer select-none tap-target',
                  weddingType === 'muslim'
                    ? 'border-primary bg-primary-light/20'
                    : 'border-border bg-surface hover:border-stone-400'
                ]"
                @click="weddingType = 'muslim'"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-ink">Muslim (KUA)</span>
                  <span v-if="weddingType === 'muslim'" class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                </div>
                <p class="text-[11px] text-ink-muted mt-1.5 leading-relaxed">
                  Pemberkasan formulir Model N1-N4, bimwin KUA, izin wali nikah, dan buku nikah Kemenag.
                </p>
              </div>

              <div
                :class="[
                  'p-4 rounded-xl border-2 transition-all cursor-pointer select-none tap-target',
                  weddingType === 'non_muslim'
                    ? 'border-primary bg-primary-light/20'
                    : 'border-border bg-surface hover:border-stone-400'
                ]"
                @click="weddingType = 'non_muslim'"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-ink">Non-Muslim (Catatan Sipil)</span>
                  <span v-if="weddingType === 'non_muslim'" class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                </div>
                <p class="text-[11px] text-ink-muted mt-1.5 leading-relaxed">
                  Pencatatan akta perkawinan di kantor Disdukcapil setelah upacara pemberkatan agama.
                </p>
              </div>
            </div>
          </div>

          <!-- Tanggal & Lokasi -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="wizard-date"
              v-model="eventDate"
              type="date"
              label="Target Tanggal Pernikahan"
              :error="errors.event_date"
              required
            />

            <FormInput
              id="wizard-city"
              v-model="locationCity"
              label="Kota / Lokasi Acara"
              placeholder="Jakarta Selatan"
              :error="errors.location_city"
              helper="Untuk penyesuaian aturan KUA atau kantor Disdukcapil setempat."
              required
            />
          </div>

          <!-- Estimasi Pagu Anggaran -->
          <div class="p-4 bg-surface-subtle rounded-xl border border-border space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label for="wizard-budget" class="text-xs font-bold text-ink">
                  Estimasi Target Pagu Anggaran Pernikahan (Budget)
                </label>
                <p class="text-[11px] text-ink-muted">
                  Pagu acuan untuk membatasi seluruh total pengeluaran vendor dan acara.
                </p>
              </div>
              <span class="text-sm font-bold text-primary">
                {{ formatRupiah(initialBudget) }}
              </span>
            </div>

            <!-- Budget Presets -->
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="preset in budgetPresets"
                :key="preset.value"
                type="button"
                :class="[
                  'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors tap-target cursor-pointer',
                  initialBudget === preset.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface border-border text-ink-muted hover:border-stone-400'
                ]"
                @click="initialBudget = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>

            <div class="pt-2">
              <FormInput
                id="wizard-budget"
                v-model.number="initialBudget"
                type="number"
                label="Atau Masukkan Nominal Kustom (Rp)"
                placeholder="150000000"
                :error="errors.initial_budget"
                required
              />
            </div>
          </div>

          <div class="pt-5 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" @click="handlePrev">
              &larr; Kembali
            </Button>
            <Button variant="primary" @click="handleNext">
              Lanjut ke Persyaratan &rarr;
            </Button>
          </div>
        </div>

        <!-- STEP 3: Ceklist Persyaratan & Dokumen Legal -->
        <div v-else-if="currentStep === 3" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-ink">
                3. Ceklist Persyaratan &amp; Dokumen Legal
              </h2>
              <p class="text-xs text-ink-muted mt-0.5">
                Rekomendasi berkas persyaratan wajib berdasarkan jalur {{ weddingType === 'muslim' ? 'Akad Nikah KUA Muslim' : 'Pemberkatan & Catatan Sipil' }}. Anda juga dapat menambahkan berkas sendiri.
              </p>
            </div>

            <!-- Header Actions: Counter & Add Custom Button -->
            <div class="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="sm"
                class="flex items-center gap-1.5"
                @click="openAddCustomModal('legal')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Persyaratan Sendiri
              </Button>
              <div class="px-3 py-1.5 rounded-lg bg-primary-light border border-primary/20 text-xs font-semibold text-primary">
                {{ selectedLegalCount }} dari {{ totalLegalCount }} Berkas Terpilih
              </div>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div class="flex items-center justify-between border-b border-border pb-3">
            <span class="text-xs font-semibold text-ink">
              Daftar Berkas Persyaratan Administrasi
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                @click="selectAllLegal"
              >
                Pilih Semua
              </button>
              <span class="text-ink-light text-xs">&bull;</span>
              <button
                type="button"
                class="text-[11px] font-semibold text-ink-muted hover:underline cursor-pointer"
                @click="selectOnlyEssentialLegal"
              >
                Hanya Wajib
              </button>
            </div>
          </div>

          <!-- Legal Cards List -->
          <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div
              v-for="item in legalRecommendations"
              :key="item.id"
              :class="[
                'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 tap-target select-none',
                selectedRecommendationIds.includes(item.id)
                  ? 'border-primary/50 bg-primary-light/10 shadow-2xs'
                  : 'border-border bg-surface hover:border-stone-300 opacity-75'
              ]"
              @click="toggleRecommendation(item.id)"
            >
              <!-- Checkbox Checkmark -->
              <div class="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  :checked="selectedRecommendationIds.includes(item.id)"
                  class="w-5 h-5 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  @click.stop
                  @change="toggleRecommendation(item.id)"
                />
              </div>

              <!-- Item Details -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm font-bold text-ink leading-tight">
                    {{ item.title }}
                  </h3>
                  <StatusBadge v-if="item.badgeText" :variant="item.isCustom ? 'success' : 'info'">
                    {{ item.badgeText }}
                  </StatusBadge>
                  <span
                    v-if="item.targetDeadline"
                    class="text-[11px] font-medium text-ink-muted bg-surface-subtle px-2 py-0.5 rounded border border-border/80"
                  >
                    Target: {{ item.targetDeadline }}
                  </span>
                </div>
                <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <!-- Action button for custom checklist items -->
              <button
                v-if="item.isCustom || item.id.startsWith('custom-')"
                type="button"
                class="p-2 inline-flex items-center justify-center text-ink-muted hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors tap-target shrink-0 self-center"
                title="Hapus persyaratan kustom ini"
                aria-label="Hapus persyaratan kustom ini"
                @click.stop="removeCustomItem(item.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="pt-5 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" @click="handlePrev">
              &larr; Kembali ke Rencana Acara
            </Button>
            <Button variant="primary" @click="handleNext">
              Lanjut ke Ceklist Vendor &rarr;
            </Button>
          </div>
        </div>

        <!-- STEP 4: Ceklist Vendor -->
        <div v-else-if="currentStep === 4" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-ink">
                4. Ceklist Vendor
              </h2>
              <p class="text-xs text-ink-muted mt-0.5">
                Pilih rekomendasi vendor esensial yang ingin Anda cari dan kurasi untuk hari-H pernikahan. Anda juga dapat menambahkan vendor sendiri.
              </p>
            </div>

            <!-- Header Actions: Counter & Add Custom Button -->
            <div class="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="sm"
                class="flex items-center gap-1.5"
                @click="openAddCustomModal('vendor')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Vendor Sendiri
              </Button>
              <div class="px-3 py-1.5 rounded-lg bg-primary-light border border-primary/20 text-xs font-semibold text-primary">
                {{ selectedVendorCount }} dari {{ totalVendorCount }} Vendor Terpilih
              </div>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div class="flex items-center justify-between border-b border-border pb-3">
            <span class="text-xs font-semibold text-ink">
              Daftar Kebutuhan Vendor Pernikahan
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                @click="selectAllVendor"
              >
                Pilih Semua
              </button>
              <span class="text-ink-light text-xs">&bull;</span>
              <button
                type="button"
                class="text-[11px] font-semibold text-ink-muted hover:underline cursor-pointer"
                @click="selectOnlyEssentialVendor"
              >
                Hanya Wajib
              </button>
            </div>
          </div>

          <!-- Vendor Cards List -->
          <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div
              v-for="item in vendorRecommendations"
              :key="item.id"
              :class="[
                'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 tap-target select-none',
                selectedRecommendationIds.includes(item.id)
                  ? 'border-primary/50 bg-primary-light/10 shadow-2xs'
                  : 'border-border bg-surface hover:border-stone-300 opacity-75'
              ]"
              @click="toggleRecommendation(item.id)"
            >
              <!-- Checkbox Checkmark -->
              <div class="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  :checked="selectedRecommendationIds.includes(item.id)"
                  class="w-5 h-5 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  @click.stop
                  @change="toggleRecommendation(item.id)"
                />
              </div>

              <!-- Item Details -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm font-bold text-ink leading-tight">
                    {{ item.title }}
                  </h3>
                  <StatusBadge v-if="item.badgeText" :variant="item.isCustom ? 'success' : 'info'">
                    {{ item.badgeText }}
                  </StatusBadge>
                  <span
                    v-if="item.targetDeadline"
                    class="text-[11px] font-medium text-ink-muted bg-surface-subtle px-2 py-0.5 rounded border border-border/80"
                  >
                    Target: {{ item.targetDeadline }}
                  </span>
                </div>
                <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <!-- Action button for custom checklist items -->
              <button
                v-if="item.isCustom || item.id.startsWith('custom-')"
                type="button"
                class="p-2 inline-flex items-center justify-center text-ink-muted hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors tap-target shrink-0 self-center"
                title="Hapus vendor kustom ini"
                aria-label="Hapus vendor kustom ini"
                @click.stop="removeCustomItem(item.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="pt-5 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" @click="handlePrev">
              &larr; Kembali ke Persyaratan
            </Button>
            <Button variant="primary" @click="handleNext">
              Review Ringkasan &rarr;
            </Button>
          </div>
        </div>

        <!-- STEP 5: Konfirmasi Ringkasan & Aktivasi Ruang Rencana -->
        <div v-else-if="currentStep === 5" class="space-y-6">
          <div>
            <h2 class="text-lg font-bold text-ink">
              5. Konfirmasi &amp; Aktivasi Ruang Rencana
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Seluruh ceklist persyaratan dan kebutuhan vendor yang Anda kurasi akan langsung diaktifkan ke dashboard serta modul terkait.
            </p>
          </div>

          <!-- Summary Preview Card -->
          <div class="p-6 bg-surface-subtle rounded-2xl border border-border space-y-5">
            <!-- Header Summary -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-ink-muted font-bold">Calon Pengantin</span>
                <p class="text-xl font-extrabold text-ink mt-0.5">
                  {{ groomName }} &amp; {{ brideName }}
                </p>
                <p class="text-xs text-ink-muted mt-0.5">
                  {{ locationCity }} &bull; {{ weddingType === 'muslim' ? 'Jalur Akad KUA Muslim' : 'Jalur Catatan Sipil' }}
                </p>
              </div>

              <div class="text-left sm:text-right bg-surface p-3 px-4 rounded-xl border border-border">
                <span class="text-[10px] uppercase font-bold text-ink-muted">Hitung Mundur</span>
                <p class="text-xl font-extrabold text-primary leading-tight">
                  {{ daysRemaining }} Hari
                </p>
                <span class="text-[11px] text-ink-muted">Target: {{ eventDate }}</span>
              </div>
            </div>

            <!-- Financial Summary Pill -->
            <div class="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-ink">Pagu Anggaran Disiapkan</span>
                <p class="text-[11px] text-ink-muted">Batas pagu operasional pernikahan awal Anda</p>
              </div>
              <span class="text-base font-extrabold text-primary">
                {{ formatRupiah(initialBudget) }}
              </span>
            </div>

            <!-- Module Readiness Counters -->
            <div>
              <span class="text-xs font-bold text-ink block mb-2">
                Modul yang Siap Diaktifkan Bersama Ceklist Rekomendasi:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div class="p-3 bg-surface rounded-xl border border-border">
                  <span class="text-xl font-extrabold text-ink">{{ selectedLegalCount }}</span>
                  <p class="text-[11px] text-ink-muted mt-0.5 font-medium">Berkas Legal</p>
                </div>

                <div class="p-3 bg-surface rounded-xl border border-border">
                  <span class="text-xl font-extrabold text-ink">{{ selectedVendorCount }}</span>
                  <p class="text-[11px] text-ink-muted mt-0.5 font-medium">Vendor Acuan</p>
                </div>
              </div>
            </div>

            <div v-if="visionNote" class="text-xs text-ink-muted pt-1">
              <strong class="text-ink">Visi Konsep:</strong> {{ visionNote }}
            </div>
          </div>

          <div class="pt-5 border-t border-border flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" @click="handlePrev">
              &larr; Ubah Ceklist
            </Button>
            <Button
              variant="primary"
              :loading="authStore.isLoading"
              @click="handleCompleteWizard"
            >
              Aktifkan Ruang Rencana &amp; Buka Dashboard &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dialog: Tambah Ceklist Kustom Catin -->
    <ModalDialog
      :is-open="isAddCustomModalOpen"
      title="Tambah Ceklist Kustom Anda"
      description="Buat ceklist khusus yang spesifik untuk kebutuhan pernikahan Anda dan pasangan."
      max-width="md"
      @close="isAddCustomModalOpen = false"
    >
      <div class="space-y-4">
        <FormInput
          id="custom-checklist-title"
          v-model="customTitle"
          label="Nama / Judul Ceklist"
          placeholder="Misal: Fitting busana keluarga, Sewa photobooth"
          :error="customError"
          required
        />

        <FormSelect
          id="custom-checklist-category"
          v-model="customCategory"
          :options="categoryOptions"
          label="Kategori Modul"
          helper="Tentukan modul persiapan yang sesuai dengan ceklist ini"
        />

        <FormInput
          id="custom-checklist-target"
          v-model="customTarget"
          label="Target Tenggat / Waktu (Opsional)"
          placeholder="Misal: H-60 atau 2 Minggu Sebelum Akad"
          helper="Estimasi waktu pengerjaan item ceklist ini"
        />

        <div>
          <label for="custom-checklist-desc" class="text-xs font-semibold text-ink block mb-1.5">
            Catatan / Detail Tambahan (Opsional)
          </label>
          <textarea
            id="custom-checklist-desc"
            v-model="customDescription"
            rows="3"
            class="w-full p-3 text-sm bg-surface border border-border rounded-lg text-ink font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:border-primary hover:border-stone-400"
            placeholder="Catatan detail atau hal penting yang perlu diingat..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <Button variant="outline" size="sm" @click="isAddCustomModalOpen = false">
          Batal
        </Button>
        <Button variant="primary" size="sm" @click="handleAddCustomItem">
          Simpan Ceklist
        </Button>
      </template>
    </ModalDialog>
  </div>
</template>
