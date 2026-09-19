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

const groomPhoto = computed(() => props.invitation?.customImages?.groom_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
const bridePhoto = computed(() => props.invitation?.customImages?.bride_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');

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
  <section class="py-16 bg-[#FDFBF7] text-ink relative z-30 overflow-hidden">
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
            'relative mb-20 transition-all duration-800 ease-out delay-100 will-change-[opacity,transform]',
            isGroomIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Background Decoration -->
          <div class="absolute bottom-0 right-0 w-[80%] h-[75%] bg-[#EAE4DC] rounded-tl-[6rem] border-t border-l border-ink/20 z-0"></div>
          
          <div class="px-6 relative z-10 flex flex-col items-center">
              <!-- Image Block -->
              <div class="relative w-[16rem] h-[24rem] mb-10">
                  <!-- Black shadow/offset -->
                  <div class="absolute inset-0 bg-[#111111] rounded-full translate-x-4 translate-y-4"></div>
                  <!-- Image -->
                  <div class="absolute inset-0 rounded-full overflow-hidden border-2 border-white/50">
                      <img :src="groomPhoto" alt="Groom" class="w-full h-full object-cover" />
                  </div>
              </div>
              
              <!-- Text Block -->
              <div class="w-full text-left">
                  <h3 class="font-wedding-serif italic text-[3.5rem] leading-none mb-3">{{ groomName }}</h3>
                  <p class="font-wedding-serif text-lg tracking-widest uppercase mb-2">{{ groomFullName }}</p>
                  <p class="text-sm text-ink-muted leading-relaxed whitespace-pre-line mb-6">{{ groomParents }}</p>
                  
                  <a :href="'https://instagram.com/' + groomInstagram" target="_blank" class="inline-flex px-5 py-2.5 bg-black text-white text-xs rounded font-medium items-center gap-2 hover:bg-zinc-800 transition">
                      <i class="fa-brands fa-instagram text-sm"></i> @{{ groomInstagram }}
                  </a>
              </div>
          </div>
      </div>
      
      <!-- Ampersand -->
      <div class="text-center text-7xl font-wedding-serif mb-20 relative z-20 text-ink/80">&</div>

      <!-- Bride Profile -->
      <div 
        ref="targetBride"
        :class="[
            'relative pb-16 transition-all duration-800 ease-out delay-100 will-change-[opacity,transform]',
            isBrideIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Background Decoration -->
          <div class="absolute bottom-0 left-0 w-[80%] h-[75%] bg-[#EAE4DC] rounded-tr-[6rem] border-t border-r border-ink/20 z-0"></div>
          
          <div class="px-6 relative z-10 flex flex-col items-center">
              <!-- Image Block -->
              <div class="relative w-[16rem] h-[24rem] mb-10">
                  <!-- Black shadow/offset -->
                  <div class="absolute inset-0 bg-[#111111] rounded-full -translate-x-4 translate-y-4"></div>
                  <!-- Image -->
                  <div class="absolute inset-0 rounded-full overflow-hidden border-2 border-white/50">
                      <img :src="bridePhoto" alt="Bride" class="w-full h-full object-cover" />
                  </div>
              </div>
              
              <!-- Text Block -->
              <div class="w-full text-right flex flex-col items-end">
                  <h3 class="font-wedding-serif italic text-[3.5rem] leading-none mb-3">{{ brideName }}</h3>
                  <p class="font-wedding-serif text-lg tracking-widest uppercase mb-2">{{ brideFullName }}</p>
                  <p class="text-sm text-ink-muted leading-relaxed whitespace-pre-line mb-6">{{ brideParents }}</p>
                  
                  <a :href="'https://instagram.com/' + brideInstagram" target="_blank" class="inline-flex px-5 py-2.5 bg-black text-white text-xs rounded font-medium items-center gap-2 hover:bg-zinc-800 transition">
                      <i class="fa-brands fa-instagram text-sm"></i> @{{ brideInstagram }}
                  </a>
              </div>
          </div>
      </div>
  </section>
</template>
