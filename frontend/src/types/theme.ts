export type ThemeCategory = 'modern' | 'rustic' | 'traditional' | 'luxury';

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  category: ThemeCategory;
  description: string;
  thumbnailUrl: string;
  previewUrl: string;
  isPremium: boolean;
  tags: string[];
  defaultPalette: ThemePalette;
}
