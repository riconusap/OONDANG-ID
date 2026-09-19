<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import Button from '@/components/common/Button.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth';
import { useInvitationStore } from '@/stores/useInvitationStore';

const router = useRouter();
const authStore = useAuthStore();
const invitationStore = useInvitationStore();

const isInitialLoad = ref(true);

onMounted(async () => {
  await authStore.waitUntilReady();
  if (authStore.user?.id) {
    await invitationStore.fetchInvitations(authStore.user.id);
  }
  isInitialLoad.value = false;
});

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(isoString));
};

const handleCreateNew = () => {
  router.push('/invitations/themes');
};

const handleEdit = (subdomain: string) => {
  router.push(`/invitations/${subdomain}/customize`);
};
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full space-y-6 text-left font-sans">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border shadow-sm rounded-2xl p-6 sm:p-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink mb-2">Undangan Digital</h1>
          <p class="text-ink-muted text-sm sm:text-base">Kelola undangan digital Anda, pilih tema, dan sesuaikan isinya.</p>
        </div>
        <Button variant="primary" @click="handleCreateNew" class="shrink-0 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Buat Undangan Baru
        </Button>
      </div>

      <!-- Main Content -->
      <div class="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex-1">
        
        <!-- Loading State -->
        <div v-if="isInitialLoad || invitationStore.isLoading" class="flex flex-col items-center justify-center py-20 text-ink-muted">
          <svg class="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p>Memuat daftar undangan...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!invitationStore.hasInvitations" class="flex flex-col items-center justify-center py-24 text-center px-6">
          <div class="w-16 h-16 bg-surface-subtle border border-border rounded-2xl flex items-center justify-center text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5"/><path d="M5.5 5.1L2 12v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-ink mb-2">Belum ada undangan digital</h3>
          <p class="text-ink-muted text-sm max-w-md mx-auto mb-6">Anda belum membuat undangan digital apa pun. Klik tombol di bawah untuk memilih tema dan mulai membuat.</p>
          <Button variant="primary" @click="handleCreateNew">
            Pilih Tema Sekarang
          </Button>
        </div>

        <!-- Table Data -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-subtle border-b border-border">
                <th class="px-6 py-4 text-xs font-bold text-ink-muted uppercase tracking-wider">Subdomain (Tautan)</th>
                <th class="px-6 py-4 text-xs font-bold text-ink-muted uppercase tracking-wider">Tema ID</th>
                <th class="px-6 py-4 text-xs font-bold text-ink-muted uppercase tracking-wider">Tanggal Dibuat</th>
                <th class="px-6 py-4 text-xs font-bold text-ink-muted uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-xs font-bold text-ink-muted uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="inv in invitationStore.invitations" :key="inv.subdomain" class="hover:bg-surface-subtle/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-semibold text-ink">{{ inv.subdomain }}</div>
                  <div class="text-xs text-primary mt-1 hover:underline cursor-pointer">
                    oondang.id/{{ inv.subdomain }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-stone-100 text-ink-muted text-xs font-medium border border-border">
                    {{ inv.themeId }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-ink-muted">
                  {{ formatDate(inv.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <StatusBadge variant="success" size="sm">Aktif</StatusBadge>
                </td>
                <td class="px-6 py-4 text-right">
                  <Button variant="secondary" size="sm" @click="handleEdit(inv.subdomain)">
                    Kustomisasi
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  </AppLayout>
</template>
