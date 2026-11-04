/** Даты и время для подписей экранов — через строки (`src/i18n`), без текста в коде. */
import { weekday } from '../core/dates';
import type { ISODate } from '../core/model';
import type { MessageKey } from '../i18n';
import type { Translate } from '../store/prefsStore';

const month = (d: ISODate) => `date.month.${Number(d.slice(5, 7)) - 1}` as MessageKey;

/** «Вторник, 3 ноября» */
export function fullDate(t: Translate, d: ISODate): string {
  return t('date.full', {
    weekday: t(`date.weekdayTitle.${weekday(d)}` as MessageKey),
    day: Number(d.slice(8, 10)),
    month: t(month(d)),
  });
}

/** «3 ноября» */
export function dayMonth(t: Translate, d: ISODate): string {
  return t('date.dayMonth', { day: Number(d.slice(8, 10)), month: t(month(d)) });
}

/** «01.11.26» — короткая дата для подписей вроде «Слово дано». */
export function shortDate(d: ISODate): string {
  return `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(2, 4)}`;
}

/** Локальная дата `YYYY-MM-DD` момента `ms`. */
export function isoOfMs(ms: number): ISODate {
  const t = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

/** «1 240» — разряды через неразрывный пробел. */
export function groupDigits(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
