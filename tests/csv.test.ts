import { describe, expect, it } from "vitest";

import { parseGuestCsv } from "@/features/guest/guest-csv";

describe("parseGuestCsv", () => {
  it("parses guest rows with required name header", () => {
    const guests = parseGuestCsv(
      "name,phone,email\nAngga,08123,angga@example.com\nDina,,dina@example.com",
    );

    expect(guests).toHaveLength(2);
    expect(guests[0]).toMatchObject({
      name: "Angga",
      phone: "08123",
      email: "angga@example.com",
      baseSlug: "angga",
      line: 2,
    });
  });

  it("supports quoted values with commas", () => {
    const guests = parseGuestCsv('name,phone\n"Angga, Keluarga",08123');

    expect(guests[0]).toMatchObject({
      name: "Angga, Keluarga",
      baseSlug: "angga-keluarga",
    });
  });

  it("throws when the name column is missing", () => {
    expect(() => parseGuestCsv("email\nmail@example.com")).toThrow(
      "Kolom `name` wajib tersedia di CSV.",
    );
  });
});
