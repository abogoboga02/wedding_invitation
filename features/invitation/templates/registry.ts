import { ElegantLuxuryTemplate } from "./elegant-luxury/ElegantLuxuryTemplate";
import { KoreanSoftTemplate } from "./korean-soft/KoreanSoftTemplate";
import { ModernMinimalTemplate } from "./modern-minimal/ModernMinimalTemplate";
import {
  DEFAULT_INVITATION_TEMPLATE,
  getInvitationTemplateBySlug,
  getInvitationTemplateSlug,
  resolveInvitationTemplate,
} from "./template-slugs";
import type { TemplateRegistryItem } from "./types";

export const templateRegistry: TemplateRegistryItem[] = [
  {
    id: "ELEGANT_LUXURY",
    slug: getInvitationTemplateSlug("ELEGANT_LUXURY"),
    label: "Elegant Luxury",
    Component: ElegantLuxuryTemplate,
  },
  {
    id: "KOREAN_SOFT",
    slug: getInvitationTemplateSlug("KOREAN_SOFT"),
    label: "Korean Soft",
    Component: KoreanSoftTemplate,
  },
  {
    id: "MODERN_MINIMAL",
    slug: getInvitationTemplateSlug("MODERN_MINIMAL"),
    label: "Modern Minimal",
    Component: ModernMinimalTemplate,
  },
];

const templateComponentsById = Object.fromEntries(
  templateRegistry.map((template) => [template.id, template.Component]),
) as Record<TemplateRegistryItem["id"], TemplateRegistryItem["Component"]>;

export function getTemplateComponent(
  templateId: TemplateRegistryItem["id"] | string | null | undefined,
) {
  return (
    templateComponentsById[resolveInvitationTemplate(templateId)] ??
    templateComponentsById[DEFAULT_INVITATION_TEMPLATE]
  );
}

export function getTemplateComponentBySlug(templateSlug: string | null | undefined) {
  return getTemplateComponent(getInvitationTemplateBySlug(templateSlug));
}
