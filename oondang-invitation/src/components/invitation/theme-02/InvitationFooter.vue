<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetContainer = ref<HTMLElement | null>(null);
const { isIntersecting } = useIntersectionObserver(targetContainer);

const footerClosing = computed(() => props.invitation?.customTexts?.footerClosing || "Suatu kebahagiaan & kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do'a restu kepada kami.");
const footerThanks = computed(() => props.invitation?.customTexts?.footerThanks || "Kami Yang Berbahagia,");
const title = computed(() => {
  const groom = props.invitation?.customTexts?.groomName || 'Deni';
  const bride = props.invitation?.customTexts?.brideName || 'Sofiah';
  return `${groom} & ${bride}`;
});
</script>

<template>
  <footer 
    ref="targetContainer"
    :class="[
        'py-10 text-center bg-white text-zinc-800 border-t border-sage-200 transition-all duration-800 ease-out will-change-[opacity,transform]',
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
    ]"
  >
      <p class="text-xs text-zinc-500 mb-2 whitespace-pre-line px-6">{{ footerClosing }}</p>
      <p class="text-xs text-zinc-500 mb-6">{{ footerThanks }}</p>
      <h2 class="text-2xl font-wedding-serif italic mb-6">{{ title }}</h2>
      
      <div class="mt-8 pt-8 border-t border-sage-200 text-[10px] text-zinc-500 flex flex-col items-center gap-2">
          <p>Made with ❤️ by Oondang</p>
      </div>
  </footer>
</template>
