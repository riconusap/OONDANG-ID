<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInvitationStore } from '@/stores/useInvitationStore';

import CoverOverlay from '@/components/invitation/theme-01/CoverOverlay.vue';
import HeroSection from '@/components/invitation/theme-01/HeroSection.vue';
import QuoteSection from '@/components/invitation/theme-01/QuoteSection.vue';
import ProfilesSection from '@/components/invitation/theme-01/ProfilesSection.vue';
import EventSection from '@/components/invitation/theme-01/EventSection.vue';
import GallerySection from '@/components/invitation/theme-01/GallerySection.vue';
import LoveStorySection from '@/components/invitation/theme-01/LoveStorySection.vue';
import GiftSection from '@/components/invitation/theme-01/GiftSection.vue';
import WishesSection from '@/components/invitation/theme-01/WishesSection.vue';
import InvitationFooter from '@/components/invitation/theme-01/InvitationFooter.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const props = defineProps<{
    isPreview?: boolean;
    invitation?: any;
    guestName?: string;
}>();

const route = useRoute();
const invitationStore = useInvitationStore();
const subdomain = route.params.subdomain as string;

const showToast = ref(false);
const toastMessage = ref('');

const invitation = computed(() => props.invitation || invitationStore.currentInvitation);
const guestName = computed(() => props.guestName || 'Tamu Undangan');

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);

const toggleAudio = () => {
    if (!audioRef.value) return;
    
    if (isPlaying.value) {
        audioRef.value.pause();
    } else {
        audioRef.value.play().catch(err => console.error("Audio playback failed:", err));
    }
    isPlaying.value = !isPlaying.value;
};

const handleOpen = () => {
    if (!props.isPreview) {
        document.body.style.overflow = 'auto';
    }
    
    // Autoplay music if available
    if (invitation.value?.musicUrl && audioRef.value) {
        audioRef.value.play().then(() => {
            isPlaying.value = true;
        }).catch(err => {
            console.error("Autoplay failed:", err);
            // Autoplay might be blocked by browser, user needs to click play manually
            isPlaying.value = false;
        });
    }
};

const triggerToast = (message: string) => {
    toastMessage.value = message;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

onMounted(async () => {
    if (!props.isPreview && subdomain) {
        // If not preview mode, fetch data directly based on URL
        await invitationStore.fetchInvitationBySubdomain(subdomain);
    }
    
    if (!props.isPreview) {
        // Lock body scroll until cover is opened
        document.body.style.overflow = 'hidden';
    }
});

onUnmounted(() => {
    if (!props.isPreview) {
        // Reset body scroll when leaving this view
        document.body.style.overflow = 'auto';
    }
});
</script>

<template>
  <div :class="['bg-zinc-900 text-zinc-200 font-wedding-sans flex justify-center lg:justify-end m-0 relative', isPreview ? 'h-full' : 'min-h-screen']">
      
      <!-- Desktop Background Panel -->
      <div class="hidden lg:flex fixed inset-y-0 left-0 right-[480px] bg-cover bg-center bg-no-repeat flex-col justify-center items-center text-white"
           :style="{ backgroundImage: `url('${invitation?.customImages?.cover_bg || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80'}')` }">
          <!-- Dark overlay -->
          <div class="absolute inset-0 bg-black/40"></div>
          
          <!-- Text Content -->
          <div class="relative z-10 text-center px-10 max-w-3xl animate-fade-in-up">
              <p class="font-wedding-serif italic text-2xl mb-4 text-zinc-300">{{ invitation?.customTexts?.coverSubtitle || 'The Wedding of' }}</p>
              <h1 class="text-5xl xl:text-6xl font-wedding-serif tracking-widest uppercase mb-6 drop-shadow-lg">
                  {{ invitation?.customTexts?.groomName || 'DENI' }} & {{ invitation?.customTexts?.brideName || 'SOFIAH' }}
              </h1>
              <p class="text-lg xl:text-xl font-light tracking-wide text-zinc-200">{{ invitation?.customTexts?.eventDateStr || 'Sabtu, 13 Juni 2026' }}</p>
          </div>
      </div>

      <!-- Main Invitation Container -->
      <div class="w-full lg:w-[480px] flex justify-center z-10 shrink-0">
          <main :class="['w-full max-w-[480px] bg-wedding-dark relative overflow-x-hidden shadow-2xl pb-20', isPreview ? 'h-full overflow-y-auto' : 'min-h-screen']">
          
          <CoverOverlay @open="handleOpen" :invitation="invitation" :guestName="guestName" />
          
          <HeroSection :invitation="invitation" />
          <QuoteSection :invitation="invitation" />
          <ProfilesSection :invitation="invitation" />
          <EventSection :invitation="invitation" />
          <GallerySection :invitation="invitation" />
          <LoveStorySection :invitation="invitation" />
          <GiftSection :invitation="invitation" @copy="triggerToast" />
          <WishesSection :invitation="invitation" @wishSubmitted="triggerToast" />
          <InvitationFooter :invitation="invitation" />
          
          <!-- Background Music Player -->
          <div v-if="invitation?.musicUrl" class="fixed bottom-6 right-6 z-50">
              <button 
                  @click="toggleAudio" 
                  class="w-12 h-12 bg-wedding-brown text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 border-2 border-wedding-dark/30"
                  :class="{'animate-spin-slow': isPlaying}"
              >
                  <!-- SVG Note Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{'opacity-50': !isPlaying}">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                  </svg>
                  
                  <!-- Pause slash if not playing -->
                  <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div class="w-8 h-0.5 bg-white rotate-45"></div>
                  </div>
              </button>
              <audio ref="audioRef" :src="invitation.musicUrl" loop preload="auto" class="hidden"></audio>
          </div>
          
          <ToastNotification :show="showToast" :message="toastMessage" />
          
          </main>
      </div>
  </div>
</template>

<style>
/* Base overrides for this page if needed */
html {
    scroll-behavior: smooth;
}

/* Hide scrollbar for clean UI but keep functionality */
::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}
</style>
