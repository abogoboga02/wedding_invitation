/**
 * Royal Moments Wedding Invitation Template
 * 
 * 🏆 Premium luxury wedding invitation template dengan 8+ fitur
 * 🎨 Desain brown/gold yang elegan dan sophisticated
 * 📱 Fully responsive (mobile, tablet, desktop)
 * 🔌 Supabase integration ready
 * ⚡ Production-ready TypeScript code
 * 📚 Comprehensive documentation
 * 
 * Location: features/invitation/templates/royal-moments/
 */

import { RoyalMomentsTemplate } from './RoyalMomentsTemplate'
import type { TemplateComponentProps } from '../types'

// Export main template component
export { RoyalMomentsTemplate }

// Export type for usage
export type { TemplateComponentProps }

// Re-export config for reference
export { ROYAL_MOMENTS_DEFAULT_CONFIG } from './config'
export type { RoyalMomentsConfig, RoyalMomentsData } from './config'

/**
 * QUICK REFERENCE
 * 
 * Import:
 *   import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments'
 * 
 * Usage:
 *   <RoyalMomentsTemplate 
 *     invitation={data}
 *     rsvpSlot={<RSVPForm />}
 *     previewMode={false}
 *   />
 * 
 * Features:
 *   ✅ Countdown Timer
 *   ✅ Photo Gallery
 *   ✅ Video Player
 *   ✅ RSVP Form
 *   ✅ Music Player
 *   ✅ Gift Registry
 *   ✅ Couple Profiles
 *   ✅ Event Details
 *   ✅ Love Story
 *   ✅ Guest Book
 * 
 * Documentation:
 *   📖 README.md           - User guide & features
 *   👨‍💻 DEVELOPER_GUIDE.md  - Technical documentation
 *   ⚙️  config.ts          - Configuration & constants
 *   📱 RoyalMomentsTemplate.tsx - Main component
 * 
 * Colors:
 *   Primary:       #d4a574 (Gold)
 *   Primary Light: #e8d7c6 (Light Beige)
 *   Background:    #1a1410 (Dark Brown)
 *   Border:        #8b6f47 (Medium Brown)
 *   Text:          #c9b8a8 (Muted Beige)
 * 
 * Data Source: Supabase
 *   Table: invitations
 *   Schema: SharedInvitationTemplateData
 * 
 * Status: ✅ Production Ready
 * Version: 1.0.0
 * Created: May 2024
 */

export const ROYAL_MOMENTS_META = {
  id: 'ROYAL_MOMENTS',
  slug: 'royal-moments',
  label: 'Royal Moments',
  description:
    'Premium luxury wedding invitation with countdown, video, RSVP, and more.',
  thumbnail:
    'https://images.unsplash.com/photo-1519741497674-611481863552',
  features: [
    'Countdown Timer',
    'Photo Gallery',
    'Video Player',
    'RSVP Form',
    'Music Player',
    'Gift Registry',
    'Couple Profiles',
    'Event Details',
    'Love Story',
    'Guest Book',
  ],
  colors: {
    primary: '#d4a574',
    primaryLight: '#e8d7c6',
    background: '#1a1410',
    border: '#8b6f47',
    text: '#c9b8a8',
  },
  responsive: {
    mobile: 'Single column layout',
    tablet: 'Optimized for mid-size screens',
    desktop: 'Multi-column grid layout',
  },
  documentation: {
    quickStart: './ROYAL_MOMENTS_QUICKSTART.md',
    userGuide: './README.md',
    developerGuide: './DEVELOPER_GUIDE.md',
    summary: '../ROYAL_MOMENTS_SUMMARY.md',
  },
} as const
