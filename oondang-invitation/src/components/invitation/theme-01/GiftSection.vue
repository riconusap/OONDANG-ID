<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetContainer = ref<HTMLElement | null>(null);
const { isIntersecting } = useIntersectionObserver(targetContainer);

const emit = defineEmits(['copy']);

const copyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        emit('copy', "Informasi berhasil disalin!");
    } catch (err) {
        console.error('Oops, unable to copy', err);
        emit('copy', "Gagal menyalin. Silakan coba lagi.");
    }
    document.body.removeChild(textArea);
};

const giftTitle = computed(() => props.invitation?.customTexts?.giftTitle || 'Wedding Gift');
const giftSubtitle = computed(() => props.invitation?.customTexts?.giftSubtitle || 'Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui:');

const gifts = computed(() => {
    if (props.invitation?.gifts && props.invitation.gifts.length > 0) {
        return props.invitation.gifts;
    }
    // Default gifts if empty
    return [
        {
            id: '1',
            type: 'BANK',
            name: 'BCA',
            accountNumber: '1370410808',
            accountName: 'Deni Nursalam'
        },
        {
            id: '2',
            type: 'BANK',
            name: 'BRI',
            accountNumber: '4119 0102 3150 534',
            accountName: 'Sofiah Ramadhani'
        }
    ];
});
</script>

<template>
  <section class="py-24 px-6 bg-[#141414] text-center border-t border-zinc-800 rounded-t-[3rem] relative z-40">
      <div 
        ref="targetContainer"
        :class="[
            'transition-all duration-800 ease-out will-change-[opacity,transform]',
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <div class="text-white text-4xl mb-4"><i class="fa-solid fa-gift"></i></div>
          <h2 class="text-4xl font-wedding-serif mb-4 text-white">{{ giftTitle }}</h2>
          <p class="text-xs text-zinc-400 max-w-[300px] mx-auto mb-10 leading-relaxed whitespace-pre-line">{{ giftSubtitle }}</p>

          <div class="space-y-5 max-w-sm mx-auto">
              <!-- Gift Card -->
              <div v-for="gift in gifts" :key="gift.id" class="bg-white text-wedding-dark p-6 rounded-2xl text-left shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                  <div class="flex justify-between items-center mb-6" v-if="gift.type !== 'KIRIM_BARANG'">
                      <span class="font-bold text-lg" :class="{ 'text-blue-800': gift.name.toLowerCase().includes('bca'), 'text-blue-700': gift.name.toLowerCase().includes('bri') }">{{ gift.name }}</span>
                      <i v-if="gift.type === 'BANK'" class="fa-solid fa-building-columns text-zinc-300 text-xl"></i>
                      <i v-else class="fa-solid fa-wallet text-zinc-300 text-xl"></i>
                  </div>
                  <div class="flex justify-between items-center mb-6" v-else>
                      <span class="font-bold text-lg text-zinc-800">Kado Fisik</span>
                      <i class="fa-solid fa-box text-zinc-300 text-xl"></i>
                  </div>
                  
                  <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{{ gift.type === 'KIRIM_BARANG' ? 'Alamat Pengiriman' : 'Nomor Tujuan' }}</p>
                  <p class="text-xl font-bold tracking-widest mb-4 whitespace-pre-line">{{ gift.accountNumber }}</p>
                  
                  <div class="flex justify-between items-end border-t border-zinc-100 pt-4">
                      <div>
                          <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Penerima</p>
                          <p class="text-sm font-bold">{{ gift.accountName }}</p>
                      </div>
                      <button @click="copyText(gift.accountNumber.replace(/\s/g, ''))" class="px-4 py-2 bg-wedding-dark text-white text-xs rounded-lg flex items-center gap-2 hover:bg-black transition active:scale-95">
                          <i class="fa-regular fa-copy"></i> Salin
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>
