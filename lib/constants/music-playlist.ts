export type MusicPresetMood = "romantic" | "soft" | "editorial";

export type MusicPreset = {
  id: string;
  title: string;
  mood: MusicPresetMood;
  description: string;
  durationLabel: string;
  url: string;
  mimeType: string;
};

export const MUSIC_MOOD_LABELS: Record<MusicPresetMood, string> = {
  romantic: "Romantic Glow",
  soft: "Soft Serenity",
  editorial: "Editorial Calm",
};

export const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: "romantic-dawn",
    title: "Romantic Dawn",
    mood: "romantic",
    description: "Nuansa hangat untuk pembuka undangan yang terasa manis dan personal.",
    durationLabel: "0:18",
    url: "/audio/playlist/romantic-dawn.wav",
    mimeType: "audio/wav",
  },
  {
    id: "garden-vows",
    title: "Garden Vows",
    mood: "romantic",
    description: "Piano ringan dengan ritme lembut untuk suasana intimate.",
    durationLabel: "0:18",
    url: "/audio/playlist/garden-vows.wav",
    mimeType: "audio/wav",
  },
  {
    id: "soft-blossom",
    title: "Soft Blossom",
    mood: "soft",
    description: "Warna audio yang airy dan tenang untuk template bernuansa pastel.",
    durationLabel: "0:18",
    url: "/audio/playlist/soft-blossom.wav",
    mimeType: "audio/wav",
  },
  {
    id: "morning-petal",
    title: "Morning Petal",
    mood: "soft",
    description: "Pilihan aman untuk undangan yang ingin terasa lembut tanpa berlebihan.",
    durationLabel: "0:18",
    url: "/audio/playlist/morning-petal.wav",
    mimeType: "audio/wav",
  },
  {
    id: "editorial-muse",
    title: "Editorial Muse",
    mood: "editorial",
    description: "Nada minimal dan bersih untuk tampilan yang lebih modern dan tegas.",
    durationLabel: "0:18",
    url: "/audio/playlist/editorial-muse.wav",
    mimeType: "audio/wav",
  },
  {
    id: "midnight-lines",
    title: "Midnight Lines",
    mood: "editorial",
    description: "Tone netral dengan karakter kontemporer untuk template monokrom.",
    durationLabel: "0:18",
    url: "/audio/playlist/midnight-lines.wav",
    mimeType: "audio/wav",
  },
];

export function getMusicPresetById(presetId?: string | null) {
  if (!presetId) {
    return null;
  }

  return MUSIC_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export function getMusicPresetsByMood(mood: MusicPresetMood) {
  return MUSIC_PRESETS.filter((preset) => preset.mood === mood);
}
