import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
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
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('ownerId', userId);
        
      if (fetchError) throw fetchError;
      
      const results: Invitation[] = [];
      if (data) {
        data.forEach((row: any) => {
          results.push({
            subdomain: row.id,
            ownerId: row.ownerId,
            themeId: row.themeId,
            weddingProfileId: row.weddingProfileId,
            customTexts: row.customTexts || {},
            customImages: row.customImages || {},
            stories: row.stories || [],
            gifts: row.gifts || [],
            galleryUrls: row.galleryUrls || [],
            createdAt: row.createdAt || new Date().toISOString(),
            updatedAt: row.updatedAt || new Date().toISOString()
          });
        });
      }
      
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
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (data) {
        const inv: Invitation = {
          subdomain: data.id,
          ownerId: data.ownerId,
          themeId: data.themeId,
          weddingProfileId: data.weddingProfileId,
          customTexts: data.customTexts || {},
          customImages: data.customImages || {},
          stories: data.stories || [],
          gifts: data.gifts || [],
          galleryUrls: data.galleryUrls || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        currentInvitation.value = inv;
        return inv;
      }
      
      // Fallback to dummy data if not found
      return loadDummyData(subdomain);
    } catch (err: any) {
      console.error("Error fetching invitation, using dummy data fallback:", err);
      return loadDummyData(subdomain);
    } finally {
      isLoading.value = false;
    }
  };

  const loadDummyData = (subdomain: string): Invitation => {
    const dummy: Invitation = {
      subdomain,
      ownerId: 'dummy-owner',
      themeId: 'theme-01',
      weddingProfileId: 'dummy-profile',
      customTexts: {
        groomName: 'Deni',
        groomFullName: 'DENI NURSALAM',
        brideName: 'Sofiah',
        brideFullName: 'SOFIAH RAMADHANI',
        heroQuote: "A great marriage is not when the 'perfect couple' comes together. It is when an 'imperfect couple' learns to enjoy their differences",
        heroQuoteAuthor: "- Dave Meurer -",
        wishesTitle: 'Guestbook',
        wishesSubtitle: "Berikan doa dan ucapan terbaik untuk kami"
      },
      customImages: {
        cover_bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop',
        hero_bg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop',
        groom_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
        bride_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
      },
      stories: [
        { id: '1', title: 'Pertama Bertemu', date: 'Januari 2020', text: 'Pertemuan pertama kami di sebuah kafe kecil di sudut kota.' },
        { id: '2', title: 'Lamaran', date: 'Desember 2023', text: 'Hari di mana kami memutuskan untuk melangkah ke jenjang yang lebih serius.' }
      ],
      gifts: [
        { id: '1', type: 'BANK', name: 'BCA', accountNumber: '1234567890', accountName: 'Deni Nursalam' },
        { id: '2', type: 'BANK', name: 'Mandiri', accountNumber: '0987654321', accountName: 'Sofiah Ramadhani' }
      ] as any,
      galleryUrls: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    currentInvitation.value = dummy;
    return dummy;
  };

  // Cek apakah subdomain tersedia (belum digunakan)
  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('id')
        .eq('subdomain', subdomain)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      return !data; // true if not exists (available)
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

      const { error: insertError } = await supabase
        .from('invitations')
        .insert({
          id: payload.subdomain,
          subdomain: payload.subdomain,
          ownerId: payload.ownerId,
          themeId: payload.themeId,
          weddingProfileId: payload.weddingProfileId,
          customTexts: {
            coverSubtitle: "The Wedding of",
            groomName: "DENI",
            groomFullName: "DENI NURSALAM",
            groomParents: "Putra Kedua dari\nBapak Eket & Ibu Herni Daningsih",
            groomInstagram: "Deninursalamm",
            brideName: "SOFIAH",
            brideFullName: "SOFIAH RAMADHANI",
            brideParents: "Putri Pertama dari\nBapak Deni & Ibu Eneng Eni",
            brideInstagram: "Sofiahramadhaniii_",
            eventDateStr: "Sabtu, 13 Juni 2026",
            eventDateRaw: "2026-06-13T08:00:00",
            heroQuote: "A great marriage is not when the 'perfect couple' comes together. It is when an 'imperfect couple' learns to enjoy their differences",
            heroQuoteAuthor: "- Dave Meurer -",
            profileIntroQuote: "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:",
            akadTitle: "Akad Nikah",
            akadTime: "08:00 - 10:00 WIB",
            akadAddressTitle: "KUA Kecamatan Setempat",
            akadAddressDetails: "Jl. Pernikahan No. 123, Kota Bahagia, Provinsi Sejahtera 40123",
            akadMapUrl: "https://maps.google.com",
            resepsiTitle: "Resepsi",
            resepsiTime: "11:00 - Selesai",
            resepsiAddressTitle: "Gedung Serbaguna",
            resepsiAddressDetails: "Jl. Kebahagiaan No. 456, Kota Bahagia, Provinsi Sejahtera 40123",
            resepsiMapUrl: "https://maps.google.com",
            galleryTitle: "Our Gallery",
            gallerySubtitle: "Momen bahagia yang kami abadikan",
            loveStoryTitle: "Our Love Story",
            loveStorySubtitle: "Perjalanan cinta kami berdua",
            giftTitle: 'Wedding Gift',
            giftSubtitle: "Doa Restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.",
            wishesTitle: 'Guestbook',
            wishesSubtitle: "Berikan doa dan ucapan terbaik untuk kami"
          },
          customImages: {
            cover_bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop',
            hero_bg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop',
            groom_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
            bride_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
            gallery_1: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
            gallery_2: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop',
            gallery_3: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop'
          },
          stories: [
            { id: '1', title: 'Pertama Bertemu', date: 'Januari 2020', text: 'Pertemuan pertama kami di sebuah kafe kecil di sudut kota.' },
            { id: '2', title: 'Lamaran', date: 'Desember 2023', text: 'Hari di mana kami memutuskan untuk melangkah ke jenjang yang lebih serius.' }
          ],
          gifts: [
            { id: '1', type: 'BANK', name: 'BCA', accountNumber: '1234567890', accountName: 'Deni Nursalam' },
            { id: '2', type: 'BANK', name: 'Mandiri', accountNumber: '0987654321', accountName: 'Sofiah Ramadhani' }
          ],
          galleryUrls: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

      if (insertError) throw insertError;

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
      const updatePayload: any = { updatedAt: new Date().toISOString() };
      if (data.customTexts) updatePayload.customTexts = data.customTexts;
      if (data.customImages) updatePayload.customImages = data.customImages;
      if (data.galleryUrls) updatePayload.galleryUrls = data.galleryUrls;
      if (data.stories) updatePayload.stories = data.stories;
      if (data.gifts) updatePayload.gifts = data.gifts;
      if (data.musicUrl !== undefined) updatePayload.musicUrl = data.musicUrl;
      
      const { error: updateError } = await supabase
        .from('invitations')
        .update(updatePayload)
        .eq('subdomain', subdomain);
        
      if (updateError) throw updateError;
      
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

  const uploadMedia = async (file: File, subdomain: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${subdomain}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invitations-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('invitations-media')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.error("Error uploading media:", err);
      return null;
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
    uploadMedia,
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
