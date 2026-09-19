<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';
import { supabase } from '@/lib/supabase';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetContainer = ref<HTMLElement | null>(null);
const { isIntersecting } = useIntersectionObserver(targetContainer);

const emit = defineEmits(['wishSubmitted']);

const wishesTitle = computed(() => props.invitation?.customTexts?.wishesTitle || 'Wishes');
const wishesSubtitle = computed(() => props.invitation?.customTexts?.wishesSubtitle || "Ucapan Selamat & Do'a");
const currentSubdomain = computed(() => props.invitation?.subdomain || 'preview');

const form = ref({
    name: '',
    message: '',
    attendance: ''
});

interface Comment {
    id: string;
    initials: string;
    name: string;
    message: string;
    attendance: string;
    time: string;
    createdAt?: any;
}

const comments = ref<Comment[]>([]);

const stats = computed(() => {
    let hadir = 0;
    let tidakHadir = 0;
    let ragu = 0;
    
    comments.value.forEach(c => {
        if (c.attendance === 'Hadir') hadir++;
        else if (c.attendance === 'Tidak Hadir') tidakHadir++;
        else if (c.attendance === 'Masih Ragu') ragu++;
    });
    
    return { hadir, tidakHadir, ragu };
});

const isSubmitting = ref(false);
let subscription: any = null;

const formatTime = (dateStr: any) => {
    if (!dateStr) return 'Baru saja';
    
    const jsDate = new Date(dateStr);
    
    const now = new Date();
    const diffMs = now.getTime() - jsDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHrs / 24);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHrs < 24) return `${diffHrs} jam yang lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return jsDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fetchInitialWishes = async () => {
    try {
        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('subdomain', currentSubdomain.value)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        
        if (data) {
            comments.value = data.map((d: any) => ({
                id: d.id,
                initials: d.name ? d.name.substring(0, 2).toUpperCase() : 'U',
                name: d.name,
                message: d.message,
                attendance: d.attendance,
                createdAt: d.createdAt,
                time: formatTime(d.createdAt)
            }));
        }
    } catch (error) {
        console.error("Error fetching initial wishes:", error);
    }
};

onMounted(() => {
    fetchInitialWishes();

    subscription = supabase
        .channel('public:wishes')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'wishes',
            filter: `subdomain=eq.${currentSubdomain.value}`
        }, (payload) => {
            const newWish = payload.new;
            comments.value.unshift({
                id: newWish.id,
                initials: newWish.name ? newWish.name.substring(0, 2).toUpperCase() : 'U',
                name: newWish.name,
                message: newWish.message,
                attendance: newWish.attendance,
                createdAt: newWish.createdAt,
                time: formatTime(newWish.createdAt)
            });
        })
        .subscribe();
});

onUnmounted(() => {
    if (subscription) {
        supabase.removeChannel(subscription);
    }
});

const submitWish = async () => {
    if (!form.value.name || !form.value.message || !form.value.attendance || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        const { error } = await supabase
            .from('wishes')
            .insert({
                subdomain: currentSubdomain.value,
                name: form.value.name,
                message: form.value.message,
                attendance: form.value.attendance,
                createdAt: new Date().toISOString()
            });

        if (error) throw error;

        form.value.name = '';
        form.value.message = '';
        form.value.attendance = '';

        emit('wishSubmitted', "Terima kasih atas ucapan dan doanya!");
    } catch (error) {
        console.error("Error submitting wish:", error);
        alert("Gagal mengirim ucapan. Silakan coba lagi.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
  <section class="py-20 px-6 bg-[#f7f5f2] text-wedding-dark">
      <div 
        ref="targetContainer"
        :class="[
            'transition-all duration-800 ease-out will-change-[opacity,transform]',
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <h2 class="text-4xl font-wedding-serif italic text-center mb-2">{{ wishesTitle }}</h2>
          <p class="text-center text-xs text-zinc-500 mb-10">{{ wishesSubtitle }}</p>

          <!-- RSVP Stats -->
          <div class="flex justify-center gap-4 mb-8">
              <div class="bg-green-600 text-white p-3 rounded-lg text-center w-20 shadow-md">
                  <p class="font-bold text-lg">{{ stats.hadir }}</p>
                  <p class="text-[10px]">Hadir</p>
              </div>
              <div class="bg-red-600 text-white p-3 rounded-lg text-center w-20 shadow-md">
                  <p class="font-bold text-lg">{{ stats.tidakHadir }}</p>
                  <p class="text-[10px]">Tidak Hadir</p>
              </div>
              <div class="bg-yellow-500 text-white p-3 rounded-lg text-center w-20 shadow-md">
                  <p class="font-bold text-lg">{{ stats.ragu }}</p>
                  <p class="text-[10px]">Masih Ragu</p>
              </div>
          </div>

          <!-- Form Input -->
          <form @submit.prevent="submitWish" class="space-y-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <input v-model="form.name" type="text" placeholder="Nama Anda" required class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-wedding-brown text-sm" />
              <textarea v-model="form.message" placeholder="Berikan Ucapan & Doa" required rows="4" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-wedding-brown text-sm"></textarea>
              <select v-model="form.attendance" required class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-wedding-brown text-sm text-zinc-600">
                  <option value="" disabled selected>Konfirmasi Kehadiran</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                  <option value="Masih Ragu">Masih Ragu</option>
              </select>
              <button type="submit" :disabled="isSubmitting" :class="['w-full py-3 text-white rounded-lg font-bold text-sm transition shadow-md', isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-wedding-brown hover:bg-zinc-800']">
                  {{ isSubmitting ? 'Mengirim...' : 'Kirim Ucapan' }}
              </button>
          </form>

          <!-- Comments List -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 h-80 overflow-y-auto space-y-6">
              <p class="font-bold text-sm border-b pb-2 mb-4 text-zinc-800">{{ comments.length }} Comments</p>
              
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3 animate-fade-in">
                  <div class="w-8 h-8 rounded-full bg-wedding-beige flex items-center justify-center text-wedding-brown font-bold text-xs shrink-0">{{ comment.initials }}</div>
                  <div>
                      <p class="font-bold text-sm flex items-center gap-1">
                          {{ comment.name }} 
                          <i v-if="comment.attendance === 'Hadir'" class="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                      </p>
                      <p class="text-xs text-zinc-600 mt-1">{{ comment.message }}</p>
                      <p v-if="comment.attendance" class="text-[10px] bg-zinc-100 inline-block px-2 py-0.5 rounded-full mt-2">{{ comment.attendance }}</p>
                      <p class="text-[10px] text-zinc-400 mt-2"><i class="fa-regular fa-clock"></i> {{ comment.time }}</p>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
