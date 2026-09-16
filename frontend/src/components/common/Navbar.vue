<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)


function handleLogout() {
  isMenuOpen.value = false
  authStore.logout()
  router.push('/auth/login')
}

function handleGoProfile() {
  isMenuOpen.value = false
  router.push('/profile')
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

onMounted(async () => {
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeyDown)
  if (!authStore.user) {
    await authStore.fetchCurrentUser()
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <header class="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
    <!-- Brand / Breadcrumb Area -->
    <div class="flex items-center gap-3">
      <router-link to="/" class="flex items-center group" aria-label="oondang.id">
        <img
          src="/logo-text.png"
          alt="OONDANG - All-in-One Wedding Organizer"
          class="h-9 sm:h-10 w-auto object-contain mix-blend-multiply transition-opacity group-hover:opacity-85"
        />
      </router-link>
    </div>

    <!-- Right Actions / Profile Menu -->
    <div ref="menuRef" class="relative flex items-center gap-3">
      <!-- Profile Button / Trigger Dropdown -->
      <button
        type="button"
        class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-stone-200/60 border border-border text-xs transition-colors cursor-pointer tap-target focus-visible:outline-2 focus-visible:outline-primary"
        @click="isMenuOpen = !isMenuOpen"
        :aria-expanded="isMenuOpen"
        aria-label="Menu Akun & Profil Acara"
      >
        <!-- Blank Profile Avatar -->
        <div class="w-7 h-7 rounded-full bg-surface text-ink-muted flex items-center justify-center border border-border shrink-0 shadow-2xs">
          <svg class="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="hidden sm:block text-left">
          <p class="font-semibold text-ink leading-tight truncate max-w-[140px]">
            <template v-if="!authStore.isAuthReady">
              <span class="inline-block h-3 w-20 bg-stone-200 rounded animate-pulse"></span>
            </template>
            <template v-else>
              {{ authStore.user?.name || (authStore.profile?.groom_name ? `${authStore.profile.groom_name} & ${authStore.profile.bride_name}` : 'Pengguna Baru') }}
            </template>
          </p>
          <p class="text-[10px] text-ink-muted leading-tight">
            <template v-if="!authStore.isAuthReady">
              <span class="inline-block h-2.5 w-16 bg-stone-200 rounded animate-pulse mt-0.5"></span>
            </template>
            <template v-else>
              {{ authStore.profile?.location_city || 'Belum diatur' }}
            </template>
          </p>
        </div>
        <svg
          :class="['w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ml-1', isMenuOpen ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="isMenuOpen"
        class="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
      >
        <div class="px-4 py-2.5 border-b border-border text-left">
          <p class="text-xs font-semibold text-ink">
            {{ authStore.user?.name || (authStore.profile?.groom_name ? `${authStore.profile.groom_name} & ${authStore.profile.bride_name}` : 'Pengguna Baru') }}
          </p>
          <p class="text-[11px] text-ink-muted truncate mt-0.5">
            {{ authStore.user?.email || 'Belum ada email' }}
          </p>
          <span v-if="authStore.profile?.event_date" class="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-medium">
            Target: {{ authStore.profile.event_date }}
          </span>
        </div>

        <div class="py-1">
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-xs font-medium text-ink hover:bg-surface-subtle transition-colors flex items-center gap-2.5 cursor-pointer tap-target"
            @click="handleGoProfile"
          >
            <svg class="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Pengaturan Profil Acara</span>
          </button>

          <router-link
            to="/requirements"
            class="w-full px-4 py-2 text-left text-xs font-medium text-ink hover:bg-surface-subtle transition-colors flex items-center gap-2.5 cursor-pointer tap-target"
            @click="isMenuOpen = false"
          >
            <svg class="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ceklist Berkas Pernikahan</span>
          </router-link>
        </div>

        <div class="pt-1 border-t border-border">
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer tap-target"
            @click="handleLogout"
          >
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
