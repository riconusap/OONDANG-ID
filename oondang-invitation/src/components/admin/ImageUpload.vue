<script setup lang="ts">
import { ref, computed } from 'vue';
import { useInvitationStore } from '@/stores/useInvitationStore';
import { compressToWebP } from '@/utils/imageCompression';

const props = defineProps<{
  modelValue: string;
  label: string;
  subdomain: string;
}>();

const emit = defineEmits(['update:modelValue']);

const store = useInvitationStore();

const isUploading = ref(false);
const uploadProgress = ref(0); // Optional: if we want to show percentage
const errorMsg = ref('');

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  isUploading.value = true;
  errorMsg.value = '';

  try {
    // 1. Compress to WebP
    const compressedFile = await compressToWebP(file, 1920, 0.8);
    
    // 2. Upload to Supabase
    const publicUrl = await store.uploadMedia(compressedFile, props.subdomain);
    
    if (publicUrl) {
      // 3. Emit the new URL to v-model
      emit('update:modelValue', publicUrl);
    } else {
      errorMsg.value = 'Gagal mengunggah gambar. Pastikan Anda memiliki akses.';
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Terjadi kesalahan saat kompresi.';
  } finally {
    isUploading.value = false;
    // reset input
    target.value = '';
  }
};
</script>

<template>
  <div class="space-y-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">{{ label }}</label>
    
    <div class="flex gap-4 items-center">
      <!-- Preview Image -->
      <div 
        class="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative group"
      >
        <img v-if="modelValue" :src="modelValue" class="w-full h-full object-cover" />
        <i v-else class="fa-solid fa-image text-zinc-300 text-xl"></i>
        
        <!-- Loading Overlay -->
        <div v-if="isUploading" class="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <i class="fa-solid fa-circle-notch fa-spin text-zinc-900 text-xl"></i>
        </div>
      </div>

      <!-- File Input & URL fallback -->
      <div class="flex-1 space-y-2">
        <!-- URL Input -->
        <div class="relative">
          <input 
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text" 
            placeholder="Atau masukkan URL gambar..." 
            class="w-full pl-3 pr-24 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
            :disabled="isUploading"
          >
          <!-- Upload Button Overlay inside input -->
          <div class="absolute right-1.5 top-1.5">
            <label class="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
              <i class="fa-solid fa-upload"></i>
              Upload
              <input type="file" accept="image/*" class="hidden" @change="onFileChange" :disabled="isUploading" />
            </label>
          </div>
        </div>
        
        <!-- Error Message -->
        <p v-if="errorMsg" class="text-xs text-red-500 font-medium">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>
