<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetContainer = ref<HTMLElement | null>(null);
const { isIntersecting } = useIntersectionObserver(targetContainer);

const storyTitle = computed(() => props.invitation?.customTexts?.storyTitle || 'LOVE Story');
const storySubtitle = computed(() => props.invitation?.customTexts?.storySubtitle || '');
const stories = computed(() => {
    if (props.invitation?.stories && props.invitation.stories.length > 0) {
        return props.invitation.stories;
    }
    // Default stories if empty
    return [
        {
            id: '1',
            title: 'Awal Pertemuan',
            date: '',
            text: 'Berawal dari sebuah pertemuan sederhana yang tidak pernah kami sangka sebelumnya, perlahan kami saling mengenal, memahami, dan menemukan kenyamanan satu sama lain. Dari cerita-cerita kecil yang tercipta, tumbuh perasaan yang membawa kami sampai di titik ini.'
        },
        {
            id: '2',
            title: 'Perjalanan Kami',
            date: '',
            text: 'Perjalanan kami mungkin tidak selalu sempurna, tetapi setiap langkahnya menjadi bagian berharga yang menguatkan kami untuk terus bersama. Hingga akhirnya, dengan penuh rasa syukur dan kebahagiaan, kami memutuskan untuk melangkah menuju hari istimewa yang akan menjadi awal dari cerita baru dalam hidup kami.'
        }
    ];
});
</script>

<template>
  <section 
    ref="targetContainer"
    :class="[
        'py-20 px-6 bg-white text-zinc-800 transition-all duration-800 ease-out will-change-[opacity,transform]',
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
    ]"
  >
      <h2 class="text-4xl font-wedding-serif text-center mb-10">{{ storyTitle }} <span v-if="storySubtitle" class="italic text-wedding-brown block text-2xl mt-2">{{ storySubtitle }}</span></h2>
      
      <div class="space-y-8 border-l-2 border-wedding-brown/30 ml-3 pl-6 relative">
          <div v-for="story in stories" :key="story.id" class="relative">
              <div class="absolute -left-[33px] top-1 w-4 h-4 bg-sage-600 rounded-full border-4 border-sage-600"></div>
              <h3 class="font-bold text-sm mb-1 uppercase tracking-wide">{{ story.title }}</h3>
              <p v-if="story.date" class="text-xs text-wedding-brown mb-2 font-bold">{{ story.date }}</p>
              <p class="text-xs text-zinc-600 leading-relaxed text-justify whitespace-pre-line">{{ story.text }}</p>
          </div>
      </div>
  </section>
</template>
