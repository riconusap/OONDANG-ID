<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String as () => 'success' | 'error' | 'info',
    default: 'success'
  }
});
</script>

<template>
  <div
    :class="[
      'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full text-xs shadow-2xl flex items-center gap-2 z-50 w-max max-w-[90%] transition-all duration-300 pointer-events-none',
      show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
    ]"
  >
    <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
    <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    <span>{{ message }}</span>
  </div>
</template>
