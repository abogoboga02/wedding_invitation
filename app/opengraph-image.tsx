import { ImageResponse } from "next/og";

export const alt = "Atelier Amora";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(140deg, #fffaf8 0%, #fbead6 45%, #f0c4cb 100%)",
          color: "#231f20",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#6b7556",
          }}
        >
          Atelier Amora
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: "860px" }}>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1,
              fontWeight: 600,
            }}
          >
            Undangan digital personal yang terasa dibuat khusus untuk setiap tamu.
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.5, color: "#5f5456" }}>
            Dashboard ringan, link tamu unik, RSVP online, dan template premium untuk momen
            pernikahan yang lebih hangat.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: 24,
            color: "#8d5560",
          }}
        >
          <div>Elegant Luxury</div>
          <div>•</div>
          <div>Korean Soft</div>
          <div>•</div>
          <div>Modern Minimal</div>
        </div>
      </div>
    ),
    size,
  );
}
