<script setup lang="ts">
interface Props {
  modelValue: boolean
  label: string
  id?: string
  description?: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle(current: boolean, disabled?: boolean) {
  if (!disabled) {
    emit('update:modelValue', !current)
  }
}
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none tap-target',
      modelValue ? 'bg-sage-light/30 border-sage/40' : 'bg-surface border-border hover:border-stone-400',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    @click="toggle(modelValue, disabled)"
  >
    <div class="flex items-center h-6">
      <input
        :id="id"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="w-5 h-5 rounded text-sage border-border focus:ring-sage focus:ring-offset-2 cursor-pointer"
        @click.stop
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
    </div>
    <div class="text-sm">
      <label :for="id" class="font-medium text-ink cursor-pointer">
        {{ label }}
      </label>
      <p v-if="description" class="text-xs text-ink-muted mt-0.5">
        {{ description }}
      </p>
    </div>
  </div>
</template>
