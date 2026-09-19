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
  <section class="py-24 bg-zinc-950 text-white relative z-30 overflow-hidden">
      <!-- Header -->
      <div 
        ref="targetHeader"
        :class="[
            'px-8 mb-20 transition-all duration-1000 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-8 bg-zinc-600"></div>
              <p class="font-sans tracking-[0.2em] uppercase text-[10px] text-zinc-500">The Couple</p>
          </div>
          <h2 class="text-4xl font-black uppercase mb-6 leading-tight tracking-tight">MEET THE<br/><span class="text-zinc-500">BRIDE & GROOM</span></h2>
          <p class="text-xs text-zinc-400 max-w-[280px] leading-relaxed font-light">{{ profileIntroQuote }}</p>
      </div>

      <!-- Groom Profile (Left aligned) -->
      <div 
        ref="targetGroom"
        :class="[
            'relative mb-32 px-8 transition-all duration-1000 ease-out delay-100 will-change-[opacity,transform]',
            isGroomIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="relative w-[75%] h-[26rem] mb-8 float-left mr-8">
              <div class="absolute inset-0 grayscale border border-white/10">
                  <img :src="groomPhoto" alt="Groom" class="w-full h-full object-cover" />
              </div>
          </div>
          <div class="clear-both"></div>
          <div class="w-full text-left -mt-12 relative z-10 pl-8">
              <h3 class="font-black text-6xl uppercase tracking-tighter mb-2 text-white drop-shadow-xl">{{ groomName }}</h3>
              <div class="bg-zinc-900/80 backdrop-blur p-6 border border-white/5 inline-block w-[90%] float-right -mt-8 relative z-20">
                  <p class="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-4 text-zinc-300">{{ groomFullName }}</p>
                  <p class="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-line mb-6 font-light">{{ groomParents }}</p>
                  
                  <a :href="'https://instagram.com/' + groomInstagram" target="_blank" class="inline-flex pb-1 border-b border-zinc-600 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] items-center gap-2 hover:text-white transition">
                      IG: @{{ groomInstagram }}
                  </a>
              </div>
              <div class="clear-both"></div>
          </div>
      </div>
      
      <!-- Ampersand -->
      <div class="text-center text-8xl font-black mb-32 relative z-20 text-zinc-800">&</div>

      <!-- Bride Profile (Right aligned) -->
      <div 
        ref="targetBride"
        :class="[
            'relative pb-16 px-8 transition-all duration-1000 ease-out delay-100 will-change-[opacity,transform]',
            isBrideIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="relative w-[75%] h-[26rem] mb-8 float-right ml-8">
              <div class="absolute inset-0 grayscale border border-white/10">
                  <img :src="bridePhoto" alt="Bride" class="w-full h-full object-cover" />
              </div>
          </div>
          <div class="clear-both"></div>
          <div class="w-full text-right -mt-12 relative z-10 pr-8">
              <h3 class="font-black text-6xl uppercase tracking-tighter mb-2 text-white drop-shadow-xl">{{ brideName }}</h3>
              <div class="bg-zinc-900/80 backdrop-blur p-6 border border-white/5 inline-block w-[90%] float-left -mt-8 relative z-20 text-left">
                  <p class="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-4 text-zinc-300">{{ brideFullName }}</p>
                  <p class="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-line mb-6 font-light">{{ brideParents }}</p>
                  
                  <a :href="'https://instagram.com/' + brideInstagram" target="_blank" class="inline-flex pb-1 border-b border-zinc-600 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] items-center gap-2 hover:text-white transition">
                      IG: @{{ brideInstagram }}
                  </a>
              </div>
              <div class="clear-both"></div>
          </div>
      </div>
  </section>
</template>
