import type { InvitationTemplate } from "@/lib/domain/types";

export const templateSlugMap = {
  ELEGANT_LUXURY: "elegant-luxury",
  KOREAN_SOFT: "korean-soft",
  MODERN_MINIMAL: "modern-minimal",
} as const satisfies Record<InvitationTemplate, string>;

export type InvitationTemplateSlug = (typeof templateSlugMap)[InvitationTemplate];

export const DEFAULT_INVITATION_TEMPLATE = "KOREAN_SOFT" as const;
export const DEFAULT_INVITATION_TEMPLATE_SLUG = templateSlugMap[DEFAULT_INVITATION_TEMPLATE];

const invitationTemplates = Object.keys(templateSlugMap) as InvitationTemplate[];
const invitationTemplateSlugs = Object.values(templateSlugMap) as InvitationTemplateSlug[];

const templateIdBySlug = Object.fromEntries(
  Object.entries(templateSlugMap).map(([templateId, templateSlug]) => [templateSlug, templateId]),
) as Record<InvitationTemplateSlug, InvitationTemplate>;

export function isInvitationTemplate(value: string): value is InvitationTemplate {
  return invitationTemplates.includes(value as InvitationTemplate);
}

export function getInvitationTemplateBySlug(
  templateSlug: string | null | undefined,
): InvitationTemplate | null {
  if (!templateSlug || !invitationTemplateSlugs.includes(templateSlug as InvitationTemplateSlug)) {
    return null;
  }

  return templateIdBySlug[templateSlug as InvitationTemplateSlug];
}

export function resolveInvitationTemplate(
  template: string | null | undefined,
): InvitationTemplate {
  return template && isInvitationTemplate(template) ? template : DEFAULT_INVITATION_TEMPLATE;
}

export function getInvitationTemplateSlug(
  template: InvitationTemplate | string | null | undefined,
): InvitationTemplateSlug {
  return templateSlugMap[resolveInvitationTemplate(template)];
}

export function resolveInvitationTemplateSlug(
  templateSlug: string | null | undefined,
): InvitationTemplateSlug {
  return getInvitationTemplateSlug(getInvitationTemplateBySlug(templateSlug));
}
