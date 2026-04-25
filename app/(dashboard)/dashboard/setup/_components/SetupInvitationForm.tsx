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
} from "@/features/invitation/invitation.schema";
import type { InvitationTemplate } from "@/lib/domain/types";
import { toDateTimeLocalValue } from "@/lib/utils/date";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveSetupInvitationAction } from "../../_actions/dashboard-actions";
import { InvitationFormFieldRenderer } from "./InvitationFormFieldRenderer";
import { LocationPickerField, type LocationPickerValue } from "./LocationPickerField";

type SetupInvitationFormProps = {
  invitation: {
    template: InvitationTemplate;
    partnerOneName: string;
    partnerTwoName: string;
    coupleSlug: string;
    templateConfig: unknown;
    eventSlots: Array<{
      label: string;
      startsAt: Date;
      venueName: string | null;
      address: string | null;
      mapsUrl: string | null;
      placeName: string | null;
      formattedAddress: string | null;
      latitude: number | null;
      longitude: number | null;
      googleMapsUrl: string | null;
    }>;
    setting?: {
      isRsvpEnabled: boolean;
    } | null;
  };
};

type SetupFormErrors = Record<string, string>;
type SetupFormValues = Record<string, TemplateConfigFieldValue>;
type SetupSectionDefinition = {
  id: string;
  title: string;
  description: string;
  fields: InvitationFormFieldDefinition[];
  includesLocationPicker?: boolean;
};

const initialState: DashboardActionState = {};
const locationFieldNames = [
  "placeName",
  "formattedAddress",
  "latitude",
  "longitude",
  "googleMapsUrl",
] as const;

function getCommonSection(sectionId: string) {
  const section = commonInvitationFormSections.find((item) => item.id === sectionId);

  if (!section) {
    throw new Error(`Common invitation form section "${sectionId}" tidak ditemukan.`);
  }

  return section;
}

const coreSetupSections: SetupSectionDefinition[] = [
  {
    id: "identity",
    title: "Pasangan & link undangan",
    description:
      "Isi nama pasangan, nama panggilan, dan slug yang akan dipakai pada link undangan tamu.",
    fields: getCommonSection("identity").fields,
  },
  {
    id: "event",
    title: "Jadwal & lokasi acara",
    description:
      "Tentukan nama acara, tanggal, jam, lalu pilih titik lokasi agar tamu mendapat alamat yang jelas.",
    fields: getCommonSection("event").fields,
    includesLocationPicker: true,
  },
  {
    id: "story",
    title: "Cerita singkat",
    description:
      "Copy utama akan otomatis mengikuti template. Anda cukup mengisi cerita singkat agar undangan tetap terasa personal.",
    fields: getCommonSection("story").fields,
  },
  {
    id: "interaction",
    title: "Gift & RSVP",
    description:
      "Atur informasi hadiah dan tentukan apakah tamu bisa langsung mengirim RSVP dari link mereka.",
    fields: [...getCommonSection("gift").fields, ...getCommonSection("interaction").fields],
  },
];

function buildSetupFormValues(invitation: SetupInvitationFormProps["invitation"]): SetupFormValues {
  const mainEvent = invitation.eventSlots[0];
  const normalizedTemplateConfig = normalizeTemplateConfig(
    invitation.template,
    invitation.templateConfig,
  );
  const initialDateTime = mainEvent ? toDateTimeLocalValue(mainEvent.startsAt) : "";
  const [eventDate = "", eventTime = ""] = initialDateTime.split("T");
  const primaryGift = normalizedTemplateConfig.gift.entries[0];
  const secondaryGift = normalizedTemplateConfig.gift.entries[1];

  return {
    partnerOneName: invitation.partnerOneName ?? "",
    partnerTwoName: invitation.partnerTwoName ?? "",
    partnerOneNickname: normalizedTemplateConfig.copy.partnerNicknames.partnerOne ?? "",
    partnerTwoNickname: normalizedTemplateConfig.copy.partnerNicknames.partnerTwo ?? "",
    coupleSlug: invitation.coupleSlug ?? "",
    eventLabel: mainEvent?.label ?? "Akad & Resepsi",
    eventDate,
    eventTime,
    loveStoryNarrative: normalizedTemplateConfig.loveStory.narrative ?? "",
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
}

function buildLocationValue(invitation: SetupInvitationFormProps["invitation"]): LocationPickerValue {
  const mainEvent = invitation.eventSlots[0];

  return {
    placeName: mainEvent?.placeName ?? mainEvent?.venueName ?? "",
    formattedAddress: mainEvent?.formattedAddress ?? mainEvent?.address ?? "",
    latitude: typeof mainEvent?.latitude === "number" ? mainEvent.latitude : null,
    longitude: typeof mainEvent?.longitude === "number" ? mainEvent.longitude : null,
    googleMapsUrl: mainEvent?.googleMapsUrl ?? mainEvent?.mapsUrl ?? null,
  };
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

export function SetupInvitationForm({ invitation }: SetupInvitationFormProps) {
  const initialFormValues = useMemo(() => buildSetupFormValues(invitation), [invitation]);
  const initialLocationValue = useMemo(() => buildLocationValue(invitation), [invitation]);
  const invitationResetKey = useMemo(
    () =>
      JSON.stringify({
        formValues: initialFormValues,
        locationValue: initialLocationValue,
      }),
    [initialFormValues, initialLocationValue],
  );

  return (
    <SetupInvitationFormEditor
      key={invitationResetKey}
      initialFormValues={initialFormValues}
      initialLocationValue={initialLocationValue}
    />
  );
}

type SetupInvitationFormEditorProps = {
  initialFormValues: SetupFormValues;
  initialLocationValue: LocationPickerValue;
};

function SetupInvitationFormEditor({
  initialFormValues,
  initialLocationValue,
}: SetupInvitationFormEditorProps) {
  const [state, formAction] = useActionState(saveSetupInvitationAction, initialState);
  const [errors, setErrors] = useState<SetupFormErrors>({});
  const [formValues, setFormValues] = useState<SetupFormValues>(initialFormValues);
  const [locationValue, setLocationValue] = useState<LocationPickerValue>(initialLocationValue);
  const sectionClassName =
    "rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6";

  function handleFieldChange(fieldName: string, value: TemplateConfigFieldValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
    setErrors((currentErrors) => clearFieldErrors(currentErrors, [fieldName]));
  }

  function handleLocationChange(value: LocationPickerValue) {
    setLocationValue(value);
    setErrors((currentErrors) => clearFieldErrors(currentErrors, locationFieldNames));
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

      {coreSetupSections.map((section) => (
        <section key={section.id} className={sectionClassName}>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {section.title}
            </h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              {section.description}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
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

          {section.includesLocationPicker ? (
            <div className="mt-5 border-t border-[var(--color-border)] pt-5">
              <LocationPickerField
                embedded
                value={locationValue}
                onChange={handleLocationChange}
                error={
                  errors.placeName ??
                  errors.formattedAddress ??
                  errors.latitude ??
                  errors.longitude ??
                  errors.googleMapsUrl
                }
              />
            </div>
          ) : null}
        </section>
      ))}

      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
        Template akan otomatis mengatur opening copy, heading tiap section, CTA, dan closing note.
        Setelah data inti tersimpan, Anda bisa lanjut mengatur cover, galeri, dan musik dari
        halaman media tanpa mengulang isi form ini.
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
