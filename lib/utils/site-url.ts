const DEFAULT_SITE_URL = "http://localhost:3000";

function getConfiguredSiteUrl() {
  return process.env.APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
}

function hasProtocol(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value);
}

function shouldUseHttp(value: string) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/.test(value);
}

function normalizeSiteUrl(value?: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return new URL(DEFAULT_SITE_URL);
  }

  const candidate = hasProtocol(trimmedValue)
    ? trimmedValue
    : `${shouldUseHttp(trimmedValue) ? "http" : "https"}://${trimmedValue}`;

  try {
    const url = new URL(candidate);

    return new URL("/", url);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(getConfiguredSiteUrl()).toString().replace(/\/$/, "");
}

export function getSiteMetadataBase() {
  return normalizeSiteUrl(getConfiguredSiteUrl());
}

export function buildSiteHref(pathname = "/") {
  return new URL(pathname, getSiteMetadataBase()).toString();
}
