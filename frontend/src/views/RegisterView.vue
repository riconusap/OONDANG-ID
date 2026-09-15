<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import FormInput from '@/components/common/FormInput.vue'
import Button from '@/components/common/Button.vue'
import { registerSchema } from '@/schemas/auth'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  const result = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  })

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!errors.value[field]) {
        errors.value[field] = issue.message
      }
    })
    notificationStore.showError(
      result.error.issues.map((i) => i.message).join('\n'),
      'Periksa Kembali Kolom Formulir'
    )
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  const ok = await authStore.register(name.value, email.value, password.value)
  if (ok) {
    notificationStore.showToast('Akun calon pengantin berhasil didaftarkan!', 'Registrasi Berhasil')
    router.push('/onboarding')
  } else {
    notificationStore.showError(
      authStore.error || 'Gagal mendaftarkan akun. Silakan periksa kembali data Anda.',
      'Registrasi Gagal'
    )
  }
}

async function handleGoogleSignIn() {
  const result = await authStore.loginWithGoogle()
  if (result.success) {
    if (result.isFreshAccount) {
      notificationStore.showToast('Pendaftaran akun via Google berhasil! Mari lengkapi persiapan awal Anda.', 'Registrasi Berhasil')
      router.push('/onboarding')
    } else {
      notificationStore.showToast('Akun Anda sudah terdaftar. Mengalihkan ke dashboard...', 'Selamat Datang Kembali')
      router.push('/')
    }
  } else {
    notificationStore.showError(
      authStore.error || 'Gagal mendaftar dengan akun Google.',
      'Registrasi Gagal'
    )
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <router-link to="/" class="inline-flex items-center gap-3 group">
        <img src="/icon.png" alt="oondang.id logo" class="w-10 h-10 object-contain" />
        <span class="font-bold text-2xl tracking-tight text-ink">
          oondang<span class="text-primary">.id</span>
        </span>
      </router-link>
      <h1 class="mt-4 text-2xl font-bold text-ink">
        Mulai Persiapan Hari Bahagia
      </h1>
      <p class="mt-1 text-xs text-ink-muted">
        Daftar akun bersama pasangan untuk mengelola berkas KUA, vendor, dan bujet.
      </p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-surface py-8 px-6 shadow-sm rounded-2xl border border-border sm:px-8">
        <!-- Google Sign-in Button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-subtle transition-colors text-xs font-semibold text-ink shadow-sm cursor-pointer mb-5"
          @click="handleGoogleSignIn"
          :disabled="authStore.isLoading"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Daftar dengan Akun Google
        </button>

        <div class="relative mb-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-surface px-2 text-ink-muted">atau daftar dengan email</span>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <FormInput
            id="reg-name"
            v-model="name"
            label="Nama Lengkap Calon Pengantin"
            placeholder="Dimas Prasetyo"
            :error="errors.name"
            required
          />

          <FormInput
            id="reg-email"
            v-model="email"
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            :error="errors.email"
            required
          />

          <div class="relative">
            <FormInput
              id="reg-password"
              v-model="password"
              label="Kata Sandi (Minimal 8 Karakter)"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :error="errors.password"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-[34px] text-xs text-ink-muted hover:text-ink cursor-pointer p-1"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Sembunyikan' : 'Lihat' }}
            </button>
          </div>

          <FormInput
            id="reg-confirm-password"
            v-model="confirmPassword"
            label="Ulangi Kata Sandi"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :error="errors.confirmPassword"
            required
          />

          <Button
            type="submit"
            variant="primary"
            class="w-full"
            :loading="authStore.isLoading"
          >
            Daftar &amp; Lanjut ke Wizard Acara
          </Button>
        </form>

        <div class="mt-6 text-center text-xs text-ink-muted border-t border-border pt-4">
          Sudah memiliki akun catin?
          <router-link to="/auth/login" class="text-primary font-semibold hover:underline ml-1">
            Masuk di sini
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
