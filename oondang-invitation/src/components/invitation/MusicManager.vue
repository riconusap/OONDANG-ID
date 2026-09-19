<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Invitation } from '@/types/invitation';
import { useInvitationStore } from '@/stores/useInvitationStore';
import Button from '@/components/common/Button.vue';
import { supabase } from '@/lib/supabase';

const props = defineProps<{
  invitation: Invitation
}>();

const invitationStore = useInvitationStore();

const activeUpload = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const currentMusicUrl = computed(() => props.invitation.musicUrl || '');

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) return;
  const file = files[0];
  
  if (!file.type.startsWith('audio/')) {
    alert('Harap pilih file audio (MP3/WAV).');
    return;
  }
  
  // File size limit 10MB
  if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB.');
      return;
  }
  
  try {
    activeUpload.value = true;
    
    // Upload to Supabase Storage (bucket 'oondang-id')
    const fileExt = file.name.split('.').pop();
    const fileName = `invitations/${props.invitation.subdomain}/music_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('oondang-id')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('oondang-id')
      .getPublicUrl(fileName);
      
    const downloadUrl = publicUrlData.publicUrl;
    
    // Update store local state
    invitationStore.updateLocalMusicUrl(downloadUrl);
    
  } catch (err: any) {
    console.error("Upload error:", err);
    alert('Gagal mengunggah musik: ' + (err.message || 'Error tidak diketahui'));
  } finally {
    activeUpload.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const removeMusic = () => {
  invitationStore.updateLocalMusicUrl('');
};
</script>

<template>
  <div class="space-y-6 pb-20">
    <div class="mb-4">
      <h3 class="text-sm font-bold text-ink mb-1">Pengaturan Musik Latar</h3>
      <p class="text-xs text-ink-muted">Unggah lagu yang akan diputar saat tamu membuka undangan digital Anda.</p>
    </div>

    <input type="file" ref="fileInput" class="hidden" accept="audio/mpeg, audio/wav, audio/*" @change="handleFileSelect">

    <div class="bg-surface rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <!-- Icon Preview -->
      <div class="w-16 h-16 shrink-0 rounded-full border border-border bg-stone-100 flex items-center justify-center relative">
        <svg v-if="!currentMusicUrl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-ink-light"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-primary"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        
        <div v-if="activeUpload" class="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
          <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      </div>

      <!-- Info & Actions -->
      <div class="flex-1 min-w-0">
        <div class="mb-3">
            <h4 class="text-sm font-bold text-ink truncate">
                {{ currentMusicUrl ? 'Musik Latar Aktif' : 'Belum Ada Musik' }}
            </h4>
            <p v-if="currentMusicUrl" class="text-xs text-ink-muted truncate mt-1">
                Lagu akan otomatis diputar (bergantung izin peramban).
            </p>
            <p v-else class="text-xs text-ink-muted mt-1">
                Gunakan file MP3 (Maks. 10MB)
            </p>
        </div>
        
        <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" @click="triggerFileInput" :disabled="activeUpload">
                {{ currentMusicUrl ? 'Ganti Musik' : 'Unggah Musik' }}
            </Button>
            <Button v-if="currentMusicUrl" variant="outline" size="sm" @click="removeMusic" class="text-red-600 border-red-200 hover:bg-red-50" :disabled="activeUpload">
                Hapus
            </Button>
        </div>
        
        <div v-if="currentMusicUrl" class="mt-4">
            <audio controls class="w-full h-8" :src="currentMusicUrl"></audio>
        </div>
      </div>
    </div>
  </div>
</template>
