<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const target = ref<HTMLElement | null>(null);
const { isIntersecting: isVisible } = useIntersectionObserver(target);

const heroImage = computed(() => props.invitation?.customImages?.hero_bg || 'https://images.unsplash.com/photo-1465495972077-4364ea166d61?auto=format&fit=crop&w=800&q=80');
const groomName = computed(() => props.invitation?.customTexts?.groomName || 'DENI');
const brideName = computed(() => props.invitation?.customTexts?.brideName || 'SOFIAH');
const subtitle = computed(() => props.invitation?.customTexts?.coverSubtitle || 'THE WEDDING OF');
const eventDateObj = computed(() => {
    let dateStr = '2026-06-13';
    if (props.invitation?.customTexts?.eventDateRaw) {
        dateStr = props.invitation.customTexts.eventDateRaw;
    }
    return new Date(dateStr);
});

const day = computed(() => eventDateObj.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (eventDateObj.value.getMonth() + 1).toString().padStart(2, '0'));
const year = computed(() => eventDateObj.value.getFullYear().toString().slice(-2));
</script>

<template>
  <section id="hero" class="relative min-h-screen flex flex-col justify-end px-8 pb-16 overflow-hidden bg-zinc-950">
      <!-- Full Bleed Background Image -->
      <img :src="heroImage" alt="Hero Background" class="absolute inset-0 w-full h-full object-cover object-center grayscale opacity-80" />
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
      
      <!-- Content Block -->
      <div 
        ref="target"
        :class="[
            'relative z-10 w-full text-left transition-all duration-1000 ease-out will-change-[opacity,transform] delay-300',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        ]"
      >
          <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-12 bg-zinc-400"></div>
              <p class="font-sans tracking-[0.3em] uppercase text-[10px] text-zinc-400">{{ subtitle }}</p>
          </div>
          <h1 class="text-6xl font-black text-white tracking-tight uppercase leading-none mb-1">
              {{ groomName }}
          </h1>
          <h1 class="text-6xl font-black text-white tracking-tight uppercase leading-none mb-6 text-zinc-500">
              & {{ brideName }}
          </h1>
          <div class="flex items-center gap-6 text-xs font-bold text-white tracking-[0.2em] uppercase">
              <span>{{ day }}</span>
              <span class="w-1 h-1 rounded-full bg-zinc-500"></span>
              <span>{{ month }}</span>
              <span class="w-1 h-1 rounded-full bg-zinc-500"></span>
              <span>{{ year }}</span>
          </div>
      </div>
  </section>
</template>
