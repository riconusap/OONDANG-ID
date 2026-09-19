<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInvitationStore } from '@/stores/useInvitationStore';

import CoverOverlay from '@/components/invitation/theme-03/CoverOverlay.vue';
import HeroSection from '@/components/invitation/theme-03/HeroSection.vue';
import ProfilesSection from '@/components/invitation/theme-03/ProfilesSection.vue';
import EventSection from '@/components/invitation/theme-03/EventSection.vue';
import GallerySection from '@/components/invitation/theme-03/GallerySection.vue';
import WishesSection from '@/components/invitation/theme-03/WishesSection.vue';
import InvitationFooter from '@/components/invitation/theme-02/InvitationFooter.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const props = defineProps<{
    invitation?: any;
    guestName?: string;
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
    
    if (invitation.value?.musicUrl && audioRef.value) {
        audioRef.value.play().then(() => {
            isPlaying.value = true;
        }).catch(err => {
            console.error("Autoplay failed:", err);
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
        await invitationStore.fetchInvitationBySubdomain(subdomain);
    }
    
    if (!props.isPreview) {
        document.body.style.overflow = 'hidden';
    }
});

onUnmounted(() => {
    if (!props.isPreview) {
        document.body.style.overflow = 'auto';
    }
});
</script>

<template>
  <div :class="['bg-black text-zinc-50 font-sans flex justify-center lg:justify-end m-0 relative', isPreview ? 'h-full' : 'min-h-screen']">
      
      <!-- Desktop Background Panel -->
      <div class="hidden lg:flex fixed inset-y-0 left-0 right-[480px] bg-cover bg-center bg-no-repeat flex-col justify-center items-center text-white"
           :style="{ backgroundImage: `url('${invitation?.customImages?.cover_bg || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80'}')` }">
          <div class="absolute inset-0 bg-black/60"></div>
          
          <div class="relative z-10 text-center px-10 max-w-3xl animate-fade-in-up">
              <p class="font-sans font-light tracking-[0.3em] uppercase text-sm mb-6 text-zinc-400">{{ invitation?.customTexts?.coverSubtitle || 'THE WEDDING OF' }}</p>
              <h1 class="text-6xl xl:text-8xl font-black tracking-tight uppercase mb-6 drop-shadow-lg text-white">
                  {{ invitation?.customTexts?.groomName || 'DENI' }}<br/><span class="text-4xl text-zinc-500 font-light">&</span><br/>{{ invitation?.customTexts?.brideName || 'SOFIAH' }}
              </h1>
              <div class="w-16 h-px bg-white/30 mx-auto mb-6"></div>
              <p class="text-sm xl:text-base font-light tracking-[0.2em] text-zinc-300 uppercase">{{ invitation?.customTexts?.eventDateStr || 'SABTU, 13 JUNI 2026' }}</p>
          </div>
      </div>

      <!-- Main Invitation Container -->
      <div class="w-full lg:w-[480px] flex justify-center z-10 shrink-0">
          <main :class="['w-full max-w-[480px] bg-zinc-950 relative overflow-x-hidden shadow-2xl pb-20 border-l border-white/10', isPreview ? 'h-full overflow-y-auto' : 'min-h-screen']">
          
          <CoverOverlay @open="handleOpen" :invitation="invitation" :guestName="guestName" />
          
          <HeroSection :invitation="invitation" />
          <ProfilesSection :invitation="invitation" />
          <EventSection :invitation="invitation" />
          <GallerySection :invitation="invitation" />
          <WishesSection :invitation="invitation" @wishSubmitted="triggerToast" />
          <InvitationFooter :invitation="invitation" />
          
          <!-- Background Music Player -->
          <div v-if="invitation?.musicUrl" class="fixed bottom-6 right-6 z-50">
              <button 
                  @click="toggleAudio" 
                  class="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-110"
                  :class="{'animate-spin-slow': isPlaying}"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{'opacity-50': !isPlaying}">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                  </svg>
                  <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div class="w-8 h-0.5 bg-black rotate-45"></div>
                  </div>
              </button>
              <audio ref="audioRef" :src="invitation.musicUrl" loop preload="auto" class="hidden"></audio>
          </div>
          
          <ToastNotification :show="showToast" :message="toastMessage" />
          
          </main>
      </div>
  </div>
</template>
