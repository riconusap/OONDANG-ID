import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import RequirementsView from '@/views/RequirementsView.vue'
import VendorsView from '@/views/VendorsView.vue'
import FinancesView from '@/views/FinancesView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    alias: '/dashboard',
  },
  {
    path: '/auth/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/auth/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    alias: '/wedding-profile',
  },
  {
    path: '/requirements',
    name: 'requirements',
    component: RequirementsView,
  },
  {
    path: '/vendors',
    name: 'vendors',
    component: VendorsView,
  },
  {
    path: '/finances',
    name: 'finances',
    component: FinancesView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
