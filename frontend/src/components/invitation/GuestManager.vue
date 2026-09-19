<script setup lang="ts">
import { ref } from 'vue';
import type { Invitation, Guest } from '@/types/invitation';
import Button from '@/components/common/Button.vue';

const props = defineProps<{
  invitation: Invitation
}>();

const guests = ref<Guest[]>([]);
const isAdding = ref(false);

const newGuest = ref({
  name: '',
  phoneNumber: ''
});

const handleAddGuest = () => {
  if (!newGuest.value.name) return;
  
  guests.value.push({
    id: Date.now().toString(),
    invitationSubdomain: props.invitation.subdomain,
    name: newGuest.value.name,
    phoneNumber: newGuest.value.phoneNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  newGuest.value = { name: '', phoneNumber: '' };
  isAdding.value = false;
};
</script>

<template>
  <div class="space-y-6">
    
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-bold text-ink">Buku Tamu</h3>
        <p class="text-xs text-ink-muted">Kelola siapa saja yang Anda undang.</p>
      </div>
      <Button variant="outline" size="sm" @click="isAdding = !isAdding">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Tambah
      </Button>
    </div>

    <!-- Add Form -->
    <div v-if="isAdding" class="bg-surface-subtle p-4 rounded-xl border border-border">
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Nama Tamu</label>
          <input type="text" v-model="newGuest.name" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="Budi Santoso">
        </div>
        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">No. WhatsApp (Opsional)</label>
          <input type="tel" v-model="newGuest.phoneNumber" class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface" placeholder="08123456789">
        </div>
        <div class="flex gap-2 pt-2">
          <Button variant="primary" size="sm" class="flex-1" @click="handleAddGuest">Simpan</Button>
          <Button variant="secondary" size="sm" class="flex-1" @click="isAdding = false">Batal</Button>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <div v-if="guests.length === 0" class="text-center py-10 text-ink-muted text-sm px-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-ink-light"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
        Belum ada tamu undangan.
      </div>
      
      <div v-else class="divide-y divide-border">
        <div v-for="guest in guests" :key="guest.id" class="p-3 flex items-center justify-between hover:bg-surface-subtle transition-colors">
          <div>
            <p class="text-sm font-semibold text-ink">{{ guest.name }}</p>
            <p class="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {{ guest.phoneNumber || '-' }}
            </p>
          </div>
          <button class="w-7 h-7 rounded-md text-ink-muted hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>
