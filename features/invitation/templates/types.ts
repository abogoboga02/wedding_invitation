import type { InvitationTemplate } from "@prisma/client";

import type { InvitationRenderModel } from "../invitation.types";
import type { SharedInvitationTemplateData } from "./contract";
import type { InvitationTemplateSlug } from "./template-slugs";

export type TemplateRendererProps = {
  invitation: InvitationRenderModel;
  rsvpSlot?: React.ReactNode;
  previewMode?: boolean;
};

export type TemplateComponentProps = {
  invitation: SharedInvitationTemplateData;
  rsvpSlot?: React.ReactNode;
  previewMode?: boolean;
};

export type TemplateRegistryItem = {
  id: InvitationTemplate;
  slug: InvitationTemplateSlug;
  label: string;
  Component: (props: TemplateComponentProps) => React.JSX.Element;
};
