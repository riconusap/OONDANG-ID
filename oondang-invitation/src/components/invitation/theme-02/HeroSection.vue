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
  return props.invitation?.customImages?.hero_bg || 'https://placehold.co/480x800/111111/4a4036?text=Hero+Background';
});

onMounted(() => {
    setTimeout(() => {
        isVisible.value = true;
    }, 100);
});
</script>

<template>
  <section id="hero" class="relative min-h-screen flex flex-col justify-end px-6 pb-24 overflow-hidden">
      <!-- Full Bleed Background Image -->
      <img :src="heroImage" alt="Hero Background" class="absolute inset-0 w-full h-full object-cover object-center" />
      <div class="absolute inset-0 bg-black/20"></div>
      
      <!-- Frosted Glass Card -->
      <div 
        :class="[
            'relative z-10 w-full bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl border border-white/50 text-center transition-all duration-1000 ease-out will-change-[opacity,transform] delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <p class="font-wedding-serif italic text-lg text-sage-600 mb-2">{{ subtitle }}</p>
          <h1 class="text-4xl sm:text-5xl font-wedding-serif text-zinc-800 tracking-wider uppercase leading-tight mb-4">
              {{ groomName }} <br/><span class="text-3xl sm:text-4xl">&</span> {{ brideName }}
          </h1>
          <div class="w-12 h-px bg-sage-400 mx-auto mb-4"></div>
          <div class="flex items-center justify-center gap-4 text-sm font-medium text-zinc-700 tracking-widest uppercase">
              <span>{{ day }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-sage-400"></span>
              <span>{{ month }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-sage-400"></span>
              <span>{{ year }}</span>
          </div>
      </div>
  </section>
</template>
