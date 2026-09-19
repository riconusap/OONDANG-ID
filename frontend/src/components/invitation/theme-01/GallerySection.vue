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

const groomName = computed(() => props.invitation?.customTexts?.groomName || 'Deni');
const brideName = computed(() => props.invitation?.customTexts?.brideName || 'Sofiah');

const gallery1 = computed(() => props.invitation?.customImages?.gallery_1 || 'https://placehold.co/400x600/4a4036/eae5de?text=Gallery+Main');
const gallery2 = computed(() => props.invitation?.customImages?.gallery_2 || 'https://placehold.co/200x200/4a4036/eae5de?text=Img+1');
const gallery3 = computed(() => props.invitation?.customImages?.gallery_3 || 'https://placehold.co/200x200/4a4036/eae5de?text=Img+2');
const gallery4 = computed(() => props.invitation?.customImages?.gallery_4 || 'https://placehold.co/400x200/4a4036/eae5de?text=Img+3');
</script>

<template>
  <section class="py-24 px-6 bg-wedding-beige text-wedding-dark rounded-t-[3rem] -mt-10 relative z-30">
      <div 
        ref="targetHeader"
        :class="[
            'text-center mb-10 transition-all duration-800 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <h2 class="text-4xl font-wedding-serif mb-2">OUR GALLERY</h2>
          <h3 class="text-2xl font-wedding-serif italic text-wedding-brown">{{ groomName }} & {{ brideName }}</h3>
      </div>
      
      <div 
        ref="targetGallery"
        :class="[
            'transition-all duration-800 ease-out will-change-[opacity,transform]',
            isGalleryIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Main Gallery Image -->
          <div class="w-full h-96 rounded-t-full overflow-hidden mb-4 shadow-lg border-4 border-white">
              <img :src="gallery1" alt="Gallery 1" class="w-full h-full object-cover">
          </div>
          <!-- Grid Images -->
          <div class="grid grid-cols-2 gap-4">
              <div class="h-40 rounded-lg overflow-hidden shadow">
                  <img :src="gallery2" alt="Gallery 2" class="w-full h-full object-cover">
              </div>
              <div class="h-40 rounded-lg overflow-hidden shadow">
                  <img :src="gallery3" alt="Gallery 3" class="w-full h-full object-cover">
              </div>
              <div class="h-40 rounded-lg overflow-hidden shadow col-span-2">
                  <img :src="gallery4" alt="Gallery 4" class="w-full h-full object-cover">
              </div>
          </div>
      </div>
  </section>
</template>
