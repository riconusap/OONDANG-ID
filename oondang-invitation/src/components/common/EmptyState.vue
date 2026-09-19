<script setup lang="ts">
import Button from './Button.vue'

interface Props {
  title: string
  description: string
  actionLabel?: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center bg-surface-subtle/50 rounded-xl border border-dashed border-border my-4">
    <div v-if="$slots.icon" class="p-3 mb-3 bg-surface rounded-full border border-border text-ink-muted">
      <slot name="icon" />
    </div>

    <h3 class="text-base font-semibold text-ink">
      {{ title }}
    </h3>

    <p class="mt-1 text-sm text-ink-muted max-w-sm">
      {{ description }}
    </p>

    <div v-if="actionLabel" class="mt-5">
      <Button variant="primary" size="sm" @click="emit('action')">
        {{ actionLabel }}
      </Button>
    </div>
  </div>
</template>
