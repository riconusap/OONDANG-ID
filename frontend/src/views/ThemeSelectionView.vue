<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/auth';
import { useInvitationStore } from '@/stores/useInvitationStore';
import type { ThemeCategory, ThemeTemplate } from '@/types/theme';

import AppLayout from '@/components/layout/AppLayout.vue';
import ThemeCard from '@/components/themes/ThemeCard.vue';
import ThemePreviewModal from '@/components/themes/ThemePreviewModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const invitationStore = useInvitationStore();

const activeCategory = ref<ThemeCategory | 'all'>('all');
const initialThemeId = ref<string | null>(null);

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error' | 'info'>('success');

const showSubdomainModal = ref(false);
const subdomainInput = ref('');
const isSubmitting = ref(false);
const subdomainError = ref('');

// Computed
const filteredThemes = computed(() => themeStore.getThemesByCategory(activeCategory.value));
const hasUnsavedChanges = computed(() => {
  return themeStore.selectedThemeId !== initialThemeId.value && themeStore.selectedThemeId !== null;
});

// Category options
const categories: { label: string; value: ThemeCategory | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Modern', value: 'modern' },
  { label: 'Rustic', value: 'rustic' },
  { label: 'Tradisional', value: 'traditional' },
  { label: 'Mewah', value: 'luxury' },
];

onMounted(async () => {
  await authStore.waitUntilReady();
  // Clear selection on mount because they are creating a new invitation here
  themeStore.selectTheme(''); 
  initialThemeId.value = '';
});

// Handlers
const handleSelectTheme = (themeId: string) => {
  themeStore.selectTheme(themeId);
};

const handlePreviewTheme = (theme: ThemeTemplate) => {
  themeStore.setPreviewTheme(theme);
};

const handleClosePreview = () => {
  themeStore.setPreviewTheme(null);
};

const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const promptForSubdomain = () => {
  if (!authStore.profile?.id) {
    triggerToast("Gagal menyimpan: Profil pernikahan tidak ditemukan.", "error");
    return;
  }
  subdomainInput.value = '';
  subdomainError.value = '';
  showSubdomainModal.value = true;
};

const closeSubdomainModal = () => {
  if (isSubmitting.value) return;
  showSubdomainModal.value = false;
};

const submitSubdomain = async () => {
  if (!subdomainInput.value || subdomainInput.value.length < 3) {
    subdomainError.value = "Subdomain harus terdiri dari minimal 3 karakter.";
    return;
  }
  
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subdomainInput.value)) {
    subdomainError.value = "Subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).";
    return;
  }
  
  if (!authStore.profile?.id || !authStore.user?.id || !themeStore.selectedThemeId) {
    subdomainError.value = "Sesi tidak valid atau tema belum dipilih.";
    return;
  }
  
  isSubmitting.value = true;
  subdomainError.value = '';
  
  const success = await invitationStore.createInvitation({
    subdomain: subdomainInput.value.toLowerCase(),
    ownerId: authStore.user.id,
    themeId: themeStore.selectedThemeId,
    weddingProfileId: authStore.profile.id
  });
  
  isSubmitting.value = false;
  
  if (success) {
    showSubdomainModal.value = false;
    triggerToast("Berhasil membuat undangan digital!", "success");
    setTimeout(() => {
      router.push(`/invitations/${subdomainInput.value.toLowerCase()}/customize`);
    }, 1000);
  } else {
    subdomainError.value = invitationStore.error || "Gagal membuat undangan. Mungkin subdomain sudah digunakan.";
  }
};
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full space-y-6 text-left font-sans">
      <!-- Header -->
      <header class="bg-surface border border-border shadow-sm rounded-2xl p-6 sm:p-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink mb-2">Katalog Tema Undangan</h1>
        <p class="text-ink-muted text-sm sm:text-base">Pilih desain undangan digital yang paling mencerminkan kisah cinta Anda.</p>
        
        <!-- Category Filter -->
        <div class="mt-6 flex flex-wrap gap-2">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            @click="activeCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors border shadow-sm',
              activeCategory === cat.value 
                ? 'bg-ink text-white border-ink' 
                : 'bg-surface text-ink-muted border-border hover:border-ink/30 hover:text-ink'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow w-full">
        
        <!-- Loading State for initial fetch -->
        <div v-if="themeStore.isLoading && !themeStore.selectedThemeId" class="flex flex-col items-center justify-center py-20 text-ink-muted bg-surface border border-border rounded-2xl">
          <svg class="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p>Memuat profil Anda...</p>
        </div>
        
        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ThemeCard 
            v-for="theme in filteredThemes" 
            :key="theme.id"
            :theme="theme"
            :isActive="themeStore.selectedThemeId === theme.id"
            @select="handleSelectTheme"
            @preview="handlePreviewTheme"
          />
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredThemes.length === 0" class="text-center py-20 bg-surface border border-border rounded-2xl mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-ink-light mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3 class="text-xl font-semibold text-ink">Tema tidak ditemukan</h3>
          <p class="text-ink-muted mt-2">Belum ada tema untuk kategori ini.</p>
        </div>

      </main>

      <!-- Save Bar -->
      <div 
        v-if="hasUnsavedChanges"
        class="bg-surface border border-border shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center z-40 rounded-2xl gap-4 mt-6"
      >
        <div class="text-center sm:text-left">
          <p class="font-semibold text-ink">Tema telah dipilih</p>
          <p class="text-sm text-ink-muted">Simpan dan buat tautan undangan untuk mulai kustomisasi.</p>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button 
            @click="initialThemeId ? handleSelectTheme(initialThemeId) : handleSelectTheme('')" 
            class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium text-ink bg-surface-subtle border border-border hover:bg-border transition-colors"
            :disabled="themeStore.isLoading"
          >
            Batal
          </button>
          <button 
            @click="promptForSubdomain" 
            class="flex-1 sm:flex-none px-8 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-colors flex items-center justify-center gap-2"
            :disabled="themeStore.isLoading"
          >
            <svg v-if="themeStore.isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span v-else>Simpan & Lanjutkan</span>
          </button>
        </div>
      </div>

    </div>
  </AppLayout>

  <!-- Subdomain Input Modal -->
  <div v-if="showSubdomainModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-ink/50 backdrop-blur-sm" @click="closeSubdomainModal"></div>
    <div class="bg-surface rounded-2xl w-full max-w-md p-6 sm:p-8 z-10 shadow-lg border border-border">
      <h3 class="text-xl font-bold text-ink mb-2">Tentukan Tautan Undangan</h3>
      <p class="text-ink-muted text-sm mb-6">Pilih subdomain unik untuk undangan Anda. Ini tidak dapat diubah setelahnya.</p>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-ink mb-2">Alamat Tautan (Subdomain)</label>
        <div class="flex items-center relative">
          <span class="absolute left-3 text-ink-muted text-sm z-10">oondang.id/</span>
          <input 
            type="text" 
            v-model="subdomainInput" 
            placeholder="nama-pasangan"
            class="w-full pl-[95px] pr-4 py-2.5 rounded-lg border border-border bg-surface-subtle focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            :disabled="isSubmitting"
          />
        </div>
        <p v-if="subdomainError" class="text-sm text-red-500 mt-2">{{ subdomainError }}</p>
      </div>
      
      <div class="flex items-center gap-3 w-full">
        <button 
          @click="closeSubdomainModal" 
          class="flex-1 px-4 py-2.5 rounded-lg font-medium text-ink bg-surface-subtle border border-border hover:bg-border transition-colors"
          :disabled="isSubmitting"
        >
          Batal
        </button>
        <button 
          @click="submitSubdomain" 
          class="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-colors flex items-center justify-center gap-2"
          :disabled="isSubmitting"
        >
          <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-else>Buat Undangan</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Theme Preview Modal -->
  <ThemePreviewModal 
    v-if="themeStore.previewTheme"
    :theme="themeStore.previewTheme"
    :isOpen="true"
    @close="handleClosePreview"
    @select="handleSelectTheme"
  />

  <!-- Toast Notification -->
  <ToastNotification 
    :show="showToast" 
    :message="toastMessage" 
    :type="toastType"
  />
</template>
