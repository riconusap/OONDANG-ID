<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvitationStore } from '@/stores/useInvitationStore';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/components/layout/AppLayout.vue';
import Button from '@/components/common/Button.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

// Subcomponents
import TextCustomizationForm from '@/components/invitation/TextCustomizationForm.vue';
import PhotoManager from '@/components/invitation/PhotoManager.vue';
import GuestManager from '@/components/invitation/GuestManager.vue';
import MusicManager from '@/components/invitation/MusicManager.vue';
import Theme01View from '@/views/invitation/Theme01View.vue';

const route = useRoute();
const router = useRouter();
const invitationStore = useInvitationStore();
const authStore = useAuthStore();

const subdomain = route.params.subdomain as string;

const activeTab = ref<'text' | 'gallery' | 'guests' | 'music'>('text');
const isSaving = ref(false);

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error' | 'info'>('success');

onMounted(async () => {
  await authStore.waitUntilReady();
  if (!subdomain) {
    router.push('/invitations');
    return;
  }
  
  await invitationStore.fetchInvitationBySubdomain(subdomain);
  
  // Verify ownership
  if (!invitationStore.currentInvitation || invitationStore.currentInvitation.ownerId !== authStore.user?.id) {
    triggerToast("Anda tidak memiliki akses ke undangan ini.", "error");
    setTimeout(() => router.push('/invitations'), 2000);
  }
});

const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
};

const handleSave = async () => {
  if (!invitationStore.currentInvitation) return;
  
  isSaving.value = true;
  try {
    const success = await invitationStore.updateCustomization(
      invitationStore.currentInvitation.subdomain, 
      {
        customTexts: invitationStore.currentInvitation.customTexts,
        customImages: invitationStore.currentInvitation.customImages,
        stories: invitationStore.currentInvitation.stories,
        gifts: invitationStore.currentInvitation.gifts,
        musicUrl: invitationStore.currentInvitation.musicUrl
      }
    );
    
    if (success) {
      triggerToast("Perubahan berhasil disimpan!", "success");
    } else {
      triggerToast("Gagal menyimpan perubahan", "error");
    }
  } catch (err: any) {
    triggerToast(err.message || "Terjadi kesalahan saat menyimpan", "error");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <AppLayout>
    <!-- Use negative margins to break out of AppLayout padding and fill the space -->
    <div class="flex flex-col lg:flex-row h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 lg:mt-0 bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
      
      <!-- Left Panel: Editor Sidebar -->
      <div class="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-surface border-r border-border shrink-0 z-10 h-full overflow-hidden">
        
        <!-- Header -->
        <div class="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <div class="flex items-center gap-3">
            <button @click="router.push('/invitations')" class="p-2 -ml-2 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h2 class="font-bold text-ink text-lg leading-tight">Editor Undangan</h2>
              <p class="text-xs text-primary font-medium">oondang.id/{{ subdomain }}</p>
            </div>
          </div>
          <Button variant="primary" size="sm" @click="handleSave" :disabled="isSaving" class="shadow-sm">
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Simpan
          </Button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-border bg-surface shrink-0">
          <button 
            @click="activeTab = 'text'" 
            :class="['flex-1 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'text' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle']"
          >
            Teks
          </button>
          <button 
            @click="activeTab = 'gallery'" 
            :class="['flex-1 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle']"
          >
            Galeri
          </button>
          <button 
            @click="activeTab = 'guests'" 
            :class="['flex-1 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'guests' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle']"
          >
            Tamu
          </button>
          <button 
            @click="activeTab = 'music'" 
            :class="['flex-1 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'music' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle']"
          >
            Musik
          </button>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-canvas/30">
          
          <div v-if="invitationStore.isLoading && !invitationStore.currentInvitation" class="flex flex-col items-center justify-center py-12 text-ink-muted">
            <svg class="animate-spin h-6 w-6 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-sm">Memuat data...</p>
          </div>

          <template v-else-if="invitationStore.currentInvitation">
            <!-- Tab Contents -->
            <KeepAlive>
              <TextCustomizationForm v-if="activeTab === 'text'" :invitation="invitationStore.currentInvitation" @save="handleSave" />
              <PhotoManager v-else-if="activeTab === 'gallery'" :invitation="invitationStore.currentInvitation" />
              <GuestManager v-else-if="activeTab === 'guests'" :invitation="invitationStore.currentInvitation" />
              <MusicManager v-else-if="activeTab === 'music'" :invitation="invitationStore.currentInvitation" />
            </KeepAlive>
          </template>

        </div>
      </div>

      <!-- Right Panel: Live Preview Area -->
      <div class="hidden lg:flex flex-1 bg-stone-200 items-center justify-center relative overflow-hidden">
        
        <!-- Decoration / Background -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
        
        <!-- Mobile Device Frame Container -->
        <div class="relative w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-[8px] border-stone-800 overflow-hidden flex flex-col shrink-0 z-10 transform scale-90 xl:scale-95 origin-center transition-transform">
          
          <!-- Mock Status Bar -->
          <div class="h-6 w-full bg-surface shrink-0 flex items-center justify-between px-5 text-[10px] font-medium z-50">
            <span>9:41</span>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
          </div>

          <!-- Preview Content iframe or component -->
          <div class="flex-1 w-full h-full overflow-y-auto bg-zinc-900 flex flex-col relative text-ink-muted">
            <!-- If theme is rustic-floral (theme-01), render the component directly -->
            <template v-if="invitationStore.currentInvitation?.themeId === 'rustic-floral'">
              <Theme01View :isPreview="true" class="absolute inset-0 w-full h-full" />
            </template>
            <div v-else class="flex flex-col items-center justify-center h-full text-ink-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 0-2.4-1.46L4.2 4.02a2 2 0 0 0-1.46 2.4l.45 1.81"/></svg>
              <p class="text-sm">Preview tidak tersedia untuk tema ini</p>
              <p class="text-xs mt-1">Menggunakan tema: {{ invitationStore.currentInvitation?.themeId || '...' }}</p>
            </div>
          </div>

          <!-- Home Indicator -->
          <div class="h-5 w-full bg-surface shrink-0 flex items-center justify-center z-50">
            <div class="w-1/3 h-1 bg-stone-300 rounded-full"></div>
          </div>

        </div>

      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification 
      :show="showToast" 
      :message="toastMessage" 
      :type="toastType"
    />
  </AppLayout>
</template>
