<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const bottomNavItems = [
  { label: 'Ringkasan', to: '/', icon: 'dashboard' },
  { label: 'Dokumen', to: '/requirements', icon: 'requirements' },
  { label: 'Vendor', to: '/vendors', icon: 'vendors' },
  { label: 'Keuangan', to: '/finances', icon: 'finances' },
  { label: 'Profil', to: '/profile', icon: 'profile' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-1 py-1 flex items-center justify-around">
    <router-link
      v-for="item in bottomNavItems"
      :key="item.to"
      :to="item.to"
      :class="[
        'flex flex-col items-center justify-center py-1 px-2 min-h-[48px] min-w-[44px] rounded-lg text-[10px] font-medium transition-colors tap-target',
        isActive(item.to)
          ? 'text-primary font-semibold'
          : 'text-ink-muted hover:text-ink'
      ]"
    >
      <svg v-if="item.icon === 'dashboard'" class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <svg v-else-if="item.icon === 'requirements'" class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="item.icon === 'vendors'" class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <svg v-else-if="item.icon === 'finances'" class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="item.icon === 'profile'" class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>
