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

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  ratio: string;
}

const slots: ImageSlot[] = [
  { key: 'cover_bg', label: 'Sampul Depan', description: 'Tampil saat undangan pertama dibuka', ratio: '9:16 (Potret)' },
  { key: 'hero_bg', label: 'Latar Belakang Utama', description: 'Tampil di halaman utama setelah dibuka', ratio: '9:16 (Potret)' },
  { key: 'event_bg', label: 'Latar Belakang Acara', description: 'Tampil di bagian jadwal dan lokasi acara', ratio: '2:3 (Potret)' },
  { key: 'groom_photo', label: 'Foto Mempelai Pria', description: 'Foto profil mempelai pria', ratio: '2:3 (Potret)' },
  { key: 'bride_photo', label: 'Foto Mempelai Wanita', description: 'Foto profil mempelai wanita', ratio: '2:3 (Potret)' },
  { key: 'gallery_1', label: 'Galeri 1 (Utama)', description: 'Foto potret untuk galeri', ratio: '2:3 (Potret)' },
  { key: 'gallery_2', label: 'Galeri 2', description: 'Foto tambahan galeri', ratio: '1:1 (Persegi)' },
  { key: 'gallery_3', label: 'Galeri 3', description: 'Foto tambahan galeri', ratio: '1:1 (Persegi)' },
  { key: 'gallery_4', label: 'Galeri 4', description: 'Foto mendatar galeri', ratio: '2:1 (Lanskap)' },
];

const customImages = computed(() => props.invitation.customImages || {});
const activeUploadKey = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = (key: string) => {
  activeUploadKey.value = key;
  fileInput.value?.click();
};

const compressAndConvertToWebp = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, 'image/webp', 0.8);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  const uploadKey = activeUploadKey.value;
  
  if (!files || files.length === 0 || !uploadKey) return;
  const file = files[0];
  
  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar.');
    return;
  }
  
  try {
    // Compress & Convert
    const webpBlob = await compressAndConvertToWebp(file);
    
    // Upload to Supabase Storage (bucket 'oondang-id')
    const fileName = `invitations/${props.invitation.subdomain}/${uploadKey}_${Date.now()}.webp`;
    
    const { error } = await supabase.storage
      .from('oondang-id')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
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
    invitationStore.updateLocalCustomImage(uploadKey, downloadUrl);
    
  } catch (err: any) {
    console.error("Upload error:", err);
    alert('Gagal mengunggah gambar: ' + (err.message || 'Error tidak diketahui'));
  } finally {
    activeUploadKey.value = null;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const removePhoto = (key: string) => {
  invitationStore.updateLocalCustomImage(key, '');
};
</script>

<template>
  <div class="space-y-6 pb-20">
    <div class="mb-4">
      <h3 class="text-sm font-bold text-ink mb-1">Pengaturan Gambar Tema</h3>
      <p class="text-xs text-ink-muted">Unggah foto sesuai dengan slot yang tersedia pada template undangan Anda. Gambar akan otomatis dioptimasi.</p>
    </div>

    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect">

    <div class="space-y-4">
      <div v-for="slot in slots" :key="slot.key" class="bg-surface rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <!-- Image Preview / Placeholder -->
        <div class="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-border bg-stone-100 flex items-center justify-center relative group">
          <img v-if="customImages[slot.key]" :src="customImages[slot.key]" class="w-full h-full object-cover" :alt="slot.label" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-ink-light"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          
          <div v-if="activeUploadKey === slot.key" class="absolute inset-0 bg-white/80 flex items-center justify-center">
            <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          
          <div v-if="customImages[slot.key] && activeUploadKey !== slot.key" class="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button @click="removePhoto(slot.key)" class="w-8 h-8 rounded-full bg-white text-ink flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm" title="Hapus foto">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Info & Actions -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-sm font-bold text-ink truncate">{{ slot.label }}</h4>
            <span class="text-[10px] font-medium px-2 py-0.5 bg-surface-subtle border border-border rounded text-ink-muted">{{ slot.ratio }}</span>
          </div>
          <p class="text-xs text-ink-muted mb-3">{{ slot.description }}</p>
          <Button variant="outline" size="sm" @click="triggerFileInput(slot.key)" :disabled="activeUploadKey === slot.key">
            Ubah Foto
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
