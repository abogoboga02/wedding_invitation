import { describe, expect, it } from "vitest";

import { validateUploadFile } from "@/lib/utils/upload";

describe("upload validation", () => {
  it("accepts supported image and music files", () => {
    const imageFile = new File([new Uint8Array(1024)], "cover.jpg", { type: "image/jpeg" });
    const musicFile = new File([new Uint8Array(1024)], "music.mp3", { type: "audio/mpeg" });

    expect(() => validateUploadFile(imageFile, "cover")).not.toThrow();
    expect(() => validateUploadFile(imageFile, "gallery")).not.toThrow();
    expect(() => validateUploadFile(musicFile, "music")).not.toThrow();
  });

  it("rejects unsupported mime types", () => {
    const invalidFile = new File([new Uint8Array(1024)], "document.pdf", {
      type: "application/pdf",
    });

    expect(() => validateUploadFile(invalidFile, "cover")).toThrow(
      "Format gambar tidak didukung.",
    );
  });

  it("rejects files over the size limit", () => {
    const tooLargeMusicFile = new File([new Uint8Array(13 * 1024 * 1024)], "music.mp3", {
      type: "audio/mpeg",
    });

    expect(() => validateUploadFile(tooLargeMusicFile, "music")).toThrow(
      "Ukuran file maksimal 12MB.",
    );
  });
});
