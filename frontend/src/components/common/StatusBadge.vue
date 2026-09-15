<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'locked'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
})

const badgeClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-sage-light text-sage border-sage/30'
    case 'warning':
      return 'bg-amber-light text-amber border-amber/30'
    case 'info':
      return 'bg-stone-100 text-stone-800 border-stone-300'
    case 'locked':
      return 'bg-stone-200 text-stone-700 border-stone-300'
    case 'neutral':
    default:
      return 'bg-surface-subtle text-ink-muted border-border'
  }
})

const sizeClasses = computed(() => {
  return props.size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs font-medium'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-md border',
      badgeClasses,
      sizeClasses,
    ]"
  >
    <slot />
  </span>
</template>
