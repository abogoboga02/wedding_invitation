import { createElement } from "react";

import { buildSharedInvitationTemplateData } from "./contract";
import { getTemplateComponentBySlug } from "./registry";
import type { TemplateRendererProps } from "./types";

export function TemplateRenderer(props: TemplateRendererProps) {
  const contract = buildSharedInvitationTemplateData(props.invitation);
  const componentProps = {
    ...props,
    invitation: contract,
  };

  return createElement(getTemplateComponentBySlug(contract.meta.templateSlug), componentProps);
}
