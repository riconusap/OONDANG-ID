<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  guestName?: string;
  invitation?: Invitation | null
}>();

const isOpened = ref(false);
const emit = defineEmits(['open']);

const openInvitation = () => {
  isOpened.value = true;
  emit('open');
};

const coverImage = computed(() => {
  return props.invitation?.customImages?.cover_bg || 'https://placehold.co/480x800/111111/4a4036?text=Cover+Photo';
});

const subtitle = computed(() => props.invitation?.customTexts?.coverSubtitle || 'The Wedding of');
const title = computed(() => {
  const groom = props.invitation?.customTexts?.groomName || 'DENI';
  const bride = props.invitation?.customTexts?.brideName || 'SOFIAH';
  return `${groom} & ${bride}`.toUpperCase();
});
const dateStr = computed(() => props.invitation?.customTexts?.eventDateStr || 'Sabtu, 13 Juni 2026');
const salutation = computed(() => props.invitation?.customTexts?.coverSalutation || 'Kepada Yth. Bapak/Ibu/Saudara/i');
</script>

<template>
  <div 
    id="cover-overlay" 
    :class="[
      'fixed inset-y-0 left-0 right-0 mx-auto lg:left-auto lg:right-0 lg:mx-0 z-50 flex flex-col justify-end items-center pb-20 bg-white bg-cover bg-center w-full max-w-[480px] origin-bottom transition-transform duration-1000 ease-[cubic-bezier(0.645,0.045,0.355,1)]',
      { '-translate-y-full': isOpened }
    ]"
    :style="{ backgroundImage: `url('${coverImage}')` }"
  >
    <div class="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/90 to-transparent"></div>
    
    <div class="relative z-10 text-center space-y-4 px-6 w-full animate-fade-in-up">
        <p class="font-wedding-serif italic text-sm text-zinc-600">{{ subtitle }}</p>
        <h1 class="text-4xl font-wedding-serif text-white tracking-widest mt-2">{{ title }}</h1>
        <p class="text-sm font-light text-zinc-600">{{ dateStr }}</p>
        
        <div class="mt-12 p-5 border border-sage-200 rounded-xl bg-black/40 backdrop-blur-md">
            <p class="text-xs text-zinc-500 mb-1">{{ salutation }}</p>
            <p class="font-bold text-lg text-white mb-6">{{ guestName || 'Tamu Undangan' }}</p>
            <button @click="openInvitation" class="w-full py-3 px-6 bg-transparent border border-white text-sage-700 rounded-lg hover:bg-white hover:text-black transition duration-300 flex items-center justify-center gap-2 font-medium text-sm">
                <i class="fa-solid fa-envelope-open-text"></i> Buka Undangan
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
