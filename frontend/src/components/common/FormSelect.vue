<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface OptionItem {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  options: OptionItem[]
  label?: string
  id?: string
  placeholder?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  size: 'md',
  placeholder: 'Pilih opsi...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const openUpward = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const highlightedIndex = ref<number>(-1)

const selectedOption = computed(() => {
  return props.options.find((opt) => String(opt.value) === String(props.modelValue))
})

const selectedLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : ''
})

function toggleDropdown() {
  if (props.disabled) return
  if (!isOpen.value && triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    openUpward.value = spaceBelow < 220 && rect.top > spaceBelow
    highlightedIndex.value = props.options.findIndex(
      (opt) => String(opt.value) === String(props.modelValue)
    )
  }
  isOpen.value = !isOpen.value
}

function selectOption(opt: OptionItem) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  isOpen.value = false
  triggerRef.value?.focus()
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isOpen.value) {
      toggleDropdown()
    } else {
      highlightedIndex.value = (highlightedIndex.value + 1) % props.options.length
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) {
      toggleDropdown()
    } else {
      highlightedIndex.value =
        highlightedIndex.value <= 0 ? props.options.length - 1 : highlightedIndex.value - 1
    }
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (isOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < props.options.length) {
      const targetOpt = props.options[highlightedIndex.value]
      if (targetOpt && !targetOpt.disabled) {
        selectOption(targetOpt)
      }
    } else {
      toggleDropdown()
    }
  } else if (event.key === 'Escape') {
    if (isOpen.value) {
      event.preventDefault()
      isOpen.value = false
      triggerRef.value?.focus()
    }
  } else if (event.key === 'Tab') {
    if (isOpen.value) {
      isOpen.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative flex flex-col gap-1.5 text-left font-sans">
    <label
      v-if="label"
      :for="id"
      class="text-xs font-semibold text-ink"
      @click="toggleDropdown"
    >
      {{ label }}
      <span v-if="required" class="text-primary">*</span>
    </label>

    <div class="relative">
      <button
        :id="id"
        ref="triggerRef"
        type="button"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-controls="id ? `${id}-listbox` : undefined"
        :disabled="disabled"
        :class="[
          'w-full flex items-center justify-between bg-surface border rounded-lg text-ink font-sans transition-all cursor-pointer select-none text-left',
          size === 'xs'
            ? 'h-7 px-2 text-[11px]'
            : size === 'sm'
              ? 'h-9 px-3 text-xs'
              : 'h-11 px-3.5 text-sm',
          isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : error
              ? 'border-red-600 ring-2 ring-red-100'
              : 'border-border hover:border-stone-400',
          disabled ? 'bg-surface-subtle text-ink-muted cursor-not-allowed border-border' : ''
        ]"
        @click="toggleDropdown"
        @keydown="handleKeyDown"
      >
        <span class="truncate" :class="!selectedLabel ? 'text-ink-muted' : 'text-ink font-medium'">
          {{ selectedLabel || placeholder }}
        </span>

        <svg
          :class="[
            'shrink-0 ml-2 transition-transform duration-200',
            size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4',
            isOpen ? 'rotate-180 text-primary' : 'text-ink-muted'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          :id="id ? `${id}-listbox` : undefined"
          role="listbox"
          :class="[
            'absolute z-50 w-full min-w-[170px] bg-surface border border-border rounded-xl shadow-lg p-1 max-h-60 overflow-y-auto font-sans focus:outline-none',
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          ]"
        >
          <div
            v-for="(opt, index) in options"
            :key="opt.value"
            role="option"
            :aria-selected="String(opt.value) === String(modelValue)"
            :class="[
              'flex items-center justify-between rounded-lg cursor-pointer transition-colors select-none',
              size === 'xs' ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2 text-xs sm:text-sm',
              String(opt.value) === String(modelValue)
                ? 'bg-primary/10 text-primary font-semibold'
                : highlightedIndex === index
                  ? 'bg-surface-subtle text-ink font-medium'
                  : 'text-ink hover:bg-surface-subtle font-medium',
              opt.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            ]"
            @click.stop="selectOption(opt)"
            @mouseenter="highlightedIndex = index"
          >
            <span class="truncate">{{ opt.label }}</span>
            <svg
              v-if="String(opt.value) === String(modelValue)"
              :class="['shrink-0 text-primary ml-2', size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="error" class="text-xs text-red-700 font-medium">
      {{ error }}
    </p>
    <p v-else-if="helper" class="text-xs text-ink-muted">
      {{ helper }}
    </p>
  </div>
</template>
