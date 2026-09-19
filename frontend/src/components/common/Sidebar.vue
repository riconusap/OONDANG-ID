<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

interface NavMenuItem {
  label: string
  to: string
  iconName: string
  badge?: string
}

const menuItems: NavMenuItem[] = [
  {
    label: 'Ringkasan Utama',
    to: '/',
    iconName: 'dashboard',
  },
  {
    label: 'Ceklist Dokumen KUA',
    to: '/requirements',
    iconName: 'requirements',
  },
  {
    label: 'Manajemen Vendor',
    to: '/vendors',
    iconName: 'vendors',
  },
  {
    label: 'Pelacak Keuangan',
    to: '/finances',
    iconName: 'finances',
  },
  {
    label: 'Undangan Digital',
    to: '/invitations',
    iconName: 'themes',
  },
  {
    label: 'Profil Acara',
    to: '/profile',
    iconName: 'settings',
  },
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 justify-between">
    <div>


      <div class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-light">
        Modul Pernikahan
      </div>

      <nav class="mt-2 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors tap-target',
            'focus-visible:outline-2 focus-visible:outline-primary',
            isActive(item.to)
              ? 'bg-primary-light text-primary font-semibold'
              : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
          ]"
        >
          <!-- Custom SVGs based on module context (antislop R-04) -->
          <svg v-if="item.iconName === 'dashboard'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <svg v-else-if="item.iconName === 'requirements'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="item.iconName === 'vendors'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <svg v-else-if="item.iconName === 'finances'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="item.iconName === 'themes'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="20" height="16" x="2" y="4" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="item.iconName === 'settings'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>

          <span class="truncate">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>
