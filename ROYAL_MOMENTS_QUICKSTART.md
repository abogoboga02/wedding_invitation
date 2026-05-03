# 🚀 Royal Moments - Quick Start Guide

## 5 Menit Setup

Panduan cepat untuk mulai menggunakan Royal Moments Template.

---

## 1️⃣ Verify Files Created

```bash
# Check if all files exist
ls -la features/invitation/templates/royal-moments/
# Should show:
# - RoyalMomentsTemplate.tsx
# - config.ts
# - README.md
# - DEVELOPER_GUIDE.md
```

---

## 2️⃣ Check Template Registration

Template sudah terdaftar di sistem:

```typescript
// ✅ In lib/domain/types.ts
export const INVITATION_TEMPLATES = [
  "ELEGANT_LUXURY",
  "KOREAN_SOFT",
  "MODERN_MINIMAL",
  "ROYAL_MOMENTS"  // ← ADDED
]

// ✅ In features/invitation/templates/template-slugs.ts
export const templateSlugMap = {
  ELEGANT_LUXURY: "elegant-luxury",
  KOREAN_SOFT: "korean-soft",
  MODERN_MINIMAL: "modern-minimal",
  ROYAL_MOMENTS: "royal-moments"  // ← ADDED
}

// ✅ In features/invitation/templates/registry.ts
export const templateRegistry = [
  { id: "ELEGANT_LUXURY", ... },
  { id: "KOREAN_SOFT", ... },
  { id: "MODERN_MINIMAL", ... },
  { id: "ROYAL_MOMENTS", ... }  // ← ADDED
]
```

---

## 3️⃣ View Preview

```bash
npm run dev
# Open browser: http://localhost:3000/royal-moments-preview
```

**Features di Preview:**
- ✅ Full template rendering
- ✅ Guest name input
- ✅ Sample data dengan countdown
- ✅ Video player demo
- ✅ RSVP section
- ✅ All sections responsive

---

## 4️⃣ How to Use in Your Code

### Import Template
```typescript
import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments/RoyalMomentsTemplate'
```

### Use in a Page
```tsx
'use client'

import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments/RoyalMomentsTemplate'
import type { SharedInvitationTemplateData } from '@/features/invitation/templates/contract'

interface Props {
  data: SharedInvitationTemplateData
  rsvpSlot?: React.ReactNode
}

export default function InvitationPage({ data, rsvpSlot }: Props) {
  return (
    <div className="bg-[#1a1410] min-h-screen p-4">
      <RoyalMomentsTemplate 
        invitation={data}
        rsvpSlot={rsvpSlot}
        previewMode={false}
      />
    </div>
  )
}
```

### Fetch Data from Supabase
```typescript
import { createClient } from '@supabase/supabase-js'
import { buildSharedInvitationTemplateData } from '@/features/invitation/templates/contract'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getInvitation(coupleSlug: string) {
  // 1. Fetch dari Supabase
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('coupleSlug', coupleSlug)
    .eq('templateSlug', 'royal-moments')
    .single()

  if (error) throw error

  // 2. Build template data
  const templateData = buildSharedInvitationTemplateData(invitation)

  // 3. Return untuk render
  return templateData
}
```

---

## 5️⃣ Template Structure

```
📱 Mobile View (default)
├── Hero Section
│   ├── Monogram
│   ├── Partner Names
│   └── Guest Greeting
├── Countdown Timer
├── Quote & Music
├── Couple Profiles
├── Event Details
├── Photo Gallery
├── Love Story
├── Video Section
├── Wedding Gift
├── RSVP Form
└── Guest Book
└── Closing

🖥️ Desktop View (auto-arranged)
├── Hero Section (full width)
├── Countdown + Summary (2 col grid)
├── Quote + Music (2 col grid)
├── Couple Profiles (full width)
├── Event Details (full width)
├── Gallery + Love Story (2 col grid)
├── Video Section (full width)
├── Gift + RSVP (2 col grid)
└── Closing (full width)
```

---

## 🎨 Customizing Colors

Edit `features/invitation/templates/royal-moments/config.ts`:

```typescript
export const ROYAL_MOMENTS_DEFAULT_CONFIG = {
  theme: {
    primary: '#d4a574',        // Change this to your color
    primaryLight: '#e8d7c6',
    background: '#1a1410',
    border: '#8b6f47',
    text: '#c9b8a8',
    // ... other colors
  }
}
```

Then use in template:
```tsx
const theme = {
  shell: `bg-${background} text-${primaryLight}`,
  accent: `text-${primary}`,
  // ...
}
```

---

## 🎬 Adding Video Support

Template sudah support video. Pastikan data Supabase include video:

```typescript
sections: {
  coverPersonal: {
    video: {
      url: 'https://storage.example.com/video.mp4',
      mimeType: 'video/mp4'
    }
  }
}
```

Video akan otomatis render di section tersendiri.

---

## 📝 RSVP Form Integration

Template menerima `rsvpSlot` prop untuk custom RSVP form:

```tsx
import RSVPForm from '@/components/forms/RSVPForm'

<RoyalMomentsTemplate
  invitation={data}
  rsvpSlot={<RSVPForm invitationId={data.meta.id} />}
/>
```

---

## 🔧 Key Props

```typescript
interface TemplateComponentProps {
  // Required: Invitation data dari Supabase
  invitation: SharedInvitationTemplateData

  // Optional: Custom RSVP form component
  rsvpSlot?: React.ReactNode

  // Optional: Preview mode (untuk demo)
  previewMode?: boolean
}
```

---

## 📊 Data Requirements

Template expects Supabase data structure:

```typescript
SharedInvitationTemplateData = {
  meta: {
    id: string
    status: 'DRAFT' | 'PUBLISHED'
    template: 'ROYAL_MOMENTS'
    templateSlug: 'royal-moments'
    coupleSlug: string
    // ... more meta fields
  },
  sections: {
    coverPersonal: { ... },
    heroCouple: { ... },
    countdown: { ... },
    quote: { ... },
    profiles: { ... },
    eventDetails: { ... },
    gallery: { ... },
    loveStory: { ... },
    weddingGift: { ... },
    rsvp: { ... },
    closing: { ... }
  }
}
```

See `DEVELOPER_GUIDE.md` for full data structure.

---

## 🚀 Deploy to Vercel

```bash
# 1. Commit changes
git add .
git commit -m "feat: Add Royal Moments template"

# 2. Push to GitHub
git push

# 3. Vercel auto-deploys or use CLI
vercel deploy --prod

# 4. Set environment variables in Vercel dashboard
```

---

## ✅ Verification Checklist

Before going live:

- [ ] Template renders without errors
- [ ] All sections display correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Countdown timer working
- [ ] Video player functional
- [ ] Images load properly
- [ ] Music player works
- [ ] RSVP form submits
- [ ] Links working (Maps, Social)
- [ ] Performance acceptable

---

## 📚 Documentation Files

Read in this order:

1. **This file** (Quick Start) ← You are here
2. `README.md` - Features & overview
3. `DEVELOPER_GUIDE.md` - Technical details
4. `config.ts` - Configuration reference
5. `RoyalMomentsTemplate.tsx` - Source code

---

## 🆘 Troubleshooting

### Template not showing?
```typescript
// Check if imported correctly
import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments/RoyalMomentsTemplate'

// Check if data structure is correct
console.log(invitation.sections)
```

### Styles not applied?
```tsx
// Ensure Tailwind CSS is imported in globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// Check if HTML has bg-background class
<html className="bg-background">
```

### Video not playing?
```typescript
// Verify video format
const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg']

// Check CORS headers if external URL
// Verify video URL is accessible
```

### TypeScript errors?
```bash
# Run type check
npx tsc --noEmit

# Look for missing properties in data structure
```

---

## 🎯 Next: Production Setup

After Quick Start, follow `DEVELOPER_GUIDE.md` for:

1. **Supabase Setup**
   - Create database tables
   - Setup authentication
   - Configure storage

2. **API Integration**
   - Create RSVP endpoint
   - Setup email notifications
   - Configure webhooks

3. **Deployment**
   - Set environment variables
   - Configure CDN
   - Setup monitoring

---

## 📞 Support

- **Questions?** Check `DEVELOPER_GUIDE.md`
- **Issues?** See Troubleshooting section
- **Customization?** Edit `config.ts` or template component

---

## 🎉 You're Ready!

Template is set up and ready to use. Start by:

```bash
npm run dev
# Visit http://localhost:3000/royal-moments-preview
```

Happy coding! 🚀

---

**Next Steps:**
1. Customize colors in `config.ts`
2. Integrate with your Supabase data
3. Create RSVP form component
4. Deploy to Vercel

---

*For detailed information, see documentation files in template directory.*
