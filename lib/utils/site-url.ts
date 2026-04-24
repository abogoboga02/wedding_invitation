const DEFAULT_SITE_URL = "http://localhost:3000";

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
  return normalizeSiteUrl(process.env.NEXTAUTH_URL).toString().replace(/\/$/, "");
}

export function getSiteMetadataBase() {
  return normalizeSiteUrl(process.env.NEXTAUTH_URL);
}

export function buildSiteHref(pathname = "/") {
  return new URL(pathname, getSiteMetadataBase()).toString();
}
