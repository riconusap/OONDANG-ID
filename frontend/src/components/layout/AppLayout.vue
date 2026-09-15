<script setup lang="ts">
import Navbar from '@/components/common/Navbar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import MobileBottomNav from '@/components/common/MobileBottomNav.vue'
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink flex flex-col font-sans">
    <!-- Top Header -->
    <Navbar />

    <!-- Main Workspace: Sidebar menempel ke sisi kiri layar -->
    <div class="flex-1 flex w-full">
      <!-- Desktop Sidebar -->
      <Sidebar />

      <!-- Page Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 min-w-0">
        <div class="max-w-5xl mx-auto w-full">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />
  </div>
</template>
