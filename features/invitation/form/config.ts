import { z } from "zod";

import type { InvitationTemplate } from "@/lib/domain/types";
import {
  getMusicPresetById,
  MUSIC_MOOD_LABELS,
  type MusicPresetMood,
} from "@/lib/constants/music-playlist";

export type InvitationFormFieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "url"
  | "select"
  | "checkbox";

export type InvitationFormFieldOption = {
  value: string;
  label: string;
};

export type InvitationFormFieldDefinition = {
  name: string;
  label: string;
  type: InvitationFormFieldType;
  description?: string;
  placeholder?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string | boolean;
  options?: InvitationFormFieldOption[];
  fullWidth?: boolean;
};

export type InvitationFormSectionDefinition = {
  id: string;
  title: string;
  description: string;
  fields: InvitationFormFieldDefinition[];
};

export type TemplateConfigFieldValue = string | boolean;

export type InvitationGiftEntryType = "bank" | "ewallet";
export type InvitationMusicSource = "preset" | "upload";

export type InvitationGiftEntry = {
  type: InvitationGiftEntryType;
  label: string;
  accountName: string;
  accountNumber: string;
  note: string;
};

export type ElegantLuxuryThemeConfig = {
  monogram: string;
  dresscode: string;
  showFamilySection: boolean;
  formalIntroQuote: string;
};

export type KoreanSoftThemeConfig = {
  floralStyle: "blush-petal" | "wild-bloom" | "minimal-bud";
  pastelVariant: "soft-rose" | "peach-cream" | "ivory-blush";
  frameStyle: "rounded" | "soft-outline" | "floating-card";
  greetingTone: "warm" | "gentle" | "intimate";
};

export type ModernMinimalThemeConfig = {
  typographyMode: "editorial-serif" | "refined-sans" | "hybrid";
  monochromeStyle: "classic-black" | "warm-gray" | "soft-contrast";
  dividerStyle: "line" | "block" | "none";
  titleCasingMode: "title-case" | "uppercase";
};

type SharedTemplateConfig<TTheme> = {
  copy: {
    partnerNicknames: {
      partnerOne: string;
      partnerTwo: string;
    };
  };
  loveStory: {
    narrative: string;
  };
  gift: {
    enabled: boolean;
    entries: InvitationGiftEntry[];
  };
  music: {
    source: InvitationMusicSource;
    presetId: string;
    mood: MusicPresetMood;
  };
  theme: TTheme;
};

export type ElegantLuxuryTemplateConfig = SharedTemplateConfig<ElegantLuxuryThemeConfig>;
export type KoreanSoftTemplateConfig = SharedTemplateConfig<KoreanSoftThemeConfig>;
export type ModernMinimalTemplateConfig = SharedTemplateConfig<ModernMinimalThemeConfig>;

export type InvitationTemplateConfigMap = {
  ELEGANT_LUXURY: ElegantLuxuryTemplateConfig;
  KOREAN_SOFT: KoreanSoftTemplateConfig;
  MODERN_MINIMAL: ModernMinimalTemplateConfig;
};

export type InvitationTemplateConfigValues =
  InvitationTemplateConfigMap[InvitationTemplate];

const giftTypeOptions: InvitationFormFieldOption[] = [
  { value: "bank", label: "Bank Transfer" },
  { value: "ewallet", label: "E-Wallet" },
];

const templateDefaultMood: Record<InvitationTemplate, MusicPresetMood> = {
  ELEGANT_LUXURY: "romantic",
  KOREAN_SOFT: "soft",
  MODERN_MINIMAL: "editorial",
};

const commonTemplateConfigDefaults = {
  copy: {
    partnerNicknames: {
      partnerOne: "",
      partnerTwo: "",
    },
  },
  loveStory: {
    narrative: "",
  },
  gift: {
    enabled: false,
    entries: [] as InvitationGiftEntry[],
  },
};

const templateThemeDefaults: {
  [Key in InvitationTemplate]: InvitationTemplateConfigMap[Key]["theme"];
} = {
  ELEGANT_LUXURY: {
    monogram: "",
    dresscode: "Formal attire",
    showFamilySection: true,
    formalIntroQuote:
      "Dengan penuh hormat, kami mengundang Anda untuk hadir pada hari berbahagia kami.",
  },
  KOREAN_SOFT: {
    floralStyle: "blush-petal",
    pastelVariant: "soft-rose",
    frameStyle: "rounded",
    greetingTone: "warm",
  },
  MODERN_MINIMAL: {
    typographyMode: "editorial-serif",
    monochromeStyle: "warm-gray",
    dividerStyle: "line",
    titleCasingMode: "title-case",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getBooleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function getGiftEntryValue(
  type: InvitationGiftEntryType,
  label: string,
  accountName: string,
  accountNumber: string,
  note: string,
) {
  if (!label.trim() || !accountName.trim() || !accountNumber.trim()) {
    return null;
  }

  return {
    type,
    label: label.trim(),
    accountName: accountName.trim(),
    accountNumber: accountNumber.trim(),
    note: note.trim(),
  } satisfies InvitationGiftEntry;
}

function createTemplateFieldSchema(field: InvitationFormFieldDefinition) {
  if (field.type === "checkbox") {
    return z.boolean();
  }

  if (field.type === "url") {
    return z.string().trim().url(`${field.label} tidak valid.`).optional().or(z.literal(""));
  }

  if (field.type === "select") {
    return z
      .string()
      .trim()
      .refine(
        (value) => field.options?.some((option) => option.value === value) ?? false,
        `${field.label} belum valid.`,
      );
  }

  return z
    .string()
    .trim()
    .min(field.minLength ?? 0, `${field.label} minimal ${field.minLength ?? 0} karakter.`)
    .max(field.maxLength ?? 240, `${field.label} terlalu panjang.`);
}

export const commonInvitationFormSections: InvitationFormSectionDefinition[] = [
  {
    id: "identity",
    title: "Identitas pasangan",
    description:
      "Nama pasangan, slug, dan nama panggilan menjadi fondasi route personal serta nada undangan.",
    fields: [
      {
        name: "partnerOneName",
        label: "Nama pengantin pria",
        type: "text",
        minLength: 2,
        maxLength: 80,
      },
      {
        name: "partnerTwoName",
        label: "Nama pengantin wanita",
        type: "text",
        minLength: 2,
        maxLength: 80,
      },
      {
        name: "partnerOneNickname",
        label: "Nama panggilan pria",
        type: "text",
        maxLength: 40,
        placeholder: "Opsional, mis. Adrian",
      },
      {
        name: "partnerTwoNickname",
        label: "Nama panggilan wanita",
        type: "text",
        maxLength: 40,
        placeholder: "Opsional, mis. Selma",
      },
      {
        name: "coupleSlug",
        label: "Slug pasangan",
        type: "text",
        minLength: 3,
        maxLength: 80,
        fullWidth: true,
        description: "Route publik akan mengikuti format /slug-pasangan/slug-tamu",
      },
    ],
  },
  {
    id: "event",
    title: "Acara utama",
    description:
      "Pilih jadwal acara utama lalu tentukan titik lokasi langsung dari peta agar tamu mendapat detail yang presisi.",
    fields: [
      {
        name: "eventLabel",
        label: "Nama acara",
        type: "text",
        minLength: 2,
        maxLength: 80,
      },
      {
        name: "eventDate",
        label: "Tanggal acara",
        type: "date",
      },
      {
        name: "eventTime",
        label: "Waktu acara",
        type: "time",
      },
    ],
  },
  {
    id: "story",
    title: "Cerita singkat pasangan",
    description:
      "Template akan mengurus opening copy, heading, dan closing. Anda cukup menambahkan love story singkat agar undangan tetap terasa personal.",
    fields: [
      {
        name: "loveStoryNarrative",
        label: "Love story",
        type: "textarea",
        rows: 5,
        maxLength: 800,
        fullWidth: true,
        placeholder: "Ceritakan singkat bagaimana perjalanan kalian sampai ke hari bahagia ini.",
      },
    ],
  },
  {
    id: "gift",
    title: "Wedding gift",
    description:
      "Untuk MVP, wedding gift memakai maksimal dua channel sederhana agar tetap mudah dipahami user awam.",
    fields: [
      {
        name: "weddingGiftEnabled",
        label: "Tampilkan section wedding gift",
        type: "checkbox",
        defaultValue: false,
        fullWidth: true,
      },
      {
        name: "giftPrimaryType",
        label: "Channel gift utama",
        type: "select",
        options: giftTypeOptions,
        defaultValue: "bank",
      },
      {
        name: "giftPrimaryLabel",
        label: "Label channel utama",
        type: "text",
        maxLength: 80,
        placeholder: "Contoh: BCA / OVO",
      },
      {
        name: "giftPrimaryAccountName",
        label: "Nama pemilik utama",
        type: "text",
        maxLength: 120,
      },
      {
        name: "giftPrimaryAccountNumber",
        label: "Nomor rekening / akun utama",
        type: "text",
        maxLength: 80,
      },
      {
        name: "giftPrimaryNote",
        label: "Catatan gift utama",
        type: "text",
        maxLength: 120,
        placeholder: "Opsional, mis. Konfirmasi setelah transfer",
        fullWidth: true,
      },
      {
        name: "giftSecondaryType",
        label: "Channel gift kedua",
        type: "select",
        options: giftTypeOptions,
        defaultValue: "ewallet",
      },
      {
        name: "giftSecondaryLabel",
        label: "Label channel kedua",
        type: "text",
        maxLength: 80,
        placeholder: "Opsional",
      },
      {
        name: "giftSecondaryAccountName",
        label: "Nama pemilik kedua",
        type: "text",
        maxLength: 120,
      },
      {
        name: "giftSecondaryAccountNumber",
        label: "Nomor rekening / akun kedua",
        type: "text",
        maxLength: 80,
      },
      {
        name: "giftSecondaryNote",
        label: "Catatan gift kedua",
        type: "text",
        maxLength: 120,
        placeholder: "Opsional",
        fullWidth: true,
      },
    ],
  },
  {
    id: "interaction",
    title: "Interaksi tamu",
    description:
      "Kontrol bagian invitation yang ingin ditampilkan saat tamu membuka link personal mereka.",
    fields: [
      {
        name: "isRsvpEnabled",
        label: "Aktifkan RSVP",
        type: "checkbox",
        defaultValue: true,
        description:
          "Jika dimatikan, section RSVP tetap muncul sebagai informasi tetapi form submit tidak ditampilkan.",
        fullWidth: true,
      },
    ],
  },
];

export const templateSpecificFormSections: Record<
  InvitationTemplate,
  InvitationFormSectionDefinition[]
> = {
  ELEGANT_LUXURY: [],
  KOREAN_SOFT: [],
  MODERN_MINIMAL: [],
};

export function getTemplateSpecificSections(template: InvitationTemplate) {
  return templateSpecificFormSections[template];
}

export function getTemplateSpecificFields(template: InvitationTemplate) {
  return getTemplateSpecificSections(template).flatMap((section) => section.fields);
}

export function getTemplateSpecificSchema(template: InvitationTemplate) {
  const shape = Object.fromEntries(
    getTemplateSpecificFields(template).map((field) => [field.name, createTemplateFieldSchema(field)]),
  );

  return z.object(shape);
}

function getStructuredTemplateDefaults<T extends InvitationTemplate>(
  template: T,
): InvitationTemplateConfigMap[T] {
  return {
    copy: {
      ...commonTemplateConfigDefaults.copy,
    },
    loveStory: {
      ...commonTemplateConfigDefaults.loveStory,
    },
    gift: {
      enabled: commonTemplateConfigDefaults.gift.enabled,
      entries: [],
    },
    music: {
      source: "preset",
      presetId: "",
      mood: templateDefaultMood[template],
    },
    theme: {
      ...templateThemeDefaults[template],
    },
  } as unknown as InvitationTemplateConfigMap[T];
}

export function normalizeTemplateConfig<T extends InvitationTemplate>(
  template: T,
  rawConfig: unknown,
): InvitationTemplateConfigMap[T] {
  const defaults = getStructuredTemplateDefaults(template);
  const defaultThemeRecord = defaults.theme as Record<string, string | boolean>;

  if (!isRecord(rawConfig)) {
    return defaults;
  }

  const copySource = isRecord(rawConfig.copy) ? rawConfig.copy : {};
  const nicknameSource = isRecord(copySource.partnerNicknames)
    ? copySource.partnerNicknames
    : {};
  const loveStorySource = isRecord(rawConfig.loveStory) ? rawConfig.loveStory : {};
  const giftSource = isRecord(rawConfig.gift) ? rawConfig.gift : {};
  const musicSource = isRecord(rawConfig.music) ? rawConfig.music : {};
  const themeSource = isRecord(rawConfig.theme) ? rawConfig.theme : rawConfig;
  const rawEntries = Array.isArray(giftSource.entries) ? giftSource.entries : [];

  const entries = rawEntries
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const type = entry.type === "ewallet" ? "ewallet" : "bank";
      const label = getStringValue(entry.label);
      const accountName = getStringValue(entry.accountName);
      const accountNumber = getStringValue(entry.accountNumber);
      const note = getStringValue(entry.note);

      return getGiftEntryValue(type, label, accountName, accountNumber, note);
    })
    .filter((entry): entry is InvitationGiftEntry => Boolean(entry));

  return {
    copy: {
      partnerNicknames: {
        partnerOne: getStringValue(
          nicknameSource.partnerOne,
          defaults.copy.partnerNicknames.partnerOne,
        ),
        partnerTwo: getStringValue(
          nicknameSource.partnerTwo,
          defaults.copy.partnerNicknames.partnerTwo,
        ),
      },
    },
    loveStory: {
      narrative: getStringValue(loveStorySource.narrative, defaults.loveStory.narrative),
    },
    gift: {
      enabled: getBooleanValue(giftSource.enabled, defaults.gift.enabled),
      entries,
    },
    music: {
      source:
        musicSource.source === "upload" || musicSource.source === "preset"
          ? musicSource.source
          : defaults.music.source,
      presetId: getStringValue(musicSource.presetId, defaults.music.presetId),
      mood:
        musicSource.mood === "romantic" ||
        musicSource.mood === "soft" ||
        musicSource.mood === "editorial"
          ? musicSource.mood
          : defaults.music.mood,
    },
    theme: getTemplateSpecificFields(template).reduce<InvitationTemplateConfigMap[T]["theme"]>(
      (acc, field) => {
        const key = field.name as keyof InvitationTemplateConfigMap[T]["theme"];
        const rawValue = themeSource[field.name];
        const fallbackValue = defaultThemeRecord[field.name];

        if (field.type === "checkbox") {
          acc[key] = getBooleanValue(rawValue, Boolean(fallbackValue)) as never;
          return acc;
        }

        acc[key] = getStringValue(rawValue, String(fallbackValue ?? "")) as never;
        return acc;
      },
      { ...defaults.theme },
    ),
  } as unknown as InvitationTemplateConfigMap[T];
}

export function extractTemplateSpecificFormValues<T extends InvitationTemplate>(
  template: T,
  formData: FormData,
): InvitationTemplateConfigMap[T]["theme"] {
  return getTemplateSpecificFields(template).reduce<InvitationTemplateConfigMap[T]["theme"]>(
    (acc, field) => {
      const key = field.name as keyof InvitationTemplateConfigMap[T]["theme"];

      if (field.type === "checkbox") {
        acc[key] = (formData.get(field.name) === "on") as never;
        return acc;
      }

      acc[key] = String(formData.get(field.name) ?? "").trim() as never;
      return acc;
    },
    { ...templateThemeDefaults[template] } as InvitationTemplateConfigMap[T]["theme"],
  );
}

function readOptionalText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function buildTemplateConfigFromSetupForm<T extends InvitationTemplate>(
  template: T,
  rawConfig: unknown,
  formData: FormData,
): InvitationTemplateConfigMap[T] {
  const normalized = normalizeTemplateConfig(template, rawConfig);
  const theme = {
    ...normalized.theme,
    ...extractTemplateSpecificFormValues(template, formData),
  };
  const giftEntries = [
    getGiftEntryValue(
      (readOptionalText(formData, "giftPrimaryType") as InvitationGiftEntryType) || "bank",
      readOptionalText(formData, "giftPrimaryLabel"),
      readOptionalText(formData, "giftPrimaryAccountName"),
      readOptionalText(formData, "giftPrimaryAccountNumber"),
      readOptionalText(formData, "giftPrimaryNote"),
    ),
    getGiftEntryValue(
      (readOptionalText(formData, "giftSecondaryType") as InvitationGiftEntryType) || "ewallet",
      readOptionalText(formData, "giftSecondaryLabel"),
      readOptionalText(formData, "giftSecondaryAccountName"),
      readOptionalText(formData, "giftSecondaryAccountNumber"),
      readOptionalText(formData, "giftSecondaryNote"),
    ),
  ].filter((entry): entry is InvitationGiftEntry => Boolean(entry));

  return {
    ...normalized,
    copy: {
      partnerNicknames: {
        partnerOne: readOptionalText(formData, "partnerOneNickname"),
        partnerTwo: readOptionalText(formData, "partnerTwoNickname"),
      },
    },
    loveStory: {
      narrative: readOptionalText(formData, "loveStoryNarrative"),
    },
    gift: {
      enabled: formData.get("weddingGiftEnabled") === "on",
      entries: giftEntries,
    },
    theme,
  } as InvitationTemplateConfigMap[T];
}

export function updateTemplateConfigMusicSelection<T extends InvitationTemplate>(
  template: T,
  rawConfig: unknown,
  values: {
    source: InvitationMusicSource;
    presetId?: string | null;
    mood?: MusicPresetMood | null;
  },
): InvitationTemplateConfigMap[T] {
  const normalized = normalizeTemplateConfig(template, rawConfig);

  return {
    ...normalized,
    music: {
      source: values.source,
      presetId: values.presetId ?? "",
      mood: values.mood ?? normalized.music.mood,
    },
  } as InvitationTemplateConfigMap[T];
}

export function getTemplateConfigSummaryEntries(
  template: InvitationTemplate,
  rawConfig: unknown,
) {
  const normalized = normalizeTemplateConfig(template, rawConfig);
  const nicknames = [
    normalized.copy.partnerNicknames.partnerOne,
    normalized.copy.partnerNicknames.partnerTwo,
  ]
    .filter(Boolean)
    .join(" & ");
  const musicPreset = getMusicPresetById(normalized.music.presetId);
  const musicSummary =
    normalized.music.source === "upload"
      ? "Upload manual"
      : musicPreset
        ? `${musicPreset.title} (${MUSIC_MOOD_LABELS[normalized.music.mood]})`
        : `Belum dipilih (${MUSIC_MOOD_LABELS[normalized.music.mood]})`;
  const templateToneLabels: Record<InvitationTemplate, string> = {
    ELEGANT_LUXURY: "Formal elegan",
    KOREAN_SOFT: "Lembut romantis",
    MODERN_MINIMAL: "Modern ringkas",
  };

  return [
    {
      id: "templateTone",
      label: "Tone Template",
      value: templateToneLabels[template],
    },
    {
      id: "nicknames",
      label: "Nama Panggilan",
      value: nicknames || "Pakai nama lengkap",
    },
    {
      id: "loveStory",
      label: "Love Story",
      value: normalized.loveStory.narrative.trim() ? "Sudah diisi" : "Pakai copy bawaan template",
    },
    {
      id: "weddingGift",
      label: "Wedding Gift",
      value: normalized.gift.enabled
        ? `${normalized.gift.entries.length} channel aktif`
        : "Nonaktif",
    },
    {
      id: "music",
      label: "Music",
      value: musicSummary,
    },
  ];
}
