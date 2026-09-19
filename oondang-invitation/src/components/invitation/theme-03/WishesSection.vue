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

const wishesTitle = computed(() => props.invitation?.customTexts?.wishesTitle || 'RSVP & WISHES');
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
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHrs < 24) return `${diffHrs} hrs ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
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
  <section class="py-24 px-8 bg-zinc-950 text-white border-t border-white/10">
      <div 
        ref="targetContainer"
        :class="[
            'transition-all duration-1000 ease-out will-change-[opacity,transform]',
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
          <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-8 bg-zinc-600"></div>
              <p class="font-sans tracking-[0.2em] uppercase text-[10px] text-zinc-500">Guestbook</p>
          </div>
          <h2 class="text-4xl font-black uppercase tracking-tight mb-12">{{ wishesTitle }}</h2>

          <!-- RSVP Stats -->
          <div class="flex justify-start gap-6 mb-12 border-b border-white/10 pb-8">
              <div>
                  <p class="font-black text-3xl text-white">{{ stats.hadir }}</p>
                  <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Attending</p>
              </div>
              <div class="h-10 w-px bg-white/10"></div>
              <div>
                  <p class="font-black text-3xl text-zinc-600">{{ stats.tidakHadir }}</p>
                  <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Declined</p>
              </div>
          </div>

          <!-- Form Input (Underline Style) -->
          <form @submit.prevent="submitWish" class="space-y-8 mb-16">
              <div class="relative">
                  <input v-model="form.name" type="text" placeholder="Name" required class="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white text-sm transition-colors text-white placeholder:text-zinc-600" />
              </div>
              
              <div class="relative">
                  <select v-model="form.attendance" required class="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white text-sm transition-colors text-zinc-400 appearance-none">
                      <option value="" disabled selected class="bg-zinc-900">Attendance</option>
                      <option value="Hadir" class="bg-zinc-900">Will Attend</option>
                      <option value="Tidak Hadir" class="bg-zinc-900">Regretfully Decline</option>
                      <option value="Masih Ragu" class="bg-zinc-900">Maybe</option>
                  </select>
                  <!-- Custom arrow for select -->
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                      <i class="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
              </div>

              <div class="relative">
                  <textarea v-model="form.message" placeholder="Leave a message..." required rows="3" class="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white text-sm transition-colors text-white placeholder:text-zinc-600 resize-none"></textarea>
              </div>
              
              <button type="submit" :disabled="isSubmitting" :class="['w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border', isSubmitting ? 'border-zinc-700 text-zinc-500 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-black']">
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>
          </form>

          <!-- Comments List (Terminal/Clean Style) -->
          <div class="h-96 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              <div v-for="comment in comments" :key="comment.id" class="animate-fade-in border-l border-white/10 pl-4 py-1 relative">
                  <div class="absolute w-2 h-2 bg-white/20 -left-[4.5px] top-2"></div>
                  <div class="flex justify-between items-start mb-2">
                      <p class="font-bold text-sm text-white uppercase tracking-wider">{{ comment.name }}</p>
                      <p class="text-[9px] text-zinc-500 tracking-widest uppercase">{{ comment.time }}</p>
                  </div>
                  <p class="text-xs text-zinc-400 leading-relaxed mb-3">{{ comment.message }}</p>
                  <p v-if="comment.attendance" class="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                      <i class="fa-solid fa-check mr-1" v-if="comment.attendance === 'Hadir'"></i>
                      {{ comment.attendance }}
                  </p>
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

.custom-scrollbar::-webkit-scrollbar {
    width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}
</style>
