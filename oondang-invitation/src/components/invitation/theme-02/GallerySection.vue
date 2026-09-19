<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetHeader = ref<HTMLElement | null>(null);
const targetGallery = ref<HTMLElement | null>(null);

const { isIntersecting: isHeaderIntersecting } = useIntersectionObserver(targetHeader);
const { isIntersecting: isGalleryIntersecting } = useIntersectionObserver(targetGallery);


const gallery1 = computed(() => props.invitation?.customImages?.gallery_1 || 'https://placehold.co/400x600/4a4036/eae5de?text=Gallery+Main');
const gallery2 = computed(() => props.invitation?.customImages?.gallery_2 || 'https://placehold.co/200x200/4a4036/eae5de?text=Img+1');
const gallery3 = computed(() => props.invitation?.customImages?.gallery_3 || 'https://placehold.co/200x200/4a4036/eae5de?text=Img+2');
const gallery4 = computed(() => props.invitation?.customImages?.gallery_4 || 'https://placehold.co/400x200/4a4036/eae5de?text=Img+3');
</script>

<template>
  <section class="py-24 px-6 bg-white text-zinc-800 rounded-t-[3rem] -mt-10 relative z-30">
      <div 
        ref="targetHeader"
        :class="[
            'text-center mb-10 transition-all duration-800 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <h2 class="text-xs font-sans tracking-widest uppercase text-sage-600 mb-2">Moments</h2>
          <h3 class="text-4xl font-wedding-serif italic text-sage-700 mb-2">Our Gallery</h3>
      </div>
      
      <div 
        ref="targetGallery"
        :class="[
            'transition-all duration-800 ease-out will-change-[opacity,transform]',
            isGalleryIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Bento Grid -->
          <div class="grid grid-cols-2 gap-3 auto-rows-[160px]">
              <div class="col-span-1 row-span-2 rounded-[2rem] overflow-hidden shadow-md border border-sage-100">
                  <img :src="gallery1" alt="Gallery 1" class="w-full h-full object-cover transition-transform hover:scale-105 duration-700">
              </div>
              <div class="col-span-1 row-span-1 rounded-3xl overflow-hidden shadow-md border border-sage-100">
                  <img :src="gallery2" alt="Gallery 2" class="w-full h-full object-cover transition-transform hover:scale-105 duration-700">
              </div>
              <div class="col-span-1 row-span-1 rounded-3xl overflow-hidden shadow-md border border-sage-100">
                  <img :src="gallery3" alt="Gallery 3" class="w-full h-full object-cover transition-transform hover:scale-105 duration-700">
              </div>
              <div class="col-span-2 row-span-1 rounded-[2rem] overflow-hidden shadow-md border border-sage-100">
                  <img :src="gallery4" alt="Gallery 4" class="w-full h-full object-cover transition-transform hover:scale-105 duration-700">
              </div>
          </div>
      </div>
  </section>
</template>
