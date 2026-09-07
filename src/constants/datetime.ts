/* A class at 10:00 in Singapore is 10:00 for every viewer, including a manager checking
   the schedule from London: formatting in the viewer's zone would show them 02:00 and
   they would believe it. So the studio's zone is a named constant. */
export const STUDIO_TIME_ZONE = 'Asia/Singapore'

export const STUDIO_LOCALE = 'en-SG'

/* The studio's fixed UTC offset. Safe as a constant only because Singapore has no
   daylight saving; anywhere with DST would have to derive it per instant. */
export const STUDIO_UTC_OFFSET_HOURS = 8

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: STUDIO_TIME_ZONE,
}

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: STUDIO_TIME_ZONE,
}

export const DATE_SHORT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  timeZone: STUDIO_TIME_ZONE,
}

export const WEEKDAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: STUDIO_TIME_ZONE,
}
