<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Invitation, LoveStory, GiftChannel } from '@/types/invitation';
import { useInvitationStore } from '@/stores/useInvitationStore';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  invitation: Invitation
}>();

const emit = defineEmits<{
  (e: 'save'): void
}>();

const invitationStore = useInvitationStore();
const authStore = useAuthStore();

// UI State
const activeAccordion = ref<string>('global');

const toggleAccordion = (section: string) => {
  activeAccordion.value = activeAccordion.value === section ? '' : section;
};

// Data State
const formData = ref<Record<string, string>>({});
const stories = ref<LoveStory[]>([]);
const gifts = ref<GiftChannel[]>([]);

// Initialize form from invitation
watch(() => props.invitation?.subdomain, (newSubdomain) => {
  if (newSubdomain && props.invitation) {
    const newInv = props.invitation;
    
    if (newInv.customTexts) {
      formData.value = { ...newInv.customTexts };
    }
    
    // Auto-fill from WeddingProfile if missing
    if (!formData.value.groomName && authStore.profile?.groom_name) {
      formData.value.groomName = authStore.profile.groom_name;
    }
    if (!formData.value.brideName && authStore.profile?.bride_name) {
      formData.value.brideName = authStore.profile.bride_name;
    }
    if (!formData.value.groomFullName && authStore.profile?.groom_name) {
      formData.value.groomFullName = authStore.profile.groom_name.toUpperCase();
    }
    if (!formData.value.brideFullName && authStore.profile?.bride_name) {
      formData.value.brideFullName = authStore.profile.bride_name.toUpperCase();
    }
    if (!formData.value.eventDateStr && authStore.profile?.event_date) {
      const date = new Date(authStore.profile.event_date);
      formData.value.eventDateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (invitationStore.currentInvitation) {
       invitationStore.currentInvitation.customTexts = { ...formData.value };
    }
    
    if (newInv.stories && newInv.stories.length > 0) {
      stories.value = JSON.parse(JSON.stringify(newInv.stories));
    } else {
      const defaultStories = [
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
      stories.value = JSON.parse(JSON.stringify(defaultStories));
      if (invitationStore.currentInvitation) {
         invitationStore.currentInvitation.stories = JSON.parse(JSON.stringify(defaultStories));
      }
    }
    
    if (newInv.gifts && newInv.gifts.length > 0) {
      gifts.value = JSON.parse(JSON.stringify(newInv.gifts));
    } else {
      const defaultGifts = [
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
      gifts.value = JSON.parse(JSON.stringify(defaultGifts));
      if (invitationStore.currentInvitation) {
         invitationStore.currentInvitation.gifts = JSON.parse(JSON.stringify(defaultGifts));
      }
    }
  }
}, { immediate: true });

const handleInput = (key: string, value: string) => {
  invitationStore.updateLocalCustomText(key, value);
};

// Story Handlers
const generateId = () => Math.random().toString(36).substring(2, 9);

const addStory = () => {
  const newStory: LoveStory = { id: generateId(), title: '', date: '', text: '' };
  stories.value.push(newStory);
  invitationStore.addLocalStory(newStory);
};

const updateStory = (index: number) => {
  invitationStore.updateLocalStory(index, stories.value[index]);
};

const removeStory = (index: number) => {
  stories.value.splice(index, 1);
  invitationStore.removeLocalStory(index);
};

// Gift Handlers
const addGift = () => {
  const newGift: GiftChannel = { id: generateId(), type: 'BANK', name: '', accountNumber: '', accountName: '' };
  gifts.value.push(newGift);
  invitationStore.addLocalGift(newGift);
};

const updateGift = (index: number) => {
  invitationStore.updateLocalGift(index, gifts.value[index]);
};

const removeGift = (index: number) => {
  gifts.value.splice(index, 1);
  invitationStore.removeLocalGift(index);
};
</script>

<template>
  <div class="space-y-4 pb-8">
    
    <!-- ACCORDION 1: Info Utama -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('global')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Informasi Utama & Sampul</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'global' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'global'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Sub-judul Sampul</label>
          <input type="text" v-model="formData.coverSubtitle" @input="handleInput('coverSubtitle', formData.coverSubtitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="The Wedding of">
        </div>
        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Tanggal Acara (Format Teks)</label>
          <input type="text" v-model="formData.eventDateStr" @input="handleInput('eventDateStr', formData.eventDateStr)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Sabtu, 13 Juni 2026">
        </div>
        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Salam Pembuka Kepada Tamu</label>
          <input type="text" v-model="formData.coverSalutation" @input="handleInput('coverSalutation', formData.coverSalutation)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Kepada Yth. Bapak/Ibu/Saudara/i">
        </div>
      </div>
    </div>

    <!-- ACCORDION 2: Profil Mempelai -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('profiles')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Profil Mempelai</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'profiles' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'profiles'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        <div class="bg-surface p-3 rounded-lg border border-border mb-4">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Mempelai Pria</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Panggilan</label>
              <input type="text" v-model="formData.groomName" @input="handleInput('groomName', formData.groomName)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Romeo">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Lengkap</label>
              <input type="text" v-model="formData.groomFullName" @input="handleInput('groomFullName', formData.groomFullName)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="ROMEO MONTAGUE">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Orang Tua</label>
              <textarea v-model="formData.groomParents" @input="handleInput('groomParents', formData.groomParents)" rows="2" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Putra Kedua dari Bapak X & Ibu Y"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Username Instagram</label>
              <input type="text" v-model="formData.groomInstagram" @input="handleInput('groomInstagram', formData.groomInstagram)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="romeomontague">
            </div>
          </div>
        </div>

        <div class="bg-surface p-3 rounded-lg border border-border">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Mempelai Wanita</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Panggilan</label>
              <input type="text" v-model="formData.brideName" @input="handleInput('brideName', formData.brideName)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Juliet">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Lengkap</label>
              <input type="text" v-model="formData.brideFullName" @input="handleInput('brideFullName', formData.brideFullName)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="JULIET CAPULET">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Orang Tua</label>
              <textarea v-model="formData.brideParents" @input="handleInput('brideParents', formData.brideParents)" rows="2" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Putri Pertama dari Bapak A & Ibu B"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Username Instagram</label>
              <input type="text" v-model="formData.brideInstagram" @input="handleInput('brideInstagram', formData.brideInstagram)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="julietcapulet">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ACCORDION 3: Detail Acara -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('events')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Jadwal & Lokasi Acara</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'events' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'events'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        <div class="bg-surface p-3 rounded-lg border border-border mb-4">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Akad Nikah / Pemberkatan</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Acara</label>
              <input type="text" v-model="formData.akadTitle" @input="handleInput('akadTitle', formData.akadTitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Akad Nikah">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Waktu</label>
              <input type="text" v-model="formData.akadTime" @input="handleInput('akadTime', formData.akadTime)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="08:00 WIB - Selesai">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Tempat & Alamat Lengkap</label>
              <textarea v-model="formData.akadAddress" @input="handleInput('akadAddress', formData.akadAddress)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Masjid Raya..."></textarea>
            </div>
          </div>
        </div>

        <div class="bg-surface p-3 rounded-lg border border-border">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Resepsi</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Acara</label>
              <input type="text" v-model="formData.resepsiTitle" @input="handleInput('resepsiTitle', formData.resepsiTitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Resepsi Pernikahan">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Waktu</label>
              <input type="text" v-model="formData.resepsiTime" @input="handleInput('resepsiTime', formData.resepsiTime)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="11:00 WIB - Selesai">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Tempat & Alamat Lengkap</label>
              <textarea v-model="formData.resepsiAddress" @input="handleInput('resepsiAddress', formData.resepsiAddress)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Gedung Serbaguna..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ACCORDION 4: Kisah Cinta -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('stories')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Kisah Cinta (Love Story)</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'stories' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'stories'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        
        <div class="bg-surface p-3 rounded-lg border border-border mb-4">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Pengaturan Bagian</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Bagian</label>
              <input type="text" v-model="formData.storyTitle" @input="handleInput('storyTitle', formData.storyTitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Our Story">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Sub-judul Bagian</label>
              <input type="text" v-model="formData.storySubtitle" @input="handleInput('storySubtitle', formData.storySubtitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Kisah Cinta Kami">
            </div>
          </div>
        </div>

        <div v-for="(story, index) in stories" :key="story.id" class="bg-surface p-3 rounded-lg border border-border relative">
          <button @click="removeStory(index)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-md text-xs transition-colors">Hapus</button>
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Kisah #{{ index + 1 }}</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Momen (Opsional)</label>
              <input type="text" v-model="story.title" @input="updateStory(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Awal Pertemuan">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Tanggal/Waktu (Opsional)</label>
              <input type="text" v-model="story.date" @input="updateStory(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Januari 2024">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Cerita Singkat</label>
              <textarea v-model="story.text" @input="updateStory(index)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Tuliskan cerita Anda..."></textarea>
            </div>
          </div>
        </div>

        <button @click="addStory" class="w-full py-2 border-2 border-dashed border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
          + Tambah Kisah Baru
        </button>

      </div>
    </div>

    <!-- ACCORDION 5: Amplop Digital & Hadiah -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('gifts')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Amplop Digital & Hadiah</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'gifts' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'gifts'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        
        <div class="bg-surface p-3 rounded-lg border border-border mb-4">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Pengaturan Bagian</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Bagian</label>
              <input type="text" v-model="formData.giftTitle" @input="handleInput('giftTitle', formData.giftTitle)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Wedding Gift">
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Sub-judul Bagian</label>
              <textarea v-model="formData.giftSubtitle" @input="handleInput('giftSubtitle', formData.giftSubtitle)" rows="2" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Bagi keluarga dan sahabat yang ingin memberikan..."></textarea>
            </div>
          </div>
        </div>

        <div v-for="(gift, index) in gifts" :key="gift.id" class="bg-surface p-3 rounded-lg border border-border relative">
          <button @click="removeGift(index)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-md text-xs transition-colors">Hapus</button>
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Hadiah #{{ index + 1 }}</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Tipe Saluran</label>
              <select v-model="gift.type" @change="updateGift(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface">
                <option value="BANK">Transfer Bank</option>
                <option value="E-WALLET">Dompet Digital (Gopay/OVO/Dana/dll)</option>
                <option value="KIRIM_BARANG">Kirim Barang Fisik</option>
              </select>
            </div>
            
            <div v-if="gift.type !== 'KIRIM_BARANG'">
              <label class="block text-xs font-medium text-ink-muted mb-1">Nama Bank / Aplikasi</label>
              <input type="text" v-model="gift.name" @input="updateGift(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Misal: BCA / Gopay">
            </div>
            
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">{{ gift.type === 'KIRIM_BARANG' ? 'Alamat Pengiriman' : 'Nomor Rekening / HP' }}</label>
              <textarea v-if="gift.type === 'KIRIM_BARANG'" v-model="gift.accountNumber" @input="updateGift(index)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Alamat lengkap tujuan kado fisik..."></textarea>
              <input v-else type="text" v-model="gift.accountNumber" @input="updateGift(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Nomor rekening">
            </div>
            
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Atas Nama Penerima</label>
              <input type="text" v-model="gift.accountName" @input="updateGift(index)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Nama Penerima">
            </div>
          </div>
        </div>

        <button @click="addGift" class="w-full py-2 border-2 border-dashed border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
          + Tambah Rekening/Alamat
        </button>
      </div>
    </div>

    <!-- ACCORDION 6: Ayat Suci & Penutup -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <button @click="toggleAccordion('quotes')" class="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-subtle transition-colors text-left">
        <span class="font-bold text-ink text-sm">Ayat Suci & Penutup</span>
        <i class="fa-solid fa-chevron-down text-ink-muted transition-transform" :class="{ 'rotate-180': activeAccordion === 'quotes' }"></i>
      </button>
      
      <div v-show="activeAccordion === 'quotes'" class="p-4 border-t border-border space-y-4 bg-canvas/20">
        <div class="bg-surface p-3 rounded-lg border border-border mb-4">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Kutipan Utama (Ayat Suci / Quote)</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Isi Kutipan</label>
              <textarea v-model="formData.quoteText" @input="handleInput('quoteText', formData.quoteText)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Dan di antara tanda-tanda kebesaran-Nya..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Sumber Kutipan</label>
              <input type="text" v-model="formData.quoteSource" @input="handleInput('quoteSource', formData.quoteSource)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="- Ar-Rum : Ayat 21 -">
            </div>
          </div>
        </div>

        <div class="bg-surface p-3 rounded-lg border border-border">
          <label class="block text-xs font-bold text-ink mb-3 border-b border-border pb-1">Kalimat Penutup Undangan</label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Pesan Penutup</label>
              <textarea v-model="formData.footerClosing" @input="handleInput('footerClosing', formData.footerClosing)" rows="3" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface resize-none" placeholder="Merupakan suatu kehormatan dan kebahagiaan..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Salam (Terima Kasih)</label>
              <input type="text" v-model="formData.footerThanks" @input="handleInput('footerThanks', formData.footerThanks)" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Wassalamu'alaikum Wr. Wb.">
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
