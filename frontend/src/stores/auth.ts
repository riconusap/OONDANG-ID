import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/apiClient'
import type { User, WeddingProfile } from '@/types'
import {
  auth,
  db,
  signInWithGoogle as fbSignInWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  logoutUser as fbLogoutUser,
  onAuthStateChanged,
  type User as FirebaseUser
} from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { seedRequirements } from '@/services/requirementService'
import { seedDefaultLockedVendor } from '@/services/vendorService'
import { getSystemRecommendations } from '@/services/onboardingRecommendations'

let resolveAuthReady: () => void
const authReadyPromise = new Promise<void>((resolve) => {
  resolveAuthReady = resolve
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<WeddingProfile | null>(null)
  const token = ref<string | null>(localStorage.getItem('oondang_token'))
  const isLoading = ref(false)
  const isAuthReady = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value || user.value))
  const hasCompletedOnboarding = computed(() => Boolean(profile.value && profile.value.groom_name && profile.value.bride_name))

  async function waitUntilReady(): Promise<void> {
    if (isAuthReady.value) return
    await authReadyPromise
  }

  // Helper untuk mapping error Firebase ke pesan bahasa Indonesia yang ramah
  function formatFirebaseError(err: any): string {
    const code = err?.code || ''
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Email atau kata sandi tidak cocok. Silakan periksa kembali.'
    }
    if (code === 'auth/email-already-in-use') {
      return 'Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.'
    }
    if (code === 'auth/weak-password') {
      return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.'
    }
    if (code === 'auth/invalid-email') {
      return 'Format alamat email tidak valid.'
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Jendela masuk Google ditutup sebelum proses selesai.'
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Domain aplikasi belum diizinkan di konfigurasi Firebase Auth.'
    }
    if (code === 'auth/network-request-failed') {
      return 'Koneksi jaringan terganggu. Silakan periksa koneksi internet Anda.'
    }
    return err?.message || 'Terjadi kendala pada otentikasi. Silakan coba lagi.'
  }

  // Sinkronisasi profil pengguna dengan koleksi Firestore users
  async function syncFirestoreUser(fbUser: FirebaseUser, displayName?: string): Promise<{ user: User; isNewUser: boolean }> {
    const userDocRef = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(userDocRef)
    const isFirstTime = !snap.exists()

    const userData: User = {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Calon Pengantin',
      created_at: new Date().toISOString()
    }

    if (isFirstTime) {
      await setDoc(userDocRef, {
        id: fbUser.uid,
        email: userData.email,
        name: userData.name,
        photoUrl: fbUser.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
        updatedAt: serverTimestamp()
      })
    } else {
      const currentLoginCount = (snap.data()?.loginCount as number | undefined) || 1
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: currentLoginCount + 1,
        updatedAt: serverTimestamp()
      }, { merge: true })
    }

    return { user: userData, isNewUser: isFirstTime }
  }

  // Ambil profil pernikahan dari Firestore
  async function fetchWeddingProfileForUser(userId: string): Promise<void> {
    try {
      const q = query(collection(db, 'weddingProfiles'), where('ownerId', '==', userId))
      const querySnap = await getDocs(q)
      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0]
        const data = docSnap.data()
        profile.value = {
          id: docSnap.id,
          user_id: userId,
          groom_name: data.groom_name || data.groomName || '',
          bride_name: data.bride_name || data.brideName || '',
          event_date: data.event_date || data.eventDate || '',
          wedding_type: data.wedding_type || data.weddingType || 'muslim',
          location_city: data.location_city || data.locationCity || null,
          target_budget: Number(data.targetBudget || data.target_budget) || 150000000,
          created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      }
    } catch (err) {
      console.warn('Gagal memuat profil pernikahan dari Firestore, menggunakan local fallback', err)
    }
  }

  // Inisialisasi listener auth state Firebase
  let initialAuthProcessed = false

  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const tokenString = await fbUser.getIdToken()
        token.value = tokenString
        localStorage.setItem('oondang_token', tokenString)
        const syncResult = await syncFirestoreUser(fbUser)
        user.value = syncResult.user
        await fetchWeddingProfileForUser(fbUser.uid)
      } catch (e) {
        console.error('Error saat sinkronisasi user Firebase:', e)
      }
    } else {
      // Periksa apakah ada token mock pengguna demo di penyimpanan lokal
      const storedToken = localStorage.getItem('oondang_token')
      if (storedToken === 'mock-jwt-token-wedding-catin') {
        try {
          const res = await api.get<{ user: User; profile: WeddingProfile | null }>('/auth/me')
          user.value = res.data.user
          profile.value = res.data.profile
        } catch (e) {
          console.warn('Gagal memuat data user lokal:', e)
        }
      } else {
        user.value = null
        profile.value = null
      }
    }
    isAuthReady.value = true
    if (!initialAuthProcessed) {
      initialAuthProcessed = true
      resolveAuthReady()
    }
  })

  // 1. Login dengan Email & Password
  async function login(emailVal: string, passwordVal: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const fbUser = await fbLoginWithEmail(emailVal, passwordVal)
      const tokenString = await fbUser.getIdToken()
      const syncResult = await syncFirestoreUser(fbUser)
      user.value = syncResult.user
      token.value = tokenString
      localStorage.setItem('oondang_token', tokenString)
      await fetchWeddingProfileForUser(fbUser.uid)
      return true
    } catch (err: any) {
      // Fallback ke mock jika akun demo dimas.anissa@example.com digunakan
      if (emailVal === 'dimas.anissa@example.com') {
        try {
          const res = await api.post<{ user: User; token: string }>('/auth/login', { email: emailVal, password: passwordVal })
          user.value = res.data.user
          token.value = res.data.token
          localStorage.setItem('oondang_token', res.data.token)
          await fetchCurrentUser()
          return true
        } catch (mockErr: any) {
          error.value = mockErr?.message || 'Login gagal.'
          return false
        }
      }
      error.value = formatFirebaseError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 2. Login dengan Google Sign-In
  async function loginWithGoogle(): Promise<{ success: boolean; isFreshAccount: boolean }> {
    isLoading.value = true
    error.value = null
    try {
      const { user: fbUser, isNewUser: isNewAuthUser } = await fbSignInWithGoogle()
      const tokenString = await fbUser.getIdToken()
      const { user: syncedUser, isNewUser: isNewFirestoreUser } = await syncFirestoreUser(fbUser)
      user.value = syncedUser
      token.value = tokenString
      localStorage.setItem('oondang_token', tokenString)
      await fetchWeddingProfileForUser(fbUser.uid)

      // Akun fresh jika baru dibuat di Firebase Auth atau baru pertama kali tercatat di Firestore
      const isFreshAccount = isNewAuthUser || isNewFirestoreUser
      return { success: true, isFreshAccount }
    } catch (err: any) {
      error.value = formatFirebaseError(err)
      return { success: false, isFreshAccount: false }
    } finally {
      isLoading.value = false
    }
  }

  // 3. Registrasi Akun Baru dengan Email & Password
  async function register(nameVal: string, emailVal: string, passwordVal: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const fbUser = await fbRegisterWithEmail(emailVal, passwordVal)
      const tokenString = await fbUser.getIdToken()
      const syncResult = await syncFirestoreUser(fbUser, nameVal)
      user.value = syncResult.user
      token.value = tokenString
      localStorage.setItem('oondang_token', tokenString)
      return true
    } catch (err: any) {
      error.value = formatFirebaseError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (auth.currentUser) {
      const syncResult = await syncFirestoreUser(auth.currentUser)
      user.value = syncResult.user
      await fetchWeddingProfileForUser(auth.currentUser.uid)
      return
    }
    if (!token.value) return
    try {
      const res = await api.get<{ user: User; profile: WeddingProfile | null }>('/auth/me')
      user.value = res.data.user
      profile.value = res.data.profile
    } catch (err) {
      console.error('Failed to fetch user data', err)
    }
  }

  async function saveWeddingProfile(payload: {
    groom_name: string
    bride_name: string
    event_date: string
    wedding_type: 'muslim' | 'non_muslim'
    location_city?: string
  }): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      // Simpan ke Firestore jika user terautentikasi Firebase
      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        const profileDocRef = doc(collection(db, 'weddingProfiles'))
        await setDoc(profileDocRef, {
          id: profileDocRef.id,
          ownerId: uid,
          groomName: payload.groom_name,
          brideName: payload.bride_name,
          eventDate: payload.event_date,
          weddingType: payload.wedding_type,
          locationCity: payload.location_city || null,
          targetBudget: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        profile.value = {
          id: profileDocRef.id,
          user_id: uid,
          groom_name: payload.groom_name,
          bride_name: payload.bride_name,
          event_date: payload.event_date,
          wedding_type: payload.wedding_type,
          location_city: payload.location_city || null,
          created_at: new Date().toISOString()
        }
        return true
      }

      const res = await api.post<WeddingProfile>('/wedding-profile', payload)
      profile.value = res.data
      return true
    } catch (err: any) {
      error.value = err?.message || 'Gagal menyimpan profil pernikahan.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function completeOnboardingSetup(payload: {
    groom_name: string
    bride_name: string
    event_date: string
    wedding_type: 'muslim' | 'non_muslim'
    location_city: string
    initial_budget: number
    selected_recommendation_ids: string[]
    custom_items?: import('@/types').OnboardingRecommendationItem[]
  }): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        const q = query(collection(db, 'weddingProfiles'), where('ownerId', '==', uid))
        const querySnap = await getDocs(q)
        const profileDocRef = !querySnap.empty ? querySnap.docs[0].ref : doc(collection(db, 'weddingProfiles'))

        await setDoc(
          profileDocRef,
          {
            id: profileDocRef.id,
            ownerId: uid,
            groomName: payload.groom_name,
            brideName: payload.bride_name,
            eventDate: payload.event_date,
            weddingType: payload.wedding_type,
            locationCity: payload.location_city,
            targetBudget: Number(payload.initial_budget) || 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        )

        // Seeding berkas persyaratan terpilih ke subkoleksi requirements
        const selectedIds = new Set(payload.selected_recommendation_ids || [])
        const allRecs = getSystemRecommendations(payload.wedding_type, payload.event_date)
        const customItems = payload.custom_items || []
        const combinedRecs = [...allRecs, ...customItems]
        const selectedReqs = combinedRecs.filter(
          (r) =>
            (r.category === 'legal' || r.id.startsWith('custom-') || r.isCustom) &&
            selectedIds.has(r.id)
        )

        const reqItemsToSeed = selectedReqs.map((r) => ({
          title: r.title,
          category: (r.id.startsWith('custom-') || r.isCustom)
            ? ('custom' as const)
            : payload.wedding_type === 'non_muslim'
              ? ('civil_registry' as const)
              : ('kua' as const),
          notes: r.description,
          dueDate: r.targetDeadline || null,
          isDefault: !(r.id.startsWith('custom-') || r.isCustom)
        }))

        if (reqItemsToSeed.length > 0) {
          await seedRequirements(profileDocRef.id, reqItemsToSeed)
        }

        // Seeding vendor bawaan terkunci oondang.id
        await seedDefaultLockedVendor(profileDocRef.id)

        profile.value = {
          id: profileDocRef.id,
          user_id: uid,
          groom_name: payload.groom_name,
          bride_name: payload.bride_name,
          event_date: payload.event_date,
          wedding_type: payload.wedding_type,
          location_city: payload.location_city,
          target_budget: Number(payload.initial_budget) || 150000000,
          created_at: new Date().toISOString()
        }

        try {
          await api.post<WeddingProfile>('/onboarding/setup', payload)
        } catch (_) {}

        return true
      }

      const res = await api.post<WeddingProfile>('/onboarding/setup', payload)
      profile.value = res.data
      return true
    } catch (err: any) {
      error.value = err?.message || 'Gagal menyelesaikan persiapan onboarding.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await fbLogoutUser()
    } catch (e) {
      console.warn('Firebase logout error:', e)
    }
    user.value = null
    profile.value = null
    token.value = null
    localStorage.removeItem('oondang_token')
  }

  return {
    user,
    profile,
    token,
    isLoading,
    isAuthReady,
    error,
    isAuthenticated,
    hasCompletedOnboarding,
    waitUntilReady,
    login,
    loginWithGoogle,
    register,
    fetchCurrentUser,
    saveWeddingProfile,
    completeOnboardingSetup,
    logout,
  }
})
