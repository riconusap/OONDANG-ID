import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invitation, Guest } from '@/types/invitation';

export const useInvitationStore = defineStore('invitation', () => {
  const invitations = ref<Invitation[]>([]);
  const currentInvitation = ref<Invitation | null>(null);
  const currentGuests = ref<Guest[]>([]);
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasInvitations = computed(() => invitations.value.length > 0);

  // Actions
  
  // Ambil daftar undangan milik user
  const fetchInvitations = async (userId: string) => {
    if (!userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const q = query(collection(db, 'invitations'), where('ownerId', '==', userId));
      const querySnap = await getDocs(q);
      
      const results: Invitation[] = [];
      querySnap.forEach((doc) => {
        const data = doc.data();
        results.push({
          subdomain: doc.id,
          ownerId: data.ownerId,
          themeId: data.themeId,
          weddingProfileId: data.weddingProfileId,
          customTexts: data.customTexts || {},
          customImages: data.customImages || {},
          stories: data.stories || [],
          gifts: data.gifts || [],
          galleryUrls: data.galleryUrls || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      invitations.value = results;
    } catch (err: any) {
      console.error("Error fetching invitations:", err);
      error.value = err.message || "Gagal memuat daftar undangan.";
    } finally {
      isLoading.value = false;
    }
  };

  // Ambil detail satu undangan berdasarkan subdomain
  const fetchInvitationBySubdomain = async (subdomain: string) => {
    if (!subdomain) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'invitations', subdomain);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const inv: Invitation = {
          subdomain: docSnap.id,
          ownerId: data.ownerId,
          themeId: data.themeId,
          weddingProfileId: data.weddingProfileId,
          customTexts: data.customTexts || {},
          customImages: data.customImages || {},
          stories: data.stories || [],
          gifts: data.gifts || [],
          galleryUrls: data.galleryUrls || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        currentInvitation.value = inv;
        return inv;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching invitation:", err);
      error.value = err.message || "Gagal memuat detail undangan.";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Cek apakah subdomain tersedia (belum digunakan)
  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'invitations', subdomain);
      const docSnap = await getDoc(docRef);
      return !docSnap.exists(); // true if not exists (available)
    } catch (err) {
      console.error("Error checking subdomain:", err);
      return false; // Anggap tidak tersedia jika error
    }
  };

  // Buat undangan baru
  const createInvitation = async (payload: {
    subdomain: string;
    ownerId: string;
    themeId: string;
    weddingProfileId: string;
  }): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Validasi subdomain
      const isAvailable = await checkSubdomainAvailability(payload.subdomain);
      if (!isAvailable) {
        throw new Error("Subdomain sudah digunakan. Silakan pilih yang lain.");
      }

      const docRef = doc(db, 'invitations', payload.subdomain);
      await setDoc(docRef, {
        ownerId: payload.ownerId,
        themeId: payload.themeId,
        weddingProfileId: payload.weddingProfileId,
        customTexts: {},
        customImages: {},
        stories: [],
        gifts: [],
        galleryUrls: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update local state
      await fetchInvitations(payload.ownerId);
      return true;
    } catch (err: any) {
      console.error("Error creating invitation:", err);
      error.value = err.message || "Gagal membuat undangan digital.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Update kustomisasi teks dan galeri
  const updateCustomization = async (subdomain: string, data: { customTexts?: Record<string, string>; customImages?: Record<string, string>; galleryUrls?: string[]; stories?: any[]; gifts?: any[]; musicUrl?: string }): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'invitations', subdomain);
      
      const updatePayload: any = { updatedAt: serverTimestamp() };
      if (data.customTexts) updatePayload.customTexts = data.customTexts;
      if (data.customImages) updatePayload.customImages = data.customImages;
      if (data.galleryUrls) updatePayload.galleryUrls = data.galleryUrls;
      if (data.stories) updatePayload.stories = data.stories;
      if (data.gifts) updatePayload.gifts = data.gifts;
      if (data.musicUrl !== undefined) updatePayload.musicUrl = data.musicUrl;
      
      await updateDoc(docRef, updatePayload);
      
      // Update local state
      if (currentInvitation.value && currentInvitation.value.subdomain === subdomain) {
        if (data.customTexts) currentInvitation.value.customTexts = data.customTexts;
        if (data.customImages) currentInvitation.value.customImages = data.customImages;
        if (data.galleryUrls) currentInvitation.value.galleryUrls = data.galleryUrls;
        if (data.stories) currentInvitation.value.stories = data.stories;
        if (data.gifts) currentInvitation.value.gifts = data.gifts;
        if (data.musicUrl !== undefined) currentInvitation.value.musicUrl = data.musicUrl;
      }
      
      return true;
    } catch (err: any) {
      console.error("Error updating customization:", err);
      error.value = err.message || "Gagal menyimpan kustomisasi.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const updateLocalMusicUrl = (url: string) => {
    if (currentInvitation.value) {
      currentInvitation.value.musicUrl = url;
    }
  };

  const updateLocalCustomText = (key: string, value: string) => {
    if (currentInvitation.value) {
      if (!currentInvitation.value.customTexts) {
        currentInvitation.value.customTexts = {};
      }
      currentInvitation.value.customTexts[key] = value;
    }
  };

  const updateLocalCustomImage = (key: string, url: string) => {
    if (currentInvitation.value) {
      if (!currentInvitation.value.customImages) {
        currentInvitation.value.customImages = {};
      }
      currentInvitation.value.customImages[key] = url;
    }
  };

  const addLocalStory = (story: any) => {
    if (currentInvitation.value) {
      if (!currentInvitation.value.stories) currentInvitation.value.stories = [];
      currentInvitation.value.stories.push(story);
    }
  };

  const updateLocalStory = (index: number, story: any) => {
    if (currentInvitation.value && currentInvitation.value.stories) {
      currentInvitation.value.stories[index] = story;
    }
  };

  const removeLocalStory = (index: number) => {
    if (currentInvitation.value && currentInvitation.value.stories) {
      currentInvitation.value.stories.splice(index, 1);
    }
  };

  const addLocalGift = (gift: any) => {
    if (currentInvitation.value) {
      if (!currentInvitation.value.gifts) currentInvitation.value.gifts = [];
      currentInvitation.value.gifts.push(gift);
    }
  };

  const updateLocalGift = (index: number, gift: any) => {
    if (currentInvitation.value && currentInvitation.value.gifts) {
      currentInvitation.value.gifts[index] = gift;
    }
  };

  const removeLocalGift = (index: number) => {
    if (currentInvitation.value && currentInvitation.value.gifts) {
      currentInvitation.value.gifts.splice(index, 1);
    }
  };

  return {
    invitations,
    currentInvitation,
    currentGuests,
    isLoading,
    error,
    hasInvitations,
    fetchInvitations,
    fetchInvitationBySubdomain,
    checkSubdomainAvailability,
    createInvitation,
    updateCustomization,
    updateLocalCustomText,
    updateLocalCustomImage,
    updateLocalMusicUrl,
    addLocalStory,
    updateLocalStory,
    removeLocalStory,
    addLocalGift,
    updateLocalGift,
    removeLocalGift
  };
});
