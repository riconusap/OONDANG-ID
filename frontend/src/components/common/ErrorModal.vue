<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import Button from '@/components/common/Button.vue'

const notificationStore = useNotificationStore()

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && notificationStore.errorModal.isOpen) {
    notificationStore.closeError()
  }
}

watch(
  () => notificationStore.errorModal.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="notificationStore.errorModal.isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      role="alertdialog"
      aria-modal="true"
      :aria-label="notificationStore.errorModal.title"
      @click.self="notificationStore.closeError()"
    >
      <div class="relative w-full max-w-md bg-surface border border-red-200 rounded-2xl shadow-xl p-6 text-left">
        <!-- Header with Crimson Icon -->
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-ink leading-snug">
              {{ notificationStore.errorModal.title || 'Terjadi Kendala' }}
            </h3>
            <p class="mt-1 text-xs text-ink-muted leading-relaxed whitespace-pre-line">
              {{ notificationStore.errorModal.message }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="mt-6 pt-4 border-t border-border flex justify-end">
          <Button
            variant="primary"
            size="sm"
            @click="notificationStore.closeError()"
          >
            Saya Mengerti
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
