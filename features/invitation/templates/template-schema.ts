import type { InvitationTemplate } from "@/lib/domain/types";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";

export type TemplateSchemaField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "time" | "url" | "checkbox";
  required: boolean;
};

const baseTemplateSchema: TemplateSchemaField[] = [
  {
    name: "partnerOneName",
    label: "Nama Pengantin Pria",
    type: "text",
    required: true,
  },
  {
    name: "partnerTwoName",
    label: "Nama Pengantin Wanita",
    type: "text",
    required: true,
  },
  {
    name: "coupleSlug",
    label: "Slug Pasangan",
    type: "text",
    required: true,
  },
  {
    name: "eventLabel",
    label: "Nama Acara",
    type: "text",
    required: true,
  },
  {
    name: "eventDate",
    label: "Tanggal Acara",
    type: "date",
    required: true,
  },
  {
    name: "eventTime",
    label: "Waktu Acara",
    type: "time",
    required: true,
  },
  {
    name: "placeName",
    label: "Nama Lokasi",
    type: "text",
    required: true,
  },
  {
    name: "formattedAddress",
    label: "Alamat Lengkap",
    type: "textarea",
    required: true,
  },
  {
    name: "loveStoryNarrative",
    label: "Cerita Singkat",
    type: "textarea",
    required: false,
  },
  {
    name: "isRsvpEnabled",
    label: "Aktifkan RSVP",
    type: "checkbox",
    required: false,
  },
];

export const TEMPLATE_SCHEMA_BY_TEMPLATE: Record<InvitationTemplate, TemplateSchemaField[]> = {
  ELEGANT_LUXURY: baseTemplateSchema,
  KOREAN_SOFT: baseTemplateSchema,
  MODERN_MINIMAL: baseTemplateSchema,
};

export function getTemplateSchema(template: InvitationTemplate) {
  return TEMPLATE_SCHEMA_BY_TEMPLATE[template];
}

export function getTemplateDisplayName(template: InvitationTemplate) {
  return TEMPLATE_OPTIONS.find((option) => option.id === template)?.label ?? template.replaceAll("_", " ");
}
