<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const target = ref<HTMLElement | null>(null);
const { isIntersecting } = useIntersectionObserver(target);

const quoteText = computed(() => props.invitation?.customTexts?.quoteText || '"Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."');
const quoteSource = computed(() => props.invitation?.customTexts?.quoteSource || '- Ar-Rum : Ayat 21 -');
</script>

<template>
  <section class="py-20 px-8 text-center bg-white relative z-20">
      <div 
        ref="target"
        :class="[
            'transition-all duration-800 ease-out will-change-[opacity,transform]',
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <p class="text-sm text-zinc-500 leading-relaxed font-light whitespace-pre-line">{{ quoteText }}</p>
          <p class="mt-6 font-bold text-sm text-zinc-800 font-wedding-serif italic">{{ quoteSource }}</p>
      </div>
  </section>
</template>
