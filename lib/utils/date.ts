const eventDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const eventTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const wishDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const adminDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventDateTime(value: string) {
  const date = new Date(value);
  return {
    date: eventDateFormatter.format(date),
    time: `${eventTimeFormatter.format(date)} WIB`,
  };
}

export function formatWishDate(value: string) {
  return wishDateFormatter.format(new Date(value));
}

export function formatAdminDateTime(value: string | Date) {
  return adminDateTimeFormatter.format(new Date(value));
}

export function toDateTimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function getCountdownParts(value?: string | null) {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  const diff = Math.max(target.getTime() - Date.now(), 0);
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
  };
}
