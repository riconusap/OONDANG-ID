import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { THEME_TEMPLATES } from '@/data/templates';
import type { ThemeTemplate, ThemeCategory } from '@/types/theme';

export const useThemeStore = defineStore('theme', () => {
  const templates = ref<ThemeTemplate[]>(THEME_TEMPLATES);
  const selectedThemeId = ref<string | null>(null);
  const previewTheme = ref<ThemeTemplate | null>(null);
  
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const getThemesByCategory = computed(() => {
    return (category: ThemeCategory | 'all') => {
      if (category === 'all') return templates.value;
      return templates.value.filter(t => t.category === category);
    };
  });

  const getThemeById = computed(() => {
    return (id: string) => templates.value.find(t => t.id === id) || null;
  });

  // Actions
  const selectTheme = (themeId: string) => {
    selectedThemeId.value = themeId;
  };

  const setPreviewTheme = (theme: ThemeTemplate | null) => {
    previewTheme.value = theme;
  };

  const fetchUserTheme = async (profileId: string) => {
    if (!profileId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'weddingProfiles', profileId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.selectedThemeId) {
          selectedThemeId.value = data.selectedThemeId;
        }
      }
    } catch (err: any) {
      console.error("Error fetching user theme:", err);
      error.value = err.message || "Failed to fetch theme.";
    } finally {
      isLoading.value = false;
    }
  };

  const saveThemeSelection = async (profileId: string) => {
    if (!profileId || !selectedThemeId.value) return;
    
    isLoading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'weddingProfiles', profileId);
      await updateDoc(docRef, {
        selectedThemeId: selectedThemeId.value,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err: any) {
      console.error("Error saving theme:", err);
      error.value = err.message || "Failed to save theme selection.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    templates,
    selectedThemeId,
    previewTheme,
    isLoading,
    error,
    getThemesByCategory,
    getThemeById,
    selectTheme,
    setPreviewTheme,
    fetchUserTheme,
    saveThemeSelection
  };
});
