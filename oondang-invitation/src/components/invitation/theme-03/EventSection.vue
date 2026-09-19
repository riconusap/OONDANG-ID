<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetHeader = ref<HTMLElement | null>(null);
const targetAkad = ref<HTMLElement | null>(null);
const targetResepsi = ref<HTMLElement | null>(null);

const { isIntersecting: isHeaderIntersecting } = useIntersectionObserver(targetHeader);
const { isIntersecting: isAkadIntersecting } = useIntersectionObserver(targetAkad);
const { isIntersecting: isResepsiIntersecting } = useIntersectionObserver(targetResepsi);

const akadTitle = computed(() => props.invitation?.customTexts?.akadTitle || 'AKAD NIKAH');
const akadTime = computed(() => props.invitation?.customTexts?.akadTime || '08:00 - 10:00 WIB');
const akadAddress = computed(() => props.invitation?.customTexts?.akadAddress || 'KEDIAMAN MEMPELAI WANITA\nKp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat');

const resepsiTitle = computed(() => props.invitation?.customTexts?.resepsiTitle || 'RESEPSI');
const resepsiTime = computed(() => props.invitation?.customTexts?.resepsiTime || '10:00 - 18:00 WIB');
const resepsiAddress = computed(() => props.invitation?.customTexts?.resepsiAddress || 'KEDIAMAN MEMPELAI WANITA\nKp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat');

// Extract titles and details
const extractTitle = (address: string) => {
    const lines = address.split('\n');
    return lines[0] || 'LOKASI ACARA';
};
const extractDetails = (address: string) => {
    const lines = address.split('\n');
    return lines.slice(1).join('\n') || '';
};

const akadAddressTitle = computed(() => extractTitle(akadAddress.value));
const akadAddressDetails = computed(() => extractDetails(akadAddress.value));
const resepsiAddressTitle = computed(() => extractTitle(resepsiAddress.value));
const resepsiAddressDetails = computed(() => extractDetails(resepsiAddress.value));

const eventDateObj = computed(() => {
    let dateStr = '2026-12-12';
    if (props.invitation?.customTexts?.eventDateRaw) {
        dateStr = props.invitation.customTexts.eventDateRaw;
    }
    return new Date(dateStr);
});

const day = computed(() => eventDateObj.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (eventDateObj.value.getMonth() + 1).toString().padStart(2, '0'));
const fullYear = computed(() => eventDateObj.value.getFullYear().toString());
const hari = computed(() => {
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    return days[eventDateObj.value.getDay()];
});

// Countdown Logic
const targetDateStr = computed(() => {
    return `${eventDateObj.value.getFullYear()}-${(eventDateObj.value.getMonth()+1).toString().padStart(2,'0')}-${eventDateObj.value.getDate().toString().padStart(2,'0')}T08:00:00`;
});
const targetDate = computed(() => new Date(targetDateStr.value).getTime());

const daysStr = ref('00');
const hoursStr = ref('00');
const minutesStr = ref('00');
const secondsStr = ref('00');

let countdownInterval: ReturnType<typeof setInterval>;

onMounted(() => {
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.value - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        daysStr.value = d < 10 ? "0" + d : String(d);
        hoursStr.value = h < 10 ? "0" + h : String(h);
        minutesStr.value = m < 10 ? "0" + m : String(m);
        secondsStr.value = s < 10 ? "0" + s : String(s);
    }, 1000);
});

onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <section class="bg-zinc-950 relative z-20 py-24 text-white">
      
      <!-- Top Section: Save the Date & Countdown -->
      <div 
        ref="targetHeader"
        :class="[
            'px-8 mb-20 transition-all duration-1000 ease-out will-change-[opacity,transform]',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-8 bg-zinc-600"></div>
              <p class="font-sans tracking-[0.2em] uppercase text-[10px] text-zinc-500">Save The Date</p>
          </div>
          <h2 class="text-6xl font-black uppercase mb-12 leading-none tracking-tighter">
              TIMELINE<br/><span class="text-zinc-600">& DETAILS</span>
          </h2>
          
          <!-- Countdown (Minimalist) -->
          <div class="grid grid-cols-4 border-t border-b border-white/10 py-6">
              <div class="text-center border-r border-white/10">
                  <span class="block text-3xl font-black text-white mb-1">{{ daysStr }}</span>
                  <span class="block text-[8px] text-zinc-500 uppercase tracking-widest">Days</span>
              </div>
              <div class="text-center border-r border-white/10">
                  <span class="block text-3xl font-black text-white mb-1">{{ hoursStr }}</span>
                  <span class="block text-[8px] text-zinc-500 uppercase tracking-widest">Hrs</span>
              </div>
              <div class="text-center border-r border-white/10">
                  <span class="block text-3xl font-black text-white mb-1">{{ minutesStr }}</span>
                  <span class="block text-[8px] text-zinc-500 uppercase tracking-widest">Mins</span>
              </div>
              <div class="text-center">
                  <span class="block text-3xl font-black text-white mb-1">{{ secondsStr }}</span>
                  <span class="block text-[8px] text-zinc-500 uppercase tracking-widest">Secs</span>
              </div>
          </div>
      </div>

      <!-- Events Timeline -->
      <div class="px-8 space-y-16">
          <!-- Akad -->
          <div 
            ref="targetAkad"
            :class="[
                'relative pl-8 border-l border-white/10 transition-all duration-1000 ease-out will-change-[opacity,transform]',
                isAkadIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            ]"
          >
              <div class="absolute w-2 h-2 bg-white -left-[4.5px] top-2"></div>
              <h3 class="text-4xl font-black uppercase tracking-tight text-white mb-6">{{ akadTitle }}</h3>
              
              <div class="mb-6">
                  <p class="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">{{ hari }}</p>
                  <p class="text-2xl font-light text-white tracking-widest mb-1">{{ day }}.{{ month }}.{{ fullYear }}</p>
                  <p class="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">{{ akadTime }}</p>
              </div>
              
              <div class="mb-8">
                  <p class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-2">{{ akadAddressTitle }}</p>
                  <p class="text-[11px] font-light text-zinc-500 leading-relaxed max-w-[280px]">{{ akadAddressDetails }}</p>
              </div>
              
              <a href="#" class="inline-flex items-center justify-center pb-1 border-b border-zinc-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white transition">
                  <i class="fa-solid fa-location-arrow mr-2"></i> Direction
              </a>
          </div>

          <!-- Resepsi -->
          <div 
            ref="targetResepsi"
            :class="[
                'relative pl-8 border-l border-white/10 transition-all duration-1000 ease-out will-change-[opacity,transform]',
                isResepsiIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            ]"
          >
              <div class="absolute w-2 h-2 bg-white -left-[4.5px] top-2"></div>
              <h3 class="text-4xl font-black uppercase tracking-tight text-white mb-6">{{ resepsiTitle }}</h3>
              
              <div class="mb-6">
                  <p class="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">{{ hari }}</p>
                  <p class="text-2xl font-light text-white tracking-widest mb-1">{{ day }}.{{ month }}.{{ fullYear }}</p>
                  <p class="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">{{ resepsiTime }}</p>
              </div>
              
              <div class="mb-8">
                  <p class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-2">{{ resepsiAddressTitle }}</p>
                  <p class="text-[11px] font-light text-zinc-500 leading-relaxed max-w-[280px]">{{ resepsiAddressDetails }}</p>
              </div>
              
              <a href="#" class="inline-flex items-center justify-center pb-1 border-b border-zinc-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white transition">
                  <i class="fa-solid fa-location-arrow mr-2"></i> Direction
              </a>
          </div>
      </div>
  </section>
</template>
