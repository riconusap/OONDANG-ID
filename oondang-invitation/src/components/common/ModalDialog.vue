<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'md',
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
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
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div
        :class="[
          'relative w-full bg-surface border border-border rounded-xl shadow-lg p-6 text-left max-h-[90vh] overflow-y-auto',
          maxWidth === 'sm' ? 'max-w-sm' : '',
          maxWidth === 'md' ? 'max-w-md' : '',
          maxWidth === 'lg' ? 'max-w-lg' : '',
          maxWidth === 'xl' ? 'max-w-xl' : '',
        ]"
      >
        <!-- Header -->
        <div class="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <h2 class="text-lg font-bold text-ink">
              {{ title }}
            </h2>
            <p v-if="description" class="mt-1 text-xs text-ink-muted">
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors tap-target"
            @click="emit('close')"
            aria-label="Tutup dialog"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body Content -->
        <div class="py-4">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="pt-4 border-t border-border flex justify-end gap-3">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
