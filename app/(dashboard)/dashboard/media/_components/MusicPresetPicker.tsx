"use client";

import { useCallback, useMemo, useState } from "react";

import {
  getMusicPresetById,
  getMusicPresetsByMood,
  MUSIC_MOOD_LABELS,
  type MusicPresetMood,
} from "@/lib/constants/music-playlist";

type MusicPresetPickerProps = {
  defaultMood: MusicPresetMood;
  defaultPresetId: string;
};

export function MusicPresetPicker({
  defaultMood,
  defaultPresetId,
}: MusicPresetPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MusicPresetMood>(defaultMood);
  const [selectedPresetId, setSelectedPresetId] = useState(() => {
    const preset = getMusicPresetById(defaultPresetId);

    return preset?.mood === defaultMood ? defaultPresetId : "";
  });
  const visiblePresets = useMemo(() => getMusicPresetsByMood(selectedMood), [selectedMood]);

  const handleMoodSelect = useCallback((mood: MusicPresetMood) => {
    setSelectedMood(mood);

    const selectedPreset = getMusicPresetById(selectedPresetId);

    if (selectedPreset && selectedPreset.mood !== mood) {
      setSelectedPresetId("");
    }
  }, [selectedPresetId]);

  return (
    <section className="space-y-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)]/70 p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Playlist Bawaan
        </h3>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Pilih salah satu lagu pembuka bawaan berdasarkan mood. Jika Anda juga mengunggah lagu
          sendiri di bawah, file upload akan diprioritaskan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(MUSIC_MOOD_LABELS) as MusicPresetMood[]).map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => handleMoodSelect(mood)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              selectedMood === mood
                ? "bg-[var(--color-primary-strong)] text-white shadow-[var(--shadow-button)]"
                : "border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
            }`}
          >
            {MUSIC_MOOD_LABELS[mood]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedPresetId("")}
          className={`rounded-[1.5rem] border px-4 py-4 text-left ${
            selectedPresetId === ""
              ? "border-[var(--color-primary-strong)] bg-white shadow-[var(--shadow-soft)]"
              : "border-[var(--color-border)] bg-white"
          }`}
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Tanpa preset</p>
          <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
            Gunakan ini jika Anda ingin undangan tanpa musik atau hanya memakai upload manual.
          </p>
        </button>

        {visiblePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setSelectedPresetId(preset.id)}
            className={`rounded-[1.5rem] border px-4 py-4 text-left ${
              selectedPresetId === preset.id
                ? "border-[var(--color-primary-strong)] bg-white shadow-[var(--shadow-soft)]"
                : "border-[var(--color-border)] bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{preset.title}</p>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {preset.durationLabel}
              </span>
            </div>
            <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">
              {preset.description}
            </p>
            <audio controls preload="none" className="mt-3 w-full">
              <source src={preset.url} type={preset.mimeType} />
            </audio>
          </button>
        ))}
      </div>

      <input type="hidden" name="musicMood" value={selectedMood} />
      <input type="hidden" name="musicPresetId" value={selectedPresetId} />
    </section>
  );
}
