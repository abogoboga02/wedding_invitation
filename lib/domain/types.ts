export const USER_ROLES = ["ADMIN", "CLIENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PLAN_TIERS = ["STARTER", "SIGNATURE", "STUDIO"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const SUBSCRIPTION_STATUSES = ["TRIAL", "ACTIVE", "EXPIRED", "CANCELED"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SEND_CHANNELS = ["MANUAL", "WHATSAPP", "EMAIL"] as const;
export type SendChannel = (typeof SEND_CHANNELS)[number];

export const SEND_LOG_STATUSES = ["QUEUED", "SENT", "FAILED"] as const;
export type SendLogStatus = (typeof SEND_LOG_STATUSES)[number];

export const INVITATION_TEMPLATES = [
  "ELEGANT_LUXURY",
  "KOREAN_SOFT",
  "MODERN_MINIMAL",
] as const;
export type InvitationTemplate = (typeof INVITATION_TEMPLATES)[number];

export const INVITATION_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const GUEST_SOURCES = ["MANUAL", "CSV"] as const;
export type GuestSource = (typeof GUEST_SOURCES)[number];

export const RSVP_STATUSES = ["ATTENDING", "MAYBE", "DECLINED"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export type AuthenticatedAppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
};
