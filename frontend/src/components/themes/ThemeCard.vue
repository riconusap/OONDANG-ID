<script setup lang="ts">
import { computed } from 'vue';
import type { ThemeTemplate } from '@/types/theme';

const props = defineProps<{
  theme: ThemeTemplate;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'preview', theme: ThemeTemplate): void;
}>();

const badgeText = computed(() => {
  if (props.isActive) return 'Sedang Digunakan';
  if (props.theme.isPremium) return 'Premium';
  return '';
});
</script>

<template>
  <div 
    :class="[
      'group relative flex flex-col rounded-xl overflow-hidden border-2 bg-surface transition-all duration-300',
      isActive ? 'border-primary shadow-md' : 'border-border hover:border-ink/20 hover:shadow-sm'
    ]"
  >
    <!-- Thumbnail Container (9:16 aspect ratio) -->
    <div class="relative w-full aspect-[9/16] overflow-hidden bg-surface-subtle">
      <img 
        :src="theme.thumbnailUrl" 
        :alt="theme.name"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      <!-- Overlay & Actions on Hover -->
      <div class="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 p-4">
        <button 
          @click.stop="emit('preview', theme)"
          class="w-full max-w-[200px] py-2.5 px-4 bg-white text-ink font-medium rounded-lg text-sm shadow-sm hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
          Lihat Preview
        </button>
        
        <button 
          v-if="!isActive"
          @click.stop="emit('select', theme.id)"
          class="w-full max-w-[200px] py-2.5 px-4 bg-primary text-white font-medium rounded-lg text-sm shadow-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
        >
          Pilih Tema Ini
        </button>
      </div>

      <!-- Badges -->
      <div v-if="badgeText" class="absolute top-3 left-3 z-10">
        <span 
          :class="[
            'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm',
            isActive ? 'bg-primary text-white' : 'bg-amber text-white'
          ]"
        >
          {{ badgeText }}
        </span>
      </div>

      <!-- Active Checkmark Overlay (Top Right) -->
      <div v-if="isActive" class="absolute top-3 right-3 z-10 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
    </div>

    <!-- Content details -->
    <div class="p-4 flex flex-col flex-grow border-t border-border">
      <div class="flex justify-between items-start gap-2 mb-1">
        <h3 class="font-semibold text-ink text-base line-clamp-1">{{ theme.name }}</h3>
      </div>
      <p class="text-ink-muted text-xs line-clamp-2 mt-1 mb-3 flex-grow">{{ theme.description }}</p>
      
      <!-- Palette Preview -->
      <div class="flex items-center gap-1.5 mt-auto pt-2">
        <div class="w-4 h-4 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.primary }"></div>
        <div class="w-4 h-4 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.secondary }"></div>
        <div class="w-4 h-4 rounded-full border border-border shadow-sm" :style="{ backgroundColor: theme.defaultPalette.accent }"></div>
      </div>
    </div>
  </div>
</template>
