<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  id?: string
  type?: string
  placeholder?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 text-left">
    <label
      v-if="label"
      :for="id"
      class="text-xs font-semibold text-ink"
    >
      {{ label }}
      <span v-if="required" class="text-primary">*</span>
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full h-11 px-3.5 text-sm bg-surface border rounded-lg text-ink font-sans transition-colors tap-target',
        'placeholder:text-ink-light',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:border-primary',
        'disabled:bg-stone-100 disabled:cursor-not-allowed',
        error ? 'border-red-600 focus-visible:outline-red-600' : 'border-border hover:border-stone-400',
      ]"
      @input="handleInput"
    />

    <p v-if="error" class="text-xs text-red-700 font-medium">
      {{ error }}
    </p>
    <p v-else-if="helper" class="text-xs text-ink-muted">
      {{ helper }}
    </p>
  </div>
</template>
