<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useInvitationStore } from '@/stores/useInvitationStore';

const route = useRoute();
const invitationStore = useInvitationStore();

const isLoading = ref(true);
const isNotFound = ref(false);

const invitation = computed(() => invitationStore.currentInvitation);
const guestName = computed(() => route.query.to ? String(route.query.to) : 'Tamu Undangan');

// Lazy load theme components
const Theme01View = defineAsyncComponent(() => import('@/views/invitation/Theme01View.vue'));
const Theme02View = defineAsyncComponent(() => import('@/views/invitation/Theme02View.vue'));
const Theme03View = defineAsyncComponent(() => import('@/views/invitation/Theme03View.vue'));

const resolvedThemeComponent = computed(() => {
    if (!invitation.value) return null;
    switch (invitation.value.themeId) {
        case 'theme-01': return Theme01View;
        case 'theme-02': return Theme02View;
        case 'theme-03': return Theme03View;
        default: return Theme01View;
    }
});

onMounted(async () => {
    // 1. Extract subdomain
    let subdomain = '';
    
    // For local testing: ?test_subdomain=ricodanocta
    if (route.query.test_subdomain) {
        subdomain = String(route.query.test_subdomain);
    } else {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        // e.g. ricodanocta.oondang.cloud -> parts.length >= 3 -> ricodanocta
        // Handle localhost as well (parts.length === 1)
        if (parts.length >= 3 && parts[0] !== 'www') {
            subdomain = parts[0];
        } else {
            // Fallback for direct local development without subdomain or query param
            subdomain = 'ricodanocta'; 
        }
    }

    // 2. Fetch data from Supabase
    const data = await invitationStore.fetchInvitationBySubdomain(subdomain);
    
    if (!data) {
        isNotFound.value = true;
    } else {
        // Update SEO Meta Tags
        const groom = data.customTexts?.groomName || 'Pria';
        const bride = data.customTexts?.brideName || 'Wanita';
        const title = `The Wedding of ${groom} & ${bride}`;
        const description = `Kami mengundang Anda untuk hadir di acara pernikahan ${groom} dan ${bride}. Buka undangan digital untuk info lengkap.`;
        const image = data.customImages?.cover_bg || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop';
        
        document.title = title;
        
        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        setMeta('title', title);
        setMeta('description', description);
        setMeta('og:title', title, true);
        setMeta('og:description', description, true);
        setMeta('og:image', image, true);
        setMeta('twitter:title', title, true);
        setMeta('twitter:description', description, true);
        setMeta('twitter:image', image, true);
    }
    
    isLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div class="text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
          <p class="font-wedding-sans tracking-widest uppercase text-sm">Memuat Undangan...</p>
      </div>
  </div>
  
  <div v-else-if="isNotFound" class="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div class="text-center px-6">
          <h1 class="text-4xl font-wedding-serif italic mb-4">Oops!</h1>
          <p class="font-wedding-sans text-sm text-zinc-400">Undangan tidak ditemukan atau URL salah.</p>
      </div>
  </div>
  
  <component 
    v-else-if="resolvedThemeComponent" 
    :is="resolvedThemeComponent" 
    :invitation="invitation"
    :guest-name="guestName"
  />
</template>
