<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
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
  createVendor,
  updateVendor,
  deleteVendor
} from '@/services/vendorService'
import type { Vendor, VendorStatus, VendorCategory } from '@/types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const vendors = ref<Vendor[]>([])
const isLoading = ref(true)
const activeStatus = ref<string>('all')
const activeCategory = ref<string>('all')
const searchQuery = ref<string>('')

// Modal Tambah / Edit
const isModalOpen = ref(false)
const editingVendor = ref<Vendor | null>(null)
const formName = ref('')
const formCategory = ref<VendorCategory>('catering')
const formContactPerson = ref('')
const formContactPhone = ref('')
const formStatus = ref<VendorStatus>('riset')
const formNotes = ref('')
const formError = ref('')

// Modal Hapus
const isDeleteModalOpen = ref(false)
const vendorToDelete = ref<Vendor | null>(null)

let unsubscribe: (() => void) | null = null

const categoryOptions = [
  { value: 'catering', label: 'Catering & Konsumsi' },
  { value: 'venue', label: 'Gedung / Tempat Acara' },
  { value: 'mua', label: 'MUA & Rias Pengantin' },
  { value: 'wo', label: 'Wedding Organizer (WO)' },
  { value: 'decor', label: 'Dekorasi & Pelaminan' },
  { value: 'photo_video', label: 'Fotografi & Videografi' },
  { value: 'attire', label: 'Busana & Gaun Pengantin' },
  { value: 'invitation', label: 'Undangan & Souvenir' },
  { value: 'other', label: 'Lain-lain' },
]

const statusOptions = [
  { value: 'riset', label: 'Riset & Perbandingan' },
  { value: 'dealing', label: 'Negosiasi & Dealing' },
  { value: 'terkontrak', label: 'Terkontrak (Deal)' },
  { value: 'selesai', label: 'Selesai' },
]

const categoryFilterOptions = computed(() => [
  { value: 'all', label: 'Semua Kategori Vendor' },
  ...categoryOptions,
])

async function setupVendorsSubscription() {
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
    unsubscribe = subscribeVendors(
      profileId,
      (realtimeVendors) => {
        vendors.value = realtimeVendors
        isLoading.value = false
      },
      (err) => {
        console.warn('Gagal sinkronisasi data realtime vendor, beralih ke data lokal:', err)
        isLoading.value = false
        if (import.meta.env.VITE_USE_MOCK !== 'false') {
          loadMockVendors()
        }
      }
    )
  } else {
    if (authStore.token === 'mock-jwt-token-wedding-catin' || import.meta.env.VITE_USE_MOCK !== 'false') {
      loadMockVendors()
    } else {
      isLoading.value = false
    }
  }
}

async function loadMockVendors() {
  isLoading.value = true
  try {
    const res = await api.get<Vendor[]>('/vendors')
    vendors.value = res.data
  } catch (err: any) {
    console.error('Gagal mengambil daftar vendor', err)
    notificationStore.showError(err?.message || 'Gagal mengambil daftar vendor.', 'Gagal Memuat Vendor')
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  editingVendor.value = null
  formName.value = ''
  formCategory.value = 'catering'
  formContactPerson.value = ''
  formContactPhone.value = ''
  formStatus.value = 'riset'
  formNotes.value = ''
  formError.value = ''
  isModalOpen.value = true
}

function openEditModal(vendor: Vendor) {
  if (vendor.is_locked) return
  editingVendor.value = vendor
  formName.value = vendor.name
  formCategory.value = vendor.category
  formContactPerson.value = vendor.contact_person || ''
  formContactPhone.value = vendor.contact_phone || ''
  formStatus.value = vendor.status
  formNotes.value = vendor.notes || ''
  formError.value = ''
  isModalOpen.value = true
}

async function handleSaveVendor() {
  formError.value = ''
  if (!formName.value.trim()) {
    formError.value = 'Nama vendor atau perusahaan wajib diisi.'
    notificationStore.showError('Nama vendor atau perusahaan wajib diisi.', 'Formulir Belum Lengkap')
    return
  }

  const payload = {
    name: formName.value.trim(),
    category: formCategory.value,
    contact_person: formContactPerson.value.trim() || null,
    contact_phone: formContactPhone.value.trim() || null,
    status: formStatus.value,
    notes: formNotes.value.trim() || null,
  }

  const profileId = authStore.profile?.id

  try {
    if (editingVendor.value) {
      if (profileId) {
        await updateVendor(profileId, editingVendor.value.id, payload)
      } else {
        const res = await api.put<Vendor>(`/vendors/${editingVendor.value.id}`, payload)
        const idx = vendors.value.findIndex((v) => v.id === editingVendor.value!.id)
        if (idx !== -1) {
          vendors.value[idx] = res.data
        }
      }
      notificationStore.showToast(`Vendor "${payload.name}" berhasil diperbarui.`, 'Vendor Diperbarui')
    } else {
      if (profileId) {
        await createVendor(profileId, payload)
      } else {
        const res = await api.post<Vendor>('/vendors', payload)
        vendors.value.push(res.data)
      }
      notificationStore.showToast(`Vendor "${payload.name}" berhasil ditambahkan.`, 'Vendor Tersimpan')
    }
    isModalOpen.value = false
  } catch (err: any) {
    formError.value = err?.message || 'Gagal menyimpan data vendor.'
    notificationStore.showError(err?.message || 'Gagal menyimpan data vendor.', 'Gagal Menyimpan Vendor')
  }
}

async function handleQuickStatusChange(vendor: Vendor, newStatus: VendorStatus) {
  if (vendor.is_locked) return
  const profileId = authStore.profile?.id

  try {
    if (profileId) {
      await updateVendor(profileId, vendor.id, { status: newStatus })
    } else {
      const res = await api.patch<Vendor>(`/vendors/${vendor.id}/status`, { status: newStatus })
      const idx = vendors.value.findIndex((v) => v.id === vendor.id)
      if (idx !== -1) {
        vendors.value[idx] = res.data
      }
    }
    notificationStore.showToast(`Status vendor "${vendor.name}" diubah ke ${newStatus}.`, 'Status Diperbarui')
  } catch (err: any) {
    console.error('Gagal mengubah status vendor', err)
    notificationStore.showError(err?.message || 'Gagal mengubah status vendor.', 'Gagal Mengubah Status')
  }
}

function confirmDelete(vendor: Vendor) {
  if (vendor.is_locked) return
  vendorToDelete.value = vendor
  isDeleteModalOpen.value = true
}

async function handleDeleteVendor() {
  if (!vendorToDelete.value) return
  const profileId = authStore.profile?.id
  const targetId = vendorToDelete.value.id
  const deletedName = vendorToDelete.value.name

  try {
    if (profileId) {
      await deleteVendor(profileId, targetId)
    } else {
      await api.delete(`/vendors/${targetId}`)
      vendors.value = vendors.value.filter((v) => v.id !== targetId)
    }
    isDeleteModalOpen.value = false
    vendorToDelete.value = null
    notificationStore.showToast(`Vendor "${deletedName}" berhasil dihapus.`, 'Vendor Dihapus')
  } catch (err: any) {
    notificationStore.showError(err?.message || 'Gagal menghapus vendor.', 'Gagal Menghapus Vendor')
  }
}

function cleanWaNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  return cleaned
}

const filteredVendors = computed(() => {
  return vendors.value.filter((vendor) => {
    const matchesStatus =
      activeStatus.value === 'all' || vendor.status === activeStatus.value

    const matchesCategory =
      activeCategory.value === 'all' || vendor.category === activeCategory.value

    const matchesSearch =
      searchQuery.value.trim() === '' ||
      vendor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (vendor.contact_person &&
        vendor.contact_person.toLowerCase().includes(searchQuery.value.toLowerCase()))

    return matchesStatus && matchesCategory && matchesSearch
  })
})

function getStatusBadgeVariant(status: VendorStatus) {
  switch (status) {
    case 'terkontrak':
    case 'selesai':
      return 'success'
    case 'dealing':
      return 'warning'
    case 'riset':
    default:
      return 'neutral'
  }
}

function getCategoryName(cat: VendorCategory): string {
  const found = categoryOptions.find((c) => c.value === cat)
  return found ? found.label : cat
}

watch(
  () => authStore.profile?.id,
  () => {
    setupVendorsSubscription()
  }
)

onMounted(() => {
  setupVendorsSubscription()
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
            Manajemen Vendor Pernikahan
          </h1>
          <p class="text-sm text-ink-muted mt-1">
            Pantau perbandingan, proses negosiasi, dan kontrak seluruh mitra acara Anda.
          </p>
        </div>

        <Button variant="primary" size="sm" @click="openAddModal">
          + Tambah Vendor Baru
        </Button>
      </div>



      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Filter Controls Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
          <div class="sm:col-span-2 h-11 bg-stone-200 rounded-lg"></div>
          <div class="h-11 bg-stone-200 rounded-lg"></div>
        </div>

        <!-- Status Tabs Skeleton -->
        <div class="flex items-center gap-2 border-b border-border pb-3 animate-pulse">
          <div v-for="n in 5" :key="n" class="h-7 bg-stone-200 rounded-lg w-20"></div>
        </div>

        <!-- Cards Grid Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="n in 4"
            :key="n"
            class="p-5 bg-surface rounded-2xl border border-border shadow-sm animate-pulse space-y-4"
          >
            <div class="flex items-start justify-between">
              <div class="space-y-2 w-1/2">
                <div class="h-3 bg-stone-200 rounded w-1/3"></div>
                <div class="h-5 bg-stone-200 rounded w-3/4"></div>
              </div>
              <div class="h-6 bg-stone-200 rounded-full w-24"></div>
            </div>
            <div class="h-12 bg-stone-200/50 rounded-lg w-full"></div>
            <div class="pt-3 border-t border-border flex justify-between items-center">
              <div class="h-4 bg-stone-200 rounded w-28"></div>
              <div class="flex items-center gap-2">
                <div class="h-6 bg-stone-200 rounded-lg w-16"></div>
                <div class="h-6 bg-stone-200 rounded-lg w-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Vendors Content -->
      <template v-else>
        <!-- Filter Controls: Search & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama vendor atau kontak PIC..."
              class="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-lg text-ink font-sans placeholder:text-ink-light focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>
          <div>
            <FormSelect
              v-model="activeCategory"
              :options="categoryFilterOptions"
              size="md"
            />
          </div>
        </div>

        <!-- Status Tabs Filter with counts -->
        <div class="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer tap-target',
              activeStatus === 'all'
                ? 'bg-ink text-white font-semibold'
                : 'bg-surface-subtle text-ink-muted hover:text-ink'
            ]"
            @click="activeStatus = 'all'"
          >
            Semua ({{ vendors.length }})
          </button>
          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer tap-target',
              activeStatus === 'riset'
                ? 'bg-ink text-white font-semibold'
                : 'bg-surface-subtle text-ink-muted hover:text-ink'
            ]"
            @click="activeStatus = 'riset'"
          >
            Riset ({{ vendors.filter(v => v.status === 'riset').length }})
          </button>
          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer tap-target',
              activeStatus === 'dealing'
                ? 'bg-ink text-white font-semibold'
                : 'bg-surface-subtle text-ink-muted hover:text-ink'
            ]"
            @click="activeStatus = 'dealing'"
          >
            Dealing ({{ vendors.filter(v => v.status === 'dealing').length }})
          </button>
          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer tap-target',
              activeStatus === 'terkontrak'
                ? 'bg-ink text-white font-semibold'
                : 'bg-surface-subtle text-ink-muted hover:text-ink'
            ]"
            @click="activeStatus = 'terkontrak'"
          >
            Terkontrak ({{ vendors.filter(v => v.status === 'terkontrak').length }})
          </button>
          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer tap-target',
              activeStatus === 'selesai'
                ? 'bg-ink text-white font-semibold'
                : 'bg-surface-subtle text-ink-muted hover:text-ink'
            ]"
            @click="activeStatus = 'selesai'"
          >
            Selesai ({{ vendors.filter(v => v.status === 'selesai').length }})
          </button>
        </div>

        <!-- Vendor Cards Grid -->
        <div v-if="filteredVendors.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            :class="[
              'p-5 bg-surface rounded-2xl border flex flex-col justify-between transition-all shadow-sm',
              vendor.is_locked
                ? 'border-primary/40 bg-primary-light/10 ring-1 ring-primary/20'
                : 'border-border hover:border-stone-400/60'
            ]"
          >
            <!-- Top Section -->
            <div>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {{ getCategoryName(vendor.category) }}
                  </span>
                  <h2 class="text-base font-bold text-ink mt-0.5">
                    {{ vendor.name }}
                  </h2>
                </div>

                <!-- Status Badge / Lock Indicator -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <StatusBadge v-if="vendor.is_locked" variant="locked" size="sm">
                    <svg class="w-3 h-3 text-stone-600 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Phase 2: Segera Hadir
                  </StatusBadge>
                  <StatusBadge v-else :variant="getStatusBadgeVariant(vendor.status)" size="sm">
                    {{ vendor.status }}
                  </StatusBadge>
                </div>
              </div>

              <!-- Notes / Offering -->
              <p v-if="vendor.notes" class="text-xs text-ink-muted mt-2.5 line-clamp-3 leading-relaxed">
                {{ vendor.notes }}
              </p>
            </div>

            <!-- Bottom Section: Contact & Actions -->
            <div class="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2">
                <span v-if="vendor.contact_person" class="font-medium text-ink">
                  PIC: {{ vendor.contact_person }}
                </span>

                <!-- WhatsApp Action Button (Antislop R-26: functional link) -->
                <a
                  v-if="vendor.contact_phone"
                  :href="'https://wa.me/' + cleanWaNumber(vendor.contact_phone)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sage hover:underline font-medium tap-target"
                  title="Hubungi via WhatsApp"
                >
                  <span>Chat WA</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <!-- Action Buttons (Edit / Delete) -->
              <div v-if="!vendor.is_locked" class="flex items-center gap-1">
                <!-- Quick Status Dropdown -->
                <div class="w-28">
                  <FormSelect
                    :model-value="vendor.status"
                    :options="statusOptions"
                    size="xs"
                    @update:model-value="handleQuickStatusChange(vendor, $event as VendorStatus)"
                  />
                </div>

                <!-- Edit Button -->
                <button
                  type="button"
                  class="p-1 inline-flex items-center justify-center text-ink-light hover:text-primary rounded hover:bg-primary-light/30 transition-colors tap-target cursor-pointer"
                  title="Edit vendor"
                  @click="openEditModal(vendor)"
                  aria-label="Edit vendor"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Delete Button -->
                <button
                  type="button"
                  class="p-1 inline-flex items-center justify-center text-ink-light hover:text-red-700 rounded hover:bg-red-50 transition-colors tap-target cursor-pointer"
                  title="Hapus vendor"
                  @click="confirmDelete(vendor)"
                  aria-label="Hapus vendor"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State (Antislop R-27) -->
        <EmptyState
          v-else
          title="Tidak ada vendor yang cocok"
          description="Cobalah mencari dengan kata kunci lain atau reset filter status dan kategori."
          action-label="+ Tambah Vendor Baru"
          @action="openAddModal"
        />
      </template>

      <!-- Modal Tambah & Edit Vendor -->
      <ModalDialog
        :is-open="isModalOpen"
        :title="editingVendor ? 'Edit Data Mitra Vendor' : 'Tambah Mitra Vendor Baru'"
        :description="editingVendor ? 'Perbarui informasi PIC, status negosiasi, atau kesepakatan paket.' : 'Catat vendor baru untuk perbandingan atau pencatatan kontrak resmi.'"
        @close="isModalOpen = false"
      >
        <div class="space-y-4">
          <FormInput
            id="vendor-name"
            v-model="formName"
            label="Nama Vendor / Perusahaan"
            placeholder="Contoh: Dapur Nusantara Catering"
            :error="formError"
            required
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              id="vendor-category"
              v-model="formCategory"
              :options="categoryOptions"
              label="Kategori Layanan"
              required
            />

            <FormSelect
              id="vendor-status"
              v-model="formStatus"
              :options="statusOptions"
              label="Status Kemajuan"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="vendor-pic"
              v-model="formContactPerson"
              label="Nama Kontak PIC"
              placeholder="Contoh: Ibu Ratna"
            />

            <FormInput
              id="vendor-phone"
              v-model="formContactPhone"
              label="Nomor WhatsApp / HP"
              placeholder="081311223344"
              helper="Dapat langsung dihubungi via tombol WA."
            />
          </div>

          <FormInput
            id="vendor-notes"
            v-model="formNotes"
            label="Catatan Paket / Penawaran Biaya"
            placeholder="Contoh: Paket 800 pax include pondokan dan welcome drink senilai Rp 55 juta."
          />
        </div>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isModalOpen = false">
            Batal
          </Button>
          <Button variant="primary" size="sm" @click="handleSaveVendor">
            {{ editingVendor ? 'Simpan Perubahan' : 'Simpan Vendor' }}
          </Button>
        </template>
      </ModalDialog>

      <!-- Modal Konfirmasi Hapus Vendor -->
      <ModalDialog
        :is-open="isDeleteModalOpen"
        title="Hapus Mitra Vendor"
        description="Apakah Anda yakin ingin menghapus vendor ini dari catatan perencanaan pernikahan?"
        @close="isDeleteModalOpen = false"
      >
        <p class="text-sm text-ink font-semibold">
          "{{ vendorToDelete?.name }}"
        </p>
        <p class="text-xs text-ink-muted mt-1">
          Catatan vendor ini akan dihapus. Vendor bawaan sistem oondang.id tetap aman.
        </p>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isDeleteModalOpen = false">
            Batal
          </Button>
          <Button variant="danger" size="sm" @click="handleDeleteVendor">
            Ya, Hapus Vendor
          </Button>
        </template>
      </ModalDialog>
    </div>
  </AppLayout>
</template>
