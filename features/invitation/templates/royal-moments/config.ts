/**
 * Royal Moments Template Configuration
 * 
 * File ini berisi setup dan konfigurasi untuk template Royal Moments
 * yang mengintegrasikan countdown timer, video section, dan RSVP form.
 */

import type { InvitationTemplate } from '@/lib/domain/types'
import type { SharedInvitationTemplateData } from '@/features/invitation/templates/contract'

export interface RoyalMomentsConfig {
  theme: {
    primary: string // Gold: #d4a574
    primaryLight: string // Light Beige: #e8d7c6
    background: string // Dark Brown: #1a1410
    border: string // Medium Brown: #8b6f47
    text: string // Muted Beige: #c9b8a8
    monogram: string
    formalIntroQuote: string
    dresscode: string
    showFamilySection: boolean
  }
}

export const ROYAL_MOMENTS_DEFAULT_CONFIG: RoyalMomentsConfig = {
  theme: {
    primary: '#d4a574',
    primaryLight: '#e8d7c6',
    background: '#1a1410',
    border: '#8b6f47',
    text: '#c9b8a8',
    monogram: '',
    formalIntroQuote:
      'Dengan segala kerendahan hati, kami memohon doa restu untuk acara istimewa kami.',
    dresscode: 'Dress Code: Formal',
    showFamilySection: true,
  },
}

/**
 * Fitur-fitur Royal Moments Template:
 * 
 * 1. COUNTDOWN TIMER
 *    - Hitung mundur otomatis ke hari pernikahan
 *    - Tampil hari, jam, dan menit
 *    - Update real-time setiap menit
 * 
 * 2. PHOTO GALLERY
 *    - Grid responsif (2 kolom di desktop)
 *    - Lazy loading dengan Next.js Image
 *    - Aspect ratio 4:5 (portrait)
 *    - Rounded corners dengan shadow
 * 
 * 3. VIDEO SECTION (NEW)
 *    - Full responsive video player
 *    - Native HTML5 video controls
 *    - Support MP4, WebM, Ogg
 *    - Custom thumbnail/poster
 *    - Title dan description
 * 
 * 4. RSVP FORM
 *    - Integrasi dengan slot component
 *    - Tampil di section tersendiri
 *    - Toggle enable/disable dari admin
 * 
 * 5. MUSIC PLAYER
 *    - Audio player untuk lagu pembuka
 *    - Native audio controls
 *    - Display nama lagu
 * 
 * 6. GUEST BOOK
 *    - Daftar ucapan dari tamu
 *    - Nama tamu + timestamp
 *    - Pesan ucapan
 *    - Toggle enable/disable
 * 
 * 7. GIFT REGISTRY
 *    - Multiple channel (Bank, Wishlist, E-wallet)
 *    - Account info dan detail
 *    - Custom notes
 * 
 * 8. COUPLE PROFILES
 *    - Foto, nama, nickname
 *    - Bio dan parent info
 *    - Social media links
 */

/**
 * Struktur Data yang Diperlukan dari Supabase
 */
export interface RoyalMomentsData extends SharedInvitationTemplateData {
  sections: {
    coverPersonal: {
      image: {
        url: string
        altText?: string
      }
      video?: {
        url: string
        mimeType: string // video/mp4, video/webm, video/ogg
      }
      eyebrow: string
      title: string
      guestName: string
      music?: {
        url: string
        originalName?: string
        mimeType?: string
      }
    }
    heroCouple: {
      partnerOneName: string
      partnerTwoName: string
      displayName: string
      summary: string
    }
    countdown: {
      startsAt: Date
      label: string
    }
    quote: {
      title: string
      text: string
      source?: string
    }
    profiles: {
      title: string
      intro: string
      partnerOne: {
        fullName: string
        nickname?: string
        parentLine?: string
        bio: string
        social?: {
          platform: 'instagram' | 'tiktok'
          href: string
          label: string
        }
      }
      partnerTwo: {
        fullName: string
        nickname?: string
        parentLine?: string
        bio: string
        social?: {
          platform: 'instagram' | 'tiktok'
          href: string
          label: string
        }
      }
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
      locationCtaLabel?: string
    }
    gallery: {
      title: string
      intro: string
      items: Array<{
        id: string
        imageUrl: string
        altText?: string
      }>
    }
    loveStory: {
      title: string
      narrative: string
      moments: Array<{
        id: string
        title: string
        narrative: string
      }>
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
      wishes: Array<{
        id: string
        guestName: string
        message: string
        createdAt: Date
      }>
    }
    closing: {
      title: string
      note: string
    }
  }
}

/**
 * Query Supabase untuk fetch data
 */
export const ROYAL_MOMENTS_SUPABASE_QUERIES = {
  // Fetch invitation dengan semua sections
  getInvitation: `
    SELECT 
      id, slug, coupleSlug,
      title, description,
      sections -> 'coverPersonal' as coverPersonal,
      sections -> 'heroCouple' as heroCouple,
      sections -> 'countdown' as countdown,
      sections -> 'quote' as quote,
      sections -> 'profiles' as profiles,
      sections -> 'eventDetails' as eventDetails,
      sections -> 'gallery' as gallery,
      sections -> 'loveStory' as loveStory,
      sections -> 'weddingGift' as weddingGift,
      sections -> 'rsvp' as rsvp,
      sections -> 'closing' as closing,
      templateSlug,
      status,
      createdAt,
      updatedAt
    FROM invitations
    WHERE coupleSlug = $1 AND templateSlug = 'royal-moments'
  `,

  // Fetch RSVP wishes
  getWishes: `
    SELECT id, guestName, message, createdAt
    FROM rsvp_entries
    WHERE invitationId = $1 AND wishMessage IS NOT NULL
    ORDER BY createdAt DESC
    LIMIT 50
  `,

  // Fetch gallery items
  getGallery: `
    SELECT id, imageUrl, altText, displayOrder
    FROM invitation_gallery_items
    WHERE invitationId = $1
    ORDER BY displayOrder ASC
  `,
}

/**
 * Tailwind Classes untuk Theme
 */
export const ROYAL_MOMENTS_TAILWIND_THEME = {
  // Shell
  shell: 'bg-[#1a1410] text-[#e8d7c6]',

  // Surface
  surface:
    'border border-[#8b6f47] bg-[rgba(20,18,15,0.85)] backdrop-blur-sm',

  // Card
  card: 'border border-[#8b6f47] bg-[rgba(28,25,20,0.9)]',

  // Accents
  accent: 'text-[#d4a574]',
  muted: 'text-[#c9b8a8]/75',
  mutedBg: 'bg-[rgba(201,184,168,0.1)]',

  // Borders
  borderLight: 'border-[#8b6f47]',
  borderDark: 'border-[#6b4e1f]',

  // Dividers
  divider:
    'bg-gradient-to-r from-transparent via-[#d4a574] to-transparent',

  // Buttons
  buttonPrimary:
    'bg-[#d4a574] text-[#1a1410] hover:bg-[#e5c977] transition-colors',
  buttonSecondary:
    'border border-[#d4a574] text-[#d4a574] hover:bg-[rgba(212,165,116,0.1)] transition-colors',

  // Forms
  inputBg: 'bg-[rgba(28,25,20,0.9)] border-[#8b6f47] text-[#e8d7c6]',
  inputFocus: 'focus:ring-[#d4a574] focus:border-[#d4a574]',

  // Rounds
  roundLg: 'rounded-[2rem]',
  roundMd: 'rounded-[1.8rem]',
  roundSm: 'rounded-[1.5rem]',
}

/**
 * Animation Classes
 */
export const ROYAL_MOMENTS_ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
  countdownFlash: 'animate-pulse duration-1000',
}

/**
 * Responsive Breakpoints
 */
export const ROYAL_MOMENTS_BREAKPOINTS = {
  mobile: 'max-w-full px-4',
  tablet: 'md:max-w-3xl md:px-6',
  desktop: 'lg:max-w-6xl lg:px-8',
}

export default ROYAL_MOMENTS_DEFAULT_CONFIG
