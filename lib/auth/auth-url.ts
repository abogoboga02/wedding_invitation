function hasProtocol(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value);
}

function shouldUseHttp(value: string) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/.test(value);
}

export function normalizeConfiguredAuthUrl(value?: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const candidate = hasProtocol(trimmedValue)
    ? trimmedValue
    : `${shouldUseHttp(trimmedValue) ? "http" : "https"}://${trimmedValue}`;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function syncNormalizedAuthEnvUrl() {
  const hasConfiguredUrl = Boolean(
    process.env.APP_URL?.trim() || process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim(),
  );

  const normalizedUrl =
    normalizeConfiguredAuthUrl(process.env.APP_URL) ??
    normalizeConfiguredAuthUrl(process.env.AUTH_URL) ??
    normalizeConfiguredAuthUrl(process.env.NEXTAUTH_URL);

  if (normalizedUrl) {
    process.env.APP_URL = normalizedUrl;
    process.env.AUTH_URL = normalizedUrl;
    process.env.NEXTAUTH_URL = normalizedUrl;
    return normalizedUrl;
  }

  if (hasConfiguredUrl) {
    delete process.env.APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
  }

  return null;
}
