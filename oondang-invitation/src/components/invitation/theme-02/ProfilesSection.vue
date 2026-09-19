<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetHeader = ref<HTMLElement | null>(null);
const targetGroom = ref<HTMLElement | null>(null);
const targetBride = ref<HTMLElement | null>(null);

const { isIntersecting: isHeaderIntersecting } = useIntersectionObserver(targetHeader);
const { isIntersecting: isGroomIntersecting } = useIntersectionObserver(targetGroom);
const { isIntersecting: isBrideIntersecting } = useIntersectionObserver(targetBride);

const groomPhoto = computed(() => props.invitation?.customImages?.groom_photo || 'https://placehold.co/400x600/4a4036/eae5de?text=Groom');
const bridePhoto = computed(() => props.invitation?.customImages?.bride_photo || 'https://placehold.co/400x600/4a4036/eae5de?text=Bride');

const profileIntroQuote = computed(() => props.invitation?.customTexts?.profileIntroQuote || 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:');
const groomName = computed(() => props.invitation?.customTexts?.groomName || 'Deni');
const groomFullName = computed(() => props.invitation?.customTexts?.groomFullName || 'DENI NURSALAM');
const groomParents = computed(() => props.invitation?.customTexts?.groomParents || 'Putra Kedua dari\nBapak Eket & Ibu Herni Daningsih');
const groomInstagram = computed(() => props.invitation?.customTexts?.groomInstagram || 'Deninursalamm');

const brideName = computed(() => props.invitation?.customTexts?.brideName || 'Sofiah');
const brideFullName = computed(() => props.invitation?.customTexts?.brideFullName || 'SOFIAH RAMADHANI');
const brideParents = computed(() => props.invitation?.customTexts?.brideParents || 'Putri Pertama dari\nBapak Deni & Ibu Eneng Eni');
const brideInstagram = computed(() => props.invitation?.customTexts?.brideInstagram || 'Sofiahramadhaniii_');
</script>

<template>
  <section class="py-16 bg-white text-ink relative z-30 overflow-hidden">
      <!-- Header -->
      <div 
        ref="targetHeader"
        :class="[
            'px-6 mb-16 transition-all duration-800 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <h2 class="text-4xl font-wedding-serif italic mb-2">We Are Getting</h2>
          <h2 class="text-5xl font-wedding-serif tracking-widest uppercase mb-6">MARRIED!</h2>
          <p class="text-sm text-ink-muted max-w-[280px] leading-relaxed">{{ profileIntroQuote }}</p>
      </div>

      <!-- Groom Profile -->
      <div 
        ref="targetGroom"
        :class="[
            'relative mb-20 flex flex-col items-center text-center transition-all duration-800 ease-out delay-100 will-change-[opacity,transform]',
            isGroomIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Image Block (Arch Shape) -->
          <div class="relative w-[16rem] h-[22rem] mb-8">
              <div class="absolute inset-0 bg-sage-200 rounded-t-full rounded-b-3xl translate-x-3 translate-y-3"></div>
              <div class="absolute inset-0 rounded-t-full rounded-b-3xl overflow-hidden border border-sage-300">
                  <img :src="groomPhoto" alt="Groom" class="w-full h-full object-cover" />
              </div>
          </div>
          
          <!-- Text Block -->
          <div class="px-6">
              <h3 class="font-wedding-serif italic text-[3.5rem] leading-none mb-3 text-sage-700">{{ groomName }}</h3>
              <p class="font-wedding-serif text-lg tracking-widest uppercase mb-2 text-zinc-800">{{ groomFullName }}</p>
              <p class="text-sm text-zinc-500 leading-relaxed whitespace-pre-line mb-6">{{ groomParents }}</p>
              <a :href="'https://instagram.com/' + groomInstagram" target="_blank" class="inline-flex px-5 py-2.5 bg-sage-50 text-sage-700 border border-sage-200 text-xs rounded-full font-medium items-center gap-2 hover:bg-sage-100 transition shadow-sm">
                  <i class="fa-brands fa-instagram text-sm"></i> @{{ groomInstagram }}
              </a>
          </div>
      </div>
      
      <!-- Ampersand -->
      <div class="text-center text-7xl font-wedding-serif italic mb-20 relative z-20 text-sage-300">&</div>

      <!-- Bride Profile -->
      <div 
        ref="targetBride"
        :class="[
            'relative pb-16 flex flex-col items-center text-center transition-all duration-800 ease-out delay-100 will-change-[opacity,transform]',
            isBrideIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Image Block (Arch Shape) -->
          <div class="relative w-[16rem] h-[22rem] mb-8">
              <div class="absolute inset-0 bg-sage-200 rounded-t-full rounded-b-3xl -translate-x-3 translate-y-3"></div>
              <div class="absolute inset-0 rounded-t-full rounded-b-3xl overflow-hidden border border-sage-300">
                  <img :src="bridePhoto" alt="Bride" class="w-full h-full object-cover" />
              </div>
          </div>
          
          <!-- Text Block -->
          <div class="px-6">
              <h3 class="font-wedding-serif italic text-[3.5rem] leading-none mb-3 text-sage-700">{{ brideName }}</h3>
              <p class="font-wedding-serif text-lg tracking-widest uppercase mb-2 text-zinc-800">{{ brideFullName }}</p>
              <p class="text-sm text-zinc-500 leading-relaxed whitespace-pre-line mb-6">{{ brideParents }}</p>
              <a :href="'https://instagram.com/' + brideInstagram" target="_blank" class="inline-flex px-5 py-2.5 bg-sage-50 text-sage-700 border border-sage-200 text-xs rounded-full font-medium items-center gap-2 hover:bg-sage-100 transition shadow-sm">
                  <i class="fa-brands fa-instagram text-sm"></i> @{{ brideInstagram }}
              </a>
          </div>
      </div>
  </section>
</template>
