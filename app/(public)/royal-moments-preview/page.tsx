'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RoyalMomentsTemplate } from '@/features/invitation/templates/royal-moments/RoyalMomentsTemplate'
import type { SharedInvitationTemplateData } from '@/features/invitation/templates/contract'

// Contoh data dari Supabase
const SAMPLE_INVITATION_DATA: SharedInvitationTemplateData = {
  meta: {
    templateSlug: 'royal-moments',
    templateConfig: {},
  },
  sections: {
    coverPersonal: {
      image: {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        altText: 'Couple Portrait',
      },
      video: {
        url: 'https://media.istockphoto.com/id/1386487636/video/just-married-newly-wed-couple-in-love-at-wedding-ceremony.mp4',
        mimeType: 'video/mp4',
      },
      eyebrow: 'Dengan Bahagia',
      title: 'Mengundang Anda untuk Merayakan Momen Spesial Kami',
      guestName: 'Bapak/Ibu',
      music: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        originalName: 'Instrumental Wedding - Love Story',
      },
    },
    heroCouple: {
      partnerOneName: 'Rifa',
      partnerTwoName: 'Hanafi',
      displayName: 'Rifa & Hanafi',
      summary:
        'Dua hati yang berpadu menjadi satu, siap memulai perjalanan indah bersama. Dengan penuh syukur dan cinta, kami mengundang Anda untuk menjadi bagian dari perayaan istimewa ini.',
    },
    countdown: {
      startsAt: new Date('2024-12-25T17:00:00Z'),
      label: 'Penghitungan Hari Istimewa',
    },
    quote: {
      title: 'Kata Mutiara',
      text: 'Cinta adalah ketika dua orang menjadi satu, tetapi tidak saling meninggalkan identitas mereka',
      source: 'Unknown',
    },
    profiles: {
      title: 'Tentang Kami',
      intro:
        'Berkenalanlah dengan kedua pasangan yang akan memulai perjalanan hidup bersama',
      partnerOne: {
        fullName: 'Rifa Hanafi',
        nickname: 'Rifa',
        parentLine: 'Putri dari Bapak/Ibu...',
        bio: 'Seorang profesional muda dengan passion di bidang design dan travel. Cinta berbagi cerita dan menciptakan momen berkesan bersama orang-orang terkasih.',
        social: {
          platform: 'instagram' as const,
          href: 'https://instagram.com',
          label: '@rifa.hanafi',
        },
      },
      partnerTwo: {
        fullName: 'Angga Pratama',
        nickname: 'Angga',
        parentLine: 'Putra dari Bapak/Ibu...',
        bio: 'Entrepreneur dan tech enthusiast yang selalu mencari peluang baru. Gemar hiking, photography, dan menghabiskan waktu quality dengan keluarga.',
        social: {
          platform: 'instagram' as const,
          href: 'https://instagram.com',
          label: '@angga.pratama',
        },
      },
    },
    eventDetails: {
      title: 'Acara Pernikahan',
      intro: 'Kami dengan senang hati berbagi jadwal acara pernikahan kami:',
      events: [
        {
          id: '1',
          label: 'Akad Nikah',
          startsAt: new Date('2024-12-25T10:00:00Z'),
          timeLabel: '10:00 WIB',
          venueName: 'Masjid Al-Ikhlas',
          address: 'Jl. Merdeka No. 123, Jakarta',
          googleMapsUrl: 'https://maps.google.com',
          mapsUrl: 'https://maps.apple.com',
        },
        {
          id: '2',
          label: 'Resepsi',
          startsAt: new Date('2024-12-25T17:00:00Z'),
          timeLabel: '17:00 WIB',
          venueName: 'Grand Hotel Bintang Lima',
          address: 'Jl. Sudirman No. 456, Jakarta',
          googleMapsUrl: 'https://maps.google.com',
          mapsUrl: 'https://maps.apple.com',
        },
      ],
      locationCtaLabel: 'Buka di Maps',
    },
    gallery: {
      title: 'Galeri Foto',
      intro: 'Kenang-kenangan indah perjalanan cinta kami:',
      items: [
        {
          id: '1',
          imageUrl:
            'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&q=80&fit=crop',
          altText: 'Couple Portrait 1',
        },
        {
          id: '2',
          imageUrl:
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=500&q=80&fit=crop',
          altText: 'Couple Portrait 2',
        },
        {
          id: '3',
          imageUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&q=80&fit=crop',
          altText: 'Couple Portrait 3',
        },
        {
          id: '4',
          imageUrl:
            'https://images.unsplash.com/photo-1543269865-cbdf26cecb46?w=400&h=500&q=80&fit=crop',
          altText: 'Couple Portrait 4',
        },
      ],
    },
    loveStory: {
      title: 'Kisah Cinta Kami',
      narrative:
        'Awalnya hanya sekedar pertemuan biasa, hingga akhirnya kami menyadari bahwa ini adalah takdir yang indah.',
      moments: [
        {
          id: '1',
          title: '2019 - Pertemuan Pertama',
          narrative:
            'Kami bertemu di sebuah acara berkumpul teman. Di antara keramaian, mata kami saling berpapasan.',
        },
        {
          id: '2',
          title: '2021 - Jatuh Cinta',
          narrative:
            'Setelah menghabiskan banyak waktu bersama, kami menyadari bahwa ini lebih dari sekedar persahabatan.',
        },
        {
          id: '3',
          title: '2023 - Lamaran',
          narrative:
            'Di bawah langit malam yang berbintang, dia merendahkan lutut dan meminta kami bersatu selamanya.',
        },
      ],
    },
    weddingGift: {
      title: 'Hadiah Pernikahan',
      intro:
        'Kehadiran Anda adalah hadiah terbesar bagi kami. Namun, jika Anda ingin berbagi kebahagiaan, berikut adalah informasi hadiah:',
      enabled: true,
      entries: [
        {
          type: 'Bank Transfer',
          label: 'BCA',
          accountName: 'Rifa Hanafi',
          accountNumber: '1234 5678 9012',
          note: 'Atas Nama: Rifa Hanafi',
        },
        {
          type: 'Bank Transfer',
          label: 'Mandiri',
          accountName: 'Angga Pratama',
          accountNumber: '1234 5678 9012',
          note: 'Atas Nama: Angga Pratama',
        },
        {
          type: 'Wishlist',
          label: 'Registry',
          accountName: 'Wishlist Pernikahan',
          accountNumber: 'https://registry.example.com',
          note: 'Kunjungi link untuk melihat wishlist kami',
        },
      ],
    },
    rsvp: {
      title: 'Konfirmasi Kehadiran',
      intro:
        'Mohon konfirmasi kehadiran Anda sebelum tanggal 15 Desember 2024',
      enabled: true,
      wishEnabled: true,
      wishes: [
        {
          id: '1',
          guestName: 'Budi Santoso',
          message:
            'Selamat dan semoga pernikahan Anda penuh dengan kebahagiaan dan berkah. Sukses selalu!',
          createdAt: new Date('2024-11-20'),
        },
        {
          id: '2',
          guestName: 'Siti Nur Azizah',
          message:
            'Alhamdulillah, semoga persatuannya lancar dan bahagia dunia akhirat. Amin.',
          createdAt: new Date('2024-11-21'),
        },
      ],
    },
    closing: {
      title: 'Terima Kasih',
      note: 'Atas kehadiran dan doa restu Anda, kami ucapkan terima kasih yang sebesar-besarnya. Semoga Tuhan memberkahi perjalanan indah kami.',
    },
  },
}

export default function RoyalMomentsPreviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1410]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#c9b8a8]">Memuat Undangan...</p>
        </div>
      </div>
    )
  }

  // Update guest name if provided
  const invitationData = {
    ...SAMPLE_INVITATION_DATA,
    sections: {
      ...SAMPLE_INVITATION_DATA.sections,
      coverPersonal: {
        ...SAMPLE_INVITATION_DATA.sections.coverPersonal,
        guestName: guestName || 'Bapak/Ibu',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2a2420] to-[#1a1410] py-6 px-4 sm:py-8 md:py-12">
      {/* Guest Name Input */}
      <div className="mb-8 flex justify-center">
        <div className="max-w-md w-full">
          <label className="block text-sm font-medium text-[#d4a574] mb-2">
            Masukkan Nama Tamu:
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full px-4 py-3 rounded-lg bg-[rgba(28,25,20,0.9)] border border-[#8b6f47] text-[#e8d7c6] placeholder-[#c9b8a8]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
          />
        </div>
      </div>

      {/* Template Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <RoyalMomentsTemplate invitation={invitationData} previewMode={true} />
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-12 text-center">
        <p className="text-[#c9b8a8]/60 text-sm">
          Ini adalah preview template Royal Moments Wedding Invitation
        </p>
        <p className="text-[#8b6f47] text-xs mt-2">
          © 2024 Wedding Invitation System
        </p>
      </div>
    </div>
  )
}
