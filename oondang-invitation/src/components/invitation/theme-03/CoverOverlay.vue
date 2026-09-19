<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  guestName?: string;
  invitation?: Invitation | null
}>();

const emit = defineEmits(['open']);

const isOpened = ref(false);
const isClosing = ref(false);

const coverBg = computed(() => props.invitation?.customImages?.cover_bg || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80');
const groomName = computed(() => props.invitation?.customTexts?.groomName || 'Deni');
const brideName = computed(() => props.invitation?.customTexts?.brideName || 'Sofiah');
const coverSubtitle = computed(() => props.invitation?.customTexts?.coverSubtitle || 'THE WEDDING OF');
const guestName = computed(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('to') || 'Tamu Undangan';
});

const openInvitation = () => {
    isClosing.value = true;
    setTimeout(() => {
        isOpened.value = true;
        emit('open');
    }, 1200); // Wait for transition
};
</script>

<template>
  <div 
    v-if="!isOpened"
    :class="[
        'absolute top-0 left-0 z-50 w-full h-[100dvh] bg-zinc-950 flex flex-col justify-between transition-transform duration-1000 ease-in-out overflow-hidden',
        isClosing ? '-translate-y-full' : 'translate-y-0'
    ]"
  >
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
          <img :src="coverBg" alt="Cover" class="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
      </div>
      
      <!-- Top Content -->
      <div class="relative z-10 pt-20 px-8 text-center animate-fade-in-up">
          <p class="font-sans font-light tracking-[0.4em] text-xs text-zinc-400 uppercase mb-4">{{ coverSubtitle }}</p>
          <h1 class="text-5xl font-black text-white tracking-tight leading-none uppercase mb-2">
              {{ groomName }}<br/><span class="text-3xl text-zinc-600 font-light">&</span><br/>{{ brideName }}
          </h1>
      </div>
      
      <!-- Bottom Content -->
      <div class="relative z-10 pb-20 px-8 text-center animate-fade-in-up delay-300">
          <p class="text-xs tracking-widest text-zinc-500 uppercase mb-4">Dear,</p>
          <h2 class="text-xl font-bold text-white mb-10">{{ guestName }}</h2>
          
          <button 
            @click="openInvitation" 
            class="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black bg-white uppercase tracking-[0.2em] text-xs transition-all hover:bg-zinc-200"
          >
              <span class="mr-2">OPEN INVITATION</span>
              <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
          </button>
      </div>
  </div>
</template>
