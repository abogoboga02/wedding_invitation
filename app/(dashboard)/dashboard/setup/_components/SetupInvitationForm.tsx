"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  commonInvitationFormSections,
  normalizeTemplateConfig,
  type InvitationFormFieldDefinition,
  type TemplateConfigFieldValue,
} from "@/features/invitation/form/config";
import {
  buildCommonInvitationSetupInput,
  commonInvitationSetupSchema,
  setupEventFieldGroups,
} from "@/features/invitation/invitation.schema";
import type { InvitationTemplate } from "@/lib/domain/types";
import { buildCoupleSlug } from "@/lib/utils/slug";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveSetupInvitationAction } from "../../_actions/dashboard-actions";
import { EventTimePicker } from "./EventTimePicker";
import { InvitationFormFieldRenderer } from "./InvitationFormFieldRenderer";
import { LocationPickerField, type LocationPickerValue } from "./LocationPickerField";

type SetupInvitationFormProps = {
  invitation: {
    template: InvitationTemplate;
    partnerOneName: string;
    partnerTwoName: string;
    coupleSlug: string;
    templateConfig: unknown;
    setupEventSnapshots: Array<{
      key?: string;
      label?: string;
      venueName?: string | null;
      address?: string | null;
      mapsUrl?: string | null;
      placeName?: string | null;
      formattedAddress?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      googleMapsUrl?: string | null;
      dateInput?: string;
      timeInput?: string;
    }>;
    setting?: {
      isRsvpEnabled: boolean;
      timezone?: string;
    } | null;
  };
};

type SetupFormErrors = Record<string, string>;
type SetupFormValues = Record<string, TemplateConfigFieldValue>;
type SetupEventKey = (typeof setupEventFieldGroups)[number]["key"];
type SetupLocationValues = Record<SetupEventKey, LocationPickerValue>;

const initialState: DashboardActionState = {};
const sectionClassName =
  "rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6";
const nestedCardClassName =
  "rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)]/55 p-4 sm:p-5";
const socialPlatformOptions = [
  { value: "", label: "Tanpa akun sosial" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
] satisfies Array<{ value: string; label: string }>;
const defaultEventLabels: Record<SetupEventKey, string> = {
  eventOne: "Akad Nikah",
  eventTwo: "",
  eventThree: "",
};
const optionalEventKeys = new Set<SetupEventKey>(["eventTwo", "eventThree"]);

function getCommonSection(sectionId: string) {
  const section = commonInvitationFormSections.find((item) => item.id === sectionId);

  if (!section) {
    throw new Error(`Common invitation form section "${sectionId}" tidak ditemukan.`);
  }

  return section;
}

const partnerSections: Array<{
  id: "partnerOne" | "partnerTwo";
  title: string;
  eyebrow: string;
  fields: InvitationFormFieldDefinition[];
}> = [
  {
    id: "partnerOne",
    title: "Pengantin 1",
    eyebrow: "Profil mempelai",
    fields: [
      {
        name: "partnerOneName",
        label: "Nama lengkap",
        type: "text",
        minLength: 2,
        maxLength: 80,
        fullWidth: true,
      },
      {
        name: "partnerOneParentLine",
        label: "Keterangan keluarga",
        type: "text",
        maxLength: 140,
        fullWidth: true,
        placeholder: "Contoh: Putri Kedua dari Bapak Santoso & Ibu Arsih",
      },
      {
        name: "partnerOneSocialPlatform",
        label: "Platform sosial",
        type: "select",
        defaultValue: "",
        options: socialPlatformOptions,
      },
      {
        name: "partnerOneSocialHandle",
        label: "Username sosial",
        type: "text",
        maxLength: 120,
        placeholder: "Contoh: annisarahma tanpa @",
      },
    ],
  },
  {
    id: "partnerTwo",
    title: "Pengantin 2",
    eyebrow: "Profil mempelai",
    fields: [
      {
        name: "partnerTwoName",
        label: "Nama lengkap",
        type: "text",
        minLength: 2,
        maxLength: 80,
        fullWidth: true,
      },
      {
        name: "partnerTwoParentLine",
        label: "Keterangan keluarga",
        type: "text",
        maxLength: 140,
        fullWidth: true,
        placeholder: "Contoh: Putra Pertama dari Bapak Rahmat & Ibu Sari",
      },
      {
        name: "partnerTwoSocialPlatform",
        label: "Platform sosial",
        type: "select",
        defaultValue: "",
        options: socialPlatformOptions,
      },
      {
        name: "partnerTwoSocialHandle",
        label: "Username sosial",
        type: "text",
        maxLength: 120,
        placeholder: "Contoh: bagaswedding tanpa @",
      },
    ],
  },
];

const storyFields: InvitationFormFieldDefinition[] = [
  {
    name: "loveStoryFirstMeeting",
    label: "Awal perkenalan",
    type: "textarea",
    rows: 4,
    minLength: 1,
    maxLength: 400,
    fullWidth: true,
    placeholder: "Ceritakan awal kalian saling mengenal.",
  },
  {
    name: "loveStoryProposal",
    label: "Proses lamaran",
    type: "textarea",
    rows: 4,
    minLength: 1,
    maxLength: 400,
    fullWidth: true,
    placeholder: "Ceritakan momen saat hubungan kalian menuju tahap yang lebih serius.",
  },
  {
    name: "loveStoryWedding",
    label: "Hari bahagia",
    type: "textarea",
    rows: 4,
    minLength: 1,
    maxLength: 400,
    fullWidth: true,
    placeholder: "Ceritakan suasana yang ingin dikenang menuju hari pernikahan kalian.",
  },
];

const eventFieldDefinitions = setupEventFieldGroups.reduce<
  Record<SetupEventKey, InvitationFormFieldDefinition[]>
>((acc, group) => {
  acc[group.key] = [
    {
      name: group.fields.label,
      label: "Nama acara",
      type: "text",
      minLength: 2,
      maxLength: 80,
      placeholder: group.isRequired ? "Contoh: Akad Nikah" : "Contoh: Resepsi Rumah Mempelai",
    },
    {
      name: group.fields.date,
      label: "Tanggal acara",
      type: "date",
    },
    {
      name: group.fields.time,
      label: "Jam acara",
      type: "time",
    },
  ];

  return acc;
}, {} as Record<SetupEventKey, InvitationFormFieldDefinition[]>);

function buildSetupFormValues(invitation: SetupInvitationFormProps["invitation"]): SetupFormValues {
  const normalizedTemplateConfig = normalizeTemplateConfig(
    invitation.template,
    invitation.templateConfig,
  );
  const primaryGift = normalizedTemplateConfig.gift.entries[0];
  const secondaryGift = normalizedTemplateConfig.gift.entries[1];
  const partnerProfiles = normalizedTemplateConfig.copy.partnerProfiles;
  const values: SetupFormValues = {
    partnerOneName: invitation.partnerOneName ?? "",
    partnerOneParentLine: partnerProfiles.partnerOne.parentLine ?? "",
    partnerOneSocialPlatform: partnerProfiles.partnerOne.socialPlatform ?? "",
    partnerOneSocialHandle: partnerProfiles.partnerOne.socialHandle ?? "",
    partnerTwoName: invitation.partnerTwoName ?? "",
    partnerTwoParentLine: partnerProfiles.partnerTwo.parentLine ?? "",
    partnerTwoSocialPlatform: partnerProfiles.partnerTwo.socialPlatform ?? "",
    partnerTwoSocialHandle: partnerProfiles.partnerTwo.socialHandle ?? "",
    coupleSlug: invitation.coupleSlug ?? "",
    loveStoryFirstMeeting: normalizedTemplateConfig.loveStory.firstMeeting ?? "",
    loveStoryProposal: normalizedTemplateConfig.loveStory.proposal ?? "",
    loveStoryWedding: normalizedTemplateConfig.loveStory.wedding ?? "",
    weddingGiftEnabled: normalizedTemplateConfig.gift.enabled ?? false,
    giftPrimaryType: primaryGift?.type ?? "bank",
    giftPrimaryLabel: primaryGift?.label ?? "",
    giftPrimaryAccountName: primaryGift?.accountName ?? "",
    giftPrimaryAccountNumber: primaryGift?.accountNumber ?? "",
    giftPrimaryNote: primaryGift?.note ?? "",
    giftSecondaryType: secondaryGift?.type ?? "ewallet",
    giftSecondaryLabel: secondaryGift?.label ?? "",
    giftSecondaryAccountName: secondaryGift?.accountName ?? "",
    giftSecondaryAccountNumber: secondaryGift?.accountNumber ?? "",
    giftSecondaryNote: secondaryGift?.note ?? "",
    isRsvpEnabled: invitation.setting?.isRsvpEnabled ?? true,
  };

  for (const [index, group] of setupEventFieldGroups.entries()) {
    const snapshot = invitation.setupEventSnapshots[index];
    values[group.fields.label] = snapshot?.label ?? defaultEventLabels[group.key];
    values[group.fields.date] = snapshot?.dateInput ?? "";
    values[group.fields.time] = snapshot?.timeInput ?? "";
  }

  return values;
}

function buildLocationValues(
  invitation: SetupInvitationFormProps["invitation"],
): SetupLocationValues {
  return setupEventFieldGroups.reduce<SetupLocationValues>((acc, group, index) => {
    const snapshot = invitation.setupEventSnapshots[index];

    acc[group.key] = {
      placeName: snapshot?.placeName ?? snapshot?.venueName ?? "",
      formattedAddress: snapshot?.formattedAddress ?? snapshot?.address ?? "",
      latitude: typeof snapshot?.latitude === "number" ? snapshot.latitude : null,
      longitude: typeof snapshot?.longitude === "number" ? snapshot.longitude : null,
      googleMapsUrl: snapshot?.googleMapsUrl ?? snapshot?.mapsUrl ?? null,
    };

    return acc;
  }, {} as SetupLocationValues);
}

function hasVisibleEventData(
  key: SetupEventKey,
  formValues: SetupFormValues,
  locationValues: SetupLocationValues,
) {
  const group = setupEventFieldGroups.find((item) => item.key === key);

  if (!group) {
    return false;
  }

  return Boolean(
    String(formValues[group.fields.label] ?? "").trim() ||
      String(formValues[group.fields.date] ?? "").trim() ||
      String(formValues[group.fields.time] ?? "").trim() ||
      locationValues[key].placeName.trim() ||
      locationValues[key].formattedAddress.trim() ||
      locationValues[key].googleMapsUrl?.trim(),
  );
}

function getInitialVisibleEventCount(
  formValues: SetupFormValues,
  locationValues: SetupLocationValues,
) {
  if (hasVisibleEventData("eventThree", formValues, locationValues)) {
    return 3;
  }

  if (hasVisibleEventData("eventTwo", formValues, locationValues)) {
    return 2;
  }

  return 1;
}

function hasSecondaryGiftData(formValues: SetupFormValues) {
  return Boolean(
    String(formValues.giftSecondaryLabel ?? "").trim() ||
      String(formValues.giftSecondaryAccountName ?? "").trim() ||
      String(formValues.giftSecondaryAccountNumber ?? "").trim() ||
      String(formValues.giftSecondaryNote ?? "").trim(),
  );
}

function clearFieldErrors(currentErrors: SetupFormErrors, fieldNames: readonly string[]) {
  let hasChanges = false;
  const nextErrors = { ...currentErrors };

  for (const fieldName of fieldNames) {
    if (fieldName in nextErrors) {
      delete nextErrors[fieldName];
      hasChanges = true;
    }
  }

  return hasChanges ? nextErrors : currentErrors;
}

function getLocationFieldNames(key: SetupEventKey) {
  const group = setupEventFieldGroups.find((item) => item.key === key);

  if (!group) {
    throw new Error(`Konfigurasi event "${key}" tidak ditemukan.`);
  }

  return [
    group.fields.placeName,
    group.fields.formattedAddress,
    group.fields.latitude,
    group.fields.longitude,
    group.fields.googleMapsUrl,
  ] as const;
}

function getLocationError(
  errors: SetupFormErrors,
  key: SetupEventKey,
) {
  const group = setupEventFieldGroups.find((item) => item.key === key);

  if (!group) {
    return undefined;
  }

  return (
    errors[group.fields.placeName] ??
    errors[group.fields.formattedAddress] ??
    errors[group.fields.latitude] ??
    errors[group.fields.longitude] ??
    errors[group.fields.googleMapsUrl]
  );
}

export function SetupInvitationForm({ invitation }: SetupInvitationFormProps) {
  const initialFormValues = useMemo(() => buildSetupFormValues(invitation), [invitation]);
  const initialLocationValues = useMemo(() => buildLocationValues(invitation), [invitation]);
  const invitationResetKey = useMemo(
    () =>
      JSON.stringify({
        formValues: initialFormValues,
        locationValues: initialLocationValues,
      }),
    [initialFormValues, initialLocationValues],
  );

  return (
    <SetupInvitationFormEditor
      key={invitationResetKey}
      initialFormValues={initialFormValues}
      initialLocationValues={initialLocationValues}
    />
  );
}

type SetupInvitationFormEditorProps = {
  initialFormValues: SetupFormValues;
  initialLocationValues: SetupLocationValues;
};

function SetupInvitationFormEditor({
  initialFormValues,
  initialLocationValues,
}: SetupInvitationFormEditorProps) {
  const [state, formAction] = useActionState(saveSetupInvitationAction, initialState);
  const [errors, setErrors] = useState<SetupFormErrors>({});
  const [formValues, setFormValues] = useState<SetupFormValues>(initialFormValues);
  const [locationValues, setLocationValues] = useState<SetupLocationValues>(initialLocationValues);
  const [visibleEventCount, setVisibleEventCount] = useState(() =>
    getInitialVisibleEventCount(initialFormValues, initialLocationValues),
  );
  const [isSecondaryGiftVisible, setIsSecondaryGiftVisible] = useState(() =>
    hasSecondaryGiftData(initialFormValues),
  );
  const [hasPendingSlugDraft, setHasPendingSlugDraft] = useState(false);
  const giftFields = useMemo(() => getCommonSection("gift").fields, []);
  const interactionFields = useMemo(() => getCommonSection("interaction").fields, []);
  const giftToggleField = useMemo(
    () => giftFields.find((field) => field.name === "weddingGiftEnabled"),
    [giftFields],
  );
  const primaryGiftFields = useMemo(
    () => giftFields.filter((field) => field.name.startsWith("giftPrimary")),
    [giftFields],
  );
  const secondaryGiftFields = useMemo(
    () => giftFields.filter((field) => field.name.startsWith("giftSecondary")),
    [giftFields],
  );
  const effectiveCoupleSlug =
    !hasPendingSlugDraft && state.nextCoupleSlug
      ? state.nextCoupleSlug
      : String(formValues.coupleSlug ?? "");

  function handleFieldChange(fieldName: string, value: TemplateConfigFieldValue) {
    if (fieldName === "partnerOneName" || fieldName === "partnerTwoName") {
      setHasPendingSlugDraft(true);
    }

    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [fieldName]: value,
      };

      if (fieldName === "partnerOneName" || fieldName === "partnerTwoName") {
        nextValues.coupleSlug = buildCoupleSlug(
          String(nextValues.partnerOneName ?? ""),
          String(nextValues.partnerTwoName ?? ""),
        );
      }

      return nextValues;
    });
    setErrors((currentErrors) => clearFieldErrors(currentErrors, [fieldName]));
  }

  function handleLocationChange(key: SetupEventKey, value: LocationPickerValue) {
    setLocationValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setErrors((currentErrors) => clearFieldErrors(currentErrors, getLocationFieldNames(key)));
  }

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextErrors: SetupFormErrors = {};

        const parsedCommon = commonInvitationSetupSchema.safeParse(
          buildCommonInvitationSetupInput(formData),
        );

        if (!parsedCommon.success) {
          const fieldErrors = parsedCommon.error.flatten().fieldErrors;

          for (const [field, message] of Object.entries(fieldErrors)) {
            if (message?.[0]) {
              nextErrors[field] = message[0];
            }
          }
        }

        if (Object.keys(nextErrors).length > 0) {
          event.preventDefault();
          setErrors(nextErrors);
          return;
        }

        setHasPendingSlugDraft(false);
        setErrors({});
      }}
    >
      {state.error ? (
        <p className="rounded-[1.35rem] border border-[rgba(181,87,99,0.22)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[1.35rem] border border-[rgba(79,123,98,0.18)] bg-[rgba(79,123,98,0.08)] px-4 py-3 text-sm text-[var(--color-success)]">
          {state.success}
        </p>
      ) : null}

      <section className={sectionClassName}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Pasangan & identitas undangan
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Isi dua profil mempelai terlebih dahulu. Slug undangan akan mengikuti nama pasangan
            secara otomatis.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {partnerSections.map((section) => (
            <article key={section.id} className={nestedCardClassName}>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                  {section.eyebrow}
                </p>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {section.title}
                </h3>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <InvitationFormFieldRenderer
                    key={field.name}
                    field={field}
                    value={
                      formValues[field.name] ??
                      (field.type === "checkbox" ? false : field.defaultValue ?? "")
                    }
                    error={errors[field.name]}
                    onValueChange={handleFieldChange}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              URL slug undangan
            </span>
            <div className="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                /{effectiveCoupleSlug}
              </p>
              <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
                Slug ini otomatis mengikuti nama pasangan. Jika nama berubah, URL publik juga ikut
                menyesuaikan.
              </p>
            </div>
            <input type="hidden" name="coupleSlug" value={effectiveCoupleSlug} />
            {errors.coupleSlug ? (
              <p className="text-sm text-[var(--color-error)]">{errors.coupleSlug}</p>
            ) : null}
          </label>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Rangkaian acara
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Acara pertama wajib diisi. Acara berikutnya bisa ditambahkan satu per satu hanya kalau
            memang diperlukan.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {setupEventFieldGroups.slice(0, visibleEventCount).map((group, index) => (
            <article key={group.key} className={nestedCardClassName}>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                      {group.title}
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                      {group.isRequired ? "Wajib" : "Tambahan"}
                    </span>
                  </div>
                  {optionalEventKeys.has(group.key) ? (
                    <button
                      type="button"
                      onClick={() => setVisibleEventCount(index)}
                      className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary-strong)] hover:text-[var(--color-text-primary)]"
                    >
                      Hapus acara ini
                    </button>
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {group.description}
                </p>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1.25fr]">
                {eventFieldDefinitions[group.key]
                  .filter((field) => field.name !== group.fields.time)
                  .map((field) => (
                  <InvitationFormFieldRenderer
                    key={field.name}
                    field={field}
                    value={formValues[field.name] ?? field.defaultValue ?? ""}
                    error={errors[field.name]}
                    onValueChange={handleFieldChange}
                  />
                ))}
                <div className="xl:col-span-3">
                  <EventTimePicker
                    name={group.fields.time}
                    label="Jam acara"
                    value={String(formValues[group.fields.time] ?? "")}
                    error={errors[group.fields.time]}
                    onValueChange={(fieldName, value) => handleFieldChange(fieldName, value)}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                <LocationPickerField
                  embedded
                  title={`Lokasi ${group.title.toLowerCase()}`}
                  description="Cari lokasi, pilih titik peta, lalu sistem akan menyimpan nama tempat, alamat lengkap, koordinat, dan tautan Google Maps secara otomatis."
                  fieldNames={{
                    placeName: group.fields.placeName,
                    formattedAddress: group.fields.formattedAddress,
                    latitude: group.fields.latitude,
                    longitude: group.fields.longitude,
                    googleMapsUrl: group.fields.googleMapsUrl,
                  }}
                  value={locationValues[group.key]}
                  onChange={(value) => handleLocationChange(group.key, value)}
                  error={getLocationError(errors, group.key)}
                />
              </div>
            </article>
          ))}

          {visibleEventCount < setupEventFieldGroups.length ? (
            <button
              type="button"
              onClick={() => setVisibleEventCount((currentValue) => currentValue + 1)}
              className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary-strong)]"
            >
              Tambah {setupEventFieldGroups[visibleEventCount]?.title.toLowerCase()}
            </button>
          ) : null}
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Cerita cinta
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Tiga momen ini akan menjadi rangkaian cerita utama di undangan: awal perkenalan, proses
            lamaran, dan hari bahagia kalian.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          {storyFields.map((field) => (
            <InvitationFormFieldRenderer
              key={field.name}
              field={field}
              value={formValues[field.name] ?? field.defaultValue ?? ""}
              error={errors[field.name]}
              onValueChange={handleFieldChange}
            />
          ))}
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Wedding gift
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Struktur gift tetap sama. Aktifkan bila ingin menampilkan detail transfer atau e-wallet
            pada undangan.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {giftToggleField ? (
            <InvitationFormFieldRenderer
              field={giftToggleField}
              value={Boolean(formValues[giftToggleField.name] ?? giftToggleField.defaultValue ?? false)}
              error={errors[giftToggleField.name]}
              onValueChange={handleFieldChange}
            />
          ) : null}

          <div className={nestedCardClassName}>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Channel gift utama
              </h3>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Channel pertama selalu tersedia kalau section gift diaktifkan.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {primaryGiftFields.map((field) => (
                <InvitationFormFieldRenderer
                  key={field.name}
                  field={field}
                  value={formValues[field.name] ?? (field.type === "checkbox" ? false : field.defaultValue ?? "")}
                  error={errors[field.name]}
                  onValueChange={handleFieldChange}
                />
              ))}
            </div>
          </div>

          {isSecondaryGiftVisible ? (
            <div className={nestedCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    Channel gift kedua
                  </h3>
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    Maksimal dua rekening atau akun gift dalam satu undangan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSecondaryGiftVisible(false)}
                  className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary-strong)] hover:text-[var(--color-text-primary)]"
                >
                  Hapus channel kedua
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {secondaryGiftFields.map((field) => (
                  <InvitationFormFieldRenderer
                    key={field.name}
                    field={field}
                    value={formValues[field.name] ?? (field.type === "checkbox" ? false : field.defaultValue ?? "")}
                    error={errors[field.name]}
                    onValueChange={handleFieldChange}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSecondaryGiftVisible(true)}
              className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary-strong)]"
            >
              Tambah channel gift kedua
            </button>
          )}
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Ucapan & doa
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Bagian akhir undangan akan menampilkan form nama, konfirmasi kehadiran, dan teks
            ucapan. Di sini Anda cukup menentukan apakah form itu aktif.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {interactionFields.map((field) => (
            <InvitationFormFieldRenderer
              key={field.name}
              field={field}
              value={
                formValues[field.name] ??
                (field.type === "checkbox" ? false : field.defaultValue ?? "")
              }
              error={errors[field.name]}
              onValueChange={handleFieldChange}
            />
          ))}
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Saat aktif, tamu akan melihat form yang lebih ringkas: nama responden, status kehadiran,
          lalu ucapan atau doa untuk kedua mempelai.
        </div>
      </section>

      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
        Template akan otomatis mengatur copy pembuka, heading section, dan penutup. Visual pembuka
        nanti dipilih otomatis dari galeri yang Anda unggah di halaman media, jadi form setup ini
        bisa tetap fokus pada struktur undangan.
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SubmitButton
            pendingLabel="Menyimpan draft..."
            className="button-primary rounded-full px-6 py-3.5 text-sm font-semibold"
          >
            Simpan Draft
          </SubmitButton>
          <Link
            href="/dashboard/preview"
            className="button-secondary inline-flex justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
          >
            Lihat Preview
          </Link>
          <Link
            href="/dashboard/media"
            className="button-secondary inline-flex justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
          >
            Kelola Media
          </Link>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Simpan dulu agar perubahan langsung terlihat di halaman preview.
        </p>
      </div>
    </form>
  );
}
