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
    isPreview?: boolean
}>();

const route = useRoute();
const invitationStore = useInvitationStore();
const subdomain = route.params.subdomain as string;

const showToast = ref(false);
const toastMessage = ref('');

const invitation = computed(() => invitationStore.currentInvitation);

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
  <div :class="['bg-zinc-900 text-zinc-200 font-wedding-sans flex justify-center m-0', isPreview ? 'h-full' : 'min-h-screen']">
      <main :class="['w-full max-w-[480px] bg-wedding-dark relative overflow-x-hidden shadow-2xl pb-20', isPreview ? 'h-full overflow-y-auto' : 'min-h-screen']">
          
          <CoverOverlay @open="handleOpen" :invitation="invitation" />
          
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
