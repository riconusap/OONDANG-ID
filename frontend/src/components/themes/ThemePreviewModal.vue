<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { ThemeTemplate } from '@/types/theme';

const props = defineProps<{
  theme: ThemeTemplate | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', id: string): void;
}>();

const isLoading = ref(true);

const handleIframeLoad = () => {
  isLoading.value = false;
};

// Handle body scroll locking
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    isLoading.value = true;
  } else {
    document.body.style.overflow = 'auto';
  }
});

onUnmounted(() => {
  document.body.style.overflow = 'auto';
});
</script>

<template>
  <!-- Backdrop -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-0 animate-in fade-in duration-300"
    @click.self="emit('close')"
  >
    <!-- Modal Container -->
    <div 
      class="bg-surface w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh] scale-95 animate-in zoom-in-95 duration-300"
      v-if="theme"
    >
      
      <!-- Close Button (Mobile Absolute) -->
      <button 
        @click="emit('close')"
        class="md:hidden absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md text-ink p-2 rounded-full shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <!-- Left Side: Interactive Preview (Iframe/Image container) -->
      <div class="relative w-full md:w-[60%] lg:w-[65%] h-[60vh] md:h-full bg-surface-dark flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-border">
        
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center text-ink-inverse z-10 gap-4">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-sm">Memuat Preview...</span>
        </div>
        
        <!-- Mock Iframe wrapper (Simulating Mobile View) -->
        <div class="w-full max-w-[400px] h-full max-h-[800px] bg-white shadow-2xl relative z-20">
          <iframe 
            :src="theme.previewUrl" 
            class="w-full h-full border-0"
            @load="handleIframeLoad"
            title="Theme Preview"
          ></iframe>
        </div>
      </div>

      <!-- Right Side: Details -->
      <div class="w-full md:w-[40%] lg:w-[35%] flex flex-col h-[40vh] md:h-full bg-surface">
        <div class="p-6 md:p-8 flex-grow overflow-y-auto">
          
          <div class="flex justify-between items-start mb-6">
            <div>
              <span class="inline-block px-3 py-1 bg-surface-subtle text-ink-muted text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
                {{ theme.category }}
              </span>
              <h2 class="text-2xl md:text-3xl font-bold text-ink">{{ theme.name }}</h2>
            </div>
            
            <!-- Close Button (Desktop) -->
            <button 
              @click="emit('close')"
              class="hidden md:flex text-ink-light hover:text-ink transition-colors bg-surface-subtle p-2 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <p class="text-ink-muted leading-relaxed text-sm md:text-base mb-8">
            {{ theme.description }}
          </p>

          <div class="mb-8">
            <h3 class="text-sm font-semibold text-ink mb-3 uppercase tracking-wide">Palet Warna Utama</h3>
            <div class="flex gap-4">
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.primary }"></div>
                <span class="text-[10px] text-ink-muted font-mono uppercase">{{ theme.defaultPalette.primary }}</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.secondary }"></div>
                <span class="text-[10px] text-ink-muted font-mono uppercase">{{ theme.defaultPalette.secondary }}</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.accent }"></div>
                <span class="text-[10px] text-ink-muted font-mono uppercase">{{ theme.defaultPalette.accent }}</span>
              </div>
            </div>
          </div>

          <div>
             <h3 class="text-sm font-semibold text-ink mb-3 uppercase tracking-wide">Tags</h3>
             <div class="flex flex-wrap gap-2">
               <span v-for="tag in theme.tags" :key="tag" class="px-3 py-1 bg-surface-subtle border border-border text-ink-muted text-xs rounded-full">
                 #{{ tag }}
               </span>
             </div>
          </div>
          
        </div>

        <!-- Sticky Footer Action -->
        <div class="p-6 bg-surface border-t border-border mt-auto">
          <button 
            @click="emit('select', theme.id)"
            class="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.42 4.42a2 2 0 0 0 2.83 0L22 2"/><path d="m16 22 6-6"/></svg>
            Gunakan Tema Ini
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Basic Tailwind animate-in utility replacements since standard TW doesn't have it by default unless configured */
.animate-in {
  animation-fill-mode: both;
}
.fade-in {
  animation-name: fadeIn;
}
.zoom-in-95 {
  animation-name: zoomIn95;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn95 {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
</style>
