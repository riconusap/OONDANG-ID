<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  helperText?: string
  trend?: string
}

defineProps<Props>()
</script>

<template>
  <div class="p-5 bg-surface rounded-xl border border-border transition-shadow hover:border-stone-400/50">
    <div class="flex items-center justify-between gap-3">
      <span class="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {{ title }}
      </span>
      <div v-if="$slots.icon" class="text-ink-muted">
        <slot name="icon" />
      </div>
    </div>

    <div class="mt-3 text-2xl font-bold text-ink">
      {{ value }}
    </div>

    <div v-if="helperText || trend" class="mt-2 text-xs text-ink-muted flex items-center gap-1.5">
      <span v-if="trend" class="font-medium text-sage">{{ trend }}</span>
      <span v-if="helperText">{{ helperText }}</span>
    </div>
  </div>
</template>
