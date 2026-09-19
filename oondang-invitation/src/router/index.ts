import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/invitation/DynamicInvitationView.vue'),
  },
  {
    path: '/invitation/:theme',
    name: 'invitation-preview',
    component: () => import('@/views/invitation/DynamicInvitationView.vue'),
  },
  {
    path: '/admin/:subdomain',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
