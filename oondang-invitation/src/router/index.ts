import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/invitation/theme-01',
  },
  {
    path: '/invitation/theme-01',
    name: 'invitation-theme-01',
    component: () => import('@/views/invitation/Theme01View.vue'),
  },
  {
    path: '/invitation/theme-02',
    name: 'invitation-theme-02',
    component: () => import('@/views/invitation/Theme02View.vue'),
  },
  {
    path: '/invitation/theme-03',
    name: 'invitation-theme-03',
    component: () => import('@/views/invitation/Theme03View.vue'),
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
