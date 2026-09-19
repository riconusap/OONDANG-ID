const fs = require('fs');
const file = 'src/components/invitation/TextCustomizationForm.vue';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
  "import { useInvitationStore } from '@/stores/useInvitationStore';",
  "import { useInvitationStore } from '@/stores/useInvitationStore';\nimport { useAuthStore } from '@/stores/auth';"
);

// Add authStore instance
content = content.replace(
  "const invitationStore = useInvitationStore();",
  "const invitationStore = useInvitationStore();\nconst authStore = useAuthStore();"
);

// Update watch
const watchStart = content.indexOf("watch(() => props.invitation?.subdomain");
const watchEnd = content.indexOf("}, { immediate: true });") + "}, { immediate: true });".length;

const newWatch = `watch(() => props.invitation?.subdomain, (newSubdomain) => {
  if (newSubdomain && props.invitation) {
    const newInv = props.invitation;
    
    if (newInv.customTexts) {
      formData.value = { ...newInv.customTexts };
    }
    
    // Auto-fill from WeddingProfile if missing
    if (!formData.value.groomName && authStore.profile?.groom_name) {
      formData.value.groomName = authStore.profile.groom_name;
    }
    if (!formData.value.brideName && authStore.profile?.bride_name) {
      formData.value.brideName = authStore.profile.bride_name;
    }
    if (!formData.value.groomFullName && authStore.profile?.groom_name) {
      formData.value.groomFullName = authStore.profile.groom_name.toUpperCase();
    }
    if (!formData.value.brideFullName && authStore.profile?.bride_name) {
      formData.value.brideFullName = authStore.profile.bride_name.toUpperCase();
    }
    if (!formData.value.eventDateStr && authStore.profile?.event_date) {
      const date = new Date(authStore.profile.event_date);
      formData.value.eventDateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (invitationStore.currentInvitation) {
       invitationStore.currentInvitation.customTexts = { ...formData.value };
    }
    
    if (newInv.stories && newInv.stories.length > 0) {
      stories.value = JSON.parse(JSON.stringify(newInv.stories));
    } else {
      const defaultStories = [
        {
            id: '1',
            title: 'Awal Pertemuan',
            date: '',
            text: 'Berawal dari sebuah pertemuan sederhana yang tidak pernah kami sangka sebelumnya, perlahan kami saling mengenal, memahami, dan menemukan kenyamanan satu sama lain. Dari cerita-cerita kecil yang tercipta, tumbuh perasaan yang membawa kami sampai di titik ini.'
        },
        {
            id: '2',
            title: 'Perjalanan Kami',
            date: '',
            text: 'Perjalanan kami mungkin tidak selalu sempurna, tetapi setiap langkahnya menjadi bagian berharga yang menguatkan kami untuk terus bersama. Hingga akhirnya, dengan penuh rasa syukur dan kebahagiaan, kami memutuskan untuk melangkah menuju hari istimewa yang akan menjadi awal dari cerita baru dalam hidup kami.'
        }
      ];
      stories.value = JSON.parse(JSON.stringify(defaultStories));
      if (invitationStore.currentInvitation) {
         invitationStore.currentInvitation.stories = JSON.parse(JSON.stringify(defaultStories));
      }
    }
    
    if (newInv.gifts && newInv.gifts.length > 0) {
      gifts.value = JSON.parse(JSON.stringify(newInv.gifts));
    } else {
      const defaultGifts = [
        {
            id: '1',
            type: 'BANK',
            name: 'BCA',
            accountNumber: '1370410808',
            accountName: 'Deni Nursalam'
        },
        {
            id: '2',
            type: 'BANK',
            name: 'BRI',
            accountNumber: '4119 0102 3150 534',
            accountName: 'Sofiah Ramadhani'
        }
      ];
      gifts.value = JSON.parse(JSON.stringify(defaultGifts));
      if (invitationStore.currentInvitation) {
         invitationStore.currentInvitation.gifts = JSON.parse(JSON.stringify(defaultGifts));
      }
    }
  }
}, { immediate: true });`;

content = content.substring(0, watchStart) + newWatch + content.substring(watchEnd);

fs.writeFileSync(file, content);
console.log('Updated TextCustomizationForm.vue');
