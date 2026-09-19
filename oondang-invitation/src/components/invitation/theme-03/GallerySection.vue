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

const gallery1 = computed(() => props.invitation?.customImages?.gallery_1 || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80');
const gallery2 = computed(() => props.invitation?.customImages?.gallery_2 || 'https://images.unsplash.com/photo-1520854221256-17451fc3369b?auto=format&fit=crop&w=400&q=80');
const gallery3 = computed(() => props.invitation?.customImages?.gallery_3 || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80');
const gallery4 = computed(() => props.invitation?.customImages?.gallery_4 || 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80');
</script>

<template>
  <section class="py-24 bg-zinc-950 text-white relative z-30">
      <div 
        ref="targetHeader"
        :class="[
            'px-8 mb-12 transition-all duration-1000 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-8 bg-zinc-600"></div>
              <p class="font-sans tracking-[0.2em] uppercase text-[10px] text-zinc-500">Moments</p>
          </div>
          <h2 class="text-4xl font-black uppercase tracking-tight">THE GALLERY</h2>
      </div>
      
      <div 
        ref="targetGallery"
        :class="[
            'transition-all duration-1000 ease-out will-change-[opacity,transform] w-full overflow-hidden flex flex-col',
            isGalleryIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <!-- Gapless Collage -->
          <div class="w-full flex">
              <div class="w-[60%] h-64 grayscale hover:grayscale-0 transition-all duration-1000">
                  <img :src="gallery1" alt="Gallery 1" class="w-full h-full object-cover">
              </div>
              <div class="w-[40%] flex flex-col h-64">
                  <div class="h-1/2 w-full grayscale hover:grayscale-0 transition-all duration-1000">
                      <img :src="gallery2" alt="Gallery 2" class="w-full h-full object-cover">
                  </div>
                  <div class="h-1/2 w-full grayscale hover:grayscale-0 transition-all duration-1000">
                      <img :src="gallery3" alt="Gallery 3" class="w-full h-full object-cover">
                  </div>
              </div>
          </div>
          <div class="w-full h-40 grayscale hover:grayscale-0 transition-all duration-1000">
              <img :src="gallery4" alt="Gallery 4" class="w-full h-full object-cover">
          </div>
      </div>
  </section>
</template>
