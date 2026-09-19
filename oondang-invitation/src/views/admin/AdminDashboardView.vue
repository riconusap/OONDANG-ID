<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInvitationStore } from '@/stores/useInvitationStore';
import ImageUpload from '@/components/admin/ImageUpload.vue';

const route = useRoute();
const invitationStore = useInvitationStore();

const subdomain = route.params.subdomain as string;

const isLoading = ref(true);
const isSaving = ref(false);
const saveSuccess = ref(false);

const activeTab = ref('general');

// Local state for editing
const formTexts = ref<Record<string, string>>({});
const formImages = ref<Record<string, string>>({});
const formThemeId = ref('theme-01');
const formStories = ref<any[]>([]);
const formGifts = ref<any[]>([]);

const previewUrl = computed(() => {
    return `/?test_subdomain=${subdomain}`;
});

onMounted(async () => {
    const data = await invitationStore.fetchInvitationBySubdomain(subdomain);
    if (data) {
        formTexts.value = { ...data.customTexts };
        formImages.value = { ...data.customImages };
        formThemeId.value = data.themeId;
        formStories.value = Array.isArray(data.stories) ? [...data.stories] : [];
        formGifts.value = Array.isArray(data.gifts) ? [...data.gifts] : [];
    }
    isLoading.value = false;
});

const saveChanges = async () => {
    isSaving.value = true;
    saveSuccess.value = false;
    
    // Call store update
    const success = await invitationStore.updateCustomization(subdomain, {
        customTexts: formTexts.value,
        customImages: formImages.value,
        stories: formStories.value,
        gifts: formGifts.value
    });
    
    import('@/lib/supabase').then(async ({ supabase }) => {
        await supabase.from('invitations').update({ themeId: formThemeId.value }).eq('subdomain', subdomain);
    });

    isSaving.value = false;
    if (success) {
        saveSuccess.value = true;
        setTimeout(() => saveSuccess.value = false, 3000);
    }
};

const addStory = () => {
    formStories.value.push({ id: Date.now().toString(), title: '', date: '', text: '' });
};

const removeStory = (index: number) => {
    formStories.value.splice(index, 1);
};

const addGift = () => {
    formGifts.value.push({ id: Date.now().toString(), type: 'BANK', name: '', accountNumber: '', accountName: '' });
};

const removeGift = (index: number) => {
    formGifts.value.splice(index, 1);
};

</script>

<template>
  <div class="h-screen w-full bg-[#F7F7F9] flex font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-hidden">
      
      <!-- Sidebar (Dark Premium) -->
      <aside class="w-72 bg-zinc-950 text-zinc-400 flex-shrink-0 flex flex-col shadow-2xl z-20">
          <div class="p-8 border-b border-zinc-800/50">
              <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <i class="fa-solid fa-ring text-zinc-950 text-sm"></i>
                  </div>
                  <h1 class="text-xl font-bold tracking-tight text-white">Oondang</h1>
              </div>
              <p class="text-xs text-zinc-500 font-medium">CMS Workspace</p>
              
              <div class="mt-6 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                  <div class="flex flex-col">
                      <span class="text-[10px] uppercase tracking-widest text-zinc-500">Subdomain</span>
                      <span class="text-sm font-semibold text-white">{{ subdomain }}</span>
                  </div>
                  <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
          </div>

          <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <p class="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Menu Utama</p>
              
              <button 
                  @click="activeTab = 'general'" 
                  :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300', activeTab === 'general' ? 'bg-zinc-800 text-white shadow-inner' : 'hover:bg-zinc-900 hover:text-zinc-200']"
              >
                  <i :class="['fa-solid fa-align-left w-5 text-center transition-colors', activeTab === 'general' ? 'text-white' : 'text-zinc-500']"></i> Teks & Info Acara
              </button>
              
              <button 
                  @click="activeTab = 'media'" 
                  :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300', activeTab === 'media' ? 'bg-zinc-800 text-white shadow-inner' : 'hover:bg-zinc-900 hover:text-zinc-200']"
              >
                  <i :class="['fa-solid fa-image w-5 text-center transition-colors', activeTab === 'media' ? 'text-white' : 'text-zinc-500']"></i> Media & Galeri
              </button>
              
              <button 
                  @click="activeTab = 'theme'" 
                  :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300', activeTab === 'theme' ? 'bg-zinc-800 text-white shadow-inner' : 'hover:bg-zinc-900 hover:text-zinc-200']"
              >
                  <i :class="['fa-solid fa-swatchbook w-5 text-center transition-colors', activeTab === 'theme' ? 'text-white' : 'text-zinc-500']"></i> Desain & Tema
              </button>
          </nav>

          <div class="p-6 border-t border-zinc-800/50">
              <a :href="previewUrl" target="_blank" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-zinc-950 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <i class="fa-solid fa-external-link-alt text-xs"></i> Pratinjau Undangan
              </a>
          </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative scroll-smooth">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-[#F7F7F9] z-10">
              <div class="flex flex-col items-center gap-4">
                  <i class="fa-solid fa-circle-notch fa-spin text-3xl text-zinc-900"></i>
                  <p class="text-sm font-medium text-zinc-500 animate-pulse">Memuat workspace...</p>
              </div>
          </div>
          
          <div v-else class="max-w-4xl mx-auto p-6 md:p-12">
              
              <!-- Sticky Header -->
              <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10 pb-6 border-b border-zinc-200/60 sticky top-0 bg-[#F7F7F9]/80 backdrop-blur-md z-10 pt-4 -mt-4">
                  <div>
                      <h2 class="text-3xl font-bold text-zinc-900 tracking-tight">
                          {{ activeTab === 'general' ? 'Informasi Acara' : activeTab === 'media' ? 'Media Visual' : 'Desain Tema' }}
                      </h2>
                      <p class="text-sm text-zinc-500 mt-1">
                          {{ activeTab === 'general' ? 'Atur nama mempelai dan detail pelaksanaan.' : activeTab === 'media' ? 'Kelola foto sampul, mempelai, dan galeri.' : 'Pilih gaya visual yang paling cocok.' }}
                      </p>
                  </div>
                  
                  <div class="flex items-center gap-4">
                      <transition name="fade">
                          <span v-if="saveSuccess" class="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                              <i class="fa-solid fa-check"></i> Tersimpan
                          </span>
                      </transition>
                      <button 
                          @click="saveChanges" 
                          :disabled="isSaving"
                          class="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-zinc-900/10 hover:shadow-lg hover:-translate-y-0.5"
                      >
                          <i v-if="isSaving" class="fa-solid fa-circle-notch fa-spin"></i>
                          <i v-else class="fa-solid fa-cloud-arrow-up"></i>
                          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                      </button>
                  </div>
              </header>

              <!-- GENERAL TAB -->
              <div v-if="activeTab === 'general'" class="space-y-8 animate-fade-in-up pb-20">
                  
                  <!-- Card: Kutipan & Intro -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                              <i class="fa-solid fa-quote-left"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Kutipan & Judul</h3>
                              <p class="text-xs text-zinc-500">Kutipan di halaman depan dan pengantar.</p>
                          </div>
                      </div>
                      
                      <div class="space-y-5">
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subjudul Cover (Cth: The Wedding of)</label>
                              <input v-model="formTexts.coverSubtitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Kutipan Utama (Hero Quote)</label>
                              <textarea v-model="formTexts.heroQuote" rows="2" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Penulis Kutipan (Hero Quote Author)</label>
                              <input v-model="formTexts.heroQuoteAuthor" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Teks Pengantar Profil (Ayat/Doa)</label>
                              <textarea v-model="formTexts.profileIntroQuote" rows="3" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                          </div>
                      </div>
                  </section>

                  <!-- Card: Data Mempelai -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                              <i class="fa-solid fa-user-group"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Profil Mempelai</h3>
                              <p class="text-xs text-zinc-500">Nama yang akan ditampilkan di undangan.</p>
                          </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Panggilan Pria</label>
                              <input v-model="formTexts.groomName" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lengkap Pria</label>
                              <input v-model="formTexts.groomFullName" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Orang Tua Pria</label>
                              <textarea v-model="formTexts.groomParents" rows="2" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Username Instagram Pria</label>
                              <input v-model="formTexts.groomInstagram" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          
                          <div class="col-span-1 md:col-span-2 my-2 border-t border-dashed border-zinc-200"></div>

                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Panggilan Wanita</label>
                              <input v-model="formTexts.brideName" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lengkap Wanita</label>
                              <input v-model="formTexts.brideFullName" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Orang Tua Wanita</label>
                              <textarea v-model="formTexts.brideParents" rows="2" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Username Instagram Wanita</label>
                              <input v-model="formTexts.brideInstagram" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                      </div>
                  </section>

                  <!-- Card: Jadwal Acara -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                              <i class="fa-solid fa-calendar-day"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Jadwal & Waktu</h3>
                              <p class="text-xs text-zinc-500">Penanggalan untuk countdown dan rundown.</p>
                          </div>
                      </div>
                      
                      <div class="space-y-5">
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tanggal Acara Utama</label>
                              <input v-model="formTexts.eventDateRaw" type="datetime-local" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium font-mono text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              <p class="text-[10px] text-zinc-400 mt-1">Pilih tanggal dan waktu pelaksanaan acara.</p>
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Jam Akad</label>
                                  <input v-model="formTexts.akadTime" type="text" placeholder="08:00 - 10:00 WIB" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Jam Resepsi</label>
                                  <input v-model="formTexts.resepsiTime" type="text" placeholder="10:00 - Selesai" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                          </div>
                      </div>
                  </section>
                  
                  <!-- Card: Lokasi -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                              <i class="fa-solid fa-map-location-dot"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Lokasi Penyelenggaraan</h3>
                              <p class="text-xs text-zinc-500">Alamat lengkap acara.</p>
                          </div>
                      </div>
                      
                      <div class="space-y-6">
                          <!-- Akad -->
                          <div class="space-y-4 p-4 border border-zinc-100 bg-zinc-50/50 rounded-xl">
                              <h4 class="font-bold text-sm text-zinc-900">Lokasi Akad</h4>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nama Tempat / Gedung</label>
                                  <input v-model="formTexts.akadAddressTitle" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alamat Lengkap</label>
                                  <textarea v-model="formTexts.akadAddressDetails" rows="3" class="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">URL Google Maps</label>
                                  <input v-model="formTexts.akadMapUrl" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                          </div>
                          
                          <!-- Resepsi -->
                          <div class="space-y-4 p-4 border border-zinc-100 bg-zinc-50/50 rounded-xl">
                              <h4 class="font-bold text-sm text-zinc-900">Lokasi Resepsi</h4>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nama Tempat / Gedung</label>
                                  <input v-model="formTexts.resepsiAddressTitle" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alamat Lengkap</label>
                                  <textarea v-model="formTexts.resepsiAddressDetails" rows="3" class="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">URL Google Maps</label>
                                  <input v-model="formTexts.resepsiMapUrl" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                          </div>
                      </div>
                  </section>
                  
                  <!-- Card: Section Titles -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <i class="fa-solid fa-heading"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Judul & Subjudul Seksi</h3>
                              <p class="text-xs text-zinc-500">Kustomisasi teks untuk setiap bagian halaman.</p>
                          </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Judul Galeri</label>
                              <input v-model="formTexts.galleryTitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subjudul Galeri</label>
                              <input v-model="formTexts.gallerySubtitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          
                          <div class="col-span-1 md:col-span-2 my-2 border-t border-dashed border-zinc-200"></div>

                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Judul Love Story</label>
                              <input v-model="formTexts.loveStoryTitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subjudul Love Story</label>
                              <input v-model="formTexts.loveStorySubtitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          
                          <div class="col-span-1 md:col-span-2 my-2 border-t border-dashed border-zinc-200"></div>

                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Judul Wedding Gift</label>
                              <input v-model="formTexts.giftTitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subjudul Wedding Gift</label>
                              <input v-model="formTexts.giftSubtitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          
                          <div class="col-span-1 md:col-span-2 my-2 border-t border-dashed border-zinc-200"></div>

                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Judul Buku Tamu</label>
                              <input v-model="formTexts.wishesTitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subjudul Buku Tamu</label>
                              <input v-model="formTexts.wishesSubtitle" type="text" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                          </div>
                      </div>
                  </section>
                  
                  <!-- Card: Love Stories -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between mb-6">
                          <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                                  <i class="fa-solid fa-heart"></i>
                              </div>
                              <div>
                                  <h3 class="text-lg font-bold text-zinc-900">Perjalanan Cinta</h3>
                                  <p class="text-xs text-zinc-500">Bagikan momen kisah kasih Anda.</p>
                              </div>
                          </div>
                          <button @click="addStory" class="px-4 py-2 text-xs font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition">
                              <i class="fa-solid fa-plus mr-1"></i> Tambah
                          </button>
                      </div>
                      
                      <div v-if="formStories.length === 0" class="text-center py-8 text-zinc-400 text-sm italic">
                          Belum ada kisah cinta yang ditambahkan.
                      </div>
                      
                      <div v-else class="space-y-4">
                          <div v-for="(story, index) in formStories" :key="story.id" class="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 relative group">
                              <button @click="removeStory(index)" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition opacity-0 group-hover:opacity-100">
                                  <i class="fa-solid fa-trash text-xs"></i>
                              </button>
                              
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                  <div class="space-y-1.5">
                                      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Judul Momen</label>
                                      <input v-model="story.title" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                                  </div>
                                  <div class="space-y-1.5">
                                      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tanggal/Bulan/Tahun</label>
                                      <input v-model="story.date" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                                  </div>
                              </div>
                              <div class="space-y-1.5 pr-10">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Deskripsi Singkat</label>
                                  <textarea v-model="story.text" rows="2" class="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none"></textarea>
                              </div>
                          </div>
                      </div>
                  </section>
                  
                  <!-- Card: Wedding Gifts -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between mb-6">
                          <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                                  <i class="fa-solid fa-gift"></i>
                              </div>
                              <div>
                                  <h3 class="text-lg font-bold text-zinc-900">Rekening & Kado</h3>
                                  <p class="text-xs text-zinc-500">Informasi rekening atau alamat pengiriman kado.</p>
                              </div>
                          </div>
                          <button @click="addGift" class="px-4 py-2 text-xs font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition">
                              <i class="fa-solid fa-plus mr-1"></i> Tambah
                          </button>
                      </div>
                      
                      <div v-if="formGifts.length === 0" class="text-center py-8 text-zinc-400 text-sm italic">
                          Belum ada rekening/hadiah yang ditambahkan.
                      </div>
                      
                      <div v-else class="space-y-4">
                          <div v-for="(gift, index) in formGifts" :key="gift.id" class="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 relative group">
                              <button @click="removeGift(index)" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition opacity-0 group-hover:opacity-100">
                                  <i class="fa-solid fa-trash text-xs"></i>
                              </button>
                              
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                  <div class="space-y-1.5">
                                      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nama Bank / Dompet Digital</label>
                                      <input v-model="gift.name" type="text" placeholder="BCA / Mandiri / DANA" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                                  </div>
                                  <div class="space-y-1.5">
                                      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">No. Rekening / No. HP</label>
                                      <input v-model="gift.accountNumber" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                                  </div>
                              </div>
                              <div class="space-y-1.5 pr-10">
                                  <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Atas Nama (Pemilik Rekening)</label>
                                  <input v-model="gift.accountName" type="text" class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all">
                              </div>
                          </div>
                      </div>
                  </section>
              </div>

              <!-- MEDIA TAB -->
              <div v-if="activeTab === 'media'" class="space-y-8 animate-fade-in-up pb-20">
                  <div class="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
                      <div class="text-blue-500 mt-0.5"><i class="fa-solid fa-cloud-arrow-up text-xl"></i></div>
                      <div>
                          <h4 class="text-sm font-bold text-blue-900 mb-1">Unggah Langsung (Otomatis WebP)</h4>
                          <p class="text-xs text-blue-800/80 leading-relaxed">
                              Pilih gambar dari perangkat Anda. Gambar akan otomatis dikompresi menjadi WebP untuk menghemat kuota tamu dan diunggah ke *cloud storage* Anda secara instan.
                          </p>
                      </div>
                  </div>

                  <!-- Banner & Cover -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                              <i class="fa-solid fa-image"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Hero & Cover</h3>
                              <p class="text-xs text-zinc-500">Latar belakang halaman utama.</p>
                          </div>
                      </div>
                      
                      <div class="space-y-6">
                          <ImageUpload v-model="formImages.cover_bg" :subdomain="subdomain" label="Gambar Cover (Amplop Depan)" />
                          <ImageUpload v-model="formImages.hero_bg" :subdomain="subdomain" label="Gambar Hero (Bagian Utama dalam)" />
                      </div>
                  </section>

                  <!-- Foto Profil -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                              <i class="fa-solid fa-camera-retro"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Foto Profil</h3>
                              <p class="text-xs text-zinc-500">Pas foto individu mempelai.</p>
                          </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ImageUpload v-model="formImages.groom_photo" :subdomain="subdomain" label="Pria" />
                          <ImageUpload v-model="formImages.bride_photo" :subdomain="subdomain" label="Wanita" />
                      </div>
                  </section>
                  
                  <!-- Galeri -->
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-6">
                          <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                              <i class="fa-solid fa-photo-film"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Galeri Prewedding</h3>
                              <p class="text-xs text-zinc-500">Album foto momen berharga.</p>
                          </div>
                      </div>
                      
                      <div class="grid grid-cols-1 gap-6">
                          <ImageUpload v-model="formImages.gallery_1" :subdomain="subdomain" label="Grid Foto 1 (Utama)" />
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <ImageUpload v-model="formImages.gallery_2" :subdomain="subdomain" label="Grid Foto 2 (Kecil)" />
                              <ImageUpload v-model="formImages.gallery_3" :subdomain="subdomain" label="Grid Foto 3 (Kecil)" />
                          </div>
                      </div>
                  </section>
              </div>

              <!-- THEME TAB -->
              <div v-if="activeTab === 'theme'" class="space-y-8 animate-fade-in-up pb-20">
                  <section class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center gap-3 mb-8">
                          <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                              <i class="fa-solid fa-paintbrush"></i>
                          </div>
                          <div>
                              <h3 class="text-lg font-bold text-zinc-900">Pilih Desain Tema</h3>
                              <p class="text-xs text-zinc-500">Tata letak dan palet warna akan berubah otomatis.</p>
                          </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          <!-- Theme 01 -->
                          <label class="cursor-pointer group relative">
                              <input type="radio" v-model="formThemeId" value="theme-01" class="peer sr-only">
                              <div class="rounded-2xl border-2 border-zinc-200 p-2 transition-all peer-checked:border-zinc-900 peer-checked:ring-4 peer-checked:ring-zinc-900/10 hover:border-zinc-300">
                                  <div class="h-40 bg-zinc-950 rounded-xl mb-4 flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                      <i class="fa-solid fa-moon text-zinc-600 text-3xl z-10"></i>
                                      <span class="text-white font-serif text-lg z-10">Classic Dark</span>
                                  </div>
                                  <div class="px-2 pb-2 text-center">
                                      <p class="font-bold text-sm text-zinc-900">Theme 01</p>
                                      <p class="text-[10px] text-zinc-500 mt-0.5">Misterius & Elegan</p>
                                  </div>
                              </div>
                              <div class="absolute top-4 right-4 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100 z-20 shadow-lg">
                                  <i class="fa-solid fa-check text-xs"></i>
                              </div>
                          </label>

                          <!-- Theme 02 -->
                          <label class="cursor-pointer group relative">
                              <input type="radio" v-model="formThemeId" value="theme-02" class="peer sr-only">
                              <div class="rounded-2xl border-2 border-zinc-200 p-2 transition-all peer-checked:border-zinc-900 peer-checked:ring-4 peer-checked:ring-zinc-900/10 hover:border-zinc-300">
                                  <div class="h-40 bg-stone-100 rounded-xl mb-4 flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                                      <i class="fa-solid fa-sun text-stone-300 text-3xl z-10"></i>
                                      <span class="text-stone-800 font-serif text-lg z-10">Soft Light</span>
                                  </div>
                                  <div class="px-2 pb-2 text-center">
                                      <p class="font-bold text-sm text-zinc-900">Theme 02</p>
                                      <p class="text-[10px] text-zinc-500 mt-0.5">Hangat & Ramah</p>
                                  </div>
                              </div>
                              <div class="absolute top-4 right-4 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100 z-20 shadow-lg">
                                  <i class="fa-solid fa-check text-xs"></i>
                              </div>
                          </label>

                          <!-- Theme 03 -->
                          <label class="cursor-pointer group relative">
                              <input type="radio" v-model="formThemeId" value="theme-03" class="peer sr-only">
                              <div class="rounded-2xl border-2 border-zinc-200 p-2 transition-all peer-checked:border-zinc-900 peer-checked:ring-4 peer-checked:ring-zinc-900/10 hover:border-zinc-300">
                                  <div class="h-40 bg-zinc-950 rounded-xl mb-4 flex flex-col items-center justify-center gap-2 border border-zinc-800 overflow-hidden relative">
                                      <div class="absolute top-0 left-0 w-full h-1 bg-white"></div>
                                      <span class="text-white font-sans font-black text-2xl tracking-tighter uppercase z-10">Modern</span>
                                  </div>
                                  <div class="px-2 pb-2 text-center">
                                      <p class="font-bold text-sm text-zinc-900">Theme 03</p>
                                      <p class="text-[10px] text-zinc-500 mt-0.5">Tegas & Minimalis</p>
                                  </div>
                              </div>
                              <div class="absolute top-4 right-4 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100 z-20 shadow-lg">
                                  <i class="fa-solid fa-check text-xs"></i>
                              </div>
                          </label>

                      </div>
                  </section>
              </div>

          </div>
      </main>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
