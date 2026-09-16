<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import FormInput from '@/components/common/FormInput.vue'
import FormSelect from '@/components/common/FormSelect.vue'
import Button from '@/components/common/Button.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import type { WeddingType } from '@/types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const groomName = ref('')
const brideName = ref('')
const weddingType = ref<WeddingType>('muslim')
const eventDate = ref('')
const locationCity = ref('')
const notes = ref('')

const weddingTypeOptions = [
  { value: 'muslim', label: 'Muslim (Akad Nikah KUA)' },
  { value: 'non_muslim', label: 'Non-Muslim (Catatan Sipil / Disdukcapil)' },
]

function initFormData() {
  if (authStore.profile) {
    groomName.value = authStore.profile.groom_name
    brideName.value = authStore.profile.bride_name
    weddingType.value = authStore.profile.wedding_type
    eventDate.value = authStore.profile.event_date
    locationCity.value = authStore.profile.location_city || ''
  }
}

const catinInitials = computed(() => {
  const g = groomName.value ? groomName.value.charAt(0) : 'P'
  const b = brideName.value ? brideName.value.charAt(0) : 'W'
  return `${g} & ${b}`
})

const daysRemaining = computed(() => {
  if (!eventDate.value) return 0
  const target = new Date(eventDate.value)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

async function handleSaveProfile() {
  if (!groomName.value.trim() || !brideName.value.trim() || !eventDate.value) {
    notificationStore.showError('Nama kedua mempelai dan target tanggal acara wajib diisi.', 'Formulir Belum Lengkap')
    return
  }

  const ok = await authStore.saveWeddingProfile({
    groom_name: groomName.value.trim(),
    bride_name: brideName.value.trim(),
    wedding_type: weddingType.value,
    event_date: eventDate.value,
    location_city: locationCity.value.trim() || undefined,
  })

  if (ok) {
    notificationStore.showToast('Profil acara pernikahan berhasil diperbarui dan disimpan.', 'Profil Tersimpan')
  } else {
    notificationStore.showError(authStore.error || 'Gagal menyimpan profil pernikahan.', 'Gagal Menyimpan Profil')
  }
}

const isLoading = ref(!authStore.profile)

onMounted(async () => {
  if (!authStore.profile) {
    isLoading.value = true
    try {
      await authStore.fetchCurrentUser()
    } finally {
      isLoading.value = false
    }
  }
  initFormData()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-4xl mx-auto text-left">
      <!-- Header Module -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          Profil &amp; Informasi Acara Pernikahan
        </h1>
        <p class="text-sm text-ink-muted mt-1">
          Kelola data calon mempelai, tanggal sakral pernikahan, dan preferensi wilayah acara.
        </p>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Hero Summary Card Skeleton -->
        <div class="p-6 bg-surface rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm animate-pulse">
          <div class="flex items-center gap-4 w-full">
            <div class="w-16 h-16 rounded-2xl bg-stone-200 shrink-0"></div>
            <div class="space-y-2 w-full max-w-sm">
              <div class="h-4 bg-stone-200 rounded w-24"></div>
              <div class="h-6 bg-stone-200 rounded w-48"></div>
              <div class="h-3 bg-stone-200 rounded w-36"></div>
            </div>
          </div>
          <div class="bg-surface-subtle p-3.5 px-5 rounded-xl border border-border w-full sm:w-36 h-20 shrink-0 flex flex-col items-center justify-center space-y-1.5">
            <div class="h-3 bg-stone-200 rounded w-16"></div>
            <div class="h-6 bg-stone-200 rounded w-10"></div>
          </div>
        </div>

        <!-- Form Settings Card Skeleton -->
        <div class="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm animate-pulse space-y-6">
          <div class="space-y-4">
            <div class="h-4 bg-stone-200 rounded w-40 pb-2 border-b border-border"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-11 bg-stone-200 rounded-lg"></div>
              <div class="h-11 bg-stone-200 rounded-lg"></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-4 bg-stone-200 rounded w-40 pb-2 border-b border-border"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-11 bg-stone-200 rounded-lg"></div>
              <div class="h-11 bg-stone-200 rounded-lg"></div>
            </div>
          </div>
          <div class="pt-4 border-t border-border flex justify-end">
            <div class="h-10 bg-stone-200 rounded-lg w-44"></div>
          </div>
        </div>
      </div>

      <!-- Main Profile Content -->
      <template v-else>
        <!-- Hero Summary Card -->
        <div class="p-6 bg-surface rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0">
              {{ catinInitials }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <StatusBadge variant="info">
                  {{ weddingType === 'muslim' ? 'KUA Muslim' : 'Catatan Sipil' }}
                </StatusBadge>
                <span class="text-xs text-ink-muted">
                  {{ locationCity || 'Indonesia' }}
                </span>
              </div>
              <h2 class="text-xl font-bold text-ink mt-1">
                {{ groomName || 'Mempelai Pria' }} &amp; {{ brideName || 'Mempelai Wanita' }}
              </h2>
              <p class="text-xs text-ink-muted mt-0.5">
                Akun Terdaftar: {{ authStore.user?.email || 'Belum ada email' }}
              </p>
            </div>
          </div>

          <div class="bg-surface-subtle p-3.5 px-5 rounded-xl border border-border text-center min-w-[140px] w-full sm:w-auto">
            <span class="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Hitung Mundur</span>
            <div class="text-2xl font-extrabold text-primary mt-0.5">
              {{ daysRemaining }}
            </div>
            <span class="text-xs text-ink-muted">Hari Menuju Akad</span>
          </div>
        </div>

        <!-- Form Settings Card -->
        <div class="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
          <form class="space-y-6" @submit.prevent="handleSaveProfile">
          <!-- Section 1: Data Mempelai -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-ink pb-2 border-b border-border">
              1. Identitas Calon Pengantin
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <FormInput
                id="profile-groom"
                v-model="groomName"
                label="Nama Calon Mempelai Pria"
                placeholder="Dimas Prasetyo"
                required
              />

              <FormInput
                id="profile-bride"
                v-model="brideName"
                label="Nama Calon Mempelai Wanita"
                placeholder="Anissa Rahmawati"
                required
              />
            </div>
          </div>

          <!-- Section 2: Jadwal & Wilayah -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-ink pb-2 border-b border-border">
              2. Waktu &amp; Wilayah Acara
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <FormInput
                id="profile-date"
                v-model="eventDate"
                type="date"
                label="Target Tanggal Pernikahan"
                required
              />

              <FormSelect
                id="profile-type"
                v-model="weddingType"
                :options="weddingTypeOptions"
                label="Prosedur Pencatatan Resmi"
                required
                helper="Menentukan template syarat berkas KUA vs Catatan Sipil."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <FormInput
                id="profile-city"
                v-model="locationCity"
                label="Kota / Kabupaten Acara"
                placeholder="Jakarta Selatan"
                helper="Digunakan untuk penyesuaian aturan KUA setempat."
              />

              <FormInput
                id="profile-notes"
                v-model="notes"
                label="Catatan Tema / Visi (Opsional)"
                placeholder="Contoh: Konsep intimate wedding nuansa hangat"
              />
            </div>
          </div>



          <!-- Action Buttons -->
          <div class="pt-4 border-t border-border flex items-center justify-between gap-4">
            <span class="text-xs text-ink-muted">
              Perubahan profil akan langsung menyesuaikan ringkasan modul lainnya.
            </span>

            <Button
              type="submit"
              variant="primary"
              :loading="authStore.isLoading"
            >
              Simpan Perubahan Profil
            </Button>
          </div>
        </form>
      </div>

      <!-- Quick Links to other modules -->
      <div class="p-5 bg-surface rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 class="text-sm font-bold text-ink">
            Lanjut Persiapan Berkas &amp; Vendor
          </h4>
          <p class="text-xs text-ink-muted mt-0.5">
            Lihat daftar dokumen yang harus dilengkapi berdasarkan profil acara ini.
          </p>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <router-link to="/requirements" class="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" class="w-full">
              Cek Berkas KUA
            </Button>
          </router-link>
          <router-link to="/vendors" class="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" class="w-full">
              Kelola Vendor
            </Button>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</AppLayout>
</template>
