export interface LoveStory {
  id: string;
  title: string;
  date: string;
  text: string;
}

export interface GiftChannel {
  id: string;
  type: 'BANK' | 'E-WALLET' | 'KIRIM_BARANG';
  name: string; // Bank name, E-wallet name, or empty for physical
  accountNumber: string; // Account number, Phone number, or Address
  accountName: string; // Receiver name
}

export interface Invitation {
  subdomain: string;
  ownerId: string;
  themeId: string;
  weddingProfileId: string;
  customTexts: Record<string, string>;
  customImages?: Record<string, string>;
  musicUrl?: string;
  stories?: LoveStory[];
  gifts?: GiftChannel[];
  galleryUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  invitationSubdomain: string;
  name: string;
  phoneNumber: string;
  whatsappLink?: string;
  isAttending?: boolean | null;
  guestCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationThemeConfig {
  greeting: string;
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  loveStory: string;
  closingMessage: string;
  [key: string]: string; // For flexibility
}
