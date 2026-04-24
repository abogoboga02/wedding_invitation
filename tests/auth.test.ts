import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/features/auth/auth.schema";
import { normalizeConfiguredAuthUrl } from "@/lib/auth/auth-url";

describe("auth schema", () => {
  it("accepts admin username login with seeded short password", () => {
    expect(
      loginSchema.parse({
        identifier: "admin",
        password: "admin",
      }),
    ).toEqual({
      identifier: "admin",
      password: "admin",
    });
  });

  it("still enforces stronger passwords during registration", () => {
    expect(() =>
      registerSchema.parse({
        name: "Admin",
        email: "admin@example.com",
        password: "admin",
      }),
    ).toThrow("Password minimal 8 karakter.");
  });
});

describe("auth url normalization", () => {
  it("adds https to production domains without a protocol", () => {
    expect(normalizeConfiguredAuthUrl("wedding-invitation-3z29.vercel.app")).toBe(
      "https://wedding-invitation-3z29.vercel.app",
    );
  });

  it("keeps http for localhost values without a protocol", () => {
    expect(normalizeConfiguredAuthUrl("localhost:3000")).toBe("http://localhost:3000");
  });
});
