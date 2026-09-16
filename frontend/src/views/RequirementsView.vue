<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import FormCheckbox from '@/components/common/FormCheckbox.vue'
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
  subscribeRequirements,
  createRequirement,
  toggleRequirement,
  deleteRequirement
} from '@/services/requirementService'
import type { RequirementItem, RequirementCategory } from '@/types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const items = ref<RequirementItem[]>([])
const isLoading = ref(true)
const statusFilter = ref<'all' | 'pending' | 'completed'>('all')
const categoryFilter = ref<'all' | 'kua' | 'civil_registry' | 'custom'>('all')

const categoryFilterOptions = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'kua', label: 'Resmi KUA' },
  { value: 'civil_registry', label: 'Catatan Sipil' },
  { value: 'custom', label: 'Kustom Catin' },
]

const isAddModalOpen = ref(false)
const newTitle = ref('')
const newNotes = ref('')
const newDueDate = ref('')
const addError = ref('')

const isDeleteModalOpen = ref(false)
const itemToDelete = ref<RequirementItem | null>(null)

let unsubscribe: (() => void) | null = null

async function setupRequirementsSubscription() {
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
    unsubscribe = subscribeRequirements(
      profileId,
      (realtimeItems) => {
        items.value = realtimeItems
        isLoading.value = false
      },
      (err) => {
        console.warn('Gagal sinkronisasi data realtime berkas, beralih ke data lokal:', err)
        isLoading.value = false
        if (import.meta.env.VITE_USE_MOCK !== 'false') {
          loadMockRequirements()
        }
      }
    )
  } else {
    if (authStore.token === 'mock-jwt-token-wedding-catin' || import.meta.env.VITE_USE_MOCK !== 'false') {
      loadMockRequirements()
    } else {
      isLoading.value = false
    }
  }
}

async function loadMockRequirements() {
  isLoading.value = true
  try {
    const res = await api.get<RequirementItem[]>('/requirements')
    items.value = res.data
  } catch (err: any) {
    console.error('Gagal mengambil daftar berkas', err)
    notificationStore.showError(err?.message || 'Gagal mengambil daftar berkas.', 'Gagal Memuat Berkas')
  } finally {
    isLoading.value = false
  }
}

async function handleToggle(item: RequirementItem) {
  const profileId = authStore.profile?.id
  const nextStatus = !item.is_completed

  try {
    if (profileId) {
      await toggleRequirement(profileId, item.id, nextStatus)
    } else {
      const res = await api.patch<RequirementItem>(`/requirements/${item.id}/toggle`)
      const idx = items.value.findIndex((it) => it.id === item.id)
      if (idx !== -1) {
        items.value[idx] = res.data
      }
    }
    notificationStore.showToast(
      nextStatus ? `Berkas "${item.title}" ditandai selesai.` : `Status berkas "${item.title}" dibuka kembali.`,
      'Status Diperbarui'
    )
  } catch (err: any) {
    console.error('Gagal mengubah status berkas', err)
    notificationStore.showError(err?.message || 'Gagal mengubah status berkas.', 'Gagal Mengubah Status')
  }
}

async function handleAddCustom() {
  addError.value = ''
  if (!newTitle.value.trim()) {
    addError.value = 'Nama berkas persyaratan wajib diisi.'
    notificationStore.showError('Nama berkas persyaratan wajib diisi.', 'Formulir Belum Lengkap')
    return
  }

  const profileId = authStore.profile?.id
  try {
    if (profileId) {
      await createRequirement(profileId, {
        title: newTitle.value.trim(),
        notes: newNotes.value.trim() || null,
        due_date: newDueDate.value || null,
        category: 'custom'
      })
    } else {
      const res = await api.post<RequirementItem>('/requirements', {
        title: newTitle.value.trim(),
        notes: newNotes.value.trim() || null,
        due_date: newDueDate.value || null,
        category: 'custom' as RequirementCategory,
      })
      items.value.unshift(res.data)
    }

    newTitle.value = ''
    newNotes.value = ''
    newDueDate.value = ''
    isAddModalOpen.value = false
    notificationStore.showToast('Berkas kustom berhasil ditambahkan.', 'Berkas Tersimpan')
  } catch (err: any) {
    addError.value = err?.message || 'Gagal menambahkan berkas.'
    notificationStore.showError(err?.message || 'Gagal menambahkan berkas.', 'Gagal Menambah Berkas')
  }
}

function confirmDelete(item: RequirementItem) {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!itemToDelete.value) return
  const profileId = authStore.profile?.id
  const targetId = itemToDelete.value.id
  const deletedTitle = itemToDelete.value.title

  try {
    if (profileId) {
      await deleteRequirement(profileId, targetId)
    } else {
      await api.delete(`/requirements/${targetId}`)
      items.value = items.value.filter((i) => i.id !== targetId)
    }
    isDeleteModalOpen.value = false
    itemToDelete.value = null
    notificationStore.showToast(`Berkas "${deletedTitle}" berhasil dihapus.`, 'Berkas Dihapus')
  } catch (err: any) {
    notificationStore.showError(err?.message || 'Gagal menghapus berkas.', 'Gagal Menghapus Berkas')
  }
}

const completedCount = computed(() => items.value.filter((i) => i.is_completed).length)
const pendingCount = computed(() => items.value.length - completedCount.value)
const progressPercentage = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((completedCount.value / items.value.length) * 100)
})

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'pending' && !item.is_completed) ||
      (statusFilter.value === 'completed' && item.is_completed)

    const matchesCategory =
      categoryFilter.value === 'all' || item.category === categoryFilter.value

    return matchesStatus && matchesCategory
  })
})

function getCategoryLabel(cat: RequirementCategory): string {
  switch (cat) {
    case 'kua':
      return 'Resmi KUA'
    case 'civil_registry':
      return 'Catatan Sipil'
    case 'custom':
    default:
      return 'Kustom Catin'
  }
}

watch(
  () => authStore.profile?.id,
  () => {
    setupRequirementsSubscription()
  }
)

onMounted(() => {
  setupRequirementsSubscription()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-4xl mx-auto text-left font-sans">
      <!-- Header Module -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink">
            Ceklist Persyaratan Legal Pernikahan
          </h1>
          <p class="text-sm text-ink-muted mt-1">
            Panduan kelengkapan berkas resmi KUA dan Catatan Sipil untuk calon pengantin.
          </p>
        </div>

        <Button variant="primary" size="sm" @click="isAddModalOpen = true">
          + Tambah Berkas Kustom
        </Button>
      </div>



      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Progress Card Skeleton -->
        <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm animate-pulse">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div class="space-y-2">
              <div class="h-3 bg-stone-200 rounded w-36"></div>
              <div class="h-7 bg-stone-200 rounded w-28"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-8 bg-stone-200 rounded-lg w-28"></div>
              <div class="h-8 bg-stone-200 rounded-lg w-28"></div>
            </div>
          </div>
          <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-border">
            <div class="h-full bg-stone-200 rounded-full w-1/3"></div>
          </div>
        </div>

        <!-- Filter Controls Skeleton -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 animate-pulse">
          <div class="flex items-center gap-2">
            <div class="h-8 bg-stone-200 rounded-lg w-24"></div>
            <div class="h-8 bg-stone-200 rounded-lg w-28"></div>
            <div class="h-8 bg-stone-200 rounded-lg w-24"></div>
          </div>
          <div class="h-8 bg-stone-200 rounded-lg w-44"></div>
        </div>

        <!-- Checklist Cards Skeleton -->
        <div class="space-y-3">
          <div
            v-for="n in 5"
            :key="n"
            class="p-4 sm:p-5 bg-surface rounded-xl border border-border shadow-sm animate-pulse flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div class="flex-1 flex items-start gap-3">
              <div class="w-5 h-5 bg-stone-200 rounded mt-0.5 shrink-0"></div>
              <div class="space-y-2 w-full max-w-md">
                <div class="h-4 bg-stone-200 rounded w-3/4"></div>
                <div class="h-3 bg-stone-200 rounded w-1/2"></div>
              </div>
            </div>
            <div class="h-6 bg-stone-200 rounded-full w-20 shrink-0 self-start"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Dynamic Progress Card -->
        <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Kemajuan Dokumen Pernikahan
              </span>
              <div class="text-2xl font-extrabold text-ink mt-0.5">
                {{ progressPercentage }}% Lengkap
              </div>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div class="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border">
                <span class="text-ink-muted">Selesai:</span>
                <strong class="text-sage ml-1 font-bold">{{ completedCount }} Berkas</strong>
              </div>
              <div class="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border">
                <span class="text-ink-muted">Menunggu:</span>
                <strong class="text-amber ml-1 font-bold">{{ pendingCount }} Berkas</strong>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-border">
            <div
              class="h-full bg-sage transition-all duration-300 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Filter Controls: Status Tabs & Category Pills -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              :class="[
                'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target whitespace-nowrap',
                statusFilter === 'all'
                  ? 'bg-ink text-white font-semibold'
                  : 'bg-surface-subtle text-ink-muted hover:text-ink'
              ]"
              @click="statusFilter = 'all'"
            >
              Semua ({{ items.length }})
            </button>
            <button
              type="button"
              :class="[
                'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target whitespace-nowrap',
                statusFilter === 'pending'
                  ? 'bg-ink text-white font-semibold'
                  : 'bg-surface-subtle text-ink-muted hover:text-ink'
              ]"
              @click="statusFilter = 'pending'"
            >
              Belum Selesai ({{ pendingCount }})
            </button>
            <button
              type="button"
              :class="[
                'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer tap-target whitespace-nowrap',
                statusFilter === 'completed'
                  ? 'bg-ink text-white font-semibold'
                  : 'bg-surface-subtle text-ink-muted hover:text-ink'
              ]"
              @click="statusFilter = 'completed'"
            >
              Selesai ({{ completedCount }})
            </button>
          </div>

          <!-- Category Dropdown / Pill -->
          <div class="flex items-center gap-2 text-xs text-ink-muted">
            <span class="shrink-0 font-medium">Kategori:</span>
            <div class="w-44">
              <FormSelect
                v-model="categoryFilter"
                :options="categoryFilterOptions"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Checklist Items -->
        <div v-if="filteredItems.length > 0" class="space-y-3">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            :class="[
              'p-4 sm:p-5 bg-surface rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3',
              item.is_completed ? 'border-sage/40 bg-sage-light/10' : 'border-border hover:border-stone-400'
            ]"
          >
            <!-- Left: Checkbox & Content -->
            <div class="flex-1 pr-2">
              <FormCheckbox
                :id="item.id"
                :model-value="item.is_completed"
                :label="item.title"
                :description="item.notes || undefined"
                @update:model-value="handleToggle(item)"
              />

              <!-- Meta details below checkbox -->
              <div class="ml-11 mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
                <span class="inline-flex items-center gap-1 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                  {{ getCategoryLabel(item.category) }}
                </span>

                <span v-if="item.due_date" class="flex items-center gap-1">
                  <span>Target:</span>
                  <strong class="text-ink font-semibold">{{ item.due_date }}</strong>
                </span>

                <span v-if="item.is_default" class="text-ink-light">
                  (Berkas Standar Regulasi)
                </span>
              </div>
            </div>

            <!-- Right: Status Badge & Delete action for custom items -->
            <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-1 border-t sm:border-t-0 border-border">
              <StatusBadge :variant="item.is_completed ? 'success' : 'neutral'" size="sm">
                {{ item.is_completed ? 'Selesai' : 'Belum Selesai' }}
              </StatusBadge>

              <button
                v-if="!item.is_default"
                type="button"
                class="p-1.5 inline-flex items-center justify-center text-ink-light hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors tap-target cursor-pointer"
                title="Hapus berkas kustom ini"
                @click="confirmDelete(item)"
                aria-label="Hapus berkas kustom"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State (Antislop R-27) -->
        <EmptyState
          v-else
          title="Tidak ada berkas yang sesuai dengan filter"
          description="Cobalah memilih filter status atau kategori yang lain untuk melihat daftar persyaratan."
          action-label="Reset Filter ke Semua"
          @action="statusFilter = 'all'; categoryFilter = 'all'"
        />
      </template>

      <!-- Modal Tambah Berkas Kustom -->
      <ModalDialog
        :is-open="isAddModalOpen"
        title="Tambah Dokumen Persyaratan Kustom"
        description="Tambahkan berkas khusus keperluan keluarga, izin instansi, atau adat."
        @close="isAddModalOpen = false"
      >
        <div class="space-y-4">
          <FormInput
            id="custom-title"
            v-model="newTitle"
            label="Nama Berkas / Dokumen"
            placeholder="Contoh: Surat Izin Komandan / Instansi Pasangan"
            :error="addError"
            required
          />

          <FormInput
            id="custom-due-date"
            v-model="newDueDate"
            type="date"
            label="Target Tanggal Penyelesaian"
            helper="Pengingat batas waktu pengurusan dokumen."
          />

          <FormInput
            id="custom-notes"
            v-model="newNotes"
            label="Catatan Pengurusan (Opsional)"
            placeholder="Contoh: Disiapkan 3 rangkap fotokopi legalisir."
          />
        </div>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isAddModalOpen = false">
            Batal
          </Button>
          <Button variant="primary" size="sm" @click="handleAddCustom">
            Simpan Dokumen
          </Button>
        </template>
      </ModalDialog>

      <!-- Modal Konfirmasi Hapus Berkas Kustom -->
      <ModalDialog
        :is-open="isDeleteModalOpen"
        title="Hapus Berkas Kustom"
        description="Apakah Anda yakin ingin menghapus berkas ini dari ceklist?"
        @close="isDeleteModalOpen = false"
      >
        <p class="text-sm text-ink font-medium">
          "{{ itemToDelete?.title }}"
        </p>
        <p class="text-xs text-ink-muted mt-1">
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <template #footer>
          <Button variant="secondary" size="sm" @click="isDeleteModalOpen = false">
            Batal
          </Button>
          <Button variant="danger" size="sm" @click="handleDelete">
            Ya, Hapus Berkas
          </Button>
        </template>
      </ModalDialog>
    </div>
  </AppLayout>
</template>
