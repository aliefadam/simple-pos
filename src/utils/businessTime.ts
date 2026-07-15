const BUSINESS_DAY_START_HOUR = 17;
const BUSINESS_DAY_END_HOUR = 1;

function withTime(date: Date, hour: number, minute = 0, second = 0, ms = 0) {
  const next = new Date(date);
  next.setHours(hour, minute, second, ms);
  return next;
}

export function getBusinessDayRange(reference = new Date()) {
  const hour = reference.getHours();

  if (hour >= BUSINESS_DAY_START_HOUR) {
    const start = withTime(reference, BUSINESS_DAY_START_HOUR);
    const end = withTime(reference, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(BUSINESS_DAY_END_HOUR, 0, 0, 0);
    return { start, end };
  }

  const end = withTime(reference, BUSINESS_DAY_END_HOUR);
  const start = withTime(reference, BUSINESS_DAY_START_HOUR);
  start.setDate(start.getDate() - 1);
  return { start, end };
}

export function isWithinCurrentBusinessDay(
  iso: string,
  reference = new Date(),
) {
  const target = new Date(iso);
  const { start, end } = getBusinessDayRange(reference);
  return target >= start && target < end;
}

export function formatBusinessDayRange(reference = new Date()) {
  const { start, end } = getBusinessDayRange(reference);
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} - ${dateFormatter.format(end)} ${timeFormatter.format(end)} WIB`;
}
