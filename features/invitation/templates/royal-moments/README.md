# Royal Moments Wedding Invitation Template

Template TypeScript untuk undangan pernikahan dengan desain luxury brown/gold yang elegan, menampilkan semua fitur yang diminta.

## Fitur

✨ **Countdown Timer** - Hitung mundur otomatis ke hari pernikahan  
📸 **Luxury Gallery** - Galeri foto dengan grid responsif  
🎬 **Video Section** - Tampilan video storytelling  
📝 **RSVP Form** - Formulir konfirmasi kehadiran terintegrasi  
🎵 **Music Player** - Audio background untuk undangan  
💝 **Gift Registry** - Tempat informasi hadiah pernikahan  
📍 **Event Details** - Informasi waktu dan lokasi acara  
💌 **Guest Book** - Daftar ucapan dari tamu  

## Struktur File

```
features/invitation/templates/
├── royal-moments/
│   └── RoyalMomentsTemplate.tsx    # Komponen template utama
├── shared/
│   └── TemplateBlocks.tsx          # Komponen-komponen reusable
├── registry.ts                      # Registrasi template
└── template-slugs.ts               # Definisi slug template
```

## Warna & Desain

**Color Palette:**
- Primary: `#d4a574` (Gold)
- Secondary: `#e8d7c6` (Light Beige)
- Background: `#1a1410` (Dark Brown)
- Border: `#8b6f47` (Medium Brown)
- Text: `#c9b8a8` (Muted Beige)

**Typography:**
- Headings: Font Serif (font-serif)
- Body: Light weight untuk elegance
- Monogram: 24px bold

## Integrasi Supabase

Template menggunakan data dari Supabase dengan struktur:

```typescript
// invitation.sections
{
  coverPersonal: {
    image: { url: string, altText?: string }
    video: { url: string, mimeType: string }  // NEW - Video support
    eyebrow: string
    title: string
    guestName: string
    music?: { url: string, originalName?: string }
  }
  heroCouple: {
    partnerOneName: string
    partnerTwoName: string
    displayName: string
    summary: string
  }
  countdown: { startsAt: Date, label: string }
  quote: { title: string, text: string, source?: string }
  profiles: {
    title: string
    intro: string
    partnerOne: { fullName: string, nickname?: string, parentLine?: string, bio: string }
    partnerTwo: { fullName: string, nickname?: string, parentLine?: string, bio: string }
  }
  eventDetails: {
    title: string
    intro: string
    events: Array<{
      id: string
      label: string
      startsAt: Date
      venueName: string
      address: string
      googleMapsUrl?: string
      mapsUrl?: string
      timeLabel?: string
    }>
  }
  gallery: {
    title: string
    intro: string
    items: Array<{ id: string, imageUrl: string, altText?: string }>
  }
  loveStory: {
    title: string
    narrative: string
    moments: Array<{ id: string, title: string, narrative: string }>
  }
  weddingGift: {
    title: string
    intro: string
    enabled: boolean
    entries: Array<{
      type: string
      label: string
      accountName: string
      accountNumber: string
      note?: string
    }>
  }
  rsvp: {
    title: string
    intro: string
    enabled: boolean
    wishEnabled: boolean
    wishes: Array<{ id: string, guestName: string, message: string, createdAt: Date }>
  }
  closing: { title: string, note: string }
}
```

## Komponen Utama

### RoyalMomentsTemplate
Komponen root yang menampilkan semua bagian:
- Hero section dengan monogram, nama pasangan
- Countdown timer
- Quote & Music player
- Couple profiles
- Event details
- Photo gallery & love story
- **Video section** (fitur baru)
- Wedding gift & RSVP form
- Closing section

### Fitur Responsif
- Mobile-first design dengan Tailwind CSS
- Grid layout yang adaptif (mobile, tablet, desktop)
- Gambar dengan Next.js Image component (optimized)
- Video player dengan controls

## Props

```typescript
interface TemplateComponentProps {
  invitation: SharedInvitationTemplateData
  rsvpSlot?: React.ReactNode
  previewMode?: boolean
}
```

## Cara Menggunakan

```tsx
import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments/RoyalMomentsTemplate'

<RoyalMomentsTemplate 
  invitation={invitationData}
  rsvpSlot={<RsvpFormComponent />}
  previewMode={false}
/>
```

## Registrasi Template

Template sudah terdaftar di:
- `template-slugs.ts` → `ROYAL_MOMENTS: "royal-moments"`
- `registry.ts` → Ditambahkan ke registry
- `lib/domain/types.ts` → Tipe `InvitationTemplate` diupdate

## Video Support

Template mendukung video dengan:
```tsx
{coverPersonal.video && (
  <video controls className="w-full">
    <source src={coverPersonal.video.url} type={coverPersonal.video.mimeType} />
  </video>
)}
```

## Customization

Edit warna di object `theme`:
```typescript
const theme = {
  shell: "bg-[#1a1410] text-[#e8d7c6]",
  surface: "border border-[#8b6f47] bg-[rgba(20,18,15,0.85)]",
  card: "border border-[#8b6f47] bg-[rgba(28,25,20,0.9)]",
  accent: "text-[#d4a574]",
  muted: "text-[#c9b8a8]/75",
}
```

## Browser Support

✅ Modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile browsers dengan responsive design  
⚠️ Video support tergantung format codec browser

## Performance

- Next.js Image Optimization untuk gallery
- Lazy loading untuk video
- Backdrop blur effects dengan CSS
- Rounded corners dan shadows untuk depth

---

*Template ini dirancang khusus untuk pengalaman pernikahan yang elegan dan memorable. Setiap detail dirancang untuk memberikan kesan luxury dan sophistication.*
