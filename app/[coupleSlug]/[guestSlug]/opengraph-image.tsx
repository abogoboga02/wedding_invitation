import { ImageResponse } from "next/og";

import { getPublicInvitationMetadataByRoute } from "@/features/invitation/public-invitation.service";

export const alt = "Undangan Digital";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function InvitationOpenGraphImage(
  props: {
    params: Promise<{ coupleSlug: string; guestSlug: string }>;
  },
) {
  const { coupleSlug, guestSlug } = await props.params;
  const invitation = await getPublicInvitationMetadataByRoute(coupleSlug, guestSlug);

  const title = invitation
    ? `${invitation.partnerOneName} & ${invitation.partnerTwoName}`
    : "Undangan Digital";
  const subtitle = invitation?.subheadline ?? "Undangan ini belum tersedia atau belum dipublish.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(140deg, rgba(24,19,21,1) 0%, rgba(43,35,36,1) 48%, rgba(90,66,49,1) 100%)",
          color: "#f7e4c9",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#d9bb86",
          }}
        >
          The Wedding Of
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "900px" }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.45,
              color: "#f4e9d8",
            }}
          >
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#d9bb86" }}>Atelier Amora</div>
      </div>
    ),
    size,
  );
}
