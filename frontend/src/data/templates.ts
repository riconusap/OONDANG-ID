import type { ThemeTemplate } from '@/types/theme';

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'rustic-floral',
    name: 'Rustic Floral',
    category: 'rustic',
    description: 'Desain elegan dengan sentuhan bunga rustic yang hangat dan natural. Cocok untuk pernikahan outdoor atau bertema alam.',
    thumbnailUrl: 'https://placehold.co/400x711/4a4036/eae5de?text=Rustic+Floral',
    previewUrl: '/invitation/theme-01', // Using the recently built theme as a preview
    isPremium: false,
    tags: ['floral', 'nature', 'warm'],
    defaultPalette: {
      primary: '#4a4036',
      secondary: '#c0a062',
      accent: '#eae5de'
    }
  },
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    category: 'modern',
    description: 'Bersih, elegan, dan fokus pada tipografi yang indah. Desain minimalis untuk pasangan modern masa kini.',
    thumbnailUrl: 'https://placehold.co/400x711/1f1f1f/ffffff?text=Minimalist+Modern',
    previewUrl: 'https://placehold.co/480x800/1f1f1f/ffffff?text=Preview+Minimalist',
    isPremium: false,
    tags: ['clean', 'simple', 'typography'],
    defaultPalette: {
      primary: '#1f1f1f',
      secondary: '#6b7280',
      accent: '#f3f4f6'
    }
  },
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    category: 'luxury',
    description: 'Kemewahan abadi dengan sentuhan warna emas yang elegan. Sempurna untuk perayaan pernikahan yang megah.',
    thumbnailUrl: 'https://placehold.co/400x711/000000/d4af37?text=Classic+Gold',
    previewUrl: 'https://placehold.co/480x800/000000/d4af37?text=Preview+Gold',
    isPremium: true,
    tags: ['gold', 'elegant', 'royal'],
    defaultPalette: {
      primary: '#000000',
      secondary: '#d4af37',
      accent: '#fdfbf7'
    }
  },
  {
    id: 'traditional-jawa',
    name: 'Adat Jawa Kuno',
    category: 'traditional',
    description: 'Membawa kekayaan budaya Nusantara dengan motif batik klasik dan elemen pewayangan.',
    thumbnailUrl: 'https://placehold.co/400x711/5c3a21/d9c2a7?text=Traditional+Jawa',
    previewUrl: 'https://placehold.co/480x800/5c3a21/d9c2a7?text=Preview+Jawa',
    isPremium: true,
    tags: ['culture', 'batik', 'heritage'],
    defaultPalette: {
      primary: '#5c3a21',
      secondary: '#8b5a2b',
      accent: '#d9c2a7'
    }
  }
];
