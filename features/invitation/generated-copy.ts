import type { InvitationTemplateConfigValues } from "./form/config";
import {
  resolveInvitationTemplateSlug,
  type InvitationTemplateSlug,
} from "./templates/template-slugs";

type GeneratedCopyInput = {
  templateSlug: string;
  partnerOneName: string;
  partnerTwoName: string;
  config: InvitationTemplateConfigValues;
};

export type GeneratedInvitationCopy = {
  legacy: {
    headline: string;
    subheadline: string;
    story: string;
    closingNote: string;
  };
  sections: {
    coverPersonal: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    heroCouple: {
      eyebrow: string;
      summary: string;
      invitationLine: string;
    };
    quote: {
      title: string;
      text: string;
      source?: string | null;
    };
    profiles: {
      title: string;
      intro: string;
      partnerOneSummary: string;
      partnerTwoSummary: string;
    };
    eventDetails: {
      title: string;
      intro: string;
      locationCtaLabel: string;
    };
    gallery: {
      title: string;
      intro: string;
    };
    loveStory: {
      title: string;
      narrative: string;
    };
    weddingGift: {
      title: string;
      intro: string;
    };
    rsvp: {
      title: string;
      intro: string;
    };
    closing: {
      title: string;
      note: string;
    };
  };
};

type TemplateFixedCopy = {
  coverEyebrow: string;
  coverSubtitle: string;
  heroEyebrow: string;
  invitationLine: string;
  heroSummaryTemplate: (coupleDisplay: string) => string;
  quoteTitle: string;
  quoteText: string;
  quoteSource: string;
  profilesTitle: string;
  profilesIntro: string;
  profileSummaryTemplate: (displayName: string) => string;
  eventTitle: string;
  eventIntro: string;
  locationCtaLabel: string;
  galleryTitle: string;
  galleryIntro: string;
  loveStoryTitle: string;
  loveStoryFallback: string;
  giftTitle: string;
  giftIntro: string;
  rsvpTitle: string;
  rsvpIntro: string;
  closingTitle: string;
  closingNote: string;
};

const templateCopy = {
  "elegant-luxury": {
    coverEyebrow: "Undangan Pernikahan",
    coverSubtitle:
      "Rangkaian momen yang disusun formal, anggun, dan penuh rasa syukur untuk hari yang sakral.",
    heroEyebrow: "A Timeless Celebration",
    invitationLine:
      "Dengan hormat, kami mengundang Anda untuk hadir dan menjadi bagian dari hari bahagia kami.",
    heroSummaryTemplate: (coupleDisplay) =>
      `${coupleDisplay} menyiapkan satu perayaan yang khidmat, hangat, dan berkesan bagi keluarga serta sahabat terdekat.`,
    quoteTitle: "Quote / Ayat",
    quoteText:
      "Dan di antara tanda-tanda kebesaran-Nya, Dia menciptakan pasangan untukmu agar kamu merasa tenteram di sisinya.",
    quoteSource: "QS. Ar-Rum: 21",
    profilesTitle: "Mempelai",
    profilesIntro:
      "Dengan penuh syukur, kami mempersembahkan dua hati yang dipersatukan menuju hari yang istimewa ini.",
    profileSummaryTemplate: (displayName) =>
      `${displayName} melangkah menuju hari ini dengan niat baik, ketulusan hati, dan harapan akan rumah tangga yang diberkahi.`,
    eventTitle: "Detail Acara",
    eventIntro:
      "Berikut susunan acara yang kami siapkan untuk menyambut Anda dalam suasana yang hangat dan berkesan.",
    locationCtaLabel: "Lihat lokasi",
    galleryTitle: "Galeri",
    galleryIntro:
      "Beberapa potret pilihan ini menjadi pengantar menuju hari yang akan kami rayakan bersama.",
    loveStoryTitle: "Jejak Perjalanan Kami",
    loveStoryFallback:
      "Setiap hubungan memiliki ritme yang khas. Hari ini menjadi satu penanda bahwa perjalanan kami sampai pada langkah yang lebih utuh dan bermakna.",
    giftTitle: "Wedding Gift",
    giftIntro:
      "Kehadiran dan doa restu Anda adalah hadiah terindah. Jika berkenan berbagi tanda kasih, detail berikut dapat digunakan.",
    rsvpTitle: "Konfirmasi Kehadiran",
    rsvpIntro:
      "Mohon bantu kami mempersiapkan hari istimewa ini dengan memberikan konfirmasi kehadiran Anda.",
    closingTitle: "Sampai Berjumpa",
    closingNote:
      "Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
  },
  "korean-soft": {
    coverEyebrow: "A Gentle Invitation",
    coverSubtitle:
      "Undangan yang lembut, hangat, dan terasa personal untuk dibuka kapan pun oleh tamu tercinta.",
    heroEyebrow: "Our Warmest Day",
    invitationLine:
      "Kami menyiapkan hari ini dengan penuh syukur dan ingin membaginya bersama orang-orang tersayang seperti Anda.",
    heroSummaryTemplate: (coupleDisplay) =>
      `${coupleDisplay} menyiapkan satu hari yang ingin dikenang dengan hangat, ringan, dan penuh kebahagiaan sederhana.`,
    quoteTitle: "Quote",
    quoteText:
      "Love is the quiet feeling of choosing the same person, again and again, in every season.",
    quoteSource: "Atelier Mempelai",
    profilesTitle: "Tentang Kami",
    profilesIntro:
      "Sedikit pengantar tentang dua hati yang bertumbuh bersama sampai akhirnya siap menyambut hari ini.",
    profileSummaryTemplate: (displayName) =>
      `${displayName} hadir dalam cerita ini dengan kelembutan yang membuat setiap langkah terasa lebih hangat dan dekat.`,
    eventTitle: "Detail Acara",
    eventIntro:
      "Kami menyiapkan hari ini dengan suasana yang ringan dan hangat agar setiap tamu merasa dekat dengan cerita kami.",
    locationCtaLabel: "Buka maps",
    galleryTitle: "Galeri",
    galleryIntro:
      "Galeri ini menyimpan potongan kecil dari perjalanan yang membawa kami sampai di titik ini.",
    loveStoryTitle: "Cerita yang Bertumbuh Pelan",
    loveStoryFallback:
      "Perjalanan kami tumbuh dengan tenang, pelan, dan penuh rasa syukur hingga akhirnya sampai di hari yang kami nantikan bersama.",
    giftTitle: "Tanda Kasih",
    giftIntro:
      "Jika Anda ingin mengirimkan tanda kasih, kami menyiapkan detail sederhana berikut untuk memudahkan.",
    rsvpTitle: "RSVP & Ucapan",
    rsvpIntro:
      "Konfirmasi singkat dari Anda akan sangat membantu kami menyiapkan momen yang lebih hangat dan nyaman.",
    closingTitle: "Dengan Hangat",
    closingNote:
      "Terima kasih sudah meluangkan waktu untuk membuka undangan ini. Kehadiran dan doa baik Anda akan sangat berarti bagi kami.",
  },
  "modern-minimal": {
    coverEyebrow: "Digital Invitation",
    coverSubtitle:
      "Disusun rapi, bersih, dan langsung pada inti tanpa kehilangan nuansa personal.",
    heroEyebrow: "A Clean Editorial Story",
    invitationLine:
      "Kami mengundang Anda untuk hadir di hari pernikahan kami dan merayakan momen penting ini bersama.",
    heroSummaryTemplate: (coupleDisplay) =>
      `${coupleDisplay} memilih perayaan yang ringkas, jelas, dan tetap hangat bagi orang-orang terdekat mereka.`,
    quoteTitle: "Quote",
    quoteText: "The best kind of love is steady, intentional, and quietly certain.",
    quoteSource: "Atelier Mempelai",
    profilesTitle: "The Couple",
    profilesIntro:
      "Template ini merangkum inti cerita kami secara singkat, jujur, dan mudah diikuti dari awal sampai akhir.",
    profileSummaryTemplate: (displayName) =>
      `${displayName} menjadi bagian penting dari hari ini dengan cara yang tenang, jujur, dan bermakna.`,
    eventTitle: "Detail Acara",
    eventIntro:
      "Detail inti acara kami susun sejelas mungkin agar tamu dapat menangkap informasi penting tanpa distraksi berlebih.",
    locationCtaLabel: "Open maps",
    galleryTitle: "Gallery",
    galleryIntro:
      "Rangkaian foto pilihan ini menjadi aksen visual yang menyeimbangkan tipografi dan whitespace template.",
    loveStoryTitle: "A Brief Story",
    loveStoryFallback:
      "Cerita kami bergerak dengan ritme yang sederhana, jelas, dan terasa cukup untuk merangkum langkah menuju hari istimewa ini.",
    giftTitle: "Wedding Gift",
    giftIntro:
      "Bila Anda ingin berbagi hadiah secara praktis, detail yang dibutuhkan tersedia di bawah ini.",
    rsvpTitle: "RSVP & Notes",
    rsvpIntro:
      "Konfirmasi Anda membantu kami menyiapkan jumlah tamu dan alur acara dengan lebih presisi.",
    closingTitle: "Thank You",
    closingNote:
      "Terima kasih atas perhatian, kehadiran, dan doa baik yang Anda kirimkan untuk hari bahagia kami.",
  },
} as const satisfies Record<InvitationTemplateSlug, TemplateFixedCopy>;

function getPreferredDisplayName(fullName: string, nickname: string) {
  return nickname.trim() || fullName.trim();
}

export function buildGeneratedInvitationCopy({
  templateSlug,
  partnerOneName,
  partnerTwoName,
  config,
}: GeneratedCopyInput): GeneratedInvitationCopy {
  const resolvedTemplateSlug = resolveInvitationTemplateSlug(templateSlug);
  const templateDefaults = templateCopy[resolvedTemplateSlug];
  const partnerOneDisplay = getPreferredDisplayName(
    partnerOneName,
    config.copy.partnerNicknames.partnerOne,
  );
  const partnerTwoDisplay = getPreferredDisplayName(
    partnerTwoName,
    config.copy.partnerNicknames.partnerTwo,
  );
  const coupleDisplay = `${partnerOneDisplay} & ${partnerTwoDisplay}`;
  const loveStoryNarrative =
    config.loveStory.narrative.trim() || templateDefaults.loveStoryFallback;

  return {
    legacy: {
      headline: "The Wedding of",
      subheadline: `${templateDefaults.coverSubtitle} ${templateDefaults.invitationLine}`,
      story: loveStoryNarrative,
      closingNote: templateDefaults.closingNote,
    },
    sections: {
      coverPersonal: {
        eyebrow: templateDefaults.coverEyebrow,
        title: `Untuk Anda yang kami nantikan di hari pernikahan ${partnerOneDisplay} & ${partnerTwoDisplay}.`,
        subtitle: templateDefaults.invitationLine,
      },
      heroCouple: {
        eyebrow: templateDefaults.heroEyebrow,
        summary: templateDefaults.heroSummaryTemplate(coupleDisplay),
        invitationLine: templateDefaults.invitationLine,
      },
      quote: {
        title: templateDefaults.quoteTitle,
        text: templateDefaults.quoteText,
        source: templateDefaults.quoteSource,
      },
      profiles: {
        title: templateDefaults.profilesTitle,
        intro: templateDefaults.profilesIntro,
        partnerOneSummary: templateDefaults.profileSummaryTemplate(partnerOneDisplay),
        partnerTwoSummary: templateDefaults.profileSummaryTemplate(partnerTwoDisplay),
      },
      eventDetails: {
        title: templateDefaults.eventTitle,
        intro: templateDefaults.eventIntro,
        locationCtaLabel: templateDefaults.locationCtaLabel,
      },
      gallery: {
        title: templateDefaults.galleryTitle,
        intro: templateDefaults.galleryIntro,
      },
      loveStory: {
        title: templateDefaults.loveStoryTitle,
        narrative: loveStoryNarrative,
      },
      weddingGift: {
        title: templateDefaults.giftTitle,
        intro: templateDefaults.giftIntro,
      },
      rsvp: {
        title: templateDefaults.rsvpTitle,
        intro: templateDefaults.rsvpIntro,
      },
      closing: {
        title: templateDefaults.closingTitle,
        note: templateDefaults.closingNote,
      },
    },
  };
}
