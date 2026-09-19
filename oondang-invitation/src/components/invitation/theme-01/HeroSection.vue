<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation: Invitation | null | undefined
}>();

const isVisible = ref(false);

const subtitle = computed(() => props.invitation?.customTexts?.coverSubtitle || 'The Wedding of');
const groomName = computed(() => props.invitation?.customTexts?.groomName || 'LIVIANA');
const brideName = computed(() => props.invitation?.customTexts?.brideName || 'ADRIAN');
const heroQuote = computed(() => props.invitation?.customTexts?.heroQuote || "A great marriage is not when the 'perfect couple' comes together. It is when an 'imperfect couple' learns to enjoy their differences");
const heroQuoteAuthor = computed(() => props.invitation?.customTexts?.heroQuoteAuthor || "- Dave Meurer -");

const eventDateObj = computed(() => {
    let dateStr = '2026-12-31';
    if (props.invitation?.customTexts?.eventDateRaw) {
        dateStr = props.invitation.customTexts.eventDateRaw;
    }
    return new Date(dateStr);
});

const day = computed(() => eventDateObj.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (eventDateObj.value.getMonth() + 1).toString().padStart(2, '0'));
const year = computed(() => eventDateObj.value.getFullYear().toString().slice(-2));

const heroImage = computed(() => {
  return props.invitation?.customImages?.hero_bg || 'https://images.unsplash.com/photo-1465495972077-4364ea166d61?auto=format&fit=crop&w=800&q=80';
});

onMounted(() => {
    setTimeout(() => {
        isVisible.value = true;
    }, 100);
});
</script>

<template>
  <section id="hero" class="relative min-h-screen flex flex-col bg-black text-white px-6 pt-16 overflow-hidden">
      <!-- Top Text Block -->
      <div 
        :class="[
            'relative z-10 w-full transition-all duration-800 ease-out will-change-[opacity,transform] delay-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
        ]"
      >
          <!-- Using font-wedding-serif italic to mimic cursive for now -->
          <p class="font-wedding-serif italic text-2xl text-white mb-2">{{ subtitle }}</p>
          <h1 class="text-4xl sm:text-5xl font-wedding-serif text-white tracking-widest uppercase leading-tight">
              {{ groomName }}<br/>
              <span class="text-3xl sm:text-4xl">& {{ brideName }}</span>
          </h1>
          
          <div class="mt-8 pr-4">
             <p class="font-wedding-serif italic text-[13px] text-zinc-300 leading-relaxed">
               "{{ heroQuote }}"
             </p>
             <p class="mt-4 text-[13px] font-bold tracking-wide">
               {{ heroQuoteAuthor }}
             </p>
          </div>
      </div>

      <!-- Bottom Block -->
      <div class="flex-1 mt-10 flex relative -mx-6">
          <!-- Left Vertical Date -->
          <div class="w-16 sm:w-20 flex flex-col items-center justify-start pt-8 pb-12 z-10">
              <div class="w-px h-28 bg-white/70 mb-6"></div>
              <div class="flex flex-col gap-6 text-xl font-wedding-serif tracking-widest text-white">
                  <span>{{ day }}</span>
                  <span>{{ month }}</span>
                  <span>{{ year }}</span>
              </div>
          </div>
          
          <!-- Right Image Block -->
          <div class="flex-1 relative overflow-hidden rounded-tl-[5rem] sm:rounded-tl-[7rem] bg-zinc-900 border-l border-t border-zinc-800/50">
             <img :src="heroImage" alt="Hero" class="absolute inset-0 w-full h-full object-cover object-center" />
             <div class="absolute inset-0 bg-black/10"></div>
          </div>
      </div>
  </section>
</template>
