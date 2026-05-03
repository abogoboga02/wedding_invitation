# Developer Guide - Royal Moments Template

## 📖 Dokumentasi Teknis Lengkap

Template Royal Moments adalah solusi undangan pernikahan luxury yang terintegrasi penuh dengan sistem Supabase. Panduan ini menjelaskan implementasi, integrasi, dan customization.

---

## 🏗️ Struktur Arsitektur

```
wedding_invitation/
├── features/
│   └── invitation/
│       └── templates/
│           ├── royal-moments/
│           │   ├── RoyalMomentsTemplate.tsx     ← Main component
│           │   ├── config.ts                     ← Theme & config
│           │   └── README.md                     ← User guide
│           ├── shared/
│           │   └── TemplateBlocks.tsx            ← Reusable blocks
│           ├── registry.ts                       ← Template registry
│           ├── template-slugs.ts                 ← Slug definitions
│           └── types.ts                          ← Type definitions
├── app/
│   └── (public)/
│       └── royal-moments-preview/
│           └── page.tsx                          ← Preview page
└── lib/
    └── domain/
        └── types.ts                              ← Domain types
```

---

## 🗂️ File-File Kunci

### 1. **RoyalMomentsTemplate.tsx** (Komponen Utama)
- **Lokasi**: `features/invitation/templates/royal-moments/RoyalMomentsTemplate.tsx`
- **Ukuran**: ~320 lines
- **Fungsi**: Render seluruh template dengan semua sections
- **Props**:
  ```tsx
  interface TemplateComponentProps {
    invitation: SharedInvitationTemplateData
    rsvpSlot?: React.ReactNode
    previewMode?: boolean
  }
  ```

### 2. **config.ts** (Konfigurasi)
- **Lokasi**: `features/invitation/templates/royal-moments/config.ts`
- **Ukuran**: ~325 lines
- **Exports**:
  - `ROYAL_MOMENTS_DEFAULT_CONFIG` - Default config
  - `ROYAL_MOMENTS_TAILWIND_THEME` - Tailwind classes
  - `ROYAL_MOMENTS_SUPABASE_QUERIES` - SQL queries

### 3. **page.tsx** (Preview Page)
- **Lokasi**: `app/(public)/royal-moments-preview/page.tsx`
- **Fungsi**: Demo & testing page
- **Features**: Guest name input, sample data

---

## 🎨 Color System

Palet warna yang digunakan untuk template luxury brown/gold:

| Role | Hex | RGB | Tailwind Class |
|------|-----|-----|---|
| Primary | `#d4a574` | `212, 165, 116` | `text-[#d4a574]` |
| Primary Light | `#e8d7c6` | `232, 215, 198` | `text-[#e8d7c6]` |
| Background | `#1a1410` | `26, 20, 16` | `bg-[#1a1410]` |
| Border | `#8b6f47` | `139, 111, 71` | `border-[#8b6f47]` |
| Text | `#c9b8a8` | `201, 184, 168` | `text-[#c9b8a8]` |
| Border Dark | `#6b4e1f` | `107, 78, 31` | `border-[#6b4e1f]` |

---

## 🔌 Integrasi Supabase

### Data Schema

```sql
-- Table: invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  coupleSlug TEXT UNIQUE,
  templateSlug TEXT DEFAULT 'royal-moments',
  sections JSONB, -- Contains all invitation sections
  status TEXT DEFAULT 'DRAFT',
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Table: rsvp_entries
CREATE TABLE rsvp_entries (
  id UUID PRIMARY KEY,
  invitationId UUID REFERENCES invitations(id),
  guestName TEXT,
  message TEXT,
  createdAt TIMESTAMP
);

-- Table: invitation_gallery_items
CREATE TABLE invitation_gallery_items (
  id UUID PRIMARY KEY,
  invitationId UUID REFERENCES invitations(id),
  imageUrl TEXT,
  altText TEXT,
  displayOrder INT
);
```

### Fetch Data Pattern

```typescript
// Contoh: Fetch invitation dari Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getInvitation(coupleSlug: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('coupleSlug', coupleSlug)
    .eq('templateSlug', 'royal-moments')
    .single()

  if (error) throw error
  return data
}
```

---

## 📱 Responsive Design

Template menggunakan Tailwind CSS grid system dengan breakpoints:

```typescript
// Mobile First (default)
// Base styles untuk semua screen sizes

// Tablet (768px+)
md: { ... }

// Desktop (1024px+)
lg: { ... }

// XL Desktop (1280px+)
xl: { ... }
```

### Grid Layouts

```tsx
// 1 column mobile, 2+ columns desktop
<div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
  {/* Content */}
</div>

// Gallery: 1 column mobile, 2 columns desktop
<div className="grid gap-4 sm:grid-cols-2">
  {/* Gallery items */}
</div>
```

---

## 🎬 Video Integration

### Supported Formats

- ✅ MP4 (video/mp4) - Recommended
- ✅ WebM (video/webm) - Modern browsers
- ✅ Ogg (video/ogg) - Legacy support

### Implementation

```tsx
{coverPersonal.video && (
  <video controls className="w-full">
    <source 
      src={coverPersonal.video.url} 
      type={coverPersonal.video.mimeType} 
    />
    Browser Anda belum mendukung video player.
  </video>
)}
```

### Video Upload to Supabase Storage

```typescript
import { createClient } from '@supabase/supabase-js'

async function uploadVideo(file: File, coupleSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const fileName = `${coupleSlug}/video-${Date.now()}.mp4`

  const { data, error } = await supabase.storage
    .from('invitation-media')
    .upload(fileName, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('invitation-media')
    .getPublicUrl(data.path)

  return publicUrl
}
```

---

## ⏳ Countdown Timer Implementation

### Hook: `useCountdown`

```typescript
import { useState, useEffect } from 'react'

interface CountdownParts {
  days: number
  hours: number
  minutes: number
}

export function useCountdown(targetDate: Date): CountdownParts | null {
  const [countdown, setCountdown] = useState<CountdownParts | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference / (1000 * 60 * 60)) % 24
          ),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        })
      }
    }, 60000) // Update setiap menit

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}
```

---

## 📋 RSVP Form Integration

### RSVPForm Component Pattern

```tsx
'use client'

import { useState } from 'react'

export function RSVPForm({ invitationId, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    guestName: '',
    rsvpStatus: 'ATTENDING',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({
        invitationId,
        ...formData,
      }),
    })

    if (response.ok) {
      onSubmit?.()
      setFormData({ guestName: '', rsvpStatus: 'ATTENDING', message: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### API Endpoint: `/api/rsvp`

```typescript
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { invitationId, guestName, rsvpStatus, message } =
    await request.json()

  const { data, error } = await supabase
    .from('rsvp_entries')
    .insert({
      invitationId,
      guestName,
      rsvpStatus,
      message,
      createdAt: new Date(),
    })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json(data)
}
```

---

## 🎵 Music Player Setup

### Supported Formats

- ✅ MP3 (audio/mpeg) - Recommended
- ✅ WAV (audio/wav)
- ✅ OGG (audio/ogg)
- ✅ M4A (audio/mp4)

### Implementation

```tsx
<audio controls className="w-full" preload="none">
  <source 
    src={coverPersonal.music.url} 
    type={coverPersonal.music.mimeType ?? 'audio/mpeg'} 
  />
  Browser Anda belum mendukung audio player.
</audio>
```

---

## 🖼️ Gallery Optimization

### Image Loading Strategy

```tsx
import Image from 'next/image'

export function GalleryGrid({ items, couple }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((image, index) => (
        <div key={image.id} className="relative aspect-[4/5]">
          <Image
            src={image.imageUrl}
            alt={image.altText || `Photo ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={80}
            priority={index < 2} // Priority untuk 2 foto pertama
            className="object-cover rounded-[1.7rem]"
          />
        </div>
      ))}
    </div>
  )
}
```

---

## 🔑 Environment Variables

Required env vars untuk template:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: CDN untuk media (jika tidak menggunakan Supabase Storage)
NEXT_PUBLIC_MEDIA_CDN_URL=https://cdn.example.com
```

---

## 🧪 Testing & Preview

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Visit preview page
# http://localhost:3000/royal-moments-preview
```

### Testing Checklist

- [ ] Hero section renders dengan benar
- [ ] Countdown timer berjalan
- [ ] Video player responsive
- [ ] RSVP form berfungsi
- [ ] Gallery images load
- [ ] Audio player works
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Push to GitHub
git add .
git commit -m "feat: Add Royal Moments template"
git push

# Deploy via Vercel CLI
vercel deploy --prod
```

### Production Checklist

- [ ] Environment variables set di Vercel
- [ ] Supabase Database seeded dengan data
- [ ] CDN configured untuk media
- [ ] SSL Certificate aktif
- [ ] SEO metadata updated
- [ ] Performance optimized (Core Web Vitals)
- [ ] Monitoring configured

---

## 🔧 Customization Guide

### 1. Mengubah Warna

Edit di `config.ts`:

```typescript
export const ROYAL_MOMENTS_DEFAULT_CONFIG = {
  theme: {
    primary: '#your-color', // Change primary color
    // ... other colors
  },
}
```

### 2. Mengubah Font

Edit di `RoyalMomentsTemplate.tsx`:

```tsx
<h1 className="font-serif text-6xl">
  {heroCouple.partnerOneName}
</h1>
```

### 3. Menambah Section Baru

1. Define data structure di `config.ts`
2. Buat component block di `TemplateBlocks.tsx`
3. Import dan render di `RoyalMomentsTemplate.tsx`

---

## 🐛 Troubleshooting

### Issue: Video tidak playback

**Solusi:**
- Check CORS headers di server
- Verify video format didukung browser
- Test dengan format MP4

### Issue: Images tidak load

**Solusi:**
- Verify Supabase Storage URL publik
- Check CDN cache
- Validate image URLs

### Issue: Countdown tidak update

**Solusi:**
- Check timezone setting
- Verify target date format
- Check browser console

---

## 📚 Referensi & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📞 Support & Contributing

Untuk issue atau improvements:
1. Check existing issues di repository
2. Create detailed bug report
3. Submit pull request dengan improvements

---

**Last Updated**: May 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
